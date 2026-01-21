# 📚 Supabase to Firebase Migration Playbook

**Created**: January 21, 2026  
**Project**: MyProfile (sasuhai)  
**Purpose**: Reusable guide for migrating Supabase projects to Firebase

---

## 🎯 WHY MIGRATE?

### Problems with Supabase Free Tier:
- ❌ **Database hibernates after 30 minutes of inactivity**
- ❌ **5-10 second cold start penalty**
- ❌ **Poor user experience (blank screens, timeouts)**
- ❌ **Limited free tier quotas**

### Benefits of Firebase:
- ✅ **No hibernation** - Always active
- ✅ **Instant cold starts** - 0 second delay
- ✅ **Better free tier limits**
- ✅ **Industry-standard authentication**
- ✅ **Real-time capabilities** (optional)
- ✅ **Google backing and reliability**

---

## 📋 PRE-MIGRATION CHECKLIST

### 1. **Audit Current Setup**
```bash
# Check package.json for Supabase dependencies
cat package.json | grep supabase

# Count files using Supabase
find src -name "*.jsx" -o -name "*.js" | xargs grep -l "supabase" | wc -l

# Identify all Supabase imports
grep -r "from.*supabase" src/
```

### 2. **Document Current Architecture**
- [ ] List all Supabase tables/collections
- [ ] Document authentication flow
- [ ] Map file storage usage
- [ ] Note any Supabase-specific features (RLS, triggers, functions)
- [ ] Record current environment variables

### 3. **Create Firebase Project**
1. Go to: https://console.firebase.google.com
2. Click "Add project"
3. Name it (e.g., your-project-name)
4. **Disable Google Analytics** (unless needed)
5. Enable **Authentication** → Email/Password
6. Enable **Firestore Database** → **Test Mode** (TEMPORARY!)
7. Copy credentials from Project Settings → General

### 4. **Backup Everything**
```bash
# Backup current code
git branch backup-before-firebase-migration
git push origin backup-before-firebase-migration

# Export Supabase data (optional - will be done by migration script)
# Document current .env file contents
```

---

## 🔧 MIGRATION PROCESS (Step-by-Step)

### PHASE 1: Setup Firebase

#### Step 1.1: Install Firebase
```bash
npm install firebase dotenv
```

#### Step 1.2: Add Firebase Credentials to `.env`
```bash
# Add these to .env (keep Supabase vars for hybrid storage)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Keep Supabase for file storage (hybrid approach)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Step 1.3: Update `.env.example`
```bash
# Mark Supabase as deprecated, add Firebase examples
```

#### Step 1.4: Verify `.gitignore`
```bash
# Ensure .env is ignored
echo ".env" >> .gitignore
```

---

### PHASE 2: Create Firebase Library

#### Step 2.1: Create `src/lib/firebase.js`

**CRITICAL DESIGN DECISION**: Mirror Supabase API structure to minimize app code changes!

```javascript
// src/lib/firebase.js
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, getDocs, ... } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword, ... } from 'firebase/auth'
import { createClient } from '@supabase/supabase-js' // For hybrid storage

// Initialize Firebase
const firebaseConfig = { /* from .env */ }
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

// Supabase Storage (hybrid - Firebase Storage requires paid plan)
const supabaseStorage = createClient(supabaseUrl, supabaseAnonKey)

// Mirror Supabase API structure
export const signIn = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { data: { user: userCredential.user }, error: null }
}

// ... replicate all Supabase functions with Firebase equivalents
```

**Key Principles**:
1. **Same function names** as Supabase (e.g., `signIn`, `getSkills`, `updateProfile`)
2. **Same return structure**: `{ data, error }` format
3. **Handle timestamps**: Convert Supabase timestamps to Firebase `Timestamp`
4. **Hybrid storage**: Use Supabase Storage for files (no cost!)

#### Step 2.2: Implement All CRUD Functions

For each Supabase table, create:
- `get[Entity]` - Read records
- `add[Entity]` - Create records  
- `update[Entity]` - Update records
- `delete[Entity]` - Delete records

**Example Pattern**:
```javascript
// Supabase version:
const { data } = await supabase.from('skills').select('*').eq('user_id', userId)

