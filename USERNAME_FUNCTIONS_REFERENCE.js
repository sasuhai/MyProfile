// Additional username-based functions to add to supabase.js
// Add these after the existing functions

// ============================================
// EDUCATION OPERATIONS (with username support)
// ============================================

export const getEducation = async (username = null) => {
    const userId = await getUserId(username)
    if (!userId) return { data: [], error: new Error('User not found') }

    const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false })
    return { data, error }
}

// ============================================
// WORK EXPERIENCE OPERATIONS (with username support)
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

// ============================================
// PROJECTS OPERATIONS (with username support)
// ============================================

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

// ============================================
// CERTIFICATIONS OPERATIONS (with username support)
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
