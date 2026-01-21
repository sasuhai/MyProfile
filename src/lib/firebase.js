import { initializeApp } from 'firebase/app'
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    setDoc,
    serverTimestamp
} from 'firebase/firestore'
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updatePassword,
    sendPasswordResetEmail,
    createUserWithEmailAndPassword
} from 'firebase/auth'
// Supabase Storage (hybrid approach - Firebase Storage requires paid plan)
import { createClient } from '@supabase/supabase-js'
import { PORTFOLIO_CONFIG } from '../config/portfolio.config'

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Supabase Storage configuration (for file uploads)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const supabaseStorage = createClient(supabaseUrl, supabaseAnonKey)

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

// ============================================
// MULTI-USER SUPPORT
// ============================================

let portfolioOwnerId = null

export const getPortfolioOwnerId = async () => {
    if (portfolioOwnerId) return portfolioOwnerId

    try {
        const q = query(
            collection(db, 'profile_info'),
            where('email', '==', PORTFOLIO_CONFIG.USER_EMAIL),
            limit(1)
        )
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
            const profile = querySnapshot.docs[0]
            portfolioOwnerId = profile.data().user_id
        }
    } catch (error) {
        console.error('Error getting portfolio owner ID:', error)
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
            return currentUser.uid
        }
        // Fallback to config for backward compatibility
        return await getPortfolioOwnerId()
    }
}

// ============================================
// AUTH HELPERS
// ============================================

export const signIn = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        return { data: { user: userCredential.user, session: userCredential }, error: null }
    } catch (error) {
        return { data: null, error }
    }
}

export const signOut = async () => {
    try {
        await firebaseSignOut(auth)
        return { error: null }
    } catch (error) {
        return { error }
    }
}

export const getCurrentUser = () => {
    return auth.currentUser
}

// Listen to auth state changes
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback)
}

// ============================================
// PROFILE OPERATIONS
// ============================================

// Get profile by email (legacy - for config-based)
export const getProfile = async () => {
    try {
        const q = query(
            collection(db, 'profile_info'),
            where('email', '==', PORTFOLIO_CONFIG.USER_EMAIL),
            limit(1)
        )
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
            const profile = querySnapshot.docs[0]
            return {
                data: { id: profile.id, ...profile.data() },
                error: null
            }
        }

        return { data: null, error: new Error('Profile not found') }
    } catch (error) {
        return { data: null, error }
    }
}

// Get profile by username (for path-based multi-tenancy)
export const getProfileByUsername = async (username) => {
    try {
        const q = query(
            collection(db, 'profile_info'),
            where('username', '==', username),
            limit(1)
        )
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
            const profile = querySnapshot.docs[0]
            return {
                data: { id: profile.id, ...profile.data() },
                error: null
            }
        }

        return { data: null, error: new Error('Profile not found') }
    } catch (error) {
        return { data: null, error }
    }
}

// Get all public profiles (for landing page)
export const getAllProfiles = async () => {
    try {
        const q = query(
            collection(db, 'profile_info'),
            orderBy('created_at', 'desc')
        )
        const querySnapshot = await getDocs(q)

        const profiles = querySnapshot.docs.map(doc => ({
            id: doc.id,
            username: doc.data().username,
            full_name: doc.data().full_name,
            tagline: doc.data().tagline,
            profile_image_url: doc.data().profile_image_url,
            created_at: doc.data().created_at
        }))

        return { data: profiles, error: null }
    } catch (error) {
        return { data: [], error }
    }
}

export const updateProfile = async (updates) => {
    try {
        const user = getCurrentUser()
        if (!user) return { data: null, error: new Error('Not authenticated') }

        // Find the profile document by user_id
        const q = query(
            collection(db, 'profile_info'),
            where('user_id', '==', user.uid),
            limit(1)
        )
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
            return { data: null, error: new Error('Profile not found') }
        }

        const profileDoc = querySnapshot.docs[0]
        await updateDoc(doc(db, 'profile_info', profileDoc.id), {
            ...updates,
            updated_at: serverTimestamp()
        })

        const updatedDoc = await getDoc(doc(db, 'profile_info', profileDoc.id))
        return {
            data: [{ id: updatedDoc.id, ...updatedDoc.data() }],
            error: null
        }
    } catch (error) {
        return { data: null, error }
    }
}

