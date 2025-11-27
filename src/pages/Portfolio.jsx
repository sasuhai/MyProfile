import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPublishedProjects } from '../lib/supabase'
import { ExternalLink, Github, Image as ImageIcon } from 'lucide-react'

const Portfolio = ({ username: usernameProp }) => {
    const { username: usernameParam } = useParams()
    const username = usernameProp || usernameParam
    const [projects, setProjects] = useState([])
    const [filter, setFilter] = useState('all')
    const [expandedProjects, setExpandedProjects] = useState(new Set())

    useEffect(() => {
        loadProjects()
    }, [username])

    const loadProjects = async () => {
        const { data } = await getPublishedProjects(username)
        if (data) setProjects(data)
    }

    const categories = ['all', ...new Set(projects.map(p => p.category).filter(Boolean))]

    const filteredProjects = filter === 'all'
        ? projects
        : projects.filter(p => p.category === filter)

    return (
        <div className="min-h-screen pt-16 sm:pt-20">
            {/* Header */}
            <section className="section">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-3xl mx-auto mb-16"
                    >
                        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                            My <span className="gradient-text">Portfolio</span>
                        </h1>
                        <p className="text-lg text-dark-600 dark:text-dark-400">
                            A showcase of my recent projects and work
                        </p>
                    </motion.div>

                    {/* Filter buttons */}
                    {categories.length > 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-wrap justify-center gap-3 mb-12"
                        >
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setFilter(category)}
                                    className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${filter === category
                                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30'
                                        : 'bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700'
                                        }`}
                                >
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {/* Projects grid */}
                    {filteredProjects.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProjects.map((project, index) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="card overflow-hidden card-hover group"
                                >
                                    {/* Project image */}
                                    <div className="relative aspect-video bg-gradient-to-br from-primary-100 to-primary-50 dark:from-dark-800 dark:to-dark-900 overflow-hidden">
                                        {project.image_url ? (
                                            <img
                                                src={project.image_url}
                                                alt={project.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon className="w-16 h-16 text-primary-300 dark:text-primary-700" />
                                            </div>
                                        )}

                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                            <div className="flex space-x-3">
                                                {project.demo_url && (
                                                    <a
                                                        href={project.demo_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <ExternalLink className="w-5 h-5 text-white" />
                                                    </a>
                                                )}
                                                {project.github_url && (
                                                    <a
                                                        href={project.github_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Github className="w-5 h-5 text-white" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Project info */}
                                    <div className="p-6">
                                        {project.category && (
                                            <span className="inline-block px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-medium mb-3">
                                                {project.category}
                                            </span>
                                        )}

                                        <h3 className="font-display text-xl font-bold mb-2">
                                            {project.title}
                                        </h3>

                                        <div className="mb-4">
                                            <p className={`text-dark-600 dark:text-dark-400 text-sm whitespace-pre-wrap ${!expandedProjects.has(project.id) ? 'line-clamp-3' : ''}`}>
                                                {project.description}
                                            </p>
                                            {project.description && project.description.length > 150 && (
                                                <button
                                                    onClick={() => {
                                                        setExpandedProjects(prev => {
                                                            const newSet = new Set(prev)
                                                            if (newSet.has(project.id)) {
                                                                newSet.delete(project.id)
                                                            } else {
                                                                newSet.add(project.id)
                                                            }
                                                            return newSet
                                                        })
                                                    }}
                                                    className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline mt-1"
                                                >
                                                    {expandedProjects.has(project.id) ? 'Read Less' : 'Read More'}
                                                </button>
                                            )}
                                        </div>

                                        {/* Technologies */}
                                        {project.technologies && project.technologies.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {project.technologies.slice(0, 4).map((tech, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-3 py-1 rounded-full bg-dark-100 dark:bg-dark-800 text-xs font-medium"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                                {project.technologies.length > 4 && (
                                                    <span className="px-3 py-1 rounded-full bg-dark-100 dark:bg-dark-800 text-xs font-medium">
                                                        +{project.technologies.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="card p-12 text-center">
                            <p className="text-dark-500 dark:text-dark-400">
                                {filter === 'all'
                                    ? 'No projects yet. Add them from the admin panel.'
                                    : `No projects in the "${filter}" category.`
                                }
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

export default Portfolio
