import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { getAboutFeatures, addAboutFeature, updateAboutFeature, deleteAboutFeature } from '../../lib/supabase'
import { Plus, Edit, Trash2, Save, X, Code2, Zap, Heart, Globe, Star, Award, Target, Lightbulb } from 'lucide-react'
import toast from 'react-hot-toast'

// Available icons for features
const AVAILABLE_ICONS = [
    { name: 'Code2', component: Code2, label: 'Code' },
    { name: 'Zap', component: Zap, label: 'Lightning' },
    { name: 'Heart', component: Heart, label: 'Heart' },
    { name: 'Globe', component: Globe, label: 'Globe' },
    { name: 'Star', component: Star, label: 'Star' },
    { name: 'Award', component: Award, label: 'Award' },
    { name: 'Target', component: Target, label: 'Target' },
    { name: 'Lightbulb', component: Lightbulb, label: 'Lightbulb' },
]

const AboutFeaturesEditor = () => {
    const [features, setFeatures] = useState([])
    const [editing, setEditing] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        icon: 'Code2',
        label: '',
        description: '',
        display_order: 0
    })

    useEffect(() => {
        loadFeatures()
    }, [])

    const loadFeatures = async () => {
        const { data } = await getAboutFeatures()
        if (data) {
            setFeatures(data)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            if (editing) {
                await updateAboutFeature(editing, formData)
                toast.success('Feature updated!')
            } else {
                await addAboutFeature(formData)
                toast.success('Feature added!')
            }

            resetForm()
            loadFeatures()
        } catch (error) {
            console.error('Error saving feature:', error)
            toast.error('Failed to save feature')
        }
    }

    const resetForm = () => {
        setFormData({ icon: 'Code2', label: '', description: '', display_order: 0 })
        setEditing(null)
        setShowForm(false)
    }

    const handleEdit = (feature) => {
        setEditing(feature.id)
        setFormData({
            icon: feature.icon,
            label: feature.label,
            description: feature.description,
            display_order: feature.display_order
        })
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this feature?')) return

        try {
            await deleteAboutFeature(id)
            toast.success('Feature deleted!')
            loadFeatures()
        } catch (error) {
            console.error('Error deleting feature:', error)
            toast.error('Failed to delete feature')
        }
    }

    const getIconComponent = (iconName) => {
        const icon = AVAILABLE_ICONS.find(i => i.name === iconName)
        return icon ? icon.component : Code2
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Add/Edit Form */}
            {showForm ? (
                <div className="card p-6">
                    <h3 className="font-display text-xl font-bold mb-4">
                        {editing ? 'Edit Feature' : 'Add Feature'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Icon *
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {AVAILABLE_ICONS.map((icon) => {
                                    const IconComponent = icon.component
                                    return (
                                        <button
                                            key={icon.name}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon: icon.name })}
                                            className={`p-3 rounded-lg border-2 transition-all ${formData.icon === icon.name
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                    : 'border-dark-200 dark:border-dark-700 hover:border-primary-300'
                                                }`}
                                        >
                                            <IconComponent className="w-6 h-6 mx-auto" />
                                            <span className="text-xs mt-1 block">{icon.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Label *
                            </label>
                            <input
                                type="text"
                                value={formData.label}
                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                required
                                className="input"
                                placeholder="e.g., Clean Code, Fast Learner"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Description *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                rows={3}
                                className="textarea"
                                placeholder="Brief description of this feature..."
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="btn btn-secondary"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                <Save className="w-4 h-4" />
                                {editing ? 'Update' : 'Add'} Feature
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <button
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary w-full"
                >
                    <Plus className="w-4 h-4" />
                    Add Feature
                </button>
            )}

            {/* Features List */}
            <div className="card p-6">
                <h3 className="font-display text-xl font-bold mb-4">About Features</h3>
                {features.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                        {features.map((feature) => {
                            const IconComponent = getIconComponent(feature.icon)
                            return (
                                <div
                                    key={feature.id}
                                    className="p-4 rounded-lg bg-dark-50 dark:bg-dark-800 relative group"
                                >
                                    <div className="flex items-start space-x-3 mb-2">
                                        <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                                            <IconComponent className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{feature.label}</h4>
                                            <p className="text-sm text-dark-600 dark:text-dark-400">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-2 mt-2">
                                        <button
                                            onClick={() => handleEdit(feature)}
                                            className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(feature.id)}
                                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-dark-500 dark:text-dark-400 text-center py-8">
                        No features yet. Add features like "Clean Code", "Fast Learner", etc.
                    </p>
                )}
            </div>
        </motion.div>
    )
}

export default AboutFeaturesEditor
