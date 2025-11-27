import { createClient } from '@supabase/supabase-js'
import { PORTFOLIO_CONFIG } from '../config/portfolio.config'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================
// MULTI-USER SUPPORT
// ============================================

// Get the portfolio owner's user_id from their email
let portfolioOwnerId = null

export const getPortfolioOwnerId = async () => {
    if (portfolioOwnerId) return portfolioOwnerId

    const { data, error } = await supabase
        .from('profile_info')
        .select('user_id')
        .eq('email', PORTFOLIO_CONFIG.USER_EMAIL)
        .single()

    if (data) {
        portfolioOwnerId = data.user_id
    }

    return portfolioOwnerId
}

// Helper: Get user_id from username or current logged-in user
export const getUserId = async (username = null) => {
    if (username) {
        // Path-based: Get user by username
        const { data: profile } = await getProfileByUsername(username)
        return profile?.user_id || null
    } else {
        // Admin/authenticated: Get currently logged-in user
        const currentUser = await getCurrentUser()
        if (currentUser) {
            return currentUser.id
        }
        // Fallback to config for backward compatibility
        return await getPortfolioOwnerId()
    }
}

// ============================================
// AUTH HELPERS
// ============================================

export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })
    return { data, error }
}

export const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
}

export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

// ============================================
// PROFILE OPERATIONS
// ============================================

// Get profile by email (legacy - for config-based)
export const getProfile = async () => {
    const { data, error } = await supabase
        .from('profile_info')
        .select('*')
        .eq('email', PORTFOLIO_CONFIG.USER_EMAIL)
        .single()
    return { data, error }
}

// Get profile by username (for path-based multi-tenancy)
export const getProfileByUsername = async (username) => {
    const { data, error } = await supabase
        .from('profile_info')
        .select('*')
        .eq('username', username)
        .single()
    return { data, error }
}

// Get all public profiles (for landing page)
export const getAllProfiles = async () => {
    const { data, error } = await supabase
        .from('profile_info')
        .select('username, full_name, tagline, profile_image_url, created_at')
        .order('created_at', { ascending: false })
    return { data, error }
}

export const updateProfile = async (updates) => {
    const user = await getCurrentUser()
    if (!user) return { data: null, error: new Error('Not authenticated') }

    const { data, error } = await supabase
        .from('profile_info')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
    return { data, error }
}

// ============================================
// SKILLS OPERATIONS
// ============================================

export const getSkills = async (username = null) => {
    const userId = await getUserId(username)
    if (!userId) return { data: [], error: new Error('User not found') }

    const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', userId)
        .order('category', { ascending: true })
    return { data, error }
}

export const addSkill = async (skill) => {
    const user = await getCurrentUser()
    if (!user) return { data: null, error: new Error('Not authenticated') }

    const { data, error } = await supabase
        .from('skills')
        .insert([{ ...skill, user_id: user.id }])
        .select()
    return { data, error }
}

export const updateSkill = async (id, updates) => {
    const { data, error } = await supabase
        .from('skills')
        .update(updates)
        .eq('id', id)
        .select()
    return { data, error }
}

export const deleteSkill = async (id) => {
    const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', id)
    return { error }
}

// ============================================
// EDUCATION OPERATIONS
// ============================================

export const getEducation = async (username = null) => {
    const userId = await getUserId(username)
    if (!userId) return { data: [], error: new Error('User not found') }

    const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', userId)
        .order('end_date', { ascending: false })
    return { data, error }
}

export const addEducation = async (education) => {
    const user = await getCurrentUser()
    if (!user) return { data: null, error: new Error('Not authenticated') }

    const dataToInsert = { ...education, user_id: user.id }
    console.log('Adding education:', dataToInsert)

    const { data, error } = await supabase
        .from('education')
        .insert([dataToInsert])
        .select()

    if (error) {
        console.error('Education insert error:', error)
    }

    return { data, error }
}

export const updateEducation = async (id, updates) => {
    const { data, error } = await supabase
        .from('education')
        .update(updates)
        .eq('id', id)
        .select()
    return { data, error }
}

export const deleteEducation = async (id) => {
    const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', id)
    return { error }
}

// ============================================
// WORK EXPERIENCE OPERATIONS
// ============================================

export const getWorkExperience = async (username = null) => {
    const userId = await getUserId(username)
    if (!userId) return { data: [], error: new Error('User not found') }

    const { data, error } = await supabase
        .from('work_experience')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false })
    return { data, error }
}

export const addWorkExperience = async (experience) => {
    const user = await getCurrentUser()
    if (!user) return { data: null, error: new Error('Not authenticated') }

    const { data, error } = await supabase
        .from('work_experience')
        .insert([{ ...experience, user_id: user.id }])
        .select()
    return { data, error }
}

export const updateWorkExperience = async (id, updates) => {
    const { data, error } = await supabase
        .from('work_experience')
        .update(updates)
        .eq('id', id)
        .select()
    return { data, error }
}

export const deleteWorkExperience = async (id) => {
    const { error } = await supabase
        .from('work_experience')
        .delete()
        .eq('id', id)
    return { error }
}

// ============================================
// PROJECTS OPERATIONS
// ============================================

export const getPublishedProjects = async (username = null) => {
    const userId = await getUserId(username)
    if (!userId) return { data: [], error: new Error('User not found') }

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .eq('published', true)
        .order('created_at', { ascending: false })
    return { data, error }
}

export const getAllProjects = async (username = null) => {
    const userId = await getUserId(username)
    if (!userId) return { data: [], error: new Error('User not found') }

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    return { data, error }
}

export const addProject = async (project) => {
    const user = await getCurrentUser()
    if (!user) return { data: null, error: new Error('Not authenticated') }

    const { data, error } = await supabase
        .from('projects')
        .insert([{ ...project, user_id: user.id }])
        .select()
    return { data, error }
}

