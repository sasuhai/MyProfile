import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Sparkles } from 'lucide-react'

const UsernamePrompt = () => {
    const [username, setUsername] = useState('')
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        if (username.trim()) {
            navigate(`/${username.trim()}`)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="card p-8 text-center">
                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center"
                    >
                        <User className="w-10 h-10 text-white" />
                    </motion.div>

                    {/* Title */}
                    <h1 className="font-display text-3xl font-bold mb-2">
                        Welcome to <span className="gradient-text">Portfolio</span>
                    </h1>
                    <p className="text-dark-600 dark:text-dark-400 mb-8">
                        Enter a username to view their portfolio
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username..."
                                className="input pl-12 text-center text-lg"
                                autoFocus
                            />
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                        </div>

                        <button
                            type="submit"
                            disabled={!username.trim()}
                            className="btn btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            View Portfolio
                        </button>
                    </form>

                    {/* About Button */}
                    <div className="mt-4">
                        <button
                            onClick={() => navigate('/about')}
                            className="btn btn-primary w-full text-lg inline-flex items-center justify-center space-x-2"
                        >
                            <Sparkles className="w-5 h-5" />
                            <span>About this App</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default UsernamePrompt