// ============================================
// SKILLS OPERATIONS
// ============================================

export const getSkills = async (username = null) => {
    try {
        const userId = await getUserId(username)
        if (!userId) return { data: [], error: new Error('User not found') }

        // Simplified query - sort in code to avoid composite index
        const q = query(
            collection(db, 'skills'),
            where('user_id', '==', userId)
        )
        const querySnapshot = await getDocs(q)

        // Sort in code
        const skills = querySnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .sort((a, b) => (a.category || '').localeCompare(b.category || ''))

        return { data: skills, error: null }
    } catch (error) {
        return { data: [], error }
    }
}

export const addSkill = async (skill) => {
    try {
        const user = getCurrentUser()
        if (!user) return { data: null, error: new Error('Not authenticated') }

        const docRef = await addDoc(collection(db, 'skills'), {
            ...skill,
            user_id: user.uid,
            created_at: serverTimestamp()
        })

        const newDoc = await getDoc(docRef)
        return {
            data: [{ id: newDoc.id, ...newDoc.data() }],
            error: null
        }
    } catch (error) {
        return { data: null, error }
    }
}

export const updateSkill = async (id, updates) => {
    try {
        await updateDoc(doc(db, 'skills', id), updates)
        const updatedDoc = await getDoc(doc(db, 'skills', id))
        return {
            data: [{ id: updatedDoc.id, ...updatedDoc.data() }],
            error: null
        }
    } catch (error) {
        return { data: null, error }
    }
}

export const deleteSkill = async (id) => {
    try {
        await deleteDoc(doc(db, 'skills', id))
        return { error: null }
    } catch (error) {
        return { error }
    }
}

// ============================================
// EDUCATION OPERATIONS
// ============================================

export const getEducation = async (username = null) => {
    try {
        const userId = await getUserId(username)
        if (!userId) return { data: [], error: new Error('User not found') }

        // Simplified query - sort in code to avoid composite index
        const q = query(
            collection(db, 'education'),
            where('user_id', '==', userId)
        )
        const querySnapshot = await getDocs(q)

        // Sort in code
        const education = querySnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .sort((a, b) => {
                const dateA = a.end_date?.toMillis?.() || 0
                const dateB = b.end_date?.toMillis?.() || 0
                return dateB - dateA // Descending
            })

        return { data: education, error: null }
    } catch (error) {
        return { data: [], error }
    }
}

export const addEducation = async (education) => {
    try {
        const user = getCurrentUser()
        if (!user) return { data: null, error: new Error('Not authenticated') }

        const dataToInsert = {
            ...education,
            user_id: user.uid,
            created_at: serverTimestamp()
        }
        console.log('Adding education:', dataToInsert)

        const docRef = await addDoc(collection(db, 'education'), dataToInsert)
        const newDoc = await getDoc(docRef)

        return {
            data: [{ id: newDoc.id, ...newDoc.data() }],
            error: null
        }
    } catch (error) {
        console.error('Education insert error:', error)
        return { data: null, error }
    }
}

export const updateEducation = async (id, updates) => {
    try {
        await updateDoc(doc(db, 'education', id), updates)
        const updatedDoc = await getDoc(doc(db, 'education', id))
        return {
            data: [{ id: updatedDoc.id, ...updatedDoc.data() }],
            error: null
        }
    } catch (error) {
        return { data: null, error }
    }
}

export const deleteEducation = async (id) => {
    try {
        await deleteDoc(doc(db, 'education', id))
        return { error: null }
    } catch (error) {
        return { error }
    }
}

// ============================================
// WORK EXPERIENCE OPERATIONS
// ============================================

