/**
 * Fix Remaining User IDs Script
 * 
 * This script finds and updates any remaining documents with old user_ids
 * that failed in the previous update.
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore'
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

// User mapping (same as before)
const USER_MAPPING = {
    '09c3aaae-cc71-4cc0-9cfe-2c9fd0f52c16': 'EtAdVFP1oIP7TcWdLyABX1SIiEm1',
    '3f57207d-8226-452e-936c-0f1af88a274d': 'X8q4IULXv6hXX3MRELlEYgeiizs2',
    'f98603f8-01eb-42f0-bf95-d6aa09522ab4': 'xmGDWBwxj3b0pmRuhUiooGBqJQf2',
}

const COLLECTIONS = [
    'profile_info',
    'skills',
    'education',
    'work_experience',
    'certifications',
    'projects',
    'contact_messages',
    'custom_resume_sections',
    'about_features'
]

// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function fixRemainingUserIds() {
    console.log('🔍 Scanning for remaining old user_ids...\n')

    let totalFixed = 0
    let totalErrors = 0

    for (const collectionName of COLLECTIONS) {
        console.log(`\n📦 Checking ${collectionName}...`)

        try {
            // Get ALL documents in the collection
            const querySnapshot = await getDocs(collection(db, collectionName))

            if (querySnapshot.empty) {
                console.log(`   ℹ️  Collection is empty`)
                continue
            }

            let foundOldIds = 0
            let fixed = 0
            let errors = 0

            // Check each document
            for (const document of querySnapshot.docs) {
                const data = document.data()
                const currentUserId = data.user_id

                // Check if this user_id is an old one that needs updating
                if (USER_MAPPING[currentUserId]) {
                    foundOldIds++
                    const newUserId = USER_MAPPING[currentUserId]

                    try {
                        // Update the document
                        await updateDoc(doc(db, collectionName, document.id), {
                            user_id: newUserId
                        })

                        console.log(`   ✅ Fixed document ${document.id}: ${currentUserId.substring(0, 8)}... → ${newUserId.substring(0, 8)}...`)
                        fixed++
                        totalFixed++

                        // Small delay to avoid rate limiting
                        await sleep(100)

                    } catch (error) {
                        console.error(`   ❌ Error updating ${document.id}:`, error.message)
                        errors++
                        totalErrors++
                    }
                }
            }

            if (foundOldIds === 0) {
                console.log(`   ✅ All user_ids are up to date`)
            } else {
                console.log(`\n   Summary: ${fixed} fixed, ${errors} errors out of ${foundOldIds} found`)
            }

        } catch (error) {
            console.error(`   ❌ Error scanning ${collectionName}:`, error.message)
            totalErrors++
        }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 FINAL SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Total documents fixed: ${totalFixed}`)
    console.log(`❌ Total errors: ${totalErrors}`)

    if (totalFixed > 0) {
        console.log('\n🎉 Successfully updated remaining user_ids!')
    }

    if (totalErrors > 0) {
        console.log('\n⚠️  Some documents still have errors.')
        console.log('These may need to be updated manually in Firebase Console.')
    }

    if (totalFixed === 0 && totalErrors === 0) {
        console.log('\n✅ All user_ids are already up to date!')
    }

    console.log('\nNext steps:')
    console.log('1. Verify all user_ids are updated in Firebase Console')
    console.log('2. Restore secure Firestore rules')
    console.log('3. Test login with all users')
}

// Run the fix
fixRemainingUserIds().catch(console.error)
