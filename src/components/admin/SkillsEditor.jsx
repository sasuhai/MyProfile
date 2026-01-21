import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { getSkills, addSkill, updateSkill, deleteSkill } from '../../lib/firebase'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'

const SkillsEditor = ({ onUpdate }) => {
    const [skills, setSkills] = useState([])
    const [editing, setEditing] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        category: 'Frontend',
        level: '',
    })
    const [customCategory, setCustomCategory] = useState('')
    const [showCustomCategory, setShowCustomCategory] = useState(false)

    useEffect(() => {
        loadSkills()
    }, [])

    const loadSkills = async () => {
        const { data } = await getSkills()
        if (data) {
            setSkills(data)
            onUpdate?.()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const skillData = {
                ...formData,
                category: formData.category === 'Custom' ? customCategory : formData.category,
                level: formData.level || null
            }

            if (editing) {
                await updateSkill(editing, skillData)
                toast.success('Skill updated!')
            } else {
                await addSkill(skillData)
                toast.success('Skill added!')
            }

            setFormData({ name: '', category: 'Frontend', level: '' })
            setEditing(null)
            setCustomCategory('')
            setShowCustomCategory(false)
            loadSkills()
        } catch (error) {
            toast.error('Failed to save skill')
        }
    }

    const handleEdit = (skill) => {
        setEditing(skill.id)
        const isCustomCat = !categories.includes(skill.category)
        setFormData({
            name: skill.name,
            category: isCustomCat ? 'Custom' : skill.category,
            level: skill.level || '',
        })
        if (isCustomCat) {
            setCustomCategory(skill.category)
            setShowCustomCategory(true)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this skill?')) return

        try {
            await deleteSkill(id)
            toast.success('Skill deleted!')
            loadSkills()
        } catch (error) {
            toast.error('Failed to delete skill')
        }
    }

    const categories = ['Frontend', 'Backend', 'Languages', 'Tools', 'Database', 'DevOps', 'Design', 'Other', 'Custom']

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Add/Edit Form */}
            <div className="card p-6">
                <h2 className="font-display text-xl font-bold mb-4">
                    {editing ? 'Edit Skill' : 'Add New Skill'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Skill Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="input"
                                placeholder="React"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Category *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => {
                                    setFormData({ ...formData, category: e.target.value })
                                    setShowCustomCategory(e.target.value === 'Custom')
                                }}
                                className="input"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            {showCustomCategory && (
                                <input
                                    type="text"
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    placeholder="Enter custom category"
                                    className="input mt-2"
                                    required
                                />
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Level (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value ? parseInt(e.target.value) : '' })}
                                className="input"
                                placeholder="Optional"
                            />
                            <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">
                                Leave blank to hide percentage
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button type="submit" className="btn btn-primary">
                            <Save className="w-4 h-4" />
                            {editing ? 'Update' : 'Add'} Skill
                        </button>
                        {editing && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditing(null)
                                    setFormData({ name: '', category: 'Frontend', level: '' })
                                    setCustomCategory('')
                                    setShowCustomCategory(false)
                                }}
                                className="btn btn-secondary"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Skills List */}
            <div className="card p-6">
                <h2 className="font-display text-xl font-bold mb-4">All Skills</h2>
                {skills.length > 0 ? (
                    <div className="space-y-2">
                        {skills.map(skill => (
                            <div key={skill.id} className="flex items-center justify-between p-4 rounded-lg bg-dark-50 dark:bg-dark-800">
                                <div>
                                    <span className="font-medium">{skill.name}</span>
                                    <span className="text-sm text-dark-500 dark:text-dark-400 ml-3">
                                        {skill.category}{skill.level ? ` • ${skill.level}%` : ''}
                                    </span>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleEdit(skill)} className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(skill.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-dark-500 dark:text-dark-400 text-center py-8">No skills added yet</p>
                )}
            </div>
        </motion.div>
    )
}

export default SkillsEditor