export const getWorkExperience = async (username = null) => {
    try {
        const userId = await getUserId(username)
        if (!userId) return { data: [], error: new Error('User not found') }

        // Simplified query - sort in code to avoid composite index
        const q = query(
            collection(db, 'work_experience'),
            where('user_id', '==', userId)
        )
        const querySnapshot = await getDocs(q)

        // Sort in code
        const workExperience = querySnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .sort((a, b) => {
                const dateA = a.start_date?.toMillis?.() || 0
                const dateB = b.start_date?.toMillis?.() || 0
                return dateB - dateA // Descending
            })

        return { data: workExperience, error: null }
    } catch (error) {
        return { data: [], error }
    }
}

export const addWorkExperience = async (experience) => {
    try {
        const user = getCurrentUser()
        if (!user) return { data: null, error: new Error('Not authenticated') }

        const docRef = await addDoc(collection(db, 'work_experience'), {
            ...experience,
            user_id: user.uid,
            created_at: serverTimestamp()
        })

        const newDoc = await getDoc(docRef)
        return {
            data: [{ id: newDoc.id, ...newDoc.data() }],
            error: null
        }
    } catch (error) {
        return { data: null, error }
    }
}

export const updateWorkExperience = async (id, updates) => {
    try {
        await updateDoc(doc(db, 'work_experience', id), updates)
        const updatedDoc = await getDoc(doc(db, 'work_experience', id))
        return {
            data: [{ id: updatedDoc.id, ...updatedDoc.data() }],
            error: null
        }
    } catch (error) {
        return { data: null, error }
    }
}

export const deleteWorkExperience = async (id) => {
    try {
        await deleteDoc(doc(db, 'work_experience', id))
        return { error: null }
    } catch (error) {
        return { error }
    }
}

// ============================================
// PROJECTS OPERATIONS
// ============================================

export const getPublishedProjects = async (username = null) => {
    try {
        const userId = await getUserId(username)
        if (!userId) return { data: [], error: new Error('User not found') }

        // Simplified query - filter published in code to avoid composite index
        const q = query(
            collection(db, 'projects'),
            where('user_id', '==', userId)
        )
        const querySnapshot = await getDocs(q)

        // Filter and sort in code
        const projects = querySnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .filter(project => project.published === true)
            .sort((a, b) => {
                const dateA = a.created_at?.toMillis?.() || 0
                const dateB = b.created_at?.toMillis?.() || 0
                return dateB - dateA // Descending
            })

        return { data: projects, error: null }
    } catch (error) {
        return { data: [], error }
    }
}

export const getAllProjects = async (username = null) => {
    try {
        const userId = await getUserId(username)
        if (!userId) return { data: [], error: new Error('User not found') }

        // Simplified query - sort in code to avoid composite index
        const q = query(
            collection(db, 'projects'),
            where('user_id', '==', userId)
        )
        const querySnapshot = await getDocs(q)

        // Sort in code
        const projects = querySnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .sort((a, b) => {
                const dateA = a.created_at?.toMillis?.() || 0
                const dateB = b.created_at?.toMillis?.() || 0
                return dateB - dateA // Descending
            })

        return { data: projects, error: null }
    } catch (error) {
        return { data: [], error }
    }
}

export const addProject = async (project) => {
    try {
        const user = getCurrentUser()
        if (!user) return { data: null, error: new Error('Not authenticated') }

        const docRef = await addDoc(collection(db, 'projects'), {
            ...project,
            user_id: user.uid,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp()
        })

        const newDoc = await getDoc(docRef)
        return {
            data: [{ id: newDoc.id, ...newDoc.data() }],
            error: null
        }
    } catch (error) {
        return { data: null, error }
    }
}

export const updateProject = async (id, updates) => {
    try {
        await updateDoc(doc(db, 'projects', id), {
            ...updates,
            updated_at: serverTimestamp()
        })

        const updatedDoc = await getDoc(doc(db, 'projects', id))
        return {
            data: [{ id: updatedDoc.id, ...updatedDoc.data() }],
            error: null
        }
    } catch (error) {
        return { data: null, error }
    }
}

