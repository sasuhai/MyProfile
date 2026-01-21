// Note: Migrated from Supabase to Firebase
import { createContext, useContext, useEffect, useState } from 'react'
import { auth, getCurrentUser, onAuthChange } from '../lib/firebase'

const AuthContext = createContext({})

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check active sessions and sets the user
        const currentUser = getCurrentUser()
        setUser(currentUser)
        setLoading(false)

        // Listen for changes on auth state (logged in, signed out, etc.)
        const unsubscribe = onAuthChange((user) => {
            setUser(user)
            setLoading(false)
        })

        return () => {
            unsubscribe()
        }
    }, [])

    const value = {
        user,
        loading,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
