import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProfileByUsername, getSkills, getAboutFeatures } from '../lib/firebase'
import { Code2, Palette, Database, Globe, Zap, Heart, Star, Award, Target, Lightbulb } from 'lucide-react'

const About = ({ username: usernameProp, profile: profileProp }) => {
    const { username: usernameParam } = useParams()
    const username = usernameProp || usernameParam
    const [profile, setProfile] = useState(profileProp || null)
    const [skills, setSkills] = useState([])
    const [features, setFeatures] = useState([])

    useEffect(() => {
        loadData()
    }, [username])

    const loadData = async () => {
        if (!profileProp && username) {
            const { data: profileData } = await getProfileByUsername(username)
            if (profileData) setProfile(profileData)
        }

        const { data: skillsData } = await getSkills(username)
        if (skillsData) setSkills(skillsData)

        const { data: featuresData } = await getAboutFeatures(username)
        if (featuresData && featuresData.length > 0) {
            setFeatures(featuresData)
        } else {
            // Default features if none in database
            setFeatures([
                { icon: 'Code2', label: 'Clean Code', description: 'Writing maintainable and scalable code' },
                { icon: 'Zap', label: 'Fast Learner', description: 'Quick to adapt to new technologies' },
                { icon: 'Heart', label: 'Passionate', description: 'Love what I do every day' },
                { icon: 'Globe', label: 'Team Player', description: 'Collaborative and communicative' },
            ])
        }
    }

    const groupedSkills = skills.reduce((acc, skill) => {
        if (!acc[skill.category]) {
            acc[skill.category] = []
        }
        acc[skill.category].push(skill)
        return acc
    }, {})

    const categoryIcons = {
        'Frontend': Palette,
        'Backend': Database,
        'Languages': Code2,
        'Tools': Zap,
        'Other': Globe,
    }

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
                            About <span className="gradient-text">Me</span>
                        </h1>
                        <p className="text-lg text-dark-600 dark:text-dark-400">
                            Get to know more about my background, skills, and what drives me
                        </p>
                    </motion.div>

                    {/* Bio Section */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <h2 className="font-display text-3xl font-bold">
                                My Story
                            </h2>
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <p className="text-dark-600 dark:text-dark-400 leading-relaxed whitespace-pre-wrap">
                                    {profile?.about || 'I am a passionate software engineer with a strong foundation in modern web technologies. My journey in tech began during my university years, where I discovered my love for creating elegant solutions to complex problems.'}
                                </p>
                                <p className="text-dark-600 dark:text-dark-400 leading-relaxed whitespace-pre-wrap">
                                    {profile?.bio || 'I specialize in building responsive, user-friendly applications using cutting-edge technologies. I\'m always eager to learn new skills and take on challenging projects that push me to grow as a developer.'}
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            {features.map((item, index) => {
                                const getIcon = (iconName) => {
                                    const icons = { Code2, Zap, Heart, Globe, Star, Award, Target, Lightbulb }
                                    return icons[iconName] || Code2
                                }
                                const Icon = getIcon(item.icon)
                                return (
                                    <motion.div
                                        key={item.label}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                                        className="card p-6 text-center card-hover"
                                    >
                                        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="font-semibold mb-2">{item.label}</h3>
                                        <p className="text-sm text-dark-600 dark:text-dark-400">
                                            {item.description}
                                        </p>
                                    </motion.div>
                                )
                            })}
                        </motion.div>
                    </div>

                    {/* Personal Details */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="card p-8 mb-20"
                    >
                        <h2 className="font-display text-2xl font-bold mb-6">
                            Personal Information
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                { label: 'Location', value: profile?.location || 'City, Country' },
                                { label: 'Email', value: profile?.email || 'your.email@example.com' },
                                { label: 'Phone', value: profile?.phone || '+1 (555) 123-4567' },
                                { label: 'Languages', value: profile?.languages || 'English, Bahasa Malaysia' },
                                {
                                    label: 'Status',
                                    value: profile?.status === 'available'
                                        ? 'Available for work'
                                        : profile?.status === 'open_to_opportunities'
                                            ? 'Open to opportunities'
                                            : 'Not available'
                                },
                            ].map((item) => (
                                <div key={item.label} className="flex flex-col">
                                    <span className="text-sm text-dark-500 dark:text-dark-400 mb-1">
                                        {item.label}
                                    </span>
                                    <span className="font-medium text-dark-900 dark:text-dark-50">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Skills Section */}
            <section className="section bg-dark-50 dark:bg-dark-900/50">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-center mb-12"
                    >
                        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                            Skills & <span className="gradient-text">Technologies</span>
                        </h2>
                        <p className="text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
                            Technologies and tools I work with to bring ideas to life
                        </p>
                    </motion.div>

                    <div className="space-y-8">
                        {Object.entries(groupedSkills).map(([category, categorySkills], index) => {
                            const Icon = categoryIcons[category] || Code2
                            return (
                                <motion.div
                                    key={category}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="card p-6"
                                >
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                            <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <h3 className="font-display text-xl font-bold">{category}</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {categorySkills.map((skill) => (
                                            <div key={skill.id} className="skill-tag">
                                                {skill.name}
                                                {skill.level && (
                                                    <span className="ml-2 text-xs opacity-70">
                                                        • {skill.level}%
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>

                    {skills.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-dark-500 dark:text-dark-400">
                                No skills added yet. Add skills from the admin panel.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

export default About