export const deleteProject = async (id) => {
    try {
        await deleteDoc(doc(db, 'projects', id))
        return { error: null }
    } catch (error) {
        return { error }
    }
}

// ============================================
// CERTIFICATIONS OPERATIONS
// ============================================

export const getCertifications = async (username = null) => {
    try {
        const userId = await getUserId(username)
        if (!userId) return { data: [], error: new Error('User not found') }

        // Simplified query - sort in code to avoid composite index
        const q = query(
            collection(db, 'certifications'),
            where('user_id', '==', userId)
        )
        const querySnapshot = await getDocs(q)

        // Sort in code
        const certifications = querySnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .sort((a, b) => {
                const dateA = a.issue_date?.toMillis?.() || 0
                const dateB = b.issue_date?.toMillis?.() || 0
                return dateB - dateA // Descending
            })

        return { data: certifications, error: null }
    } catch (error) {
        return { data: [], error }
    }
}

export const addCertification = async (certification) => {
    try {
        const user = getCurrentUser()
        if (!user) return { data: null, error: new Error('Not authenticated') }

        const dataToInsert = {
            ...certification,
            user_id: user.uid,
            created_at: serverTimestamp()
        }
        console.log('Adding certification:', dataToInsert)

        const docRef = await addDoc(collection(db, 'certifications'), dataToInsert)
        const newDoc = await getDoc(docRef)

        return {
            data: [{ id: newDoc.id, ...newDoc.data() }],
            error: null
        }
    } catch (error) {
        console.error('Certification insert error:', error)
        return { data: null, error }
    }
}

export const updateCertification = async (id, updates) => {
    try {
        await updateDoc(doc(db, 'certifications', id), updates)
        const updatedDoc = await getDoc(doc(db, 'certifications', id))
        return {
            data: [{ id: updatedDoc.id, ...updatedDoc.data() }],
            error: null
        }
    } catch (error) {
        return { data: null, error }
    }
}

export const deleteCertification = async (id) => {
    try {
        await deleteDoc(doc(db, 'certifications', id))
        return { error: null }
    } catch (error) {
        return { error }
    }
}

// ============================================
// CONTACT MESSAGES OPERATIONS
// ============================================

export const addContactMessage = async (message) => {
    try {
        const currentUser = getCurrentUser()

        const docRef = await addDoc(collection(db, 'contact_messages'), {
            ...message,
            user_id: currentUser?.uid || null,
            created_at: serverTimestamp()
        })

        const newDoc = await getDoc(docRef)
        return {
            data: [{ id: newDoc.id, ...newDoc.data() }],
            error: null
        }
    } catch (error) {
        return { data: null, error }
    }
}

export const getMessages = async () => {
    try {
        const user = getCurrentUser()
        if (!user) return { data: [], error: new Error('Not authenticated') }

        const q = query(
            collection(db, 'contact_messages'),
            orderBy('created_at', 'desc')
        )
        const querySnapshot = await getDocs(q)

        const messages = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))

        return { data: messages, error: null }
    } catch (error) {
        return { data: [], error }
    }
}

// ============================================
// FILE UPLOAD HELPERS (Using Supabase Storage)
// Note: Firebase Storage requires paid plan, so we use Supabase Storage
// ============================================

export const uploadFile = async (bucket, path, file) => {
    try {
        const { data, error } = await supabaseStorage.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: true
            })

        if (error) return { data: null, error }

        const { data: { publicUrl } } = supabaseStorage.storage
            .from(bucket)
            .getPublicUrl(path)

        return { data: publicUrl, error: null }
    } catch (error) {
        return { data: null, error }
    }
}

export const deleteFile = async (bucket, path) => {
    try {
        const { error } = await supabaseStorage.storage
            .from(bucket)
            .remove([path])
        return { error }
    } catch (error) {
        return { error }
    }
}

// ============================================
// ROLE-BASED ACCESS & USER MANAGEMENT
// ============================================