// Firebase version (return same structure):
const q = query(collection(db, 'skills'), where('user_id', '==', userId))
const snapshot = await getDocs(q)
const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
return { data, error: null }
```

---

### PHASE 3: Data Migration

#### Step 3.1: Create Migration Script

Create `migrate-to-firebase.js`:

```javascript
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, setDoc, Timestamp } from 'firebase/firestore'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Initialize both databases
const supabase = createClient(...)
const firebase = initializeApp(...)
const db = getFirestore(firebase)

// Tables to migrate
const TABLES = [
    'profile_info',
    'skills', 
    'education',
    'work_experience',
    // ... all your tables
]

async function migrateTable(tableName) {
    console.log(`Migrating ${tableName}...`)
    
    // Get all data from Supabase
    const { data, error } = await supabase.from(tableName).select('*')
    
    if (error) throw error
    
    // Migrate each record to Firebase
    for (const record of data) {
        const docId = record.id.toString()
        
        // Convert timestamps
        const firestoreData = {
            ...record,
            created_at: record.created_at ? Timestamp.fromDate(new Date(record.created_at)) : null,
            updated_at: record.updated_at ? Timestamp.fromDate(new Date(record.updated_at)) : null,
        }
        
        // Remove 'id' from data (it becomes document ID)
        delete firestoreData.id
        
        // Write to Firestore
        await setDoc(doc(db, tableName, docId), firestoreData)
    }
    
    console.log(`✅ ${tableName}: ${data.length} records migrated`)
    return data.length
}

async function migrate() {
    let total = 0
    for (const table of TABLES) {
        total += await migrateTable(table)
    }
    console.log(`\n🎉 Migration complete! ${total} total records migrated`)
}

migrate().catch(console.error)
```

#### Step 3.2: Run Migration
```bash
# Dry run first (test on one table)
# Then run full migration
node migrate-to-firebase.js
```

#### Step 3.3: Verify Migration
Check Firebase Console → Firestore Database to verify all data migrated.

---

### PHASE 4: Update Application Code

#### Step 4.1: Create Auto-Update Script

Create `update-imports.js`:

```javascript
import fs from 'fs'
import path from 'path'

const FILES_TO_UPDATE = [
    'src/pages/**/*.jsx',
    'src/components/**/*.jsx',
    'src/contexts/**/*.jsx',
    // ... all your source files
]

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8')
    let modified = false
    
    // Replace imports
    if (content.includes("from '../lib/supabase'")) {
        content = content.replace(/from ['"]\.\.\/lib\/supabase['"]/g, "from '../lib/firebase'")
        modified = true
    }
    
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8')
        console.log(`✅ Updated: ${filePath}`)
    }
}

// Run on all files
// ...
```

#### Step 4.2: Run Auto-Update
```bash
node update-imports.js
```

#### Step 4.3: Manual Fixes Required

**Common patterns to fix manually**:

1. **Auth listeners**:
```javascript
// OLD (Supabase)
supabase.auth.onAuthStateChange(callback)

// NEW (Firebase)
onAuthChange(callback) // from firebase.js
```

2. **Direct database queries in components**:
```javascript
// OLD
const { data } = await supabase.from('table').select('*')

// NEW  
const { data } = await getTableData() // use helper from firebase.js
```

3. **Current user access**:
```javascript
// OLD
const { data: { user } } = await supabase.auth.getUser()
user.id

// NEW
const user = getCurrentUser()
user.uid // Note: uid not id!
```

---

### PHASE 5: User ID Migration

**CRITICAL**: Firebase Auth creates new user UIDs!

#### Step 5.1: Create Users in Firebase Auth

1. Go to Firebase Console → Authentication
2. For each Supabase user:
   - Click "Add User"
   - Enter email
   - Set temporary password
   - **Copy the new Firebase UID**

#### Step 5.2: Map Old → New IDs

Create `update-user-ids.js`:

```javascript
const USER_MAPPING = {
    'old-supabase-uuid-1': 'new-firebase-uid-1',
    'old-supabase-uuid-2': 'new-firebase-uid-2',
    // ... map all users
}

