import { Link, useParams } from 'react-router-dom'
import { Github, Linkedin, Twitter, Mail, Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getProfile } from '../lib/supabase'

const Footer = ({ username: usernameProp }) => {
    const { username: usernameParam } = useParams()
    const username = usernameProp || usernameParam
    const [profile, setProfile] = useState(null)
    const currentYear = new Date().getFullYear()

    useEffect(() => {
        if (username) {
            loadProfile()
        }
    }, [username])

    const loadProfile = async () => {
        const { data } = await getProfile(username)
        if (data) setProfile(data)
    }

    const basePath = username ? `/${username}` : ''

    const socialLinks = [
        { icon: Github, href: profile?.github_url || 'https://github.com', label: 'GitHub' },
        { icon: Linkedin, href: profile?.linkedin_url || 'https://linkedin.com', label: 'LinkedIn' },
        { icon: Twitter, href: profile?.twitter_url || 'https://twitter.com', label: 'Twitter' },
        { icon: Mail, href: `mailto:${profile?.email || 'contact@example.com'}`, label: 'Email' },
    ]

    const footerLinks = [
        { name: 'Home', path: basePath || '/' },
        { name: 'About', path: `${basePath}/about` },
        { name: 'Resume', path: `${basePath}/resume` },
        { name: 'Portfolio', path: `${basePath}/portfolio` },
        { name: 'Contact', path: `${basePath}/contact` },
    ]

    return (
        <footer className="bg-dark-50 dark:bg-dark-900 border-t border-dark-200 dark:border-dark-800">
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold text-xl">
                                P
                            </div>
                            <span className="font-display text-xl font-bold gradient-text">
                                Portfolio
                            </span>
                        </div>
                        <p className="text-dark-600 dark:text-dark-400 text-sm">
                            Building amazing digital experiences with modern technologies.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-display font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            {footerLinks.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div>
                        <h3 className="font-display font-semibold mb-4">Connect</h3>
                        <div className="flex space-x-3">
                            {socialLinks.map((social) => {
                                const Icon = social.icon
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-lg bg-dark-100 dark:bg-dark-800 flex items-center justify-center hover:bg-primary-500 dark:hover:bg-primary-500 hover:text-white transition-all duration-300 hover:scale-110"
                                        aria-label={social.label}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </a>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-8 border-t border-dark-200 dark:border-dark-800">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                        <p className="text-dark-600 dark:text-dark-400 text-sm">
                            © {currentYear} Portfolio. All rights reserved.
                        </p>
                        <p className="text-dark-600 dark:text-dark-400 text-sm flex items-center">
                            Made with <Heart className="w-4 h-4 mx-1 text-red-500 fill-current" /> using React & Supabase
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
