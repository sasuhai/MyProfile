import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { addContactMessage, getProfileByUsername } from '../lib/supabase'
import { Mail, MapPin, Send, CheckCircle, Github, Linkedin, Twitter } from 'lucide-react'
import toast from 'react-hot-toast'

const Contact = ({ username: usernameProp, profile: profileProp }) => {
    const { username: usernameParam } = useParams()
    const username = usernameProp || usernameParam
    const [profile, setProfile] = useState(profileProp || null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    })
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        if (!profileProp && username) {
            loadProfile()
        } else if (profileProp) {
            setProfile(profileProp)
        }
    }, [username, profileProp])

    const loadProfile = async () => {
        const { data } = await getProfileByUsername(username)
        if (data) setProfile(data)
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await addContactMessage(formData)

            if (error) throw error

            setSubmitted(true)
            toast.success('Message sent successfully!')
            setFormData({ name: '', email: '', subject: '', message: '' })

            setTimeout(() => setSubmitted(false), 5000)
        } catch (error) {
            console.error('Error sending message:', error)
            toast.error('Failed to send message. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const contactInfo = [
        {
            icon: Mail,
            label: 'Email',
            value: profile?.email || 'your.email@example.com',
            href: `mailto:${profile?.email || 'your.email@example.com'}`,
        },
        {
            icon: MapPin,
            label: 'Location',
            value: profile?.location || 'City, Country',
        },
    ]

    const socialLinks = [
        {
            icon: Github,
            label: 'GitHub',
            href: profile?.github_url || 'https://github.com',
        },
        {
            icon: Linkedin,
            label: 'LinkedIn',
            href: profile?.linkedin_url || 'https://linkedin.com',
        },
        {
            icon: Twitter,
            label: 'Twitter',
            href: profile?.twitter_url || 'https://twitter.com',
        },
    ]

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
                            Get In <span className="gradient-text">Touch</span>
                        </h1>
                        <p className="text-lg text-dark-600 dark:text-dark-400">
                            Have a question or want to work together? Feel free to reach out!
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                        {/* Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-8"
                        >
                            <div>
                                <h2 className="font-display text-2xl font-bold mb-6">
                                    Contact Information
                                </h2>
                                <div className="space-y-4">
                                    {contactInfo.map((item) => {
                                        const Icon = item.icon
                                        return (
                                            <div key={item.label} className="card p-6 flex items-start space-x-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                                                    <Icon className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold mb-1">{item.label}</h3>
                                                    {item.href ? (
                                                        <a
                                                            href={item.href}
                                                            className="text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                                        >
                                                            {item.value}
                                                        </a>
                                                    ) : (
                                                        <p className="text-dark-600 dark:text-dark-400">
                                                            {item.value}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div>
                                <h2 className="font-display text-2xl font-bold mb-6">
                                    Follow Me
                                </h2>
                                <div className="flex space-x-4">
                                    {socialLinks.map((social) => {
                                        const Icon = social.icon
                                        return (
                                            <a
                                                key={social.label}
                                                href={social.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-14 h-14 rounded-xl bg-dark-100 dark:bg-dark-800 flex items-center justify-center hover:bg-primary-500 dark:hover:bg-primary-500 hover:text-white transition-all duration-300 hover:scale-110"
                                                aria-label={social.label}
                                            >
                                                <Icon className="w-6 h-6" />
                                            </a>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Decorative element */}
                            <div className="hidden lg:block">
                                <div className="relative w-full h-64 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 p-8 text-white overflow-hidden">
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="font-display text-2xl font-bold mb-4">
                                            Let's Create Something Amazing Together
                                        </h3>
                                        <p className="text-white/90">
                                            I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="card p-8">
                                <h2 className="font-display text-2xl font-bold mb-6">
                                    Send Me a Message
                                </h2>

                                {submitted ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-12"
                                    >
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                                        </div>
                                        <h3 className="font-display text-xl font-bold mb-2">
                                            Message Sent!
                                        </h3>
                                        <p className="text-dark-600 dark:text-dark-400">
                                            Thank you for reaching out. I'll get back to you soon!
                                        </p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium mb-2">
                                                Your Name *
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="input"
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                                Your Email *
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="input"
                                                placeholder="john@example.com"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="subject" className="block text-sm font-medium mb-2">
                                                Subject *
                                            </label>
                                            <input
                                                type="text"
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                                className="input"
                                                placeholder="Project Inquiry"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="message" className="block text-sm font-medium mb-2">
                                                Message *
                                            </label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                                rows={6}
                                                className="textarea"
                                                placeholder="Tell me about your project..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="btn btn-primary w-full group"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="spinner w-5 h-5" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5" />
                                                    Send Message
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Contact
