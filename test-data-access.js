/**
 * Simple test to check if pages can load data
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, where, getDocs, limit } from 'firebase/firestore'
import dotenv from 'dotenv'

dotenv.config()

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function testDataAccess() {
    const username = 'idiahus'

    console.log(`Testing data access for: ${username}\n`)

    try {
        // Step 1: Get profile
        console.log('1️⃣ Getting profile...')
        const profileQ = query(
            collection(db, 'profile_info'),
            where('username', '==', username),
            limit(1)
        )
        const profileSnap = await getDocs(profileQ)

        if (profileSnap.empty) {
            console.log('❌ Profile not found')
            return
        }

        const profile = profileSnap.docs[0].data()
        const userId = profile.user_id
        console.log(`✅ Profile found - User ID: ${userId}`)

        // Step 2: Get skills
        console.log('\n2️⃣ Getting skills...')
        const skillsQ = query(
            collection(db, 'skills'),
            where('user_id', '==', userId)
        )
        const skillsSnap = await getDocs(skillsQ)
        console.log(`✅ Skills: ${skillsSnap.size} found`)
        if (skillsSnap.size > 0) {
            const firstSkill = skillsSnap.docs[0].data()
            console.log(`   Sample: ${firstSkill.skill_name || firstSkill.name || 'No name'}`)
        }

        // Step 3: Get education
        console.log('\n3️⃣ Getting education...')
        const eduQ = query(
            collection(db, 'education'),
            where('user_id', '==', userId)
        )
        const eduSnap = await getDocs(eduQ)
        console.log(`✅ Education: ${eduSnap.size} found`)

        // Step 4: Get work experience
        console.log('\n4️⃣ Getting work experience...')
        const workQ = query(
            collection(db, 'work_experience'),
            where('user_id', '==', userId)
        )
        const workSnap = await getDocs(workQ)
        console.log(`✅ Work Experience: ${workSnap.size} found`)

        // Step 5: Get projects
        console.log('\n5️⃣ Getting projects...')
        const projectsQ = query(
            collection(db, 'projects'),
            where('user_id', '==', userId)
        )
        const projectsSnap = await getDocs(projectsQ)
        console.log(`✅ Projects: ${projectsSnap.size} found`)

        console.log('\n✅ ALL DATA CAN BE READ SUCCESSFULLY!')
        console.log(`\nSummary for ${username}:`)
        console.log(`- Skills: ${skillsSnap.size}`)
        console.log(`- Education: ${eduSnap.size}`)
        console.log(`- Work Experience: ${workSnap.size}`)
        console.log(`- Projects: ${projectsSnap.size}`)

    } catch (error) {
        console.error('\n❌ ERROR:', error.message)
        console.error('Code:', error.code)

        if (error.code === 'permission-denied') {
            console.log('\n⚠️  This is a Firestore security rules issue.')
            console.log('Make sure your rules allow reading these collections.')
        }
    }
}

testDataAccess()
