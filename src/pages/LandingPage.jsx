import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { getAllProfiles } from '../lib/supabase'
import { Users, ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const LandingPage = () => {
    const [profiles, setProfiles] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadProfiles()
    }, [])

    const loadProfiles = async () => {
        const { data, error } = await getAllProfiles()
        if (!error && data) {
            setProfiles(data)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
            {/* Hero Section */}
            <div className="container-custom py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 mb-6">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">Professional Portfolios</span>
                    </div>

                    <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
                        Discover Amazing
                        <br />
                        <span className="gradient-text">Portfolios</span>
                    </h1>

                    <p className="text-xl text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
                        Explore portfolios from talented professionals showcasing their work, skills, and achievements
                    </p>
                </motion.div>

                {/* Profiles Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="spinner w-12 h-12"></div>
                    </div>
                ) : profiles.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <Users className="w-16 h-16 mx-auto mb-4 text-dark-300 dark:text-dark-700" />
                        <h3 className="text-2xl font-bold mb-2">No Portfolios Yet</h3>
                        <p className="text-dark-600 dark:text-dark-400">
                            Be the first to create your portfolio!
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {profiles.map((profile, index) => (
                            <motion.div
                                key={profile.username}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link
                                    to={`/${profile.username}`}
                                    className="block card p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                                >
                                    {/* Profile Image */}
                                    <div className="flex items-center space-x-4 mb-4">
                                        {profile.profile_image_url ? (
                                            <img
                                                src={profile.profile_image_url}
                                                alt={profile.full_name}
                                                className="w-16 h-16 rounded-full object-cover ring-4 ring-primary-100 dark:ring-primary-900/20"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center ring-4 ring-primary-100 dark:ring-primary-900/20">
                                                <span className="text-2xl font-bold text-white">
                                                    {profile.full_name?.charAt(0) || '?'}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                {profile.full_name}
                                            </h3>
                                            <p className="text-sm text-dark-500 dark:text-dark-400 truncate">
                                                @{profile.username}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Tagline */}
                                    <p className="text-dark-600 dark:text-dark-400 mb-4 line-clamp-2 min-h-[3rem]">
                                        {profile.tagline || 'Portfolio Owner'}
                                    </p>

                                    {/* View Button */}
                                    <div className="flex items-center text-primary-600 dark:text-primary-400 font-medium group-hover:translate-x-2 transition-transform">
                                        <span className="text-sm">View Portfolio</span>
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Admin Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-16"
                >
                    <Link
                        to="/admin/login"
                        className="inline-flex items-center space-x-2 text-sm text-dark-500 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                        <span>Admin Access</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        </div>
    )
}

export default LandingPage
