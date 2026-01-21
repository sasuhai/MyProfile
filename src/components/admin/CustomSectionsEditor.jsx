import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { getCustomSections, addCustomSection, updateCustomSection, deleteCustomSection } from '../../lib/firebase'
import { Plus, Edit, Trash2, Save, X, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'

const CustomSectionsEditor = () => {
    const [sections, setSections] = useState([])
    const [editing, setEditing] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        display_order: 0
    })

    useEffect(() => {
        loadSections()
    }, [])

    const loadSections = async () => {
        const { data } = await getCustomSections()
        if (data) {
            setSections(data)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            if (editing) {
                await updateCustomSection(editing, formData)
                toast.success('Section updated!')
            } else {
                await addCustomSection(formData)
                toast.success('Section added!')
            }

            resetForm()
            loadSections()
        } catch (error) {
            console.error('Error saving section:', error)
            toast.error('Failed to save section')
        }
    }

    const resetForm = () => {
        setFormData({ title: '', content: '', display_order: 0 })
        setEditing(null)
        setShowForm(false)
    }

    const handleEdit = (section) => {
        setEditing(section.id)
        setFormData({
            title: section.title,
            content: section.content,
            display_order: section.display_order
        })
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this section?')) return

        try {
            await deleteCustomSection(id)
            toast.success('Section deleted!')
            loadSections()
        } catch (error) {
            console.error('Error deleting section:', error)
            toast.error('Failed to delete section')
        }
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
                        {editing ? 'Edit Section' : 'Add Custom Section'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Section Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                className="input"
                                placeholder="e.g., Achievements, Core Competencies, Awards"
                            />
                            <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">
                                This will be the heading of your custom section
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Content *
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                required
                                rows={6}
                                className="textarea"
                                placeholder="Describe your achievements, competencies, or other information..."
                            />
                            <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">
                                Line breaks and formatting will be preserved
                            </p>
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
                                {editing ? 'Update' : 'Add'} Section
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
                    Add Custom Section
                </button>
            )}

            {/* Sections List */}
            <div className="card p-6">
                <h3 className="font-display text-xl font-bold mb-4">Custom Sections</h3>
                {sections.length > 0 ? (
                    <div className="space-y-3">
                        {sections.map((section) => (
                            <div
                                key={section.id}
                                className="flex items-start justify-between p-4 rounded-lg bg-dark-50 dark:bg-dark-800"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <GripVertical className="w-4 h-4 text-dark-400" />
                                        <h4 className="font-semibold">{section.title}</h4>
                                    </div>
                                    <p className="text-sm text-dark-600 dark:text-dark-400 whitespace-pre-wrap line-clamp-3">
                                        {section.content}
                                    </p>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                    <button
                                        onClick={() => handleEdit(section)}
                                        className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(section.id)}
                                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-dark-500 dark:text-dark-400 text-center py-8">
                        No custom sections yet. Add sections like Achievements, Core Competencies, Awards, etc.
                    </p>
                )}
            </div>
        </motion.div>
    )
}

export default CustomSectionsEditor