async function updateUserIds() {
    for (const [oldId, newId] of Object.entries(USER_MAPPING)) {
        // Update user_id in all collections
        const collections = ['profile_info', 'skills', 'education', ...]
        
        for (const coll of collections) {
            const q = query(collection(db, coll), where('user_id', '==', oldId))
            const snapshot = await getDocs(q)
            
            for (const doc of snapshot.docs) {
                await updateDoc(doc.ref, { user_id: newId })
            }
        }
    }
}
```

#### Step 5.3: Run User ID Update
```bash
node update-user-ids.js
```

---

### PHASE 6: Fix Composite Index Issues

**Firebase Firestore Limitation**: Queries with `where` + `orderBy` require composite indexes!

#### Problem:
```javascript
// This requires a composite index in Firebase!
query(
    collection(db, 'skills'),
    where('user_id', '==', userId),
    orderBy('category', 'asc')  // ❌ Composite index required
)
```

#### Solution: Sort in JavaScript
```javascript
// Simple query (no index needed)
const q = query(
    collection(db, 'skills'),
    where('user_id', '==', userId)
)
const snapshot = await getDocs(q)

// Sort in JavaScript
const skills = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => (a.category || '').localeCompare(b.category || ''))
```

#### Functions to Fix:
- All `get[Entity]` functions that use both `where` and `orderBy`
- Replace with client-side sorting
- **Benefit**: Works immediately, no index creation needed!

---

### PHASE 7: Security Rules

#### Step 7.1: Apply Temporary Open Rules
```javascript
// Firebase Console → Firestore → Rules
// TEMPORARY for testing!
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // ⚠️ TEMPORARY!
    }
  }
}
```

#### Step 7.2: Test Thoroughly

#### Step 7.3: Apply Secure Rules
```javascript
// Production rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Public data - anyone can read, auth can write
    match /profile_info/{id} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    match /skills/{id} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    // ... secure all collections
  }
}
```

---

## 🚀 DEPLOYMENT

### For Netlify:

#### Issue: Secrets Scanner
Netlify will block builds if it detects "secrets" in build output.

#### Solution:
Add to `netlify.toml`:
```toml
[build.environment]
  NODE_VERSION = "20"
  # Allow client-side Firebase/Supabase keys
  SECRETS_SCAN_OMIT_KEYS = "VITE_FIREBASE_API_KEY,VITE_FIREBASE_APP_ID,VITE_FIREBASE_AUTH_DOMAIN,VITE_FIREBASE_MESSAGING_SENDER_ID,VITE_FIREBASE_PROJECT_ID,VITE_FIREBASE_STORAGE_BUCKET,VITE_SUPABASE_ANON_KEY,VITE_SUPABASE_URL"
