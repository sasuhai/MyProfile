# 🚀 Quick Database Setup Guide

## ⚠️ Important: Run This First!

The `contact_messages` table doesn't exist yet. Follow these steps:

---

## Step 1: Create Tables & RLS Policies

### **In Supabase Dashboard:**

1. **Go to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

2. **Copy and Run This Script**
   - Open `CREATE_TABLES_AND_POLICIES.sql`
   - Copy ALL the content
   - Paste into SQL Editor
   - Click "Run" (or press Ctrl/Cmd + Enter)

3. **Verify Success**
   - You should see: "✅ All RLS policies have been created successfully!"
   - If you see errors about tables not existing, that's OK - they might already exist

---

## Step 2: Create Storage Bucket

### **In Supabase Dashboard:**

1. **Go to Storage**
   - Click "Storage" in the left sidebar

2. **Create New Bucket**
   - Click "New bucket" button
   - Name: `profile-images`
   - Public bucket: ✅ **CHECK THIS BOX** (important!)
   - Click "Create bucket"

3. **Set Storage Policies**
   - Click on the `profile-images` bucket
   - Go to "Policies" tab
   - Click "New policy"
   - Choose "For full customization"
   - Add these policies:

**Policy 1: Allow uploads**
```sql
CREATE POLICY "Users can upload profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-images');
```

**Policy 2: Allow public read**
```sql
CREATE POLICY "Public can view profile images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');
```

**Policy 3: Allow updates**
```sql
CREATE POLICY "Users can update profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-images');
```

**Policy 4: Allow deletes**
```sql
CREATE POLICY "Users can delete profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-images');
```

---

## Step 3: Test Everything

### **Test 1: Profile Photo Upload**
1. Login to admin dashboard
2. Go to Profile tab
3. Click "Upload Image"
4. Select an image (< 2MB)
5. Should see: "Image uploaded successfully" ✅

### **Test 2: Education Entry**
1. Go to Resume tab
2. Click "Education"
3. Click "Add New"
4. Fill in degree and institution
5. Click "Save"
6. Should appear in the list ✅

### **Test 3: Certificate Entry**
1. Click "Certifications" tab
2. Click "Add New"
3. Fill in name and issuer
4. Click "Save"
5. Should appear in the list ✅

### **Test 4: Contact Form**
1. Sign out
2. Go to /your-username/contact
3. Fill in the contact form
4. Click "Send Message"
5. Should see: "Message sent successfully" ✅

---

## ✅ Quick Checklist

- [ ] Run `CREATE_TABLES_AND_POLICIES.sql` in SQL Editor
- [ ] Create `profile-images` storage bucket (make it PUBLIC)
- [ ] Add 4 storage policies
- [ ] Test profile photo upload
- [ ] Test education entry
- [ ] Test certificate entry
- [ ] Test contact form

---

## 🐛 Troubleshooting

### **"Table already exists" error**
- This is OK! It means the table was already created
- The script will skip it and continue

### **"Policy already exists" error**
- This is OK! The script drops old policies first
- If it still errors, manually delete the policy in Supabase UI

### **Profile upload still fails**
- Make sure bucket is named exactly: `profile-images`
- Make sure "Public bucket" checkbox is CHECKED
- Make sure all 4 storage policies are added

### **Education/Certificates still fail**
- Check if RLS is enabled on the tables
- Check if policies were created (go to Table → Policies)
- Try running the SQL script again

---

## 📊 What This Does

### **Creates:**
- ✅ `contact_messages` table
- ✅ RLS policies for education
- ✅ RLS policies for work_experience
- ✅ RLS policies for certifications
- ✅ RLS policies for contact_messages

### **Enables:**
- ✅ Profile photo uploads
- ✅ Education entries
- ✅ Certificate entries
- ✅ Work experience entries
- ✅ Contact form submissions

---

## ⏱️ Time Required

- **SQL script:** 2 minutes
- **Storage bucket:** 3 minutes
- **Testing:** 5 minutes
- **Total:** ~10 minutes

---

## 🎯 After This

Once all tests pass:
1. ✅ All critical bugs will be fixed
2. ✅ Profile upload will work
3. ✅ Resume editor will work
4. ✅ Contact form will work

Then I can implement the remaining features:
- Theme color selector
- Bullet points in experience
- Skills improvements
- User status field
- Footer fix
- Custom resume components

---

**Run the SQL script now and let me know if you hit any errors!** 🚀
