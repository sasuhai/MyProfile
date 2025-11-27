import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({})

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider')
    }
    return context
}

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Check localStorage first, then system preference
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme) return savedTheme

        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    })

    const [themeColor, setThemeColor] = useState('#3b82f6') // Default blue

    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    useEffect(() => {
        applyThemeColor(themeColor)
    }, [themeColor])

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
    }

    const applyThemeColor = (color) => {
        const root = document.documentElement

        // Convert hex to RGB
        const hex = color.replace('#', '')
        const r = parseInt(hex.substr(0, 2), 16)
        const g = parseInt(hex.substr(2, 2), 16)
        const b = parseInt(hex.substr(4, 2), 16)

        // Helper to create lighter/darker shades
        const lighten = (value, amount) => Math.min(255, value + amount)
        const darken = (value, amount) => Math.max(0, value - amount)

        // Set CSS variables for different shades
        root.style.setProperty('--color-primary-50', `${lighten(r, 90)} ${lighten(g, 90)} ${lighten(b, 90)}`)
        root.style.setProperty('--color-primary-100', `${lighten(r, 75)} ${lighten(g, 75)} ${lighten(b, 75)}`)
        root.style.setProperty('--color-primary-200', `${lighten(r, 60)} ${lighten(g, 60)} ${lighten(b, 60)}`)
        root.style.setProperty('--color-primary-300', `${lighten(r, 40)} ${lighten(g, 40)} ${lighten(b, 40)}`)
        root.style.setProperty('--color-primary-400', `${lighten(r, 20)} ${lighten(g, 20)} ${lighten(b, 20)}`)
        root.style.setProperty('--color-primary-500', `${r} ${g} ${b}`)
        root.style.setProperty('--color-primary-600', `${darken(r, 20)} ${darken(g, 20)} ${darken(b, 20)}`)
        root.style.setProperty('--color-primary-700', `${darken(r, 40)} ${darken(g, 40)} ${darken(b, 40)}`)
        root.style.setProperty('--color-primary-800', `${darken(r, 60)} ${darken(g, 60)} ${darken(b, 60)}`)
        root.style.setProperty('--color-primary-900', `${darken(r, 80)} ${darken(g, 80)} ${darken(b, 80)}`)
    }

    const value = {
        theme,
        toggleTheme,
        setTheme,
        themeColor,
        setThemeColor,
        applyThemeColor,
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}
