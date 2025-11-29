import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X, Copy, Mail, User, Key, Link as LinkIcon } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

const ApprovalSuccessModal = ({ isOpen, onClose, credentials }) => {
    const [copied, setCopied] = useState(false)

    if (!isOpen || !credentials) return null

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success('Copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
    }

    const copyAllCredentials = () => {
        const text = `
Welcome to Portfolio Platform!

Your access request has been approved. Here are your login credentials:

Username: ${credentials.username}
Temporary Password: ${credentials.tempPassword}
Login URL: ${window.location.origin}/admin/login

IMPORTANT: You must change your password on first login for security reasons.

Steps to login:
1. Go to ${window.location.origin}/admin/login
2. Enter your username and temporary password
3. You'll be prompted to set a new password
4. Complete your profile setup

Note: You can change your username later under "Edit Profile Information" if desired.
Your portfolio URL will be: ${window.location.origin}/${credentials.username}

If you have any questions, please contact the administrator.
        `.trim()

        copyToClipboard(text)
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-green-600 p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold">Access Approved!</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-green-100">
                            User account created successfully
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Info Message */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-900 dark:text-blue-100">
                                    <p className="font-semibold mb-1">Send these credentials to the user</p>
                                    <p>Copy the credentials below and send them to <strong>{credentials.email}</strong> via your preferred method (email, chat, etc.)</p>
                                </div>
                            </div>
                        </div>

                        {/* Credentials */}
                        <div className="space-y-3">
                            {/* Username */}
                            <div className="bg-dark-50 dark:bg-dark-900 rounded-lg p-4 border border-dark-200 dark:border-dark-700">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2 text-sm text-dark-600 dark:text-dark-400">
                                        <User className="w-4 h-4" />
                                        <span>Username</span>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(credentials.username)}
                                        className="p-1 hover:bg-dark-200 dark:hover:bg-dark-700 rounded transition-colors"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="font-mono font-semibold text-lg">{credentials.username}</p>
                            </div>

                            {/* Password */}
                            <div className="bg-dark-50 dark:bg-dark-900 rounded-lg p-4 border border-dark-200 dark:border-dark-700">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2 text-sm text-dark-600 dark:text-dark-400">
                                        <Key className="w-4 h-4" />
                                        <span>Temporary Password</span>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(credentials.tempPassword)}
                                        className="p-1 hover:bg-dark-200 dark:hover:bg-dark-700 rounded transition-colors"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="font-mono font-semibold text-lg">{credentials.tempPassword}</p>
                            </div>

                            {/* Login URL */}
                            <div className="bg-dark-50 dark:bg-dark-900 rounded-lg p-4 border border-dark-200 dark:border-dark-700">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2 text-sm text-dark-600 dark:text-dark-400">
                                        <LinkIcon className="w-4 h-4" />
                                        <span>Login URL</span>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(`${window.location.origin}/admin/login`)}
                                        className="p-1 hover:bg-dark-200 dark:hover:bg-dark-700 rounded transition-colors"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="font-mono text-sm break-all">{window.location.origin}/admin/login</p>
                            </div>
                        </div>

                        {/* Warning */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                            <p className="text-sm text-amber-900 dark:text-amber-100">
                                ⚠️ <strong>Important:</strong> The user must change their password on first login for security.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={copyAllCredentials}
                                className="btn btn-primary flex-1"
                            >
                                <Copy className="w-5 h-5" />
                                {copied ? 'Copied!' : 'Copy All Credentials'}
                            </button>
                            <button
                                onClick={onClose}
                                className="btn btn-secondary flex-1"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

export default ApprovalSuccessModal
