import { useState, useEffect } from 'react'
// Note: Migrated from Supabase to Firebase
import { motion, AnimatePresence } from 'framer-motion'
import { UserCheck, X, Check, XCircle, Clock, Mail, Phone, MessageSquare, Calendar, User, Loader, RefreshCw, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { db, getCurrentUser } from '../../lib/firebase'
import { collection, query, where, getDocs, updateDoc, doc, orderBy, deleteDoc } from 'firebase/firestore'
import { createUserWithProfile } from '../../lib/supabaseAdmin'
import toast from 'react-hot-toast'
import RejectRequestModal from './RejectRequestModal'
import ApprovalSuccessModal from './ApprovalSuccessModal'

const AccessRequestsManager = () => {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState(null)
    const [filter, setFilter] = useState('pending') // pending, approved, rejected, all
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [requestToReject, setRequestToReject] = useState(null)
    const [isRejecting, setIsRejecting] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [approvedCredentials, setApprovedCredentials] = useState(null)

    useEffect(() => {
        loadRequests()
    }, [filter])

    const loadRequests = async () => {
        setLoading(true)
        try {
            // Build query based on filter
            let q
            if (filter === 'all') {
                q = query(collection(db, 'access_requests'))
            } else {
                q = query(
                    collection(db, 'access_requests'),
                    where('status', '==', filter)
                )
            }

            const querySnapshot = await getDocs(q)

            // Sort in code to avoid composite index
            const data = querySnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .sort((a, b) => {
                    const dateA = a.created_at?.toMillis?.() || 0
                    const dateB = b.created_at?.toMillis?.() || 0
                    return dateB - dateA // Descending (newest first)
                })

            setRequests(data || [])
        } catch (error) {
            console.error('Error loading requests:', error)
            toast.error('Failed to load access requests')
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (request) => {
        setProcessingId(request.id)
        try {
            // Generate a random password
            const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'

            // Generate unique username from email (alphanumeric only, no underscores)
            const baseUsername = request.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
            const randomSuffix = Math.random().toString(36).substring(2, 6)
            const uniqueUsername = `${baseUsername}${randomSuffix}` // No underscore!

            // Create user account
            const result = await createUserWithProfile({
                email: request.email,
                password: tempPassword,
                fullName: request.full_name,
                username: uniqueUsername,
                role: 'user'
            })

            if (!result.success) {
                throw new Error(result.error)
            }

            // Get current user (admin)
            const user = getCurrentUser()

            // Update request status in Firestore
            await updateDoc(doc(db, 'access_requests', request.id), {
                status: 'approved',
                approved_by: user.uid,
                approved_at: new Date(),
                user_id: result.data.userId
            })

            // Show success modal with credentials for admin to send to user
            setApprovedCredentials({
                email: request.email,
                fullName: request.full_name,
                username: result.data.username,
                tempPassword: tempPassword
            })
            setShowSuccessModal(true)

            toast.success(`Access approved for ${request.full_name}`)
            loadRequests()
        } catch (error) {
            console.error('Error approving request:', error)
            toast.error(error.message || 'Failed to approve request')
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (request) => {
        // Open modal for confirmation
        setRequestToReject(request)
        setShowRejectModal(true)
    }

    const confirmReject = async () => {
        if (!requestToReject) return

        setIsRejecting(true)
        try {
            const user = getCurrentUser()

            // Update request status in Firestore
            await updateDoc(doc(db, 'access_requests', requestToReject.id), {
                status: 'rejected',
                approved_by: user.uid,
                approved_at: new Date()
            })

            toast.success(`Access request rejected`)

            // Close modal and reset state
            setShowRejectModal(false)
            setRequestToReject(null)

            loadRequests()
        } catch (error) {
            console.error('Error rejecting request:', error)
            toast.error('Failed to reject request')
        } finally {
            setIsRejecting(false)
        }
    }

    const handleDelete = async (request) => {
        if (!confirm(`Are you sure you want to delete this request from ${request.full_name}?`)) {
            return
        }

        setProcessingId(request.id)
        try {
            // Delete request from Firestore
            await deleteDoc(doc(db, 'access_requests', request.id))

            toast.success('Request deleted')
            loadRequests()
        } catch (error) {
            console.error('Error deleting request:', error)
            toast.error('Failed to delete request')
        } finally {
            setProcessingId(null)
        }
    }

    const getStatusBadge = (status) => {
        const badges = {
            pending: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400', icon: Clock },
            approved: { color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircle2 },
            rejected: { color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400', icon: XCircle }
        }

        const badge = badges[status] || badges.pending
        const Icon = badge.icon

        return (
            <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                <Icon className="w-4 h-4" />
                <span className="capitalize">{status}</span>
            </span>
        )
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Access Requests</h2>
                    <p className="text-dark-600 dark:text-dark-400">
                        Manage user access requests and approvals
                    </p>
                </div>
                <button
                    onClick={loadRequests}
                    disabled={loading}
                    className="btn btn-secondary"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {['pending', 'approved', 'rejected', 'all'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === tab
                            ? 'bg-primary-600 text-white'
                            : 'bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700'
                            }`}
                    >
                        <span className="capitalize">{tab}</span>
                    </button>
                ))}
            </div>

            {/* Requests List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader className="w-8 h-8 animate-spin text-primary-600" />
                </div>
            ) : requests.length === 0 ? (
                <div className="card p-12 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-dark-400" />
                    <h3 className="text-lg font-semibold mb-2">No Requests Found</h3>
                    <p className="text-dark-600 dark:text-dark-400">
                        {filter === 'pending'
                            ? 'No pending access requests at the moment.'
                            : `No ${filter} requests found.`
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card p-6"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                {/* Request Info */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-lg flex items-center space-x-2">
                                                <User className="w-5 h-5 text-primary-600" />
                                                <span>{request.full_name}</span>
                                            </h3>
                                            <div className="flex items-center space-x-2 text-dark-600 dark:text-dark-400 mt-1">
                                                <Mail className="w-4 h-4" />
                                                <span>{request.email}</span>
                                            </div>
                                        </div>
                                        {getStatusBadge(request.status)}
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-dark-600 dark:text-dark-400">
                                        <div className="flex items-center space-x-1">
                                            <Clock className="w-4 h-4" />
                                            <span>Requested: {formatDate(request.created_at)}</span>
                                        </div>
                                        {request.approved_at && (
                                            <div className="flex items-center space-x-1">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>Processed: {formatDate(request.approved_at)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                {request.status === 'pending' && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleApprove(request)}
                                            disabled={processingId === request.id}
                                            className="btn btn-primary"
                                        >
                                            {processingId === request.id ? (
                                                <Loader className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="w-5 h-5" />
                                            )}
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(request)}
                                            disabled={processingId === request.id}
                                            className="btn btn-secondary"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            Reject
                                        </button>
                                    </div>
                                )}

                                {request.status !== 'pending' && (
                                    <button
                                        onClick={() => handleDelete(request)}
                                        disabled={processingId === request.id}
                                        className="btn btn-secondary"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        Delete
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Reject Request Modal */}
            <RejectRequestModal
                isOpen={showRejectModal}
                onClose={() => {
                    setShowRejectModal(false)
                    setRequestToReject(null)
                    setIsRejecting(false)
                }}
                onConfirm={confirmReject}
                request={requestToReject}
                isRejecting={isRejecting}
            />

            {/* Approval Success Modal */}
            <ApprovalSuccessModal
                isOpen={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false)
                    setApprovedCredentials(null)
                }}
                credentials={approvedCredentials}
            />
        </div>
    )
}

export default AccessRequestsManager
