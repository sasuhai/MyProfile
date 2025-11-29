import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''

// Lazy-loaded admin client (only created when needed)
let _supabaseAdmin = null

const getAdminClient = () => {
    if (!_supabaseAdmin) {
        // Validate configuration only when admin client is actually needed
        if (!supabaseUrl) {
            throw new Error('VITE_SUPABASE_URL is not set in .env file')
        }

        if (!supabaseServiceKey) {
            console.warn('⚠️  VITE_SUPABASE_SERVICE_ROLE_KEY is not set')
            console.warn('📝 Admin features require the service role key in .env:')
            console.warn('   VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
            throw new Error('Service role key not configured')
        }

        // Create admin client with service role (can bypass RLS)
        _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })
    }
    return _supabaseAdmin
}

// Export getter instead of direct client
export const supabaseAdmin = new Proxy({}, {
    get: (target, prop) => {
        const client = getAdminClient()
        return client[prop]
    }
})

// Check if service key is configured
export const isServiceKeyConfigured = () => {
    return !!(supabaseUrl && supabaseServiceKey && supabaseServiceKey.length > 20)
}

// ============================================
// ADMIN USER MANAGEMENT
// ============================================

/**
 * Create a new user with profile (Admin only)
 * @param {Object} userData - User data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.fullName - User full name
 * @param {string} userData.username - User username
 * @param {string} userData.role - User role (admin/user)
 */
export const createUserWithProfile = async (userData) => {
    try {
        // Check if service key is configured
        if (!isServiceKeyConfigured()) {
            throw new Error('Service role key not configured. Please add VITE_SUPABASE_SERVICE_ROLE_KEY to your .env file.')
        }

        const { email, password, fullName, username, role = 'user' } = userData

        // Create user in auth.users
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email
        })

        if (authError) {
            throw new Error(`Auth error: ${authError.message}`)
        }

        if (!authData.user) {
            throw new Error('User creation failed')
        }

        // Manually create profile (don't rely on trigger due to RLS issues)
        const { data: profileData, error: profileError } = await supabaseAdmin
            .from('profile_info')
            .insert({
                user_id: authData.user.id,
                email: email,
                full_name: fullName,
                username: username,
                role: role,
                must_change_password: true
            })
            .select()
            .single()

        if (profileError) {
            // If profile creation fails, delete the auth user
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
            throw new Error(`Profile creation failed: ${profileError.message}`)
        }

        return {
            success: true,
            data: {
                userId: authData.user.id,
                email: email,
                username: profileData.username,
                role: profileData.role
            },
            error: null
        }

    } catch (error) {
        console.error('Create user error:', error)
        return {
            success: false,
            data: null,
            error: error.message || 'Failed to create user'
        }
    }
}

/**
 * Delete a user and their profile with storage cleanup (Admin only)
 * @param {string} userId - User ID to delete
 * @param {boolean} deleteStorageFiles - Whether to delete storage files (default: true)
 */
export const deleteUserAndProfile = async (userId, deleteStorageFiles = true) => {
    try {
        const deletedFiles = []
        const errors = []

        // Step 1: Get user's profile and project images before deletion
        if (deleteStorageFiles) {
            try {
                // Get profile image
                const { data: profile } = await supabaseAdmin
                    .from('profile_info')
                    .select('profile_image_url')
                    .eq('user_id', userId)
                    .single()

                // Get project images
                const { data: projects } = await supabaseAdmin
                    .from('projects')
                    .select('image_url')
                    .eq('user_id', userId)

                // Delete profile image from storage
                if (profile?.profile_image_url) {
                    const imagePath = extractStoragePath(profile.profile_image_url, 'profile-images')
                    if (imagePath) {
                        const { error } = await supabaseAdmin.storage
                            .from('profile-images')
                            .remove([imagePath])

                        if (error) {
                            errors.push(`Profile image: ${error.message}`)
                        } else {
                            deletedFiles.push(`profile-images/${imagePath}`)
                        }
                    }
                }

                // Delete project images from storage
                if (projects && projects.length > 0) {
                    for (const project of projects) {
                        if (project.image_url) {
                            const imagePath = extractStoragePath(project.image_url, 'project-images')
                            if (imagePath) {
                                const { error } = await supabaseAdmin.storage
                                    .from('project-images')
                                    .remove([imagePath])

                                if (error) {
                                    errors.push(`Project image: ${error.message}`)
                                } else {
                                    deletedFiles.push(`project-images/${imagePath}`)
                                }
                            }
                        }
                    }
                }
            } catch (storageError) {
                console.warn('Storage cleanup warning:', storageError)
                errors.push(`Storage cleanup: ${storageError.message}`)
                // Continue with user deletion even if storage cleanup fails
            }
        }

        // Step 2: Delete auth user (CASCADE will delete all database records)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

        if (authError) {
            throw new Error(`Auth deletion error: ${authError.message}`)
        }

        return {
            success: true,
            error: null,
            deletedFiles: deletedFiles,
            storageErrors: errors.length > 0 ? errors : null,
            message: `User deleted successfully. ${deletedFiles.length} storage files removed.`
        }

    } catch (error) {
        console.error('Delete user error:', error)
        return {
            success: false,
            error: error.message || 'Failed to delete user',
            deletedFiles: [],
            storageErrors: null
        }
    }
}

/**
 * Helper function to extract storage path from URL
 * @param {string} url - Full storage URL
 * @param {string} bucket - Bucket name
 * @returns {string|null} - Storage path or null
 */
const extractStoragePath = (url, bucket) => {
    if (!url) return null

    try {
        // Handle Supabase storage URLs
        // Format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
        const urlObj = new URL(url)
        const pathParts = urlObj.pathname.split('/')
        const bucketIndex = pathParts.indexOf(bucket)

        if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
            // Get everything after the bucket name
            return pathParts.slice(bucketIndex + 1).join('/')
        }

        return null
    } catch (error) {
        console.warn('Error extracting storage path:', error)
        return null
    }
}

/**
 * Update user password (Admin only)
 * @param {string} userId - User ID
 * @param {string} newPassword - New password
 */
export const updateUserPassword = async (userId, newPassword) => {
    try {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: newPassword
        })

        if (error) {
            throw new Error(error.message)
        }

        return {
            success: true,
            error: null
        }

    } catch (error) {
        console.error('Update password error:', error)
        return {
            success: false,
            error: error.message || 'Failed to update password'
        }
    }
}
