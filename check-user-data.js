/**
 * Diagnostic Script - Check User Data
 * 
 * This script checks what data exists for a specific username
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import dotenv from 'dotenv'

dotenv.config()

// Firebase configuration
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

const USERNAME_TO_CHECK = 'idiahus' // Change this to check different users

async function checkUserData() {
    console.log(`🔍 Checking data for username: ${USERNAME_TO_CHECK}\n`)

    // Step 1: Get the profile
    console.log('📋 Step 1: Finding profile...')
    const profileQuery = query(
        collection(db, 'profile_info'),
        where('username', '==', USERNAME_TO_CHECK)
    )
    const profileSnapshot = await getDocs(profileQuery)

    if (profileSnapshot.empty) {
        console.log(`❌ No profile found for username: ${USERNAME_TO_CHECK}`)
        return
    }

    const profile = profileSnapshot.docs[0].data()
    const userId = profile.user_id

    console.log(`✅ Profile found!`)
    console.log(`   User ID: ${userId}`)
    console.log(`   Email: ${profile.email}`)
    console.log(`   Full Name: ${profile.full_name}`)
    console.log(`   Role: ${profile.role}`)

    // Step 2: Check all collections for this user_id
    const collections = [
        'skills',
        'education',
        'work_experience',
        'certifications',
        'projects',
        'custom_resume_sections',
        'about_features'
    ]

    console.log(`\n📦 Step 2: Checking data collections for user_id: ${userId}\n`)

    let totalRecords = 0
    const summary = {}

    for (const collectionName of collections) {
        const q = query(
            collection(db, collectionName),
            where('user_id', '==', userId)
        )
        const snapshot = await getDocs(q)

        summary[collectionName] = snapshot.size
        totalRecords += snapshot.size

        if (snapshot.size > 0) {
            console.log(`✅ ${collectionName.padEnd(25)} ${snapshot.size} records`)

            // Show sample data for debugging
            if (snapshot.size > 0 && snapshot.size <= 3) {
                snapshot.docs.forEach((doc, index) => {
                    const data = doc.data()
                    console.log(`   ${index + 1}. ID: ${doc.id}`)
                    if (data.name) console.log(`      Name: ${data.name}`)
                    if (data.title) console.log(`      Title: ${data.title}`)
                    if (data.skill_name) console.log(`      Skill: ${data.skill_name}`)
                })
            }
        } else {
            console.log(`⚠️  ${collectionName.padEnd(25)} 0 records`)
        }
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log(`📊 SUMMARY`)
    console.log(`${'='.repeat(60)}`)
    console.log(`Username: ${USERNAME_TO_CHECK}`)
    console.log(`User ID: ${userId}`)
    console.log(`Total Records: ${totalRecords}`)
    console.log(`${'='.repeat(60)}`)

    if (totalRecords === 0) {
        console.log(`\n⚠️  WARNING: No data found for this user!`)
        console.log(`\nPossible issues:`)
        console.log(`1. User ID in profile_info doesn't match data in other collections`)
        console.log(`2. Data wasn't migrated properly`)
        console.log(`3. User ID update script didn't update this user's data`)

        console.log(`\n🔍 Checking for orphaned data...`)
        await checkOrphanedData(USERNAME_TO_CHECK)
    }
}

async function checkOrphanedData(username) {
    console.log(`\nLooking for data that might belong to ${username} but has wrong user_id...\n`)

    const collections = ['skills', 'education', 'work_experience', 'certifications', 'projects']

    // Check if there's data with old Supabase UUIDs for this user
    const oldUUIDs = [
        '09c3aaae-cc71-4cc0-9cfe-2c9fd0f52c16',
        '3f57207d-8226-452e-936c-0f1af88a274d',
        'f98603f8-01eb-42f0-bf95-d6aa09522ab4'
    ]

    for (const collectionName of collections) {
        const allDocs = await getDocs(collection(db, collectionName))

        console.log(`\n${collectionName}:`)
        console.log(`   Total documents in collection: ${allDocs.size}`)

        // Group by user_id
        const userIdGroups = {}
        allDocs.docs.forEach(doc => {
            const userId = doc.data().user_id
            if (!userIdGroups[userId]) {
                userIdGroups[userId] = 0
            }
            userIdGroups[userId]++
        })

        console.log(`   Documents per user_id:`)
        Object.entries(userIdGroups).forEach(([userId, count]) => {
            const isOld = oldUUIDs.includes(userId)
            const marker = isOld ? '⚠️  OLD UUID' : '✅'
            console.log(`   ${marker} ${userId.substring(0, 20)}...: ${count} documents`)
        })
    }
}

checkUserData().catch(console.error)
