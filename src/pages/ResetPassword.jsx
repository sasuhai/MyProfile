// Note: Migrated from Supabase to Firebase
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, getCurrentUser, changePassword } from '../lib/firebase'
import { Lock, KeyRound, Eye, EyeOff, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const ResetPassword = () => {
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isValidToken, setIsValidToken] = useState(false)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        // Check if we have a valid session from the reset link
        const checkSession = async () => {
            const user = getCurrentUser()
            if (user) {
                setIsValidToken(true)
            } else {
                toast.error('Invalid or expired reset link')
            }
            setChecking(false)
        }
        checkSession()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        setLoading(true)

        try {
            const { error } = await changePassword(password)

            if (error) throw error

            toast.success('Password updated successfully!')

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/admin/login')
            }, 2000)
        } catch (error) {
            console.error('Password reset error:', error)
            toast.error(error.message || 'Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner w-12 h-12"></div>
            </div>
        )
    }

    if (!isValidToken) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-8 max-w-md w-full text-center"
                >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Invalid Reset Link</h1>
                    <p className="text-dark-600 dark:text-dark-400 mb-6">
                        This password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <button
                        onClick={() => navigate('/admin/login')}
                        className="btn btn-primary"
                    >
                        Back to Login
                    </button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="card p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center">
                            <KeyRound className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="font-display text-3xl font-bold mb-2">
                            Reset Password
                        </h1>
                        <p className="text-dark-600 dark:text-dark-400">
                            Enter your new password below
                        </p>
                    </div>

                    {/* Reset Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="input pl-12 pr-12"
                                    placeholder="Enter new password"
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-200"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">
                                Minimum 6 characters
                            </p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="input pl-12 pr-12"
                                    placeholder="Confirm new password"
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-200"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Password Match Indicator */}
                        {password && confirmPassword && (
                            <div className={`flex items-center space-x-2 text-sm ${password === confirmPassword
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                                }`}>
                                <CheckCircle className="w-4 h-4" />
                                <span>
                                    {password === confirmPassword
                                        ? 'Passwords match'
                                        : 'Passwords do not match'}
                                </span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || password !== confirmPassword}
                            className="btn btn-primary w-full"
                        >
                            {loading ? (
                                <>
                                    <div className="spinner w-5 h-5" />
                                    Updating Password...
                                </>
                            ) : (
                                <>
                                    <KeyRound className="w-5 h-5" />
                                    Reset Password
                                </>
                            )}
                        </button>
                    </form>

                    {/* Info */}
                    <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Note:</strong> After resetting your password, you'll be redirected to the login page.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default ResetPassword