export const isCurrentUserAdmin = async () => {
    try {
        const user = getCurrentUser()
        if (!user) return false

        const q = query(
            collection(db, 'profile_info'),
            where('user_id', '==', user.uid),
            limit(1)
        )
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
            const profile = querySnapshot.docs[0]
            return profile.data().role === 'admin'
        }

        return false
    } catch (error) {
        return false
    }
}

export const getCurrentUserRole = async () => {
    try {
        const user = getCurrentUser()
        if (!user) return null

        const q = query(
            collection(db, 'profile_info'),
            where('user_id', '==', user.uid),
            limit(1)
        )
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
            const profile = querySnapshot.docs[0]
            return profile.data().role || 'user'
        }

        return 'user'
    } catch (error) {
        return null
    }
}

// ============================================
// USER MANAGEMENT (Admin Only)
// ============================================

export const getAllUsers = async () => {
    try {
        const q = query(
            collection(db, 'profile_info'),
            orderBy('created_at', 'desc')
        )
        const querySnapshot = await getDocs(q)

        const users = querySnapshot.docs.map(doc => ({
            id: doc.id,
            user_id: doc.data().user_id,
            email: doc.data().email,
            username: doc.data().username,
            full_name: doc.data().full_name,
            role: doc.data().role,
            created_at: doc.data().created_at
        }))

        return { data: users, error: null }
    } catch (error) {
        return { data: [], error }
    }
}

export const createNewUser = async (email, password, role = 'user', fullName = '') => {
    try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Create profile document
        await addDoc(collection(db, 'profile_info'), {
            user_id: user.uid,
            email: email,
            full_name: fullName || 'Your Name',
            tagline: 'Aspiring Software Engineer',
            bio: 'Passionate about creating beautiful, functional applications.',
            role: role,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp()
        })

        return {
            data: { user },
            error: null,
            message: 'User created successfully'
        }
    } catch (error) {
        return { data: null, error }
    }
}

export const updateUserRole = async (userId, newRole) => {
    try {
        const q = query(
            collection(db, 'profile_info'),
            where('user_id', '==', userId),
            limit(1)
        )
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
            return { data: null, error: new Error('User not found') }
        }

        const profileDoc = querySnapshot.docs[0]
        await updateDoc(doc(db, 'profile_info', profileDoc.id), {
            role: newRole
        })

        const updatedDoc = await getDoc(doc(db, 'profile_info', profileDoc.id))
        return {
            data: [{ id: updatedDoc.id, ...updatedDoc.data() }],
            error: null
        }
    } catch (error) {
        return { data: null, error }
    }
}

export const deleteUser = async (userId) => {
    try {
        // Delete profile document
        const q = query(
            collection(db, 'profile_info'),
            where('user_id', '==', userId),
            limit(1)
        )
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
            await deleteDoc(doc(db, 'profile_info', querySnapshot.docs[0].id))
        }

        return {
            data: null,
            error: null,
            message: 'Profile deleted. Note: Firebase Auth user still exists and needs manual deletion.',
            instructions: [
                '1. Go to Firebase Console',
                '2. Navigate to Authentication → Users',
                '3. Find and delete the user manually'
            ]
        }
    } catch (error) {
        return { data: null, error }
    }
}

export const resetUserPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email, {
            url: `${window.location.origin}/reset-password`,
        })

        return { data: { message: 'Password reset email sent' }, error: null }
    } catch (error) {
        return { data: null, error }
    }
}

export const changePassword = async (newPassword) => {
    try {
        const user = getCurrentUser()
        if (!user) return { data: null, error: new Error('Not authenticated') }

        await updatePassword(user, newPassword)
        return { data: { message: 'Password updated successfully' }, error: null }
    } catch (error) {
        return { data: null, error }
    }
}

export const getUserStats = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'profile_info'))

        const users = querySnapshot.docs.map(doc => doc.data().role)
        const stats = {
            total: users.length,
            admins: users.filter(role => role === 'admin').length,
            users: users.filter(role => role === 'user').length,
        }

        return { data: stats, error: null }
    } catch (error) {
        return { data: null, error }
    }
}

