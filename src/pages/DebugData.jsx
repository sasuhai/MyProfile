import { useState } from 'react'
import { getProfileByUsername, getPublishedProjects, getSkills } from '../lib/firebase'

const DebugData = () => {
    const [username, setUsername] = useState('idiahus')
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)

    const testUser = async () => {
        setLoading(true)
        setResults(null)

        try {
            console.log('Testing username:', username)

            // Test 1: Get profile
            const profileResult = await getProfileByUsername(username)
            console.log('Profile result:', profileResult)

            // Test 2: Get skills
            const skillsResult = await getSkills(username)
            console.log('Skills result:', skillsResult)

            // Test 3: Get projects
            const projectsResult = await getPublishedProjects(username)
            console.log('Projects result:', projectsResult)

            setResults({
                profile: profileResult,
                skills: skillsResult,
                projects: projectsResult
            })
        } catch (error) {
            console.error('Error:', error)
            setResults({ error: error.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen p-8">
            <h1 className="text-3xl font-bold mb-4">Firebase Data Debug</h1>

            <div className="mb-4">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input mr-2"
                    placeholder="Username"
                />
                <button
                    onClick={testUser}
                    disabled={loading}
                    className="btn btn-primary"
                >
                    {loading ? 'Testing...' : 'Test Data'}
                </button>
            </div>

            {results && (
                <div className="space-y-4">
                    <div className="card p-4">
                        <h2 className="font-bold text-xl mb-2">Profile</h2>
                        <pre className="bg-dark-100 dark:bg-dark-800 p-4 rounded overflow-auto">
                            {JSON.stringify(results.profile, null, 2)}
                        </pre>
                    </div>

                    <div className="card p-4">
                        <h2 className="font-bold text-xl mb-2">Skills</h2>
                        <p className="mb-2">Count: {results.skills?.data?.length || 0}</p>
                        <pre className="bg-dark-100 dark:bg-dark-800 p-4 rounded overflow-auto max-h-64">
                            {JSON.stringify(results.skills, null, 2)}
                        </pre>
                    </div>

                    <div className="card p-4">
                        <h2 className="font-bold text-xl mb-2">Projects</h2>
                        <p className="mb-2">Count: {results.projects?.data?.length || 0}</p>
                        <pre className="bg-dark-100 dark:bg-dark-800 p-4 rounded overflow-auto">
                            {JSON.stringify(results.projects, null, 2)}
                        </pre>
                    </div>

                    {results.error && (
                        <div className="card p-4 bg-red-50 dark:bg-red-900/20">
                            <h2 className="font-bold text-xl mb-2 text-red-600">Error</h2>
                            <p>{results.error}</p>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-8 card p-4">
                <h2 className="font-bold text-xl mb-2">Instructions</h2>
                <ol className="list-decimal list-inside space-y-2">
                    <li>Enter username (e.g., 'idiahus')</li>
                    <li>Click "Test Data"</li>
                    <li>Check browser console (F12) for detailed logs</li>
                    <li>Review the results below</li>
                </ol>
            </div>
        </div>
    )
}

export default DebugData
