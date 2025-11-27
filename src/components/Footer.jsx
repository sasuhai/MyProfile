import { Link } from 'react-router-dom'
import { Github, Linkedin, Twitter, Mail, Heart } from 'lucide-react'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    const socialLinks = [
        { icon: Github, href: 'https://github.com', label: 'GitHub' },
        { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
        { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
        { icon: Mail, href: 'mailto:contact@example.com', label: 'Email' },
    ]

    const footerLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Resume', path: '/resume' },
        { name: 'Portfolio', path: '/portfolio' },
        { name: 'Contact', path: '/contact' },
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
