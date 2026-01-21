import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import { Download, Mail, ArrowRight, Github, Linkedin, Code2, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getProfileByUsername, getPublishedProjects, getSkills, getCertifications, getWorkExperience } from '../lib/firebase'

const Home = ({ username: usernameProp, profile: profileProp }) => {
    const { username: usernameParam } = useParams()
    const username = usernameProp || usernameParam
    const [profile, setProfile] = useState(profileProp || null)
    const [stats, setStats] = useState({
        projects: 0,
        skills: 0,
        certifications: 0,
        experience: 0
    })

    useEffect(() => {
        if (!profileProp && username) {
            loadProfile()
        } else if (profileProp) {
            setProfile(profileProp)
        }
        if (username) {
            loadStats()
        }
    }, [username, profileProp])

    const loadProfile = async () => {
        const { data } = await getProfileByUsername(username)
        if (data) setProfile(data)
    }

    const loadStats = async () => {
        const [projectsData, skillsData, certsData, expData] = await Promise.all([
            getPublishedProjects(username),
            getSkills(username),
            getCertifications(username),
            getWorkExperience(username)
        ])

        setStats({
            projects: projectsData.data?.length || 0,
            skills: skillsData.data?.length || 0,
            certifications: certsData.data?.length || 0,
            experience: expData.data?.length || 0
        })
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
            },
        },
    }

    return (
        <div className="min-h-screen pt-16 sm:pt-20">
            {/* Hero Section */}
            <section className="section relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl animate-float" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="container-custom"
                >
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left content */}
                        <div className="space-y-8">
                            <motion.div variants={itemVariants} className="space-y-4">
                                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                                    <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                    <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                                        Welcome to my portfolio
                                    </span>
                                </div>

                                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                                    Hi, I'm
                                    <br />
                                    <span className="gradient-text">
                                        {profile?.full_name || 'Your Name'}
                                    </span>
                                </h1>

                                <p className="text-2xl sm:text-3xl text-dark-600 dark:text-dark-300 font-medium">
                                    {profile?.tagline || 'Aspiring Software Engineer'}
                                </p>
                            </motion.div>

                            <motion.p
                                variants={itemVariants}
                                className="text-lg text-dark-600 dark:text-dark-400 max-w-xl whitespace-pre-wrap"
                            >
                                {profile?.bio || 'Passionate about creating beautiful, functional, and user-friendly applications. Fresh graduate ready to make an impact in the tech industry.'}
                            </motion.p>

                            <motion.div
                                variants={itemVariants}
                                className="flex flex-wrap gap-4"
                            >
                                <Link to={username ? `/${username}/contact` : '/contact'} className="btn btn-primary group">
                                    <Mail className="w-5 h-5" />
                                    Contact Me
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>

                                <Link
                                    to={`/${username}/pdf-resume`}
                                    target="_blank"
                                    className="btn btn-secondary group"
                                >
                                    <Download className="w-5 h-5" />
                                    Download Resume
                                </Link>
                            </motion.div>

                            <motion.div
                                variants={itemVariants}
                                className="flex items-center space-x-4 pt-4"
                            >
                                <span className="text-sm text-dark-600 dark:text-dark-400">
                                    Connect with me:
                                </span>
                                <div className="flex space-x-3">
                                    <a
                                        href={profile?.github_url || 'https://github.com'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-lg bg-dark-100 dark:bg-dark-800 flex items-center justify-center hover:bg-primary-500 dark:hover:bg-primary-500 hover:text-white transition-all duration-300 hover:scale-110"
                                    >
                                        <Github className="w-5 h-5" />
                                    </a>
                                    <a
                                        href={profile?.linkedin_url || 'https://linkedin.com'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-lg bg-dark-100 dark:bg-dark-800 flex items-center justify-center hover:bg-primary-500 dark:hover:bg-primary-500 hover:text-white transition-all duration-300 hover:scale-110"
                                    >
                                        <Linkedin className="w-5 h-5" />
                                    </a>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right content - Profile image */}
                        <motion.div
                            variants={itemVariants}
                            className="relative"
                        >
                            <div className="relative w-full max-w-md mx-auto">
                                {/* Decorative elements */}
                                <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl blur-2xl opacity-20 animate-pulse" />
                                <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl blur-2xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />

                                {/* Image container */}
                                <div className={`relative ${profile?.show_photo_frame !== false ? 'glass rounded-3xl p-2 shadow-2xl' : ''}`}>
                                    <div className={`aspect-square ${profile?.show_photo_frame !== false ? 'rounded-2xl' : ''} overflow-hidden`}>
                                        {profile?.profile_image_url ? (
                                            <img
                                                src={profile.profile_image_url}
                                                alt={profile.full_name}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50 dark:from-dark-800 dark:to-dark-900">
                                                <Code2 className="w-32 h-32 text-primary-300 dark:text-primary-700" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Floating status badge */}
                                {profile?.status && (
                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute -bottom-6 -right-6 glass px-6 py-4 rounded-2xl shadow-xl"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-3 h-3 rounded-full ${profile.status === 'available'
                                                ? 'bg-green-500 animate-pulse'
                                                : profile.status === 'open_to_opportunities'
                                                    ? 'bg-blue-500 animate-pulse'
                                                    : 'bg-gray-500'
                                                }`} />
                                            <span className="font-medium">
                                                {profile.status === 'available'
                                                    ? 'Available for work'
                                                    : profile.status === 'open_to_opportunities'
                                                        ? 'Open to opportunities'
                                                        : 'Not available'}
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* Quick Stats Section */}
            <section className="section bg-dark-50 dark:bg-dark-900/50">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Projects', value: stats.projects },
                            { label: 'Skills', value: stats.skills },
                            { label: 'Certifications', value: stats.certifications },
                            { label: 'Experience', value: stats.experience > 0 ? `${stats.experience} ${stats.experience === 1 ? 'Position' : 'Positions'}` : '0' },
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="card text-center p-6 card-hover"
                            >
                                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-dark-600 dark:text-dark-400 text-sm">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home
