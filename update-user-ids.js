/**
 * User ID Migration Script
 * 
 * This script updates user_id fields in Firestore from old Supabase UUIDs
 * to new Firebase UIDs after recreating users in Firebase Auth.
 * 
 * Usage:
 * 1. Create users in Firebase Auth
 * 2. Update the USER_MAPPING below with old UUID → new UID pairs
 * 3. Run: node update-user-ids.js
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
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

// ============================================
// MAPPING: Old Supabase UUID → New Firebase UID
// ============================================
// TODO: Update this with your actual user mappings
const USER_MAPPING = {
    // Format: 'old-supabase-uuid': 'new-firebase-uid'
    // Example:
    // 'a1b2c3d4-e5f6-7890-abcd-ef1234567890': 'xmGDWBwxj3b0pmRuhUiooGBqJQf2',
    // 'another-old-uuid': 'another-new-uid',
    '09c3aaae-cc71-4cc0-9cfe-2c9fd0f52c16': 'EtAdVFP1oIP7TcWdLyABX1SIiEm1',
    '3f57207d-8226-452e-936c-0f1af88a274d': 'X8q4IULXv6hXX3MRELlEYgeiizs2',
    'f98603f8-01eb-42f0-bf95-d6aa09522ab4': 'xmGDWBwxj3b0pmRuhUiooGBqJQf2',
}

// Collections that have user_id field
const COLLECTIONS_WITH_USER_ID = [
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

// Update user_id in a collection
async function updateUserIdsInCollection(collectionName, oldUserId, newUserId) {
    console.log(`\n📦 Updating ${collectionName}...`)

    try {
        // Query documents with old user_id
        const q = query(
            collection(db, collectionName),
            where('user_id', '==', oldUserId)
        )
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
            console.log(`   ⚠️  No documents found with old user_id`)
            return { success: true, count: 0 }
        }

        console.log(`   Found ${querySnapshot.size} documents`)

        let successCount = 0
        let errorCount = 0

        // Update each document
        for (const document of querySnapshot.docs) {
            try {
                await updateDoc(doc(db, collectionName, document.id), {
                    user_id: newUserId
                })
                successCount++
                process.stdout.write(`   Updated: ${successCount}/${querySnapshot.size}\r`)
            } catch (error) {
                console.error(`\n   ❌ Error updating document ${document.id}:`, error.message)
                errorCount++
            }
        }

        console.log(`\n✅ ${collectionName}: ${successCount} updated, ${errorCount} errors`)
        return { success: errorCount === 0, count: successCount }

    } catch (error) {
        console.error(`❌ Error in ${collectionName}:`, error.message)
        return { success: false, count: 0 }
    }
}

// Main migration function
async function updateAllUserIds() {
    console.log('🚀 Starting User ID Update...\n')
    console.log('📋 User Mappings:')

    const mappingCount = Object.keys(USER_MAPPING).length

    if (mappingCount === 0) {
        console.log('\n❌ ERROR: No user mappings defined!')
        console.log('\nPlease update the USER_MAPPING object in this script with your mappings:')
        console.log('Format: { "old-supabase-uuid": "new-firebase-uid" }')
        process.exit(1)
    }

    // Display mappings
    for (const [oldId, newId] of Object.entries(USER_MAPPING)) {
        console.log(`   ${oldId.substring(0, 8)}... → ${newId.substring(0, 8)}...`)
    }

    console.log(`\nTotal users to update: ${mappingCount}`)

    // Process each user
    const results = {}

    for (const [oldUserId, newUserId] of Object.entries(USER_MAPPING)) {
        console.log('\n' + '='.repeat(60))
        console.log(`👤 Updating User: ${oldUserId.substring(0, 12)}... → ${newUserId.substring(0, 12)}...`)
        console.log('='.repeat(60))

        results[oldUserId] = {}

        // Update each collection
        for (const collectionName of COLLECTIONS_WITH_USER_ID) {
            results[oldUserId][collectionName] = await updateUserIdsInCollection(
                collectionName,
                oldUserId,
                newUserId
            )
        }
    }

    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 UPDATE SUMMARY')
    console.log('='.repeat(60))

    for (const [oldUserId, collections] of Object.entries(results)) {
        console.log(`\n👤 User ${oldUserId.substring(0, 12)}...`)

        let totalUpdated = 0
        let failedCollections = []

        for (const [collection, result] of Object.entries(collections)) {
            const status = result.success ? '✅' : '❌'
            console.log(`   ${status} ${collection.padEnd(25)} ${result.count} records`)
            totalUpdated += result.count
            if (!result.success) failedCollections.push(collection)
        }

        console.log(`   Total: ${totalUpdated} records updated`)

        if (failedCollections.length > 0) {
            console.log(`   ⚠️  Failed: ${failedCollections.join(', ')}`)
        }
    }

    console.log('\n' + '='.repeat(60))
    console.log('🎉 User ID update complete!')
    console.log('='.repeat(60))
    console.log('\nNext steps:')
    console.log('1. Verify user_id updates in Firebase Console')
    console.log('2. Test login with the updated users')
    console.log('3. Ensure all data is correctly associated')
}

// Run the update
updateAllUserIds().catch(console.error)
