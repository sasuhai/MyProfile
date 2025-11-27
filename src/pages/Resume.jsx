import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getEducation, getWorkExperience, getCertifications } from '../lib/supabase'
import { GraduationCap, Briefcase, Award, Calendar, MapPin, ExternalLink } from 'lucide-react'

const Resume = ({ username: usernameProp }) => {
    const { username: usernameParam } = useParams()
    const username = usernameProp || usernameParam
    const [education, setEducation] = useState([])
    const [experience, setExperience] = useState([])
    const [certifications, setCertifications] = useState([])

    useEffect(() => {
        loadData()
    }, [username])

    const loadData = async () => {
        const { data: eduData } = await getEducation(username)
        const { data: expData } = await getWorkExperience(username)
        const { data: certData } = await getCertifications(username)

        if (eduData) setEducation(eduData)
        if (expData) setExperience(expData)
        if (certData) setCertifications(certData)
    }

    const formatDate = (date) => {
        if (!date) return 'Present'
        return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }

    const TimelineItem = ({ item, icon: Icon, type }) => (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="timeline-item"
        >
            <div className="card p-6 card-hover">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-display text-xl font-bold">
                                {type === 'education' ? item.degree : type === 'experience' ? item.position : item.name}
                            </h3>
                            <p className="text-primary-600 dark:text-primary-400 font-medium">
                                {type === 'education' ? item.institution : type === 'experience' ? item.company : item.issuer}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-4 text-sm text-dark-600 dark:text-dark-400">
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                            {formatDate(type === 'certification' ? item.issue_date : item.start_date)} - {formatDate(type === 'certification' ? item.expiry_date : item.end_date)}
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
                    <p className="text-dark-600 dark:text-dark-400 mb-4 whitespace-pre-wrap">
                        {item.description}
                    </p>
                )}

                {item.achievements && item.achievements.length > 0 && (
                    <ul className="space-y-2 mb-4">
                        {item.achievements.map((achievement, index) => (
                            <li key={index} className="flex items-start space-x-2 text-dark-600 dark:text-dark-400">
                                <span className="text-primary-500 mt-1">•</span>
                                <span>{achievement}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {item.skills && item.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {item.skills.map((skill, index) => (
                            <span key={index} className="skill-tag text-xs">
                                {skill}
                            </span>
                        ))}
                    </div>
                )}

                {item.credential_url && (
                    <a
                        href={item.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:underline mt-4"
                    >
                        <span>View Credential</span>
                        <ExternalLink className="w-4 h-4" />
                    </a>
                )}
            </div>
        </motion.div>
    )

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
                            My <span className="gradient-text">Resume</span>
                        </h1>
                        <p className="text-lg text-dark-600 dark:text-dark-400 mb-8">
                            My educational background, work experience, and professional certifications
                        </p>
                        <a
                            href="/resume.pdf"
                            download
                            className="btn btn-primary inline-flex"
                        >
                            Download PDF Resume
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Education Section */}
            <section className="section bg-dark-50 dark:bg-dark-900/50">
                <div className="container-custom max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h2 className="font-display text-3xl font-bold">Education</h2>
                        </div>

                        {education.length > 0 ? (
                            <div className="space-y-0">
                                {education.map((item) => (
                                    <TimelineItem key={item.id} item={item} icon={GraduationCap} type="education" />
                                ))}
                            </div>
                        ) : (
                            <div className="card p-12 text-center">
                                <p className="text-dark-500 dark:text-dark-400">
                                    No education records yet. Add them from the admin panel.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Work Experience Section */}
            <section className="section">
                <div className="container-custom max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                <Briefcase className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h2 className="font-display text-3xl font-bold">Work Experience</h2>
                        </div>

                        {experience.length > 0 ? (
                            <div className="space-y-0">
                                {experience.map((item) => (
                                    <TimelineItem key={item.id} item={item} icon={Briefcase} type="experience" />
                                ))}
                            </div>
                        ) : (
                            <div className="card p-12 text-center">
                                <p className="text-dark-500 dark:text-dark-400">
                                    No work experience yet. Add them from the admin panel.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Certifications Section */}
            <section className="section bg-dark-50 dark:bg-dark-900/50">
                <div className="container-custom max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                <Award className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h2 className="font-display text-3xl font-bold">Certifications & Awards</h2>
                        </div>

                        {certifications.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                {certifications.map((cert) => (
                                    <motion.div
                                        key={cert.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        className="card p-6 card-hover"
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                                                <Award className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-display font-bold mb-1">{cert.name}</h3>
                                                <p className="text-primary-600 dark:text-primary-400 text-sm mb-2">
                                                    {cert.issuer}
                                                </p>
                                                <p className="text-sm text-dark-600 dark:text-dark-400 mb-3">
                                                    Issued: {formatDate(cert.issue_date)}
                                                </p>
                                                {cert.credential_url && (
                                                    <a
                                                        href={cert.credential_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center space-x-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                                                    >
                                                        <span>View Certificate</span>
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="card p-12 text-center">
                                <p className="text-dark-500 dark:text-dark-400">
                                    No certifications yet. Add them from the admin panel.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>
        </div>
    )
}

export default Resume
