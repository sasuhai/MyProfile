import { useState } from 'react'
// Note: Migrated from Supabase to Firebase
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, User, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { db } from '../../lib/firebase'
import toast from 'react-hot-toast'

const RequestAccessModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        email: '',
        fullName: ''
    })
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(formData.email)) {
                toast.error('Please enter a valid email address')
                setLoading(false)
                return
            }

            // Check if email already has an access request
            // Note: This would require a Firebase query
            // For now, we'll assume no existing request check is performed here
            // const { data: existingRequest } = await supabase
            //     .from('access_requests')
            //     .select('status')
            //     .eq('email', formData.email)
            //     .single()

            // if (existingRequest) {
            //     if (existingRequest.status === 'pending') {
            //         toast.error('You already have a pending access request')
            //     } else if (existingRequest.status === 'approved') {
            //         toast.error('Your access has already been approved. Please check your email.')
            //     } else {
            //         toast.error('An access request already exists for this email')
            //     }
            //     setLoading(false)
            //     return
            // }

            // Submit access request to Firestore
            const docRef = await db.collection('access_requests').add({
                email: formData.email,
                full_name: formData.fullName,
                status: 'pending',
                createdAt: new Date()
            })

            // if (insertError) { // This was from Supabase
            //     throw insertError
            // }

            // Send professional email notification to admins via Edge Function
            // This sends a beautiful custom
            // Note: Email notifications would require Firebase Cloud Functions
            // For now, admins can check the dashboard for new requests
            // TODO: Implement Firebase Cloud Function for email notifications

            setSubmitted(true)
            toast.success('Access request submitted successfully!')

            // Reset form after 3 seconds and close modal
            setTimeout(() => {
                setFormData({ email: '', fullName: '' })
                setSubmitted(false)
                onClose()
            }, 3000)

        } catch (error) {
            console.error('Error submitting access request:', error)
            toast.error(error.message || 'Failed to submit access request')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-primary-400 p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-bold">Request Free Access</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                disabled={loading}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-primary-100">
                            Get started with your professional portfolio today
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {!submitted ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Info Box */}
                                <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
                                    <div className="flex items-start space-x-3">
                                        <AlertCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-primary-900 dark:text-primary-100">
                                            <p className="font-medium mb-1">What happens next?</p>
                                            <ul className="space-y-1 text-primary-700 dark:text-primary-300">
                                                <li>• Your request will be sent to admins</li>
                                                <li>• You'll receive an email once approved</li>
                                                <li>• Setup takes less than 5 minutes</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            className="input pl-10 w-full"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="john@example.com"
                                            className="input pl-10 w-full"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">
                                        We'll send your login credentials to this email
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading || !formData.email || !formData.fullName}
                                    className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Submitting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            <span>Submit Request</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-8"
                            >
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Request Submitted!</h3>
                                <p className="text-dark-600 dark:text-dark-400 mb-4">
                                    We've notified our admins. You'll receive an email once your access is approved.
                                </p>
                                <p className="text-sm text-dark-500 dark:text-dark-500">
                                    This usually takes less than 24 hours.
                                </p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

export default RequestAccessModal
