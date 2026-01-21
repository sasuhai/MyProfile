// Note: Migrated from Supabase to Firebase
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { changePassword, getCurrentUser, db } from '../../lib/firebase'
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import toast from 'react-hot-toast'

const ChangePasswordModal = ({ isOpen, onClose, isForced = false }) => {
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const validatePassword = (password) => {
        const errors = []
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long')
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter')
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter')
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number')
        }
        return errors
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        // Clear errors when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrors({})

        // Validate passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            setErrors({ confirmPassword: 'Passwords do not match' })
            return
        }

        // Validate password strength
        const passwordErrors = validatePassword(formData.newPassword)
        if (passwordErrors.length > 0) {
            setErrors({ newPassword: passwordErrors.join('. ') })
            return
        }

        setLoading(true)

        try {
            // Change password
            const { error: passwordError } = await changePassword(formData.newPassword)
            if (passwordError) throw passwordError

            // Clear the must_change_password flag
            const user = getCurrentUser()
            if (user) {
                const q = query(
                    collection(db, 'profile_info'),
                    where('user_id', '==', user.uid)
                )
                const querySnapshot = await getDocs(q)

                if (!querySnapshot.empty) {
                    const profileDoc = querySnapshot.docs[0]
                    await updateDoc(doc(db, 'profile_info', profileDoc.id), {
                        must_change_password: false
                    })
                }
            }

            toast.success('Password changed successfully!')

            // Reset form
            setFormData({ newPassword: '', confirmPassword: '' })

            // Close modal if not forced
            if (!isForced) {
                onClose()
            } else {
                // Reload page to refresh auth state
                window.location.reload()
            }
        } catch (error) {
            console.error('Password change error:', error)
            toast.error(error.message || 'Failed to change password')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={isForced ? undefined : onClose}
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
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${isForced
                            ? 'bg-amber-100 dark:bg-amber-900/20'
                            : 'bg-primary-100 dark:bg-primary-900/20'
                            }`}>
                            {isForced ? (
                                <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                            ) : (
                                <Lock className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold mb-2">
                            {isForced ? 'Password Change Required' : 'Change Password'}
                        </h2>
                        <p className="text-dark-600 dark:text-dark-400">
                            {isForced
                                ? 'For security reasons, you must change your password before continuing.'
                                : 'Enter your new password below.'
                            }
                        </p>
                    </div>

                    {/* Warning for forced change */}
                    {isForced && (
                        <div className="mb-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                <strong>Important:</strong> This is your first login with a temporary password.
                                Please create a strong, unique password that you'll remember.
                            </p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* New Password */}
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    required
                                    className={`input pl-12 pr-12 ${errors.newPassword ? 'border-red-500' : ''}`}
                                    placeholder="Enter new password"
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
                            {errors.newPassword && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {errors.newPassword}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className={`input pl-12 pr-12 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                    placeholder="Confirm new password"
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
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        {/* Password Requirements */}
                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
                                Password Requirements:
                            </p>
                            <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                                <li>• At least 8 characters long</li>
                                <li>• Contains uppercase and lowercase letters</li>
                                <li>• Contains at least one number</li>
                            </ul>
                        </div>

                        {/* Buttons */}
                        <div className="flex space-x-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary flex-1"
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner w-5 h-5" />
                                        Changing Password...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-5 h-5" />
                                        Change Password
                                    </>
                                )}
                            </button>
                            {!isForced && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

export default ChangePasswordModal
