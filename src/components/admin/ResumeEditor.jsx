import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
    getEducation,
    addEducation,
    updateEducation,
    deleteEducation,
    getWorkExperience,
    addWorkExperience,
    updateWorkExperience,
    deleteWorkExperience,
    getCertifications,
    addCertification,
    updateCertification,
    deleteCertification
} from '../../lib/supabase'
import { GraduationCap, Briefcase, Award, Plus, Edit, Trash2, Save, X, Calendar, MapPin, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import CustomSectionsEditor from './CustomSectionsEditor'

const ResumeEditor = () => {
    const [activeSection, setActiveSection] = useState('education')
    const [education, setEducation] = useState([])
    const [experience, setExperience] = useState([])
    const [certifications, setCertifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingItem, setEditingItem] = useState(null)
    const [showForm, setShowForm] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        // Reset form when switching sections
        if (showForm) {
            setShowForm(false)
            setEditingItem(null)
        }
    }, [activeSection])

    const loadData = async () => {
        setLoading(true)
        const [eduData, expData, certData] = await Promise.all([
            getEducation(),
            getWorkExperience(),
            getCertifications()
        ])

        if (eduData.data) setEducation(eduData.data)
        if (expData.data) setExperience(expData.data)
        if (certData.data) setCertifications(certData.data)
        setLoading(false)
    }

    const handleAdd = () => {
        setEditingItem(getEmptyItem())
        setShowForm(true)
    }

    const handleEdit = (item) => {
        setEditingItem(item)
        setShowForm(true)
    }

    const handleCancel = () => {
        setEditingItem(null)
        setShowForm(false)
    }

    const handleSave = async () => {
        try {
            // Clean the data - remove empty arrays and null/undefined values
            const cleanData = Object.entries(editingItem).reduce((acc, [key, value]) => {
                // Skip id field for new items
                if (key === 'id' && !value) return acc
                // Skip empty arrays
                if (Array.isArray(value) && value.length === 0) return acc
                // Skip null/undefined
                if (value === null || value === undefined) return acc
                // Skip empty strings for optional fields
                if (value === '' && !['degree', 'institution', 'position', 'company', 'name', 'issuer'].includes(key)) return acc

                acc[key] = value
                return acc
            }, {})

            console.log('Saving data:', cleanData)
            console.log('Section:', activeSection)

            let result
            if (activeSection === 'education') {
                if (editingItem.id) {
                    result = await updateEducation(editingItem.id, cleanData)
                } else {
                    result = await addEducation(cleanData)
                }
            } else if (activeSection === 'experience') {
                if (editingItem.id) {
                    result = await updateWorkExperience(editingItem.id, cleanData)
                } else {
                    result = await addWorkExperience(cleanData)
                }
            } else if (activeSection === 'certifications') {
                if (editingItem.id) {
                    result = await updateCertification(editingItem.id, cleanData)
                } else {
                    result = await addCertification(cleanData)
                }
            }

            console.log('Save result:', result)

            if (result?.error) {
                console.error('Database error:', result.error)
                throw new Error(result.error.message || 'Failed to save')
            }

            toast.success('Saved successfully!')
            await loadData()
            handleCancel()
        } catch (error) {
            console.error('Save error:', error)
            toast.error(`Failed to save: ${error.message}`)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return

        try {
            if (activeSection === 'education') {
                await deleteEducation(id)
            } else if (activeSection === 'experience') {
                await deleteWorkExperience(id)
            } else if (activeSection === 'certifications') {
                await deleteCertification(id)
            }

            toast.success('Deleted successfully!')
            await loadData()
        } catch (error) {
            console.error('Delete error:', error)
            toast.error('Failed to delete')
        }
    }

    const getEmptyItem = () => {
        if (activeSection === 'education') {
            return {
                degree: '',
                institution: '',
                field_of_study: '',
                start_date: '',
                end_date: '',
                location: '',
                description: '',
                achievements: []
            }
        } else if (activeSection === 'experience') {
            return {
                position: '',
                company: '',
                start_date: '',
                end_date: '',
                location: '',
                description: '',
                achievements: [],
                skills: []
            }
        } else {
            return {
                name: '',
                issuer: '',
                issue_date: '',
                expiry_date: '',
                credential_id: '',
                credential_url: ''
            }
        }
    }

    const getCurrentItems = () => {
        if (activeSection === 'education') return education
        if (activeSection === 'experience') return experience
        return certifications
    }

    const formatDate = (date) => {
        if (!date) return ''
        return new Date(date).toISOString().split('T')[0]
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="card p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-display text-2xl font-bold">
                        Resume Editor
                    </h2>
                    {activeSection !== 'custom' && (
                        <button
                            onClick={handleAdd}
                            className="btn btn-primary"
                        >
                            <Plus className="w-4 h-4" />
                            Add New
                        </button>
                    )}
                </div>

                {/* Section Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setActiveSection('education')}
                        className={`btn ${activeSection === 'education' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        <GraduationCap className="w-4 h-4" />
                        Education ({education.length})
                    </button>
                    <button
                        onClick={() => setActiveSection('experience')}
                        className={`btn ${activeSection === 'experience' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        <Briefcase className="w-4 h-4" />
                        Experience ({experience.length})
                    </button>
                    <button
                        onClick={() => setActiveSection('certifications')}
                        className={`btn ${activeSection === 'certifications' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        <Award className="w-4 h-4" />
                        Certifications ({certifications.length})
                    </button>
                    <button
                        onClick={() => setActiveSection('custom')}
                        className={`btn ${activeSection === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        <Sparkles className="w-4 h-4" />
                        Custom Sections
                    </button>
                </div>

                {/* Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 p-6 bg-dark-50 dark:bg-dark-900 rounded-lg"
                        >
                            {activeSection === 'education' && (
                                <EducationForm
                                    item={editingItem}
                                    onChange={setEditingItem}
                                    onSave={handleSave}
                                    onCancel={handleCancel}
                                />
                            )}
                            {activeSection === 'experience' && (
                                <ExperienceForm
                                    item={editingItem}
                                    onChange={setEditingItem}
                                    onSave={handleSave}
                                    onCancel={handleCancel}
                                />
                            )}
                            {activeSection === 'certifications' && (
                                <CertificationForm
                                    item={editingItem}
                                    onChange={setEditingItem}
                                    onSave={handleSave}
                                    onCancel={handleCancel}
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Items List */}
                {activeSection === 'custom' ? (
                    <CustomSectionsEditor />
                ) : (
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="spinner w-8 h-8 mx-auto" />
                            </div>
                        ) : getCurrentItems().length > 0 ? (
                            getCurrentItems().map((item) => (
                                <ItemCard
                                    key={item.id}
                                    item={item}
                                    type={activeSection}
                                    onEdit={() => handleEdit(item)}
                                    onDelete={() => handleDelete(item.id)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12 text-dark-500 dark:text-dark-400">
                                <p>No items yet. Click "Add New" to get started.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    )
}

// Education Form Component
const EducationForm = ({ item, onChange, onSave, onCancel }) => {
    const handleChange = (field, value) => {
        onChange({ ...item, [field]: value })
    }

    return (
        <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Degree *</label>
                    <input
                        type="text"
                        value={item.degree}
                        onChange={(e) => handleChange('degree', e.target.value)}
                        className="input"
                        placeholder="Bachelor of Science"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Institution *</label>
                    <input
                        type="text"
                        value={item.institution}
                        onChange={(e) => handleChange('institution', e.target.value)}
                        className="input"
                        placeholder="University Name"
                        required
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Field of Study</label>
                    <input
                        type="text"
                        value={item.field_of_study || ''}
                        onChange={(e) => handleChange('field_of_study', e.target.value)}
                        className="input"
                        placeholder="Computer Science"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <input
                        type="text"
                        value={item.location || ''}
                        onChange={(e) => handleChange('location', e.target.value)}
                        className="input"
                        placeholder="City, Country"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Start Date (Month/Year)</label>
                    <input
                        type="month"
                        value={item.start_date ? new Date(item.start_date).toISOString().slice(0, 7) : ''}
                        onChange={(e) => handleChange('start_date', e.target.value ? `${e.target.value}-01` : '')}
                        className="input"
                    />
                    <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Optional</p>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">End Date (Month/Year)</label>
                    <input
                        type="month"
                        value={item.end_date ? new Date(item.end_date).toISOString().slice(0, 7) : ''}
                        onChange={(e) => handleChange('end_date', e.target.value ? `${e.target.value}-01` : '')}
                        className="input"
                    />
                    <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Optional - Leave blank if current</p>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                    value={item.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="textarea"
                    rows={3}
                    placeholder="Brief description of your studies..."
                />
            </div>

            <div className="flex justify-end space-x-3">
                <button onClick={onCancel} className="btn btn-secondary">
                    <X className="w-4 h-4" />
                    Cancel
                </button>
                <button onClick={onSave} className="btn btn-primary">
                    <Save className="w-4 h-4" />
                    Save
                </button>
            </div>
        </div>
    )
}

// Experience Form Component
const ExperienceForm = ({ item, onChange, onSave, onCancel }) => {
    const handleChange = (field, value) => {
        onChange({ ...item, [field]: value })
    }

    return (
        <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Position *</label>
                    <input
                        type="text"
                        value={item.position}
                        onChange={(e) => handleChange('position', e.target.value)}
                        className="input"
                        placeholder="Software Engineer"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Company *</label>
                    <input
                        type="text"
                        value={item.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        className="input"
                        placeholder="Company Name"
                        required
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <input
                        type="text"
                        value={item.location || ''}
                        onChange={(e) => handleChange('location', e.target.value)}
                        className="input"
                        placeholder="City, Country"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-medium mb-2">Start (Mo/Yr)</label>
                        <input
                            type="month"
                            value={item.start_date ? new Date(item.start_date).toISOString().slice(0, 7) : ''}
                            onChange={(e) => handleChange('start_date', e.target.value ? `${e.target.value}-01` : '')}
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">End (Mo/Yr)</label>
                        <input
                            type="month"
                            value={item.end_date ? new Date(item.end_date).toISOString().slice(0, 7) : ''}
                            onChange={(e) => handleChange('end_date', e.target.value ? `${e.target.value}-01` : '')}
                            className="input"
                            placeholder="Current"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                    value={item.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="textarea"
                    rows={3}
                    placeholder="Brief description of your role..."
                />
            </div>

            <div className="flex justify-end space-x-3">
                <button onClick={onCancel} className="btn btn-secondary">
                    <X className="w-4 h-4" />
                    Cancel
                </button>
                <button onClick={onSave} className="btn btn-primary">
                    <Save className="w-4 h-4" />
                    Save
                </button>
            </div>
        </div >
    )
}

// Certification Form Component
const CertificationForm = ({ item, onChange, onSave, onCancel }) => {
    const handleChange = (field, value) => {
        onChange({ ...item, [field]: value })
    }

    return (
        <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Certification Name *</label>
                    <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="input"
                        placeholder="AWS Certified Developer"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Issuer *</label>
                    <input
                        type="text"
                        value={item.issuer}
                        onChange={(e) => handleChange('issuer', e.target.value)}
                        className="input"
                        placeholder="Amazon Web Services"
                        required
                    />
                </div>
            </div>


            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Issue Date (Month/Year)</label>
                    <input
                        type="month"
                        value={item.issue_date ? new Date(item.issue_date).toISOString().slice(0, 7) : ''}
                        onChange={(e) => handleChange('issue_date', e.target.value ? `${e.target.value}-01` : '')}
                        className="input"
                    />
                    <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Optional</p>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Expiry Date (Month/Year)</label>
                    <input
                        type="month"
                        value={item.expiry_date ? new Date(item.expiry_date).toISOString().slice(0, 7) : ''}
                        onChange={(e) => handleChange('expiry_date', e.target.value ? `${e.target.value}-01` : '')}
                        className="input"
                    />
                    <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Optional - Leave blank if no expiry</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Credential ID</label>
                    <input
                        type="text"
                        value={item.credential_id || ''}
                        onChange={(e) => handleChange('credential_id', e.target.value)}
                        className="input"
                        placeholder="ABC123XYZ"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Credential URL</label>
                    <input
                        type="url"
                        value={item.credential_url || ''}
                        onChange={(e) => handleChange('credential_url', e.target.value)}
                        className="input"
                        placeholder="https://..."
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-3">
                <button onClick={onCancel} className="btn btn-secondary">
                    <X className="w-4 h-4" />
                    Cancel
                </button>
                <button onClick={onSave} className="btn btn-primary">
                    <Save className="w-4 h-4" />
                    Save
                </button>
            </div>
        </div>
    )
}

// Item Card Component
const ItemCard = ({ item, type, onEdit, onDelete }) => {
    const formatDate = (date) => {
        if (!date) return 'Present'
        return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }

    return (
        <div className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="font-bold text-lg">
                        {type === 'education' ? item.degree : type === 'experience' ? item.position : item.name}
                    </h3>
                    <p className="text-primary-600 dark:text-primary-400">
                        {type === 'education' ? item.institution : type === 'experience' ? item.company : item.issuer}
                    </p>
                </div>
                <div className="flex space-x-2">
                    <button onClick={onEdit} className="btn btn-secondary btn-sm">
                        <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={onDelete} className="btn btn-secondary btn-sm text-red-600">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-dark-600 dark:text-dark-400 mb-3">
                <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                        {formatDate(type === 'certifications' ? item.issue_date : item.start_date)} - {formatDate(type === 'certifications' ? item.expiry_date : item.end_date)}
                    </span>
                </div>
                {item.location && (
                    <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{item.location}</span>
                    </div>
                )}
            </div>

            {item.description && (
                <p className="text-dark-600 dark:text-dark-400 text-sm line-clamp-2">
                    {item.description}
                </p>
            )}
        </div>
    )
}

export default ResumeEditor
