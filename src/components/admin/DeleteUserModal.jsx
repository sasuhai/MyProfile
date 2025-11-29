import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Trash2, CheckCircle2 } from 'lucide-react'

const DeleteUserModal = ({ isOpen, onClose, onConfirm, user, isDeleting }) => {
    if (!isOpen || !user) return null

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
                    <div className="bg-red-600 p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold">Delete User</h2>
                            </div>
                            <button
                                onClick={onClose}
                                disabled={isDeleting}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-red-100">
                            This action cannot be undone
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* User Info */}
                        <div className="bg-dark-50 dark:bg-dark-900 rounded-lg p-4 border border-dark-200 dark:border-dark-700">
                            <p className="text-sm text-dark-600 dark:text-dark-400 mb-2">
                                You are about to delete:
                            </p>
                            <div className="space-y-1">
                                <p className="font-semibold text-lg">{user.full_name}</p>
                                <p className="text-sm text-dark-600 dark:text-dark-400">{user.email}</p>
                                {user.username && (
                                    <p className="text-sm text-primary-600 dark:text-primary-400 font-mono">
                                        @{user.username}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Warning Message */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-900 dark:text-amber-100">
                                    <p className="font-semibold mb-2">This will permanently delete:</p>
                                    <ul className="space-y-1.5">
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>User account and authentication</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>Profile information and settings</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>All projects, skills, and portfolio content</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>Profile and project images from storage</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>Work experience, education, and certifications</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>All messages and contact form submissions</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Confirmation Text */}
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <p className="text-sm text-red-900 dark:text-red-100 font-medium text-center">
                                ⚠️ This action is irreversible and cannot be undone
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col-reverse sm:flex-row gap-3">
                            <button
                                onClick={onClose}
                                disabled={isDeleting}
                                className="btn btn-secondary flex-1 disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isDeleting}
                                className="btn bg-red-600 hover:bg-red-700 text-white flex-1 disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-5 h-5" />
                                        <span>Yes, Delete User</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

export default DeleteUserModal