```

#### Environment Variables:
1. Netlify Dashboard → Site Settings → Environment Variables
2. Add all `VITE_FIREBASE_*` variables
3. Keep `VITE_SUPABASE_*` for file storage
4. Trigger redeploy

---

## 🐛 COMMON ISSUES & SOLUTIONS

### 1. **"No data showing"**
**Cause**: Composite index required  
**Solution**: Remove `orderBy` from queries, sort in JavaScript

### 2. **"Permission denied"**
**Cause**: Firestore security rules  
**Solution**: Check rules allow reads, temporarily use open rules for testing

### 3. **"User can't see their data"**
**Cause**: User IDs don't match  
**Solution**: Verify user_id in Firestore matches Firebase Auth UID

### 4. **"Auth state not persisting"**
**Cause**: Using wrong auth listener  
**Solution**: Use `onAuthChange` from firebase.js, not `onAuthStateChange`

### 5. **"Timestamps showing as objects"**
**Cause**: Firebase Timestamp objects  
**Solution**: Use `.toDate()` or `.toMillis()` to convert

### 6. **"File uploads failing"**
**Cause**: Trying to use Firebase Storage (paid)  
**Solution**: Use hybrid approach - keep Supabase Storage

### 7. **"Build fails on Netlify - secrets detected"**
**Cause**: Netlify secrets scanner  
**Solution**: Add `SECRETS_SCAN_OMIT_KEYS` to netlify.toml

### 8. **"Admin functions not working"**
**Cause**: Using Supabase Admin API  
**Solution**: Temporary - keep using Supabase Admin, migrate to Cloud Functions later

---

## ✅ POST-MIGRATION CHECKLIST

### Testing:
- [ ] All pages load without errors
- [ ] User authentication works
- [ ] Public portfolio data displays
- [ ] Admin dashboard accessible
- [ ] CRUD operations work (Create, Read, Update, Delete)
- [ ] File uploads work
- [ ] File deletion works
- [ ] Search/filter functionality works
- [ ] No "database hibernation" delays
- [ ] Mobile responsive still works

### Security:
- [ ] Firestore rules applied and tested
- [ ] `.env` file not committed
- [ ] Firebase API keys in environment variables only
- [ ] Admin routes protected
- [ ] User data isolated by user_id

### Performance:
- [ ] Initial load time acceptable
- [ ] No cold start delays
- [ ] Data fetches fast
- [ ] No console errors

### Documentation:
- [ ] Update README with Firebase setup instructions
- [ ] Document new environment variables
- [ ] Note any Supabase dependencies still used (storage, admin)
- [ ] Create backup/rollback plan

---

## 📊 MIGRATION METRICS (From This Project)

### Code Changes:
- **Files modified**: 56
- **Lines added**: 6,608
- **Lines removed**: 202
- **New files created**: 24 (including docs)
- **Migration time**: ~8 hours (with troubleshooting)

### Data Migration:
- **Records migrated**: 82
- **Collections**: 9
- **Migration script run time**: < 1 minute
- **User ID updates**: 76 records

### Build/Deploy:
- **Build time**: 2.88s (local)
- **Bundle size**: 1.09 MB (minified)
- **Deploy time**: ~3 minutes (Netlify)

---

## 🎯 QUICK REFERENCE COMMANDS

```bash
# Install dependencies
npm install firebase dotenv

# Run data migration
node migrate-to-firebase.js

# Update imports
node update-imports.js

# Update user IDs
node update-user-ids.js

# Test locally
npm run dev

# Build for production
npm run build

# Git workflow
git add -A
git commit -m "feat: Migrate to Firebase"
git push origin main

# Deploy triggers automatically on Netlify
```

---

## 💡 LESSONS LEARNED

### What Went Well:
1. ✅ Mirroring Supabase API structure minimized code changes
2. ✅ Hybrid storage approach avoided Firebase Storage costs
3. ✅ Client-side sorting avoided index creation complexity
4. ✅ Comprehensive documentation made troubleshooting easier
5. ✅ Incremental approach (migrate → test → fix → deploy)

### What Was Challenging:
1. ⚠️ User ID migration required manual mapping
2. ⚠️ Composite index errors needed systematic fixing
3. ⚠️ Netlify secrets scanner required configuration
4. ⚠️ Firestore rules syntax different from Supabase RLS
5. ⚠️ Admin user creation still requires Supabase (temporary)

### Future Improvements:
1. 🔄 Migrate to Firebase Cloud Functions for server-side operations
2. 🔄 Consider Firebase Storage when upgrading to paid plan
3. 🔄 Add Firebase Analytics for better insights
4. 🔄 Implement real-time listeners for live updates
5. 🔄 Create automated testing suite for migrations

---

## 📚 ADDITIONAL RESOURCES

### Firebase Documentation:
- Firestore: https://firebase.google.com/docs/firestore
- Authentication: https://firebase.google.com/docs/auth
- Security Rules: https://firebase.google.com/docs/firestore/security/get-started

### Migration Tools:
- Firebase CLI: https://firebase.google.com/docs/cli
- Firestore Data Converter: Use custom converters for complex migrations

### Community:
- Firebase Discord: https://discord.gg/firebase
- Stack Overflow: Tag `firebase` and `google-cloud-firestore`

---

## 🚨 CRITICAL WARNINGS

1. **NEVER commit `.env` file** - Contains sensitive credentials
2. **ALWAYS use test/open Firestore rules during migration** - Then secure afterward
3. **BACKUP before migrating** - Create git branch and DB export
4. **TEST thoroughly before deploying** - Especially auth and data display
5. **UPDATE user IDs immediately** - Or users can't access their data
6. **SECURE Firestore rules ASAP** - Don't leave open rules in production

---

**End of Playbook**

This document is your complete guide for future Supabase → Firebase migrations!

Keep this updated with new learnings as you migrate more projects.