export const updateProject = async (id, updates) => {
    const { data, error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
    return { data, error }
}

export const deleteProject = async (id) => {
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
    return { error }
}

// ============================================
// CERTIFICATIONS OPERATIONS
// ============================================

export const getCertifications = async (username = null) => {
    const userId = await getUserId(username)
    if (!userId) return { data: [], error: new Error('User not found') }

    const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('user_id', userId)
        .order('issue_date', { ascending: false })
    return { data, error }
}

export const addCertification = async (certification) => {
    const user = await getCurrentUser()
    if (!user) return { data: null, error: new Error('Not authenticated') }

    const dataToInsert = { ...certification, user_id: user.id }
    console.log('Adding certification:', dataToInsert)

    const { data, error } = await supabase
        .from('certifications')
        .insert([dataToInsert])
        .select()

    if (error) {
        console.error('Certification insert error:', error)
    }

    return { data, error }
}

export const updateCertification = async (id, updates) => {
    const { data, error } = await supabase
        .from('certifications')
        .update(updates)
        .eq('id', id)
        .select()
    return { data, error }
}

export const deleteCertification = async (id) => {
    const { error } = await supabase
        .from('certifications')
        .delete()
        .eq('id', id)
    return { error }
}

// ============================================
// CONTACT MESSAGES OPERATIONS
// ============================================

export const addContactMessage = async (message) => {
    // Get current user if logged in (optional)
    const currentUser = await getCurrentUser()

    const { data, error } = await supabase
        .from('contact_messages')
        .insert([{
            ...message,
            user_id: currentUser?.id || null  // Optional: link to user if logged in
        }])
        .select()
    return { data, error }
}

export const getMessages = async () => {
    const user = await getCurrentUser()
    if (!user) return { data: [], error: new Error('Not authenticated') }

    const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
    return { data, error }
}

// ============================================
// FILE UPLOAD HELPERS
// ============================================

export const uploadFile = async (bucket, path, file) => {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: true
        })

    if (error) return { data: null, error }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path)

    return { data: publicUrl, error: null }
}

export const deleteFile = async (bucket, path) => {
    const { error } = await supabase.storage
        .from(bucket)
        .remove([path])
    return { error }
}

// ============================================
// ROLE-BASED ACCESS & USER MANAGEMENT
// ============================================

// Check if current user is admin
export const isCurrentUserAdmin = async () => {
    const user = await getCurrentUser()
    if (!user) return false

    const { data, error } = await supabase
        .from('profile_info')
        .select('role')
        .eq('user_id', user.id)
        .single()

    return data?.role === 'admin'
}

// Get current user's role
export const getCurrentUserRole = async () => {
    const user = await getCurrentUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('profile_info')
        .select('role')
        .eq('user_id', user.id)
        .single()

    return data?.role || 'user'
}

// ============================================
// USER MANAGEMENT (Admin Only)
// ============================================

// Get all users (admin only)
export const getAllUsers = async () => {
    const { data, error } = await supabase
        .from('profile_info')
        .select('id, user_id, email, username, full_name, role, created_at')
        .order('created_at', { ascending: false })

    return { data, error }
}

// Create new user (admin only)
export const createNewUser = async (email, password, role = 'user', fullName = '') => {
    try {
        // Note: This requires Supabase service role key for user creation
        // For now, we'll return instructions for manual creation
        return {
            data: null,
            error: null,
            message: 'Please create user in Supabase Dashboard → Authentication → Users',
            instructions: {
                email,
                password,
                role,
                fullName,
                nextSteps: [
                    '1. Go to Supabase Dashboard',
                    '2. Navigate to Authentication → Users',
                    '3. Click "Add User"',
                    `4. Email: ${email}`,
                    `5. Password: ${password}`,
                    '6. After creation, their profile will be auto-created with the specified role'
                ]
            }
        }
    } catch (error) {
        return { data: null, error }
    }
}

// Update user role (admin only)
export const updateUserRole = async (userId, newRole) => {
    const { data, error } = await supabase
        .from('profile_info')
        .update({ role: newRole })
        .eq('user_id', userId)
        .select()

    return { data, error }
}

// Delete user (admin only)
export const deleteUser = async (userId) => {
    // First delete profile
    const { error: profileError } = await supabase
        .from('profile_info')
        .delete()
        .eq('user_id', userId)

    if (profileError) return { error: profileError }

    // Note: Deleting from auth.users requires service role
    // For now, return instructions
    return {
        data: null,
        error: null,
        message: 'Profile deleted. To fully remove user, delete from Supabase Auth dashboard',
        instructions: [
            '1. Go to Supabase Dashboard',
            '2. Navigate to Authentication → Users',
            '3. Find and delete the user manually'
        ]
    }
}

// Reset user password (admin only)
export const resetUserPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    })

    return { data, error }
}

// Change own password
export const changePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
        password: newPassword
    })

    return { data, error }
}

// Get user statistics (admin only)
export const getUserStats = async () => {
    const { data: users, error } = await supabase
        .from('profile_info')
        .select('role')

    if (error) return { data: null, error }

    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        users: users.filter(u => u.role === 'user').length,
    }

    return { data: stats, error: null }
}

// Invite new user (sends email with instructions)
export const inviteUser = async (email, role = 'user') => {
    // This would typically send an invitation email
    // For now, return instructions
    return {
        data: null,
        error: null,
        message: 'User invitation prepared',
        instructions: {
            email,
            role,
            steps: [
                '1. Create user in Supabase Auth',
                '2. User will receive welcome email',
                '3. They can set their password on first login',
                `4. Their role will be: ${role}`
            ]
        }
    }
}
