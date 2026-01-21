import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProfileByUsername, getSkills, getEducation, getWorkExperience, getCertifications, getCustomSections, getAboutFeatures, getPublishedProjects } from '../lib/firebase'
import { Mail, Phone, MapPin, Globe, Github, Linkedin, Twitter, ExternalLink } from 'lucide-react'
import '../styles/pdf-resume.css'

const PDFResume = () => {
    const { username } = useParams()
    const [profile, setProfile] = useState(null)
    const [skills, setSkills] = useState([])
    const [education, setEducation] = useState([])
    const [experience, setExperience] = useState([])
    const [certifications, setCertifications] = useState([])
    const [customSections, setCustomSections] = useState([])
    const [features, setFeatures] = useState([])
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [username])

    const loadData = async () => {
        try {
            const [profileData, skillsData, eduData, expData, certData, sectionsData, featuresData, projectsData] = await Promise.all([
                getProfileByUsername(username),
                getSkills(username),
                getEducation(username),
                getWorkExperience(username),
                getCertifications(username),
                getCustomSections(username),
                getAboutFeatures(username),
                getPublishedProjects(username)
            ])

            if (profileData.data) setProfile(profileData.data)
            if (skillsData.data) {
                console.log('Skills data:', skillsData.data)
                setSkills(skillsData.data)
            }
            if (eduData.data) setEducation(eduData.data)
            if (expData.data) setExperience(expData.data)
            if (certData.data) setCertifications(certData.data)
            if (sectionsData.data) setCustomSections(sectionsData.data)
            if (featuresData.data) setFeatures(featuresData.data)
            if (projectsData.data) setProjects(projectsData.data)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner w-12 h-12"></div>
            </div>
        )
    }

    return (
        <div className="pdf-resume-container">
            {/* Print Button - Hidden in print */}
            <div className="no-print fixed top-4 right-4 z-50">
                <button onClick={handlePrint} className="btn btn-primary">
                    Download PDF
                </button>
            </div>

            {/* PDF Content */}
            <div className="pdf-content">
                {/* Header - Repeats on every page */}
                <div className="pdf-header">
                    <div className="header-content">
                        <div className="header-logo">{profile?.full_name || 'Your Name'} Portfolio</div>
                        <div className="header-info">
                            {profile?.email && <span>{profile.email}</span>}
                        </div>
                    </div>
                </div>

                {/* Page 1: Profile & About */}
                <div className="pdf-page">
                    {/* Profile Section */}
                    <div className="profile-section">
                        <div className="profile-header">
                            {profile?.profile_image_url && (
                                <div className="profile-image">
                                    <img src={profile.profile_image_url} alt={profile.full_name} />
                                </div>
                            )}
                            <div className="profile-info">
                                <h1 className="profile-name">{profile?.full_name || 'Your Name'}</h1>
                                <p className="profile-tagline">{profile?.tagline || 'Professional Title'}</p>
                                <div className="profile-status">
                                    <span className={`status-badge ${profile?.status === 'available' ? 'status-available' : profile?.status === 'open_to_opportunities' ? 'status-open' : 'status-unavailable'}`}>
                                        {profile?.status === 'available' ? 'Available for work' : profile?.status === 'open_to_opportunities' ? 'Open to opportunities' : 'Not available'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="contact-grid">
                            {profile?.email && (
                                <div className="contact-item">
                                    <Mail className="contact-icon" />
                                    <span>{profile.email}</span>
                                </div>
                            )}
                            {profile?.phone && (
                                <div className="contact-item">
                                    <Phone className="contact-icon" />
                                    <span>{profile.phone}</span>
                                </div>
                            )}
                            {profile?.location && (
                                <div className="contact-item">
                                    <MapPin className="contact-icon" />
                                    <span>{profile.location}</span>
                                </div>
                            )}
                            {profile?.github_url && (
                                <div className="contact-item">
                                    <Github className="contact-icon" />
                                    <span>{profile.github_url.replace('https://github.com/', '')}</span>
                                </div>
                            )}
                            {profile?.linkedin_url && (
                                <div className="contact-item">
                                    <Linkedin className="contact-icon" />
                                    <span>{profile.linkedin_url.replace('https://linkedin.com/in/', '')}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* About Section */}
                    {profile?.bio && (
                        <div className="section">
                            <h2 className="section-title">About Me</h2>
                            <p className="bio-text">{profile.bio}</p>
                        </div>
                    )}

                    {/* Features */}
                    {features.length > 0 && (
                        <div className="section">
                            <h2 className="section-title">What I Do</h2>
                            <div className="features-grid">
                                {features.map((feature) => (
                                    <div key={feature.id} className="feature-item">
                                        <h3 className="feature-label">{feature.label}</h3>
                                        <p className="feature-desc">{feature.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Skills */}
                    {(() => {
                        // Each skill is already an object with {id, name, category, level}
                        // Just extract the names
                        const allSkills = skills.map(skill => skill.name).filter(Boolean);

                        console.log('All skill names:', allSkills);

                        return allSkills.length > 0 ? (
                            <div className="section">
                                <h2 className="section-title">Skills & Expertise</h2>
                                <div className="skill-items-flat">
                                    {allSkills.map((skill, idx) => (
                                        <span key={idx} className="skill-tag">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        ) : null;
                    })()}
                </div>

                {/* Page 2: Experience & Education */}
                <div className="pdf-page page-break-before">
                    {/* Work Experience */}
                    {experience.length > 0 && (
                        <div className="section">
                            <h2 className="section-title">Work Experience</h2>
                            <div className="timeline">
                                {experience.map((exp) => (
                                    <div key={exp.id} className="timeline-item">
                                        <div className="timeline-marker"></div>
                                        <div className="timeline-content">
                                            <div className="timeline-header">
                                                <h3 className="timeline-title">{exp.position}</h3>
                                                <span className="timeline-date">{exp.start_date} - {exp.end_date || 'Present'}</span>
                                            </div>
                                            <p className="timeline-company">{exp.company}</p>
                                            {exp.description && <p className="timeline-desc">{exp.description}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                        <div className="section">
                            <h2 className="section-title">Education</h2>
                            <div className="timeline">
                                {education.map((edu) => (
                                    <div key={edu.id} className="timeline-item">
                                        <div className="timeline-marker"></div>
                                        <div className="timeline-content">
                                            <div className="timeline-header">
                                                <h3 className="timeline-title">{edu.degree}</h3>
                                                <span className="timeline-date">{edu.start_date} - {edu.end_date || 'Present'}</span>
                                            </div>
                                            <p className="timeline-company">{edu.institution}</p>
                                            {edu.description && <p className="timeline-desc">{edu.description}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Portfolio/Projects */}
                    {projects.length > 0 && (
                        <div className="section">
                            <h2 className="section-title">Portfolio & Projects</h2>
                            <div className="projects-grid">
                                {projects.map((project) => (
                                    <div key={project.id} className="project-item">
                                        <h3 className="project-title">{project.title}</h3>
                                        <p className="project-desc">{project.description}</p>
                                        {project.technologies && project.technologies.length > 0 && (
                                            <div className="project-tech">
                                                {project.technologies.map((tech, idx) => (
                                                    <span key={idx} className="tech-tag">{tech}</span>
                                                ))}
                                            </div>
                                        )}
                                        {project.project_url && (
                                            <div className="project-link">
                                                <ExternalLink className="w-3 h-3" />
                                                <span>{project.project_url}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certifications */}
                    {certifications.length > 0 && (
                        <div className="section">
                            <h2 className="section-title">Certifications</h2>
                            <div className="cert-grid">
                                {certifications.map((cert) => (
                                    <div key={cert.id} className="cert-item">
                                        <h3 className="cert-name">{cert.name}</h3>
                                        <p className="cert-issuer">{cert.issuer}</p>
                                        <p className="cert-date">{cert.issue_date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Custom Sections */}
                    {customSections.map((section) => (
                        <div key={section.id} className="section">
                            <h2 className="section-title">{section.title}</h2>
                            <div className="custom-section-content" dangerouslySetInnerHTML={{ __html: section.content }} />
                        </div>
                    ))}
                </div>

                {/* Footer - Repeats on every page */}
                <div className="pdf-footer">
                    <div className="footer-content">
                        <span>Generated from Portfolio</span>
                        <span>•</span>
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PDFResume
