import { motion, AnimatePresence } from 'framer-motion'
import { XCircle, X, AlertTriangle } from 'lucide-react'

const RejectRequestModal = ({ isOpen, onClose, onConfirm, request, isRejecting }) => {
    if (!isOpen || !request) return null

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
                    <div className="bg-amber-600 p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold">Reject Access Request</h2>
                            </div>
                            <button
                                onClick={onClose}
                                disabled={isRejecting}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-amber-100">
                            This will decline the user's request
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Request Info */}
                        <div className="bg-dark-50 dark:bg-dark-900 rounded-lg p-4 border border-dark-200 dark:border-dark-700">
                            <p className="text-sm text-dark-600 dark:text-dark-400 mb-2">
                                You are about to reject the request from:
                            </p>
                            <div className="space-y-1">
                                <p className="font-semibold text-lg">{request.full_name}</p>
                                <p className="text-sm text-dark-600 dark:text-dark-400">{request.email}</p>
                            </div>
                        </div>

                        {/* Info Message */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-900 dark:text-amber-100">
                                    <p className="font-semibold mb-2">What happens when you reject:</p>
                                    <ul className="space-y-1.5">
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>Request status will be changed to "Rejected"</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>No user account will be created</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>The requestor will not be notified automatically</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>You can delete this request later if needed</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Optional: Reason for rejection */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                💡 <strong>Tip:</strong> Consider sending a personal email to {request.full_name}
                                explaining why their request was declined, if appropriate.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col-reverse sm:flex-row gap-3">
                            <button
                                onClick={onClose}
                                disabled={isRejecting}
                                className="btn btn-secondary flex-1 disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isRejecting}
                                className="btn bg-amber-600 hover:bg-amber-700 text-white flex-1 disabled:opacity-50"
                            >
                                {isRejecting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Rejecting...</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-5 h-5" />
                                        <span>Yes, Reject Request</span>
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

export default RejectRequestModal