export const inviteUser = async (email, role = 'user') => {
    // Firebase doesn't have built-in invitation system
    // You would need to implement this with Cloud Functions
    return {
        data: null,
        error: null,
        message: 'Use createNewUser to create a user account',
        instructions: {
            email,
            role,
            steps: [
                '1. Use createNewUser function to create account',
                '2. User will need to verify their email',
                `3. Their role will be: ${role}`
            ]
        }
    }
}

// ============================================
// CUSTOM RESUME SECTIONS
// ============================================

export const getCustomSections = async (username = null) => {
    try {
        const userId = await getUserId(username)
        console.log('getCustomSections - username:', username, 'userId:', userId)

        if (!userId) return { data: null, error: new Error('User not found') }

        // Simplified query - sort in code to avoid composite index
        const q = query(
            collection(db, 'custom_resume_sections'),
            where('user_id', '==', userId)
        )
        const querySnapshot = await getDocs(q)

        // Sort in code
        const sections = querySnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))

        console.log('getCustomSections - query result:', { data: sections, error: null })
        return { data: sections, error: null }
    } catch (error) {
        console.log('getCustomSections - error:', error)
        return { data: null, error }
    }
}

export const addCustomSection = async (sectionData) => {
    try {
        const userId = await getUserId()
        if (!userId) return { data: null, error: new Error('Not authenticated') }

        const docRef = await addDoc(collection(db, 'custom_resume_sections'), {
            ...sectionData,
            user_id: userId
        })

        const newDoc = await getDoc(docRef)
        return {
            data: { id: newDoc.id, ...newDoc.data() },
            error: null
        }
    } catch (error) {
        return { data: null, error }
    }
}

export const updateCustomSection = async (id, sectionData) => {
    try {
        await updateDoc(doc(db, 'custom_resume_sections', id), sectionData)
        const updatedDoc = await getDoc(doc(db, 'custom_resume_sections', id))
        return {
            data: { id: updatedDoc.id, ...updatedDoc.data() },
            error: null
        }
    } catch (error) {
        return { data: null, error }
    }
}

export const deleteCustomSection = async (id) => {
    try {
        await deleteDoc(doc(db, 'custom_resume_sections', id))
        return { error: null }
    } catch (error) {
        return { error }
    }
}

// ============================================
// ABOUT FEATURES
// ============================================

export const getAboutFeatures = async (username = null) => {
    try {
        const userId = await getUserId(username)
        if (!userId) return { data: null, error: new Error('User not found') }

        // Simplified query - sort in code to avoid composite index
        const q = query(
            collection(db, 'about_features'),
            where('user_id', '==', userId)
        )
        const querySnapshot = await getDocs(q)

        // Sort in code
        const features = querySnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))

        return { data: features, error: null }
    } catch (error) {
        return { data: null, error }
    }
}

export const addAboutFeature = async (featureData) => {
    try {
        const userId = await getUserId()
        if (!userId) return { data: null, error: new Error('Not authenticated') }

        const docRef = await addDoc(collection(db, 'about_features'), {
            ...featureData,
            user_id: userId
        })

        const newDoc = await getDoc(docRef)
        return {
            data: { id: newDoc.id, ...newDoc.data() },
            error: null
        }
    } catch (error) {
        return { data: null, error }
    }
}

export const updateAboutFeature = async (id, featureData) => {
    try {
        await updateDoc(doc(db, 'about_features', id), featureData)
        const updatedDoc = await getDoc(doc(db, 'about_features', id))
        return {
            data: { id: updatedDoc.id, ...updatedDoc.data() },
            error: null
        }
    } catch (error) {
        return { data: null, error }
    }
}

export const deleteAboutFeature = async (id) => {
    try {
        await deleteDoc(doc(db, 'about_features', id))
        return { error: null }
    } catch (error) {
        return { error }
    }
}
