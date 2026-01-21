#!/usr/bin/env node

/**
 * Update Imports Script
 * 
 * This script automatically updates all imports from Supabase to Firebase
 * across the entire codebase.
 * 
 * Usage: node update-imports.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const srcDir = path.join(__dirname, 'src')

// Files to process
const filesToUpdate = []

// Recursively find all JavaScript/JSX files
function findJSFiles(dir) {
    const files = fs.readdirSync(dir)

    for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
            // Skip node_modules and other unnecessary directories
            if (!['node_modules', 'dist', '.git'].includes(file)) {
                findJSFiles(filePath)
            }
        } else if (file.match(/\.(js|jsx)$/)) {
            filesToUpdate.push(filePath)
        }
    }
}

// Update imports in a file
function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8')
    let updated = false

    // Check if file imports from supabase
    if (content.includes('from \'../lib/supabase\'') ||
        content.includes('from \'../../lib/supabase\'') ||
        content.includes('from \'../lib/supabaseAdmin\'') ||
        content.includes('from \'../../lib/supabaseAdmin\'')) {

        // Replace supabase imports with firebase imports
        content = content.replace(
            /from ['"]\.\.\/lib\/supabase['"]/g,
            "from '../lib/firebase'"
        )
        content = content.replace(
            /from ['"]\.\.\/\.\.\/lib\/supabase['"]/g,
            "from '../../lib/firebase'"
        )

        // Remove supabaseAdmin imports (Firebase admin handled differently)
        content = content.replace(
            /import\s+{[^}]*}\s+from\s+['"]\.\.\/lib\/supabaseAdmin['"]\s*\n?/g,
            ''
        )
        content = content.replace(
            /import\s+{[^}]*}\s+from\s+['"]\.\.\/\.\.\/lib\/supabaseAdmin['"]\s*\n?/g,
            ''
        )

        // Replace 'supabase' references that should be 'db' or 'auth'
        // This is a best-effort replacement - manual review recommended
        content = content.replace(
            /const\s+{\s*data:\s*{\s*session\s*}\s*}\s*=\s*await\s+supabase\.auth\.getSession\(\)/g,
            'const user = getCurrentUser()'
        )

        content = content.replace(
            /supabase\.auth\.updateUser\(/g,
            'updatePassword(getCurrentUser(), '
        )

        updated = true
    }

    // Check if file mentions Supabase in text/comments
    if (content.includes('Supabase') && !content.includes('Firebase')) {
        // Add note about Firebase
        const note = '// Note: Migrated from Supabase to Firebase\n'
        if (!content.includes(note)) {
            content = note + content
            updated = true
        }
    }

    if (updated) {
        fs.writeFileSync(filePath, content, 'utf8')
        return true
    }

    return false
}

// Main execution
console.log('🔄 Updating imports from Supabase to Firebase...\n')

findJSFiles(srcDir)

console.log(`📁 Found ${filesToUpdate.length} JavaScript/JSX files\n`)

let updatedCount = 0

for (const file of filesToUpdate) {
    const relativePath = path.relative(__dirname, file)

    if (updateFile(file)) {
        console.log(`✅ Updated: ${relativePath}`)
        updatedCount++
    }
}

console.log(`\n📊 Summary:`)
console.log(`   Total files: ${filesToUpdate.length}`)
console.log(`   Updated files: ${updatedCount}`)
console.log(`   Unchanged files: ${filesToUpdate.length - updatedCount}`)

if (updatedCount > 0) {
    console.log(`\n⚠️  IMPORTANT: Manual review recommended!`)
    console.log(`   1. Check all updated files for correctness`)
    console.log(`   2. Test the application thoroughly`)
    console.log(`   3. Pay special attention to auth-related code`)
}

console.log(`\n✨ Done!`)
