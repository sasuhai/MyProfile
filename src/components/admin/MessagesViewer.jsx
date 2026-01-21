import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { getMessages } from '../../lib/firebase'
import { Mail, Calendar, User } from 'lucide-react'

const MessagesViewer = () => {
    const [messages, setMessages] = useState([])

    useEffect(() => {
        loadMessages()
    }, [])

    const loadMessages = async () => {
        const { data } = await getMessages()
        if (data) setMessages(data)
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="card p-8">
                <h2 className="font-display text-2xl font-bold mb-6">
                    Contact Messages
                </h2>

                {messages.length > 0 ? (
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div key={message.id} className="p-6 rounded-lg bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                            <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">{message.name}</div>
                                            <a href={`mailto:${message.email}`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                                                {message.email}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-dark-500 dark:text-dark-400">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(message.created_at)}</span>
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <span className="font-semibold">Subject:</span> {message.subject}
                                </div>

                                <div className="text-dark-600 dark:text-dark-400">
                                    {message.message}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Mail className="w-16 h-16 mx-auto mb-4 text-dark-300 dark:text-dark-700" />
                        <p className="text-dark-500 dark:text-dark-400">No messages yet</p>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

export default MessagesViewer
