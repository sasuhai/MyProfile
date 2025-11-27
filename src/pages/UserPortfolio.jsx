import { useParams, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getProfileByUsername } from '../lib/supabase'
import { useTheme } from '../contexts/ThemeContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Home from './Home'
import About from './About'
import Resume from './Resume'
import Portfolio from './Portfolio'
import Contact from './Contact'
import { motion } from 'framer-motion'

const UserPortfolio = () => {
    const { username } = useParams()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { setThemeColor } = useTheme()

    useEffect(() => {
        loadProfile()
    }, [username])

    const loadProfile = async () => {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await getProfileByUsername(username)

        if (fetchError || !data) {
            setError('User not found')
            setProfile(null)
        } else {
            setProfile(data)
            // Apply theme color if available
            if (data.theme_color) {
                setThemeColor(data.theme_color)
            }
        }

        setLoading(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950">
                <div className="text-center">
                    <div className="spinner w-12 h-12 mx-auto mb-4"></div>
                    <p className="text-dark-600 dark:text-dark-400">Loading portfolio...</p>
                </div>
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <span className="text-5xl">404</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Portfolio Not Found</h1>
                    <p className="text-xl text-dark-600 dark:text-dark-400 mb-8">
                        The user <span className="font-mono text-primary-600 dark:text-primary-400">@{username}</span> doesn't exist
                    </p>
                    <a href="/" className="btn btn-primary">
                        ← Back to Home
                    </a>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar username={username} profile={profile} />
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<Home username={username} profile={profile} />} />
                    <Route path="/about" element={<About username={username} profile={profile} />} />
                    <Route path="/resume" element={<Resume username={username} profile={profile} />} />
                    <Route path="/portfolio" element={<Portfolio username={username} profile={profile} />} />
                    <Route path="/contact" element={<Contact username={username} profile={profile} />} />
                    <Route path="*" element={<Navigate to={`/${username}`} replace />} />
                </Routes>
            </main>
            <Footer username={username} />
        </div>
    )
}

export default UserPortfolio
