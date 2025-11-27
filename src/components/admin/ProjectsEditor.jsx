import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { getAllProjects, addProject, updateProject, deleteProject, uploadFile } from '../../lib/supabase'
import { Plus, Edit, Trash2, Save, X, Upload, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const ProjectsEditor = ({ onUpdate }) => {
    const [projects, setProjects] = useState([])
    const [editing, setEditing] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        image_url: '',
        demo_url: '',
        github_url: '',
        technologies: [],
        published: true,
    })

    useEffect(() => {
        loadProjects()
    }, [])

    const loadProjects = async () => {
        const { data } = await getAllProjects()
        if (data) {
            setProjects(data)
            onUpdate?.()
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file')
            return
        }

        setUploading(true)
        try {
            const fileName = `project-${Date.now()}.${file.name.split('.').pop()}`
            console.log('Uploading file:', fileName, 'to bucket: project-images')
            const { data, error } = await uploadFile('project-images', fileName, file)

            if (error) {
                console.error('Upload error:', error)
                throw error
            }

            console.log('Upload successful:', data)
            setFormData({ ...formData, image_url: data })
            toast.success('Image uploaded!')
        } catch (error) {
            console.error('Image upload failed:', error)
            toast.error(error.message || 'Failed to upload image')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const projectData = {
                ...formData,
                technologies: formData.technologies.filter(t => t.trim()),
            }

            if (editing) {
                await updateProject(editing, projectData)
                toast.success('Project updated!')
            } else {
                await addProject(projectData)
                toast.success('Project added!')
            }

            resetForm()
            loadProjects()
        } catch (error) {
            toast.error('Failed to save project')
        }
    }

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: '',
            image_url: '',
            demo_url: '',
            github_url: '',
            technologies: [],
            published: true,
        })
        setEditing(null)
    }

    const handleEdit = (project) => {
        setEditing(project.id)
        setFormData(project)
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this project?')) return

        try {
            await deleteProject(id)
            toast.success('Project deleted!')
            loadProjects()
        } catch (error) {
            toast.error('Failed to delete project')
        }
    }

    const togglePublished = async (project) => {
        try {
            await updateProject(project.id, { published: !project.published })
            toast.success(project.published ? 'Project unpublished' : 'Project published')
            loadProjects()
        } catch (error) {
            toast.error('Failed to update project')
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="card p-6">
                <h2 className="font-display text-xl font-bold mb-4">
                    {editing ? 'Edit Project' : 'Add New Project'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Category</label>
                            <input
                                type="text"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="input"
                                placeholder="Web App, Mobile, etc."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Description *</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            rows={3}
                            className="textarea"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Project Image</label>
                        <label className="btn btn-secondary cursor-pointer inline-flex">
                            <Upload className="w-4 h-4" />
                            {uploading ? 'Uploading...' : 'Upload Image'}
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                        </label>
                        {formData.image_url && (
                            <img src={formData.image_url} alt="Preview" className="mt-2 h-20 rounded-lg" />
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Demo URL</label>
                            <input
                                type="url"
                                value={formData.demo_url}
                                onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">GitHub URL</label>
                            <input
                                type="url"
                                value={formData.github_url}
                                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                                className="input"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Technologies (comma-separated)</label>
                        <input
                            type="text"
                            value={formData.technologies.join(', ')}
                            onChange={(e) => setFormData({ ...formData, technologies: e.target.value.split(',').map(t => t.trim()) })}
                            className="input"
                            placeholder="React, Node.js, MongoDB"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="published"
                            checked={formData.published}
                            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                            className="w-4 h-4 rounded"
                        />
                        <label htmlFor="published" className="text-sm font-medium">Published</label>
                    </div>

                    <div className="flex space-x-2">
                        <button type="submit" className="btn btn-primary">
                            <Save className="w-4 h-4" />
                            {editing ? 'Update' : 'Add'} Project
                        </button>
                        {editing && (
                            <button type="button" onClick={resetForm} className="btn btn-secondary">
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="card p-6">
                <h2 className="font-display text-xl font-bold mb-4">All Projects</h2>
                {projects.length > 0 ? (
                    <div className="grid gap-4">
                        {projects.map(project => (
                            <div key={project.id} className="flex items-center justify-between p-4 rounded-lg bg-dark-50 dark:bg-dark-800">
                                <div className="flex items-center space-x-4">
                                    {project.image_url && (
                                        <img src={project.image_url} alt={project.title} className="w-16 h-16 rounded-lg object-cover" />
                                    )}
                                    <div>
                                        <div className="font-medium">{project.title}</div>
                                        <div className="text-sm text-dark-500 dark:text-dark-400">{project.category}</div>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => togglePublished(project)} className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg">
                                        {project.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                    <button onClick={() => handleEdit(project)} className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(project.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-dark-500 dark:text-dark-400 text-center py-8">No projects added yet</p>
                )}
            </div>
        </motion.div>
    )
}

export default ProjectsEditor
