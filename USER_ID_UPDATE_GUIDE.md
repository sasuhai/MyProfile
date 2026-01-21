# User ID Update Guide

## 🎯 Problem

After migrating from Supabase to Firebase, user_id fields in Firestore still contain old Supabase UUIDs, but Firebase Auth created new users with new UIDs. This breaks the link between auth and data.

## 📋 Step-by-Step Solution

### Step 1: Get Old Supabase UUIDs

From your migrated Firestore data:

1. Go to: https://console.firebase.google.com/project/portfolio-4c304/firestore/data/~2Fprofile_info
2. Open each profile document
3. Copy the `user_id` value (this is the OLD Supabase UUID)
4. Note the `email` for reference

Example:
```
Document 1:
- user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
- email: "admin@example.com"

Document 2:
- user_id: "f9e8d7c6-b5a4-3210-fedc-ba0987654321"
- email: "user@example.com"
```

### Step 2: Create Firebase Auth Users & Get New UIDs

For each user:

1. Go to: https://console.firebase.google.com/project/portfolio-4c304/authentication/users
2. Click **"Add User"**
3. Enter:
   - Email: (use same email from Firestore)
   - Password: (create new password - user will need this to login)
4. Click **"Add User"**
5. **Copy the UID** from the user row

Example:
```
New Firebase Auth Users:
- Email: admin@example.com → UID: xmGDWBwxj3b0pmRuhUiooGBqJQf2
- Email: user@example.com  → UID: zYx987WvU654tSrQ321pOnM0Lk9
```

### Step 3: Create the Mapping

Edit `update-user-ids.js` and update the `USER_MAPPING` object:

```javascript
const USER_MAPPING = {
    // Old Supabase UUID → New Firebase UID
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890': 'xmGDWBwxj3b0pmRuhUiooGBqJQf2',
    'f9e8d7c6-b5a4-3210-fedc-ba0987654321': 'zYx987WvU654tSrQ321pOnM0Lk9',
    // Add all your users here...
}
```

### Step 4: Run the Update Script

```bash
node update-user-ids.js
```

This will:
- Update `user_id` in all 9 collections
- Show progress for each collection
- Display a summary of changes

### Step 5: Verify in Firebase Console

1. Go to Firestore: https://console.firebase.google.com/project/portfolio-4c304/firestore
2. Check random documents in each collection
3. Verify `user_id` now matches the NEW Firebase UID

### Step 6: Test Login

1. Try logging in with the new Firebase user credentials
2. Verify you can see and edit your data
3. Check that all features work correctly

---

## 🔍 Quick Verification

### Before Update:
```
Firebase Auth:
└── User: xmGDWBwxj3b0pmRuhUiooGBqJQf2 (admin@example.com)

Firestore profile_info:
└── Document: { user_id: "a1b2c3d4-old-uuid..." } ❌ MISMATCH
```

### After Update:
```
Firebase Auth:
└── User: xmGDWBwxj3b0pmRuhUiooGBqJQf2 (admin@example.com)

Firestore profile_info:
└── Document: { user_id: "xmGDWBwxj3b0pmRuhUiooGBqJQf2" } ✅ MATCH!
```

---

## 📊 What Gets Updated

The script updates `user_id` in these collections:
- ✅ `profile_info`
- ✅ `skills`
- ✅ `education`
- ✅ `work_experience`
- ✅ `certifications`
- ✅ `projects`
- ✅ `contact_messages`
- ✅ `custom_resume_sections`
- ✅ `about_features`

---

## ⚠️ Important Notes

1. **Backup First**: The migration already created backups, but be cautious
2. **Temporary Open Rules**: Ensure Firestore rules allow writes during update
3. **One-Time Operation**: Only run this once per user
4. **Order Matters**: Create Firebase Auth users BEFORE running the script
5. **Password Distribution**: Users will need their NEW Firebase passwords

---

## 🆘 Troubleshooting

### Issue: "No documents found"
- **Cause**: Old user_id doesn't exist in Firestore
- **Fix**: Check the old UUID is correct

### Issue: "Permission denied"
- **Cause**: Firestore rules blocking writes
- **Fix**: Temporarily use open rules (already done if following migration guide)

### Issue: "User can't see their data"
- **Cause**: user_id still doesn't match
- **Fix**: Verify Firebase UID was copied correctly

---

## 📝 Example Workflow

```bash
# 1. Collect old UUIDs from Firestore
#    profile_info → user_id values

# 2. Create Firebase Auth users
#    Get their new UIDs

# 3. Update mapping in script
vim update-user-ids.js

# 4. Run update
node update-user-ids.js

# 5. Restore secure Firestore rules
#    (after verification)

# 6. Test login
#    Each user logs in with NEW password
```

---

## Alternative: Export/Import Users (Advanced)

If you have many users, you can try Firebase Auth import:
- Requires Firebase CLI
- Can preserve some IDs
- More complex setup
- Not recommended for small user bases

---

**For your case with 3 users, manual mapping is fastest!** ✅

Update the script and run it - should take less than 1 minute!
