import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
    getAllProjects,
    getSkills,
    getMessages,
    signOut,
    isCurrentUserAdmin,
    getCurrentUser,
} from '../../lib/supabase'
import { supabase } from '../../lib/supabase'
import {
    LogOut, User, Briefcase, FolderGit2, Award, MessageSquare,
    Settings, BarChart3, Plus, Edit, Trash2, Eye, EyeOff, Users
} from 'lucide-react'
import toast from 'react-hot-toast'
import ProfileEditor from '../../components/admin/ProfileEditor'
import SkillsEditor from '../../components/admin/SkillsEditor'
import ProjectsEditor from '../../components/admin/ProjectsEditor'
import ResumeEditor from '../../components/admin/ResumeEditor'
import MessagesViewer from '../../components/admin/MessagesViewer'
import UserManagement from '../../components/admin/UserManagement'

const AdminDashboard = () => {
    const { user, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [userProfile, setUserProfile] = useState(null)
    const [stats, setStats] = useState({
        projects: 0,
        skills: 0,
        messages: 0,
    })

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/admin/login')
        }
    }, [user, authLoading, navigate])

    useEffect(() => {
        if (user) {
            loadStats()
            loadUserProfile()
        }
    }, [user])

    const loadUserProfile = async () => {
        const currentUser = await getCurrentUser()
        if (currentUser) {
            const { data } = await supabase
                .from('profile_info')
                .select('username, full_name, email')
                .eq('user_id', currentUser.id)
                .single()
            if (data) {
                setUserProfile(data)
            }
        }
    }

    const loadStats = async () => {
        const { data: projects } = await getAllProjects()
        const { data: skills } = await getSkills()
        const { data: messages } = await getMessages()

        setStats({
            projects: projects?.length || 0,
            skills: skills?.length || 0,
            messages: messages?.length || 0,
        })
    }

    const handleSignOut = async () => {
        try {
            // Get username before signing out
            const username = userProfile?.username

            // Sign out
            await signOut()

            toast.success('Signed out successfully')

            // Use window.location for full page reload to clear auth state
            if (username) {
                window.location.href = `/${username}`
            } else {
                window.location.href = '/'
            }
        } catch (error) {
            console.error('Sign out error:', error)
            toast.error('Error signing out')
        }
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner w-12 h-12" />
            </div>
        )
    }

    if (!user) {
        return null
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'skills', label: 'Skills', icon: Settings },
        { id: 'resume', label: 'Resume', icon: Briefcase },
        { id: 'projects', label: 'Projects', icon: FolderGit2 },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'users', label: 'User Management', icon: Users },
    ]

    return (
        <div className="min-h-screen bg-dark-50 dark:bg-dark-950 pt-16 sm:pt-20">
            <div className="container-custom py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
                            Admin <span className="gradient-text">Dashboard</span>
                        </h1>
                        {userProfile && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-dark-600 dark:text-dark-400">
                                <p className="flex items-center space-x-2">
                                    <User className="w-4 h-4" />
                                    <span className="font-medium">{userProfile.full_name}</span>
                                </p>
                                <span className="hidden sm:inline">•</span>
                                <p className="flex items-center space-x-2">
                                    <span className="text-primary-600 dark:text-primary-400 font-mono">
                                        @{userProfile.username}
                                    </span>
                                </p>
                                <span className="hidden sm:inline">•</span>
                                <p className="text-sm">{userProfile.email}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="btn btn-secondary"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>

                {/* Tabs */}
                <div className="mb-8 overflow-x-auto">
                    <div className="flex space-x-2 min-w-max">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30'
                                        : 'bg-white dark:bg-dark-900 hover:bg-dark-100 dark:hover:bg-dark-800'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{tab.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Content */}
                <div>
                    {activeTab === 'overview' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="grid md:grid-cols-3 gap-6 mb-8">
                                <div className="card p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                            <FolderGit2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <span className="text-3xl font-bold gradient-text">
                                            {stats.projects}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold mb-1">Total Projects</h3>
                                    <p className="text-sm text-dark-600 dark:text-dark-400">
                                        Published and draft projects
                                    </p>
                                </div>

                                <div className="card p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                            <Settings className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <span className="text-3xl font-bold gradient-text">
                                            {stats.skills}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold mb-1">Skills Listed</h3>
                                    <p className="text-sm text-dark-600 dark:text-dark-400">
                                        Across all categories
                                    </p>
                                </div>

                                <div className="card p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                            <MessageSquare className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <span className="text-3xl font-bold gradient-text">
                                            {stats.messages}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold mb-1">Messages</h3>
                                    <p className="text-sm text-dark-600 dark:text-dark-400">
                                        Contact form submissions
                                    </p>
                                </div>
                            </div>

                            <div className="card p-8">
                                <h2 className="font-display text-2xl font-bold mb-4">
                                    Quick Actions
                                </h2>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className="btn btn-secondary justify-start"
                                    >
                                        <User className="w-5 h-5" />
                                        Edit Profile
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('projects')}
                                        className="btn btn-secondary justify-start"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add Project
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('skills')}
                                        className="btn btn-secondary justify-start"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add Skill
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('messages')}
                                        className="btn btn-secondary justify-start"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        View Messages
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'profile' && <ProfileEditor />}
                    {activeTab === 'skills' && <SkillsEditor onUpdate={loadStats} />}
                    {activeTab === 'resume' && <ResumeEditor />}
                    {activeTab === 'projects' && <ProjectsEditor onUpdate={loadStats} />}
                    {activeTab === 'messages' && <MessagesViewer />}
                    {activeTab === 'users' && <UserManagement />}
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
