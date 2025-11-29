import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { getCurrentUser, updateProfile, uploadFile } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../contexts/ThemeContext'
import { Save, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useUnsavedChanges, useFormChanges } from '../../hooks/useUnsavedChanges'

const ProfileEditor = () => {
    const { setThemeColor } = useTheme()
    const [profile, setProfile] = useState({
        full_name: '',
        username: '',
        tagline: '',
        bio: '',
        about: '',
        email: '',
        phone: '',
        location: '',
        languages: '',
        github_url: '',
        linkedin_url: '',
        twitter_url: '',
        profile_image_url: '',
        show_photo_frame: true, // Show frame around profile photo
        status: 'available', // available, not_available, open_to_opportunities
        theme_color: '#3b82f6', // Default blue color
    })
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [initialProfile, setInitialProfile] = useState(null)

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        // Get currently logged-in user
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            toast.error('Not authenticated')
            return
        }

        // Fetch their profile from database
        const { data, error } = await supabase
            .from('profile_info')
            .select('*')
            .eq('user_id', currentUser.id)
            .single()

        if (error) {
            console.error('Error loading profile:', error)
            toast.error('Failed to load profile')
            return
        }

        if (data) {
            setProfile(data)
            setInitialProfile(data) // Store initial data for comparison
            // Apply initial theme color
            if (data.theme_color) {
                setThemeColor(data.theme_color)
            }
        }
    }

    // Apply theme color when it changes
    useEffect(() => {
        if (profile.theme_color) {
            setThemeColor(profile.theme_color)
        }
    }, [profile.theme_color])

    const handleChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value,
        })
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file')
            return
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size should be less than 2MB')
            return
        }

        setUploading(true)
        try {
            const fileName = `profile-${Date.now()}.${file.name.split('.').pop()}`
            const { data, error } = await uploadFile('profile-images', fileName, file)

            if (error) throw error

            setProfile({ ...profile, profile_image_url: data })
            toast.success('Image uploaded successfully')
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Failed to upload image')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Get current user to exclude from username check
            const currentUser = await getCurrentUser()
            if (!currentUser) {
                throw new Error('Not authenticated')
            }

            // Check if username is unique (excluding current user)
            const { data: existingUser, error: checkError } = await supabase
                .from('profile_info')
                .select('user_id')
                .eq('username', profile.username)
                .neq('user_id', currentUser.id)
                .single()

            if (checkError && checkError.code !== 'PGRST116') {
                // PGRST116 means no rows found, which is what we want
                throw checkError
            }

            if (existingUser) {
                toast.error('Username is already taken. Please choose a different one.')
                setLoading(false)
                return
            }

            // Ensure theme_color has a value
            const profileData = {
                ...profile,
                theme_color: profile.theme_color || '#3b82f6'
            }

            const { error } = await updateProfile(profileData)

            if (error) {
                console.error('Update error details:', error)
                throw error
            }

            toast.success('Profile updated successfully!')
            setInitialProfile(profileData) // Update initial data after successful save
        } catch (error) {
            console.error('Update error:', error)
            toast.error(error.message || 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    // Track unsaved changes (must be after handleSubmit is defined)
    const hasUnsavedChanges = useFormChanges(initialProfile, profile)
    const { promptBeforeLeaving } = useUnsavedChanges(hasUnsavedChanges, handleSubmit)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="card p-8">
                <h2 className="font-display text-2xl font-bold mb-6">
                    Edit Profile Information
                </h2>

                {/* Unsaved Changes Warning */}
                {hasUnsavedChanges && (
                    <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                You have unsaved changes
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                Don't forget to save your changes before leaving this page.
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Image */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Profile Image
                        </label>
                        <div className="flex items-center space-x-6">
                            <div className="w-24 h-24 rounded-xl overflow-hidden flex items-center justify-center">
                                {profile.profile_image_url ? (
                                    <img
                                        src={profile.profile_image_url}
                                        alt="Profile"
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-50 dark:from-dark-800 dark:to-dark-900 flex items-center justify-center">
                                        <ImageIcon className="w-12 h-12 text-primary-300 dark:text-primary-700" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="btn btn-secondary cursor-pointer">
                                    <Upload className="w-5 h-5" />
                                    {uploading ? 'Uploading...' : 'Upload Image'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                </label>
                                <p className="text-sm text-dark-600 dark:text-dark-400 mt-2">
                                    JPG, PNG or GIF. Max 2MB.
                                </p>
                                <label className="flex items-center space-x-2 mt-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={profile.show_photo_frame !== false}
                                        onChange={(e) => setProfile({ ...profile, show_photo_frame: e.target.checked })}
                                        className="w-4 h-4 text-primary-600 border-dark-300 rounded focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-dark-700 dark:text-dark-300">
                                        Show photo frame
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="full_name" className="block text-sm font-medium mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                id="full_name"
                                name="full_name"
                                value={profile.full_name || ''}
                                onChange={handleChange}
                                required
                                className="input"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label htmlFor="tagline" className="block text-sm font-medium mb-2">
                                Tagline *
                            </label>
                            <input
                                type="text"
                                id="tagline"
                                name="tagline"
                                value={profile.tagline || ''}
                                onChange={handleChange}
                                required
                                className="input"
                                placeholder="Aspiring Software Engineer"
                            />
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium mb-2">
                                Username * (Portfolio URL)
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={profile.username || ''}
                                onChange={handleChange}
                                required
                                pattern="[a-z0-9]+"
                                className="input font-mono"
                                placeholder="johndoe"
                            />
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                ⚠️ Changing username will change your portfolio URL to: <span className="font-mono font-semibold">/{profile.username || 'username'}</span>
                            </p>
                            <p className="text-xs text-dark-500 dark:text-dark-400 mt-0.5">
                                Only lowercase letters and numbers allowed (no spaces or special characters)
                            </p>
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium mb-2">
                                Work Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={profile.status || 'available'}
                                onChange={handleChange}
                                className="input"
                            >
                                <option value="available">Available for work</option>
                                <option value="not_available">Not available</option>
                                <option value="open_to_opportunities">Open to opportunities</option>
                            </select>
                            <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">
                                This will be displayed on your portfolio
                            </p>
                        </div>

                        <div>
                            <label htmlFor="theme_color" className="block text-sm font-medium mb-2">
                                Theme Color
                            </label>
                            <div className="space-y-3">
                                {/* Color Picker */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        id="theme_color"
                                        name="theme_color"
                                        value={profile.theme_color || '#3b82f6'}
                                        onChange={handleChange}
                                        className="h-12 w-20 rounded-lg border-2 border-dark-200 dark:border-dark-700 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={profile.theme_color || '#3b82f6'}
                                        onChange={(e) => setProfile({ ...profile, theme_color: e.target.value })}
                                        className="input flex-1 font-mono"
                                        placeholder="#3b82f6"
                                        pattern="^#[0-9A-Fa-f]{6}$"
                                    />
                                </div>

                                {/* Preset Colors */}
                                <div>
                                    <p className="text-xs text-dark-600 dark:text-dark-400 mb-2">Quick presets:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { name: 'Blue', color: '#3b82f6' },
                                            { name: 'Purple', color: '#8b5cf6' },
                                            { name: 'Pink', color: '#ec4899' },
                                            { name: 'Red', color: '#ef4444' },
                                            { name: 'Orange', color: '#f97316' },
                                            { name: 'Green', color: '#10b981' },
                                            { name: 'Teal', color: '#14b8a6' },
                                            { name: 'Indigo', color: '#6366f1' },
                                        ].map((preset) => (
                                            <button
                                                key={preset.color}
                                                type="button"
                                                onClick={() => setProfile({ ...profile, theme_color: preset.color })}
                                                className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${profile.theme_color === preset.color
                                                    ? 'border-dark-900 dark:border-white ring-2 ring-offset-2 ring-dark-900 dark:ring-white'
                                                    : 'border-dark-200 dark:border-dark-700'
                                                    }`}
                                                style={{ backgroundColor: preset.color }}
                                                title={preset.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">
                                This color will be used for buttons, links, and accents throughout your portfolio
                            </p>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium mb-2">
                            Short Bio *
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={profile.bio || ''}
                            onChange={handleChange}
                            required
                            rows={3}
                            className="textarea"
                            placeholder="A brief introduction about yourself..."
                        />
                    </div>

                    <div>
                        <label htmlFor="about" className="block text-sm font-medium mb-2">
                            About Me (Detailed)
                        </label>
                        <textarea
                            id="about"
                            name="about"
                            value={profile.about || ''}
                            onChange={handleChange}
                            rows={5}
                            className="textarea"
                            placeholder="Tell your story in detail..."
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                Email * (Login Credential)
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={profile.email || ''}
                                readOnly
                                disabled
                                className="input bg-dark-100 dark:bg-dark-900 cursor-not-allowed opacity-75"
                                placeholder="your.email@example.com"
                            />
                            <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">
                                🔒 Email cannot be changed as it's used for login authentication
                            </p>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={profile.phone || ''}
                                onChange={handleChange}
                                className="input"
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium mb-2">
                                Location
                            </label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={profile.location || ''}
                                onChange={handleChange}
                                className="input"
                                placeholder="City, Country"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="languages" className="block text-sm font-medium mb-2">
                            Languages
                        </label>
                        <input
                            type="text"
                            id="languages"
                            name="languages"
                            value={profile.languages || ''}
                            onChange={handleChange}
                            className="input"
                            placeholder="English, Bahasa Malaysia, Mandarin"
                        />
                    </div>

                    <div className="border-t border-dark-200 dark:border-dark-800 pt-6">
                        <h3 className="font-semibold mb-4">Social Links</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="github_url" className="block text-sm font-medium mb-2">
                                    GitHub URL
                                </label>
                                <input
                                    type="url"
                                    id="github_url"
                                    name="github_url"
                                    value={profile.github_url || ''}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="https://github.com/yourusername"
                                />
                            </div>

                            <div>
                                <label htmlFor="linkedin_url" className="block text-sm font-medium mb-2">
                                    LinkedIn URL
                                </label>
                                <input
                                    type="url"
                                    id="linkedin_url"
                                    name="linkedin_url"
                                    value={profile.linkedin_url || ''}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="https://linkedin.com/in/yourusername"
                                />
                            </div>

                            <div>
                                <label htmlFor="twitter_url" className="block text-sm font-medium mb-2">
                                    Twitter URL
                                </label>
                                <input
                                    type="url"
                                    id="twitter_url"
                                    name="twitter_url"
                                    value={profile.twitter_url || ''}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="https://twitter.com/yourusername"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                        >
                            {loading ? (
                                <>
                                    <div className="spinner w-5 h-5" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    )
}

export default ProfileEditor
