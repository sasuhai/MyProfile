import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

const MobilePageNavigation = ({ username }) => {
    const navigate = useNavigate()
    const location = useLocation()

    // Define page sequence
    const pages = [
        { path: `/${username}`, label: 'Home' },
        { path: `/${username}/about`, label: 'About' },
        { path: `/${username}/resume`, label: 'Resume' },
        { path: `/${username}/portfolio`, label: 'Portfolio' },
        { path: `/${username}/contact`, label: 'Contact' }
    ]

    // Find current page index
    const currentIndex = pages.findIndex(page => page.path === location.pathname)

    // Get previous and next pages
    const previousPage = currentIndex > 0 ? pages[currentIndex - 1] : null
    const nextPage = currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null

    // Handle navigation with scroll to top
    const handleNavigation = (path) => {
        navigate(path)
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Don't show if not on a valid page
    if (currentIndex === -1) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden w-full py-6 px-4 bg-white dark:bg-dark-900 border-t border-dark-200 dark:border-dark-800"
        >
            <div className="container-custom max-w-4xl">
                <div className="flex items-center justify-between gap-4">
                    {/* Previous Button */}
                    {previousPage ? (
                        <button
                            onClick={() => handleNavigation(previousPage.path)}
                            className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors flex-1"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <div className="text-left flex-1">
                                <div className="text-xs text-dark-500 dark:text-dark-400">Previous</div>
                                <div className="font-medium">{previousPage.label}</div>
                            </div>
                        </button>
                    ) : (
                        <div className="flex-1" />
                    )}

                    {/* Current Page Indicator */}
                    <div className="flex items-center space-x-1">
                        {pages.map((page, index) => (
                            <div
                                key={page.path}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                    ? 'bg-primary-600 w-6'
                                    : 'bg-dark-300 dark:bg-dark-700'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Next Button */}
                    {nextPage ? (
                        <button
                            onClick={() => handleNavigation(nextPage.path)}
                            className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors flex-1"
                        >
                            <div className="text-right flex-1">
                                <div className="text-xs text-primary-100">Next</div>
                                <div className="font-medium">{nextPage.label}</div>
                            </div>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <div className="flex-1" />
                    )}
                </div>
            </div>
        </motion.div>
    )
}

export default MobilePageNavigation
