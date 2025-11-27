import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const ThemeContext = createContext()

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider')
    }
    return context
}

export const ThemeProvider = ({ children, username }) => {
    const [themeColor, setThemeColor] = useState('#3b82f6') // Default blue

    useEffect(() => {
        loadThemeColor()
    }, [username])

    const loadThemeColor = async () => {
        try {
            // Get user ID from username
            const { data: userData } = await supabase
                .from('profile_info')
                .select('theme_color, user_id')
                .eq('username', username || 'sasuhai')
                .single()

            if (userData?.theme_color) {
                applyThemeColor(userData.theme_color)
            }
        } catch (error) {
            console.error('Error loading theme color:', error)
        }
    }

    const applyThemeColor = (color) => {
        setThemeColor(color)

        // Apply CSS custom properties
        const root = document.documentElement

        // Convert hex to RGB
        const hex = color.replace('#', '')
        const r = parseInt(hex.substr(0, 2), 16)
        const g = parseInt(hex.substr(2, 2), 16)
        const b = parseInt(hex.substr(4, 2), 16)

        // Set CSS variables for different shades
        root.style.setProperty('--color-primary-50', `${r + 20} ${g + 20} ${b + 20}`)
        root.style.setProperty('--color-primary-100', `${r + 15} ${g + 15} ${b + 15}`)
        root.style.setProperty('--color-primary-200', `${r + 10} ${g + 10} ${b + 10}`)
        root.style.setProperty('--color-primary-300', `${r + 5} ${g + 5} ${b + 5}`)
        root.style.setProperty('--color-primary-400', `${r} ${g} ${b}`)
        root.style.setProperty('--color-primary-500', `${r} ${g} ${b}`)
        root.style.setProperty('--color-primary-600', `${Math.max(0, r - 10)} ${Math.max(0, g - 10)} ${Math.max(0, b - 10)}`)
        root.style.setProperty('--color-primary-700', `${Math.max(0, r - 20)} ${Math.max(0, g - 20)} ${Math.max(0, b - 20)}`)
        root.style.setProperty('--color-primary-800', `${Math.max(0, r - 30)} ${Math.max(0, g - 30)} ${Math.max(0, b - 30)}`)
        root.style.setProperty('--color-primary-900', `${Math.max(0, r - 40)} ${Math.max(0, g - 40)} ${Math.max(0, b - 40)}`)
    }

    return (
        <ThemeContext.Provider value={{ themeColor, applyThemeColor }}>
            {children}
        </ThemeContext.Provider>
    )
}
