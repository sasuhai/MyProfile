import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''

// Validate configuration
if (!supabaseUrl) {
    console.error('❌ VITE_SUPABASE_URL is not set in .env file')
}

if (!supabaseServiceKey) {
    console.error('❌ VITE_SUPABASE_SERVICE_ROLE_KEY is not set in .env file')
    console.error('📝 Please add it to your .env file:')
    console.error('   VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
}

// Admin client with service role (can bypass RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
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

        // Create user in auth.users with metadata
        // The trigger will automatically create the profile
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
                full_name: fullName,
                username: username,
                role: role
            }
        })

        if (authError) {
            throw new Error(`Auth error: ${authError.message}`)
        }

        if (!authData.user) {
            throw new Error('User creation failed')
        }

        // Wait a moment for trigger to complete
        await new Promise(resolve => setTimeout(resolve, 500))

        // Verify profile was created by trigger
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profile_info')
            .select('*')
            .eq('user_id', authData.user.id)
            .single()

        if (profileError || !profile) {
            // If profile wasn't created by trigger, delete the auth user and throw error
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
            throw new Error('Profile creation failed. Please make sure the trigger is set up correctly.')
        }

        return {
            success: true,
            data: {
                userId: authData.user.id,
                email: email,
                username: profile.username,
                role: profile.role
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
 * Delete a user and their profile (Admin only)
 * @param {string} userId - User ID to delete
 */
export const deleteUserAndProfile = async (userId) => {
    try {
        // Delete profile first
        const { error: profileError } = await supabaseAdmin
            .from('profile_info')
            .delete()
            .eq('user_id', userId)

        if (profileError) {
            throw new Error(`Profile deletion error: ${profileError.message}`)
        }

        // Delete auth user
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

        if (authError) {
            throw new Error(`Auth deletion error: ${authError.message}`)
        }

        return {
            success: true,
            error: null
        }

    } catch (error) {
        console.error('Delete user error:', error)
        return {
            success: false,
            error: error.message || 'Failed to delete user'
        }
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
