// Note: Migrated from Supabase to Firebase
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, resetUserPassword, db } from '../../lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { Lock, Mail, LogIn, KeyRound, X } from 'lucide-react'
import toast from 'react-hot-toast'
import ChangePasswordModal from '../../components/admin/ChangePasswordModal'

const AdminLogin = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const [loading, setLoading] = useState(false)
    const [showForgotPassword, setShowForgotPassword] = useState(false)
    const [resetEmail, setResetEmail] = useState('')
    const [resetLoading, setResetLoading] = useState(false)
    const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false)
    const [mustChangePassword, setMustChangePassword] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data, error } = await signIn(formData.email, formData.password)

            if (error) throw error

            // Check if user must change password
            const q = query(
                collection(db, 'profile_info'),
                where('user_id', '==', data.user.uid)
            )
            const querySnapshot = await getDocs(q)

            if (!querySnapshot.empty) {
                const profile = querySnapshot.docs[0]
                if (profile.data().must_change_password) {
                    // Show password change modal instead of navigating
                    setMustChangePassword(true)
                    setShowPasswordChangeModal(true)
                    toast.success('Login successful! Please change your password.')
                    setLoading(false)
                    return
                }
            }

            toast.success('Login successful!')
            navigate('/admin/dashboard')
        } catch (error) {
            console.error('Login error:', error)
            toast.error(error.message || 'Invalid credentials')
        } finally {
            setLoading(false)
        }
    }

    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [sentToEmail, setSentToEmail] = useState('')

    const handleForgotPassword = async (e) => {
        e.preventDefault()
        setResetLoading(true)

        try {
            const { error } = await resetUserPassword(resetEmail)

            if (error) throw error

            // Show success modal instead of toast
            setSentToEmail(resetEmail)
            setShowForgotPassword(false)
            setShowSuccessModal(true)
            setResetEmail('')
        } catch (error) {
            console.error('Password reset error:', error)
            toast.error(error.message || 'Failed to send reset email')
        } finally {
            setResetLoading(false)
        }
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
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="font-display text-3xl font-bold mb-2">
                            Admin Login
                        </h1>
                        <p className="text-dark-600 dark:text-dark-400">
                            Sign in to manage your portfolio
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="input pl-12"
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-sm font-medium">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="input pl-12"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full"
                        >
                            {loading ? (
                                <>
                                    <div className="spinner w-5 h-5" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    {/* Info */}
                    <div className="mt-6 p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                        <p className="text-sm text-primary-700 dark:text-primary-300">
                            <strong>Note:</strong> This is a protected area. Only authorized administrators can access this section.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Forgot Password Modal */}
            <AnimatePresence>
                {showForgotPassword && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowForgotPassword(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="card p-8 w-full max-w-md">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                            <KeyRound className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <h2 className="text-2xl font-bold">Reset Password</h2>
                                    </div>
                                    <button
                                        onClick={() => setShowForgotPassword(false)}
                                        className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <p className="text-dark-600 dark:text-dark-400 mb-6">
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>

                                <form onSubmit={handleForgotPassword} className="space-y-4">
                                    <div>
                                        <label htmlFor="resetEmail" className="block text-sm font-medium mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                            <input
                                                type="email"
                                                id="resetEmail"
                                                value={resetEmail}
                                                onChange={(e) => setResetEmail(e.target.value)}
                                                required
                                                className="input pl-12"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex space-x-3">
                                        <button
                                            type="submit"
                                            disabled={resetLoading}
                                            className="btn btn-primary flex-1"
                                        >
                                            {resetLoading ? (
                                                <>
                                                    <div className="spinner w-5 h-5" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Mail className="w-5 h-5" />
                                                    Send Reset Link
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowForgotPassword(false)}
                                            className="btn btn-secondary"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>

                                <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        Check your email inbox for the password reset link. It may take a few minutes to arrive.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="card p-8 w-full max-w-md">
                                <div className="text-center">
                                    {/* Success Icon */}
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                        <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-2xl font-bold mb-4">
                                        Password Reset Email Sent!
                                    </h2>

                                    {/* Message */}
                                    <div className="space-y-4 text-left mb-6">
                                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                            <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                                                <strong>From:</strong> Portfolio System (via Supabase)
                                            </p>
                                            <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                                                <strong>To:</strong> {sentToEmail}
                                            </p>
                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                <strong>Subject:</strong> Reset your password
                                            </p>
                                        </div>

                                        <p className="text-dark-600 dark:text-dark-400 text-sm">
                                            Please check your email inbox and click the reset link to set a new password. The link will expire in 1 hour.
                                        </p>

                                        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                            <p className="text-xs text-amber-700 dark:text-amber-300">
                                                <strong>Note:</strong> If you don't see the email, please check your spam folder.
                                            </p>
                                        </div>
                                    </div>

                                    {/* OK Button */}
                                    <button
                                        onClick={() => setShowSuccessModal(false)}
                                        className="btn btn-primary w-full"
                                    >
                                        OK, Got It!
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Change Password Modal */}
            <ChangePasswordModal
                isOpen={showPasswordChangeModal}
                onClose={() => {
                    setShowPasswordChangeModal(false)
                    // After password change, navigate to dashboard
                    navigate('/admin/dashboard')
                }}
                isForced={mustChangePassword}
            />
        </div>
    )
}

export default AdminLogin
