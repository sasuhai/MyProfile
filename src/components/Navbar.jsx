import { Link, useLocation, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Moon, Sun, Menu, X, Home, User, Briefcase, FolderGit2, Mail } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useState } from 'react'

const Navbar = ({ username: usernameProp, profile }) => {
    const { theme, toggleTheme } = useTheme()
    const location = useLocation()
    const { username: usernameParam } = useParams()
    const username = usernameProp || usernameParam
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const basePath = username ? `/${username}` : ''

    const navItems = [
        { name: 'Home', path: basePath || '/', icon: Home },
        { name: 'About', path: `${basePath}/about`, icon: User },
        { name: 'Resume', path: `${basePath}/resume`, icon: Briefcase },
        { name: 'Portfolio', path: `${basePath}/portfolio`, icon: FolderGit2 },
        { name: 'Contact', path: `${basePath}/contact`, icon: Mail },
    ]

    const isActive = (path) => {
        if (path === '/' || path === basePath) {
            return location.pathname === '/' || location.pathname === basePath
        }
        return location.pathname === path
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-dark-200/20 dark:border-dark-700/20">
            <div className="container-custom">
                <div className="flex items-center justify-between h-20 sm:h-24 py-3">{/* Logo & Profile Info */}
                    <div className="flex flex-col">
                        <Link to="/" className="flex items-center space-x-2 group">
                            <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold text-xl"
                            >
                                P
                            </motion.div>
                            <span className="font-display text-xl font-bold gradient-text">
                                Portfolio
                            </span>
                        </Link>

                        {/* Profile Info - Below Logo */}
                        {profile && (
                            <div className="flex items-center space-x-2 ml-12 mt-1 text-sm text-dark-600 dark:text-dark-400">
                                <span className="font-medium text-dark-700 dark:text-dark-300">
                                    {profile.full_name}
                                </span>
                                <span>•</span>
                                <span className="text-primary-600 dark:text-primary-400">
                                    @{username}
                                </span>
                                <span>•</span>
                                <span>
                                    {profile.email}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                <span className={`${isActive(item.path)
                                    ? 'text-primary-600 dark:text-primary-400'
                                    : 'text-dark-600 dark:text-dark-300 hover:text-dark-900 dark:hover:text-dark-50'
                                    }`}>
                                    {item.name}
                                </span>
                                {isActive(item.path) && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 to-primary-400"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </Link>
                        ))}

                        {/* Admin Only Link */}
                        <Link
                            to="/admin/login"
                            className="relative px-4 py-2 rounded-lg text-sm font-medium transition-colors border-l border-dark-200 dark:border-dark-700 ml-2"
                        >
                            <span className={`${location.pathname.startsWith('/admin')
                                ? 'text-primary-600 dark:text-primary-400'
                                : 'text-dark-600 dark:text-dark-300 hover:text-dark-900 dark:hover:text-dark-50'
                                }`}>
                                Admin Only
                            </span>
                            {location.pathname.startsWith('/admin') && (
                                <motion.div
                                    layoutId="navbar-indicator"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 to-primary-400"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}
                        </Link>
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center space-x-2">
                        {/* Theme toggle */}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-5 h-5 text-yellow-500" />
                            ) : (
                                <Moon className="w-5 h-5 text-dark-600" />
                            )}
                        </motion.button>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden py-4 border-t border-dark-200/20 dark:border-dark-700/20"
                    >
                        <div className="flex flex-col space-y-2">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                            : 'hover:bg-dark-100 dark:hover:bg-dark-800'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                )
                            })}

                            {/* Admin Only Link - Mobile */}
                            <div className="border-t border-dark-200 dark:border-dark-700 pt-2 mt-2">
                                <Link
                                    to="/admin/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${location.pathname.startsWith('/admin')
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                        : 'hover:bg-dark-100 dark:hover:bg-dark-800'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span className="font-medium">Admin Only</span>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </nav>
    )
}

export default Navbar
