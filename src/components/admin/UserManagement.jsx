import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
    getAllUsers,
    updateUserRole,
    resetUserPassword,
    getUserStats,
    isCurrentUserAdmin,
    getCurrentUser
} from '../../lib/supabase'
import { createUserWithProfile } from '../../lib/supabaseAdmin'
import { Users, Shield, User, Mail, Calendar, Key, UserPlus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const UserManagement = () => {
    const [users, setUsers] = useState([])
    const [stats, setStats] = useState({ total: 0, admins: 0, users: 0 })
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [currentUserId, setCurrentUserId] = useState(null)
    const [showAddUser, setShowAddUser] = useState(false)
    const [creatingUser, setCreatingUser] = useState(false)
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        fullName: '',
        username: '',
        role: 'user'
    })

    useEffect(() => {
        checkAdminAndLoadData()
    }, [])

    const checkAdminAndLoadData = async () => {
        const adminStatus = await isCurrentUserAdmin()
        setIsAdmin(adminStatus)

        // Get current user ID
        const user = await getCurrentUser()
        if (user) {
            setCurrentUserId(user.id)
        }

        if (adminStatus) {
            await loadUsers()
            await loadStats()
        }
        setLoading(false)
    }

    const loadUsers = async () => {
        const { data, error } = await getAllUsers()
        if (error) {
            toast.error('Failed to load users')
            return
        }
        setUsers(data || [])
    }

    const loadStats = async () => {
        const { data, error } = await getUserStats()
        if (error) return
        setStats(data || { total: 0, admins: 0, users: 0 })
    }

    const handleRoleChange = async (userId, newRole) => {
        const { error } = await updateUserRole(userId, newRole)
        if (error) {
            toast.error('Failed to update role')
            return
        }
        toast.success('Role updated successfully')
        await loadUsers()
        await loadStats()
    }

    const handleResetPassword = async (email) => {
        const { error } = await resetUserPassword(email)
        if (error) {
            toast.error('Failed to send password reset email')
            return
        }
        toast.success(`Password reset email sent to ${email}`)
    }

    const handleAddUser = async () => {
        // Validation
        if (!newUser.email || !newUser.password || !newUser.username) {
            toast.error('Please fill in all required fields')
            return
        }

        if (newUser.password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        if (!/^[a-z0-9-]+$/.test(newUser.username)) {
            toast.error('Username can only contain lowercase letters, numbers, and hyphens')
            return
        }

        setCreatingUser(true)

        try {
            const result = await createUserWithProfile({
                email: newUser.email,
                password: newUser.password,
                fullName: newUser.fullName || 'New User',
                username: newUser.username,
                role: newUser.role
            })

            if (result.success) {
                toast.success(`User created successfully! Accessible at /${newUser.username}`)
                setShowAddUser(false)
                setNewUser({ email: '', password: '', fullName: '', username: '', role: 'user' })

                // Reload users list
                await loadUsers()
                await loadStats()
            } else {
                toast.error(result.error || 'Failed to create user')
            }
        } catch (error) {
            console.error('Create user error:', error)
            toast.error('An unexpected error occurred')
        } finally {
            setCreatingUser(false)
        }
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="spinner w-8 h-8"></div>
            </div>
        )
    }

    if (!isAdmin) {
        return (
            <div className="card p-8 text-center">
                <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-dark-600 dark:text-dark-400">
                    Only administrators can access user management.
                </p>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-dark-500 dark:text-dark-400">Total Users</p>
                            <p className="text-3xl font-bold mt-1">{stats.total}</p>
                        </div>
                        <Users className="w-12 h-12 text-primary-500 opacity-20" />
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-dark-500 dark:text-dark-400">Administrators</p>
                            <p className="text-3xl font-bold mt-1">{stats.admins}</p>
                        </div>
                        <Shield className="w-12 h-12 text-green-500 opacity-20" />
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-dark-500 dark:text-dark-400">Regular Users</p>
                            <p className="text-3xl font-bold mt-1">{stats.users}</p>
                        </div>
                        <User className="w-12 h-12 text-blue-500 opacity-20" />
                    </div>
                </div>
            </div>

            {/* Add User Button */}
            <div className="mb-6">
                <button
                    onClick={() => setShowAddUser(!showAddUser)}
                    className="btn btn-primary"
                >
                    <UserPlus className="w-5 h-5" />
                    Add New User
                </button>
            </div>

            {/* Add User Form */}
            {showAddUser && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="card p-6 mb-6"
                >
                    <h3 className="text-xl font-bold mb-4">Add New User</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                className="input"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                placeholder="user@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Full Name</label>
                            <input
                                type="text"
                                className="input"
                                value={newUser.fullName}
                                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <input
                                type="password"
                                className="input"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                placeholder="Secure password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Username</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">@</span>
                                <input
                                    type="text"
                                    className="input pl-8"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                    placeholder="john"
                                    pattern="[a-z0-9-]+"
                                />
                            </div>
                            <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">
                                Lowercase letters, numbers, and hyphens only
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Role</label>
                            <select
                                className="input"
                                value={newUser.role}
                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                            >
                                <option value="user">Regular User</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex space-x-3 mt-4">
                        <button
                            onClick={handleAddUser}
                            disabled={creatingUser}
                            className="btn btn-primary"
                        >
                            {creatingUser ? (
                                <>
                                    <div className="spinner w-5 h-5" />
                                    Creating User...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    Create User
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => setShowAddUser(false)}
                            disabled={creatingUser}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                    <p className="text-sm text-dark-500 dark:text-dark-400 mt-3">
                        <strong>Note:</strong> User will be created automatically and accessible at /{newUser.username || 'username'}
                    </p>
                </motion.div>
            )}

            {/* Users List */}
            <div className="card p-6">
                <h3 className="text-xl font-bold mb-6">All Users</h3>

                <div className="space-y-4">
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className="p-4 rounded-lg bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                            {user.role === 'admin' ? (
                                                <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                            ) : (
                                                <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{user.full_name || 'No name set'}</h4>
                                            <div className="flex items-center space-x-2 text-sm text-dark-500 dark:text-dark-400">
                                                <Mail className="w-4 h-4" />
                                                <span>{user.email}</span>
                                            </div>
                                            {user.username && (
                                                <div className="flex items-center space-x-2 text-sm text-primary-600 dark:text-primary-400 mt-1">
                                                    <User className="w-4 h-4" />
                                                    <a
                                                        href={`/${user.username}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:underline font-mono"
                                                    >
                                                        @{user.username}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4 text-sm text-dark-600 dark:text-dark-400">
                                        <div className="flex items-center space-x-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>Joined {formatDate(user.created_at)}</span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                            : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                            }`}>
                                            {user.role === 'admin' ? 'Administrator' : 'Regular User'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col space-y-2">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                                        disabled={user.user_id === currentUserId}
                                        className="input text-sm py-1"
                                        title={user.user_id === currentUserId ? "You cannot change your own role" : "Change user role"}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    {user.user_id === currentUserId && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400">
                                            Cannot change own role
                                        </p>
                                    )}

                                    <button
                                        onClick={() => handleResetPassword(user.email)}
                                        className="btn btn-secondary text-sm py-1"
                                        title="Send password reset email"
                                    >
                                        <Key className="w-4 h-4" />
                                        Reset Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {users.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 mx-auto mb-4 text-dark-300 dark:text-dark-700" />
                            <p className="text-dark-500 dark:text-dark-400">No users found</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

export default UserManagement
