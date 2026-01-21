/**
 * Data Migration Script: Supabase to Firebase
 * 
 * This script migrates all data from Supabase SQL database to Firebase Firestore NoSQL database.
 * 
 * IMPORTANT: Run this script ONCE during the migration process.
 * 
 * Usage:
 * 1. Ensure both Supabase and Firebase credentials are in .env file
 * 2. Run: node migrate-to-firebase.js
 * 3. Monitor the console for progress and any errors
 * 4. Verify data in Firebase Console before switching production
 */

import { createClient } from '@supabase/supabase-js'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import dotenv from 'dotenv'

dotenv.config()

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

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

// Helper function to convert Supabase timestamps to Firebase timestamps
const convertTimestamp = (timestamp) => {
    if (!timestamp) return null
    return new Date(timestamp)
}

// Helper function to migrate a table to a collection
const migrateCollection = async (tableName, collectionName = tableName) => {
    console.log(`\n📦 Migrating ${tableName} to ${collectionName}...`)

    try {
        // Fetch all data from Supabase
        const { data, error } = await supabase
            .from(tableName)
            .select('*')

        if (error) {
            console.error(`❌ Error fetching from ${tableName}:`, error.message)
            return { success: false, count: 0 }
        }

        if (!data || data.length === 0) {
            console.log(`⚠️  No data found in ${tableName}`)
            return { success: true, count: 0 }
        }

        console.log(`   Found ${data.length} records`)

        // Migrate each record to Firestore
        let successCount = 0
        let errorCount = 0

        for (const record of data) {
            try {
                // Convert SQL data to Firestore format
                const firestoreData = { ...record }

                // Convert timestamps
                if (record.created_at) {
                    firestoreData.created_at = convertTimestamp(record.created_at)
                }
                if (record.updated_at) {
                    firestoreData.updated_at = convertTimestamp(record.updated_at)
                }
                if (record.start_date) {
                    firestoreData.start_date = convertTimestamp(record.start_date)
                }
                if (record.end_date) {
                    firestoreData.end_date = convertTimestamp(record.end_date)
                }
                if (record.issue_date) {
                    firestoreData.issue_date = convertTimestamp(record.issue_date)
                }
                if (record.expiry_date) {
                    firestoreData.expiry_date = convertTimestamp(record.expiry_date)
                }

                // Remove the SQL 'id' field (Firestore uses auto-generated IDs)
                const sqlId = record.id
                delete firestoreData.id

                // Create document in Firestore using SQL ID as document ID for consistency
                await setDoc(doc(db, collectionName, String(sqlId)), firestoreData)

                successCount++
                process.stdout.write(`   Migrated: ${successCount}/${data.length}\r`)
            } catch (error) {
                console.error(`\n   ❌ Error migrating record ${record.id}:`, error.message)
                errorCount++
            }
        }

        console.log(`\n✅ ${tableName}: ${successCount} records migrated, ${errorCount} errors`)
        return { success: errorCount === 0, count: successCount }

    } catch (error) {
        console.error(`❌ Error migrating ${tableName}:`, error.message)
        return { success: false, count: 0 }
    }
}

// Main migration function
const migrate = async () => {
    console.log('🚀 Starting Supabase to Firebase Migration...\n')
    console.log('📋 Configuration:')
    console.log(`   Supabase URL: ${supabaseUrl}`)
    console.log(`   Firebase Project: ${firebaseConfig.projectId}\n`)

    const results = {}

    // Migrate all tables in order
    const tables = [
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

    for (const table of tables) {
        results[table] = await migrateCollection(table)
    }

    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 MIGRATION SUMMARY')
    console.log('='.repeat(60))

    let totalRecords = 0
    let totalTables = 0
    let failedTables = []

    for (const [table, result] of Object.entries(results)) {
        const status = result.success ? '✅' : '❌'
        console.log(`${status} ${table.padEnd(25)} ${result.count} records`)

        totalRecords += result.count
        if (result.success && result.count > 0) totalTables++
        if (!result.success) failedTables.push(table)
    }

    console.log('='.repeat(60))
    console.log(`Total: ${totalRecords} records across ${totalTables} collections`)

    if (failedTables.length > 0) {
        console.log(`\n⚠️  Failed tables: ${failedTables.join(', ')}`)
        console.log('Please check the errors above and retry if needed.')
    } else {
        console.log('\n🎉 Migration completed successfully!')
        console.log('\nNext steps:')
        console.log('1. Verify data in Firebase Console')
        console.log('2. Test your application with Firebase')
        console.log('3. Update all imports from supabase.js to firebase.js')
        console.log('4. Once verified, you can remove Supabase credentials from .env')
    }
}

// Run migration
migrate().catch(console.error)
