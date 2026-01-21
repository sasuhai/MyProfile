// Note: Migrated from Supabase to Firebase
import { motion } from 'framer-motion'
import { useState } from 'react'
import {
    Sparkles, Zap, Shield, Palette, Code2, Globe, Smartphone,
    BarChart3, Lock, Users, Image, FileText, Mail, Award,
    Briefcase, GraduationCap, FolderGit2, Settings, Eye, Download,
    CheckCircle2, Star, Rocket, Heart, TrendingUp, Layout,
    Layers, Box, Database, Cloud, ArrowRight, ExternalLink
} from 'lucide-react'
import RequestAccessModal from '../../components/admin/RequestAccessModal'

const MarketingPortal = () => {
    const [showRequestModal, setShowRequestModal] = useState(false)
    const features = [
        {
            icon: Palette,
            title: "8 Premium Themes",
            description: "Choose from professionally designed color schemes. Change your entire portfolio's look with one click.",
            category: "Customization"
        },
        {
            icon: Layout,
            title: "Fully Editable Profile",
            description: "Update your bio, tagline, location, languages, and social links anytime through the intuitive admin dashboard.",
            category: "Profile"
        },
        {
            icon: Image,
            title: "Profile & Project Images",
            description: "Upload and manage your profile photo and project screenshots with automatic optimization and storage.",
            category: "Media"
        },
        {
            icon: Code2,
            title: "Skills Management",
            description: "Add unlimited skills with custom categories and proficiency levels. Organize by Frontend, Backend, Tools, and more.",
            category: "Skills"
        },
        {
            icon: Briefcase,
            title: "Work Experience",
            description: "Showcase your career journey with detailed work history, achievements, and skills used at each position.",
            category: "Resume"
        },
        {
            icon: GraduationCap,
            title: "Education & Certifications",
            description: "Display your academic background and professional certifications with dates, institutions, and achievements.",
            category: "Resume"
        },
        {
            icon: FolderGit2,
            title: "Portfolio Projects",
            description: "Showcase your work with project descriptions, images, technologies, demo links, and GitHub repositories.",
            category: "Portfolio"
        },
        {
            icon: FileText,
            title: "Custom Resume Sections",
            description: "Add personalized sections like Achievements, Core Competencies, or Awards to make your resume unique.",
            category: "Resume"
        },
        {
            icon: Star,
            title: "About Features",
            description: "Highlight your strengths with customizable feature cards (Clean Code, Fast Learner, Team Player, etc.).",
            category: "About"
        },
        {
            icon: Download,
            title: "PDF Resume Generation",
            description: "Generate a professional PDF resume with one click. Perfect for job applications and sharing.",
            category: "Export"
        },
        {
            icon: Mail,
            title: "Contact Form",
            description: "Receive messages directly through your portfolio. View and manage all submissions in your dashboard.",
            category: "Communication"
        },
        {
            icon: Users,
            title: "Multi-User Support",
            description: "Host multiple portfolios on one platform. Each user gets their own unique URL (yoursite.com/username).",
            category: "Platform"
        },
        {
            icon: Shield,
            title: "Secure Authentication",
            description: "Enterprise-grade security with Supabase Auth. Forced password change on first login for new users.",
            category: "Security"
        },
        {
            icon: Smartphone,
            title: "Fully Responsive",
            description: "Perfect display on all devices - desktop, tablet, and mobile. Mobile-first design approach.",
            category: "Design"
        },
        {
            icon: Eye,
            title: "Dark/Light Mode",
            description: "Automatic theme detection with manual toggle. Smooth transitions and persistent user preference.",
            category: "UX"
        },
        {
            icon: TrendingUp,
            title: "Work Status Badge",
            description: "Show your availability with status badges: Available for Work, Open to Opportunities, or Currently Employed.",
            category: "Profile"
        }
    ]

    const stats = [
        { icon: Layers, value: "16+", label: "Customizable Features" },
        { icon: Palette, value: "8", label: "Theme Options" },
        { icon: Settings, value: "100%", label: "Self-Service" },
        { icon: Zap, value: "< 2s", label: "Load Time" }
    ]

    const benefits = [
        {
            icon: Rocket,
            title: "Launch in Minutes",
            description: "No coding required. Set up your professional portfolio in under 30 minutes with our intuitive admin dashboard."
        },
        {
            icon: Heart,
            title: "Built for Professionals",
            description: "Designed specifically for developers, designers, and tech professionals who want to showcase their work beautifully."
        },
        {
            icon: Database,
            title: "Your Data, Your Control",
            description: "All your data is stored securely in your own Supabase database. Export, backup, or migrate anytime."
        },
        {
            icon: Cloud,
            title: "Deploy Anywhere",
            description: "Deploy to Netlify, Vercel, or any hosting platform. Full deployment guides included."
        }
    ]

    const customizationOptions = [
        { name: "Profile Information", items: ["Name", "Tagline", "Bio", "About", "Location", "Languages"] },
        { name: "Social Links", items: ["GitHub", "LinkedIn", "Twitter", "Custom URLs"] },
        { name: "Work Experience", items: ["Position", "Company", "Dates", "Description", "Achievements", "Skills Used"] },
        { name: "Education", items: ["Degree", "Institution", "Dates", "Description", "Achievements"] },
        { name: "Certifications", items: ["Name", "Issuer", "Issue Date", "Expiry Date", "Credential URL"] },
        { name: "Projects", items: ["Title", "Description", "Category", "Image", "Demo URL", "GitHub URL", "Technologies", "Publish Status"] },
        { name: "Skills", items: ["Name", "Category", "Proficiency Level", "Custom Categories"] },
        { name: "About Features", items: ["Icon", "Label", "Description", "Display Order"] },
        { name: "Custom Sections", items: ["Title", "Content", "Display Order"] },
        { name: "Theme", items: ["8 Color Presets", "Dark/Light Mode", "Custom Branding"] }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-50 via-white to-primary-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-dark-200 dark:border-dark-800">
                <div className="container-custom max-w-7xl py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center space-x-3"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg"
                            >
                                <span className="text-white font-bold text-2xl">P</span>
                            </motion.div>
                            <div>
                                <h1 className="font-display text-xl font-bold gradient-text">Portfolio</h1>
                                <p className="text-xs text-dark-500 dark:text-dark-400">Professional Platform</p>
                            </div>
                        </motion.div>

                        {/* Designer Credit */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-sm text-dark-600 dark:text-dark-400"
                        >
                            <span className="hidden sm:inline">designed by </span>
                            <span className="font-semibold text-primary-600 dark:text-primary-400">@Idiahus</span>
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 px-4">
                {/* Background decoration */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <div className="container-custom max-w-6xl relative">
                    {/* Hero Image - Right Side (Desktop Only) */}
                    <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full pointer-events-none">
                        <img
                            src="/hero-image.png"
                            alt="Hero"
                            className="w-full h-full object-contain opacity-45"
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16 relative z-10"
                    >
                        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-medium">Professional Portfolio Platform</span>
                        </div>

                        <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
                            Your Professional
                            <span className="block gradient-text">Portfolio, Perfected</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-dark-600 dark:text-dark-400 max-w-3xl mx-auto mb-8">
                            A complete, customizable portfolio platform built for developers and tech professionals.
                            <span className="block mt-2 font-semibold text-dark-700 dark:text-dark-300">
                                No coding required. 100% self-service.
                            </span>
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <button
                                onClick={() => setShowRequestModal(true)}
                                className="btn btn-primary text-lg px-8 py-4"
                            >
                                <Rocket className="w-5 h-5" />
                                Request Free Access
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <a
                                href="/idiahus"
                                className="btn btn-secondary text-lg px-8 py-4"
                            >
                                <ExternalLink className="w-5 h-5" />
                                View Live Demo
                            </a>
                        </div>
                    </motion.div>


                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
                    >
                        {stats.map((stat, index) => (
                            <div key={index} className="card p-6 text-center">
                                <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary-600 dark:text-primary-400" />
                                <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                                <div className="text-sm text-dark-600 dark:text-dark-400">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Hero Image Section - Mobile Only */}
            <section className="lg:hidden py-12 px-4 bg-gradient-to-b from-dark-50 to-white dark:from-dark-900 dark:to-dark-950">
                <div className="container-custom max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative"
                    >
                        <img
                            src="/hero-image.png"
                            alt="Portfolio Preview"
                            className="w-full h-auto object-contain opacity-80"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-4 bg-white dark:bg-dark-900">
                <div className="container-custom max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                            Everything You Need,
                            <span className="block gradient-text">All in One Place</span>
                        </h2>
                        <p className="text-xl text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
                            Powerful features that give you complete control over your professional presence
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="card p-6 hover:shadow-xl transition-all duration-300 group"
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-lg">{feature.title}</h3>
                                            <span className="text-xs px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300">
                                                {feature.category}
                                            </span>
                                        </div>
                                        <p className="text-sm text-dark-600 dark:text-dark-400">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Customization Options */}
            <section className="py-20 px-4">
                <div className="container-custom max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                            <span className="gradient-text">Complete Control</span>
                            <span className="block">Over Every Detail</span>
                        </h2>
                        <p className="text-xl text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
                            Customize every aspect of your portfolio through our intuitive admin dashboard
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {customizationOptions.map((section, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="card p-6"
                            >
                                <h3 className="font-semibold text-lg mb-4 flex items-center">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                                    {section.name}
                                </h3>
                                <ul className="space-y-2">
                                    {section.items.map((item, i) => (
                                        <li key={i} className="text-sm text-dark-600 dark:text-dark-400 flex items-start">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400 mt-1.5 mr-2 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20 px-4 bg-gradient-to-br from-primary-600 to-primary-400 text-white">
                <div className="container-custom max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                            Why Choose This Platform?
                        </h2>
                        <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                            Built with modern technology and best practices for optimal performance and user experience
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
                            >
                                <benefit.icon className="w-12 h-12 mb-4" />
                                <h3 className="text-2xl font-bold mb-3">{benefit.title}</h3>
                                <p className="text-primary-100">{benefit.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="py-20 px-4 bg-white dark:bg-dark-900">
                <div className="container-custom max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                            Built with
                            <span className="block gradient-text">Modern Technology</span>
                        </h2>
                        <p className="text-xl text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
                            Powered by industry-leading tools and frameworks
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { name: "React 18", desc: "Modern UI Framework" },
                            { name: "Vite", desc: "Lightning-Fast Build Tool" },
                            { name: "TailwindCSS", desc: "Utility-First CSS" },
                            { name: "Framer Motion", desc: "Smooth Animations" },
                            { name: "Supabase", desc: "Backend & Database" },
                            { name: "PostgreSQL", desc: "Robust Database" },
                            { name: "React Router", desc: "Client-Side Routing" },
                            { name: "Lucide Icons", desc: "Beautiful Icons" }
                        ].map((tech, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="card p-6 text-center hover:shadow-lg transition-all"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center mx-auto mb-3">
                                    <Code2 className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-semibold mb-1">{tech.name}</h3>
                                <p className="text-xs text-dark-600 dark:text-dark-400">{tech.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="container-custom max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="card p-12 text-center bg-gradient-to-br from-primary-600 to-primary-400 text-white"
                    >
                        <Rocket className="w-16 h-16 mx-auto mb-6" />
                        <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                            Ready to Get Started?
                        </h2>
                        <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                            Request free access today and start building your professional portfolio in minutes.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button
                                onClick={() => setShowRequestModal(true)}
                                className="btn bg-white text-primary-600 hover:bg-primary-50 text-lg px-8 py-4 border-0"
                            >
                                <Rocket className="w-5 h-5" />
                                Request Free Access
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white dark:bg-dark-900 border-t border-dark-200 dark:border-dark-800 py-8">
                <div className="container-custom max-w-7xl">
                    <div className="text-center">
                        <p className="text-dark-600 dark:text-dark-400">
                            Idiahus © 2026 Portfolio. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Request Access Modal */}
            <RequestAccessModal
                isOpen={showRequestModal}
                onClose={() => setShowRequestModal(false)}
            />
        </div>
    )
}

export default MarketingPortal
