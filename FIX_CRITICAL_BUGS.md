# 🔧 Critical Bug Fixes

## 1. Profile Photo Upload Fix

### **Issue**
Upload fails with "Failed to upload image"

### **Root Cause**
Storage bucket 'profile-images' doesn't exist in Supabase

### **Solution**
Create the storage bucket in Supabase:

1. Go to Supabase Dashboard
2. Click "Storage" in sidebar
3. Click "New bucket"
4. Name: `profile-images`
5. Public bucket: ✅ YES (checked)
6. Click "Create bucket"

### **RLS Policy for Storage**
```sql
-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload their own profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-images');

-- Allow public read access
CREATE POLICY "Public can view profile images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- Allow users to update their own images
CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-images');
```

---

## 2. Education/Certificate Entries Fix

### **Issue**
Entries not saving properly

### **Likely Causes**
1. Missing user_id in insert
2. RLS policies blocking insert
3. Form validation failing

### **Check Database**
```sql
-- Check if tables exist
SELECT * FROM education LIMIT 1;
SELECT * FROM certifications LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename IN ('education', 'certifications');
```

### **Fix RLS Policies**
```sql
-- Education policies
CREATE POLICY "Users can insert their own education"
ON education FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own education"
ON education FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own education"
ON education FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own education"
ON education FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Public can view all education
CREATE POLICY "Public can view education"
ON education FOR SELECT
TO public
USING (true);

-- Certifications policies (same pattern)
CREATE POLICY "Users can insert their own certifications"
ON certifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own certifications"
ON certifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own certifications"
ON certifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own certifications"
ON certifications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Public can view all certifications
CREATE POLICY "Public can view certifications"
ON certifications FOR SELECT
TO public
USING (true);
```

---

## 3. Contact Message Fix

### **Issue**
Failed to send message

### **Root Cause**
Likely RLS policy blocking anonymous inserts

### **Fix RLS Policy**
```sql
-- Allow anyone (including anonymous) to insert messages
CREATE POLICY "Anyone can send messages"
ON contact_messages FOR INSERT
TO public
WITH CHECK (true);

-- Only authenticated users can view messages
CREATE POLICY "Authenticated users can view messages"
ON contact_messages FOR SELECT
TO authenticated
USING (true);
```

---

## Quick Setup Script

Run this in Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can insert their own education" ON education;
DROP POLICY IF EXISTS "Users can view their own education" ON education;
DROP POLICY IF EXISTS "Users can update their own education" ON education;
DROP POLICY IF EXISTS "Users can delete their own education" ON education;
DROP POLICY IF EXISTS "Public can view education" ON education;

DROP POLICY IF EXISTS "Users can insert their own certifications" ON certifications;
DROP POLICY IF EXISTS "Users can view their own certifications" ON certifications;
DROP POLICY IF EXISTS "Users can update their own certifications" ON certifications;
DROP POLICY IF EXISTS "Users can delete their own certifications" ON certifications;
DROP POLICY IF EXISTS "Public can view certifications" ON certifications;

DROP POLICY IF EXISTS "Anyone can send messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can view messages" ON contact_messages;

-- Education policies
CREATE POLICY "Users can insert their own education"
ON education FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own education"
ON education FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own education"
ON education FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own education"
ON education FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Public can view education"
ON education FOR SELECT
TO public
USING (true);

-- Certifications policies
CREATE POLICY "Users can insert their own certifications"
ON certifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own certifications"
ON certifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own certifications"
ON certifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own certifications"
ON certifications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Public can view certifications"
ON certifications FOR SELECT
TO public
USING (true);

-- Contact messages policies
CREATE POLICY "Anyone can send messages"
ON contact_messages FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Authenticated users can view messages"
ON contact_messages FOR SELECT
TO authenticated
USING (true);
```

---

## Testing After Fixes

### **1. Test Profile Photo Upload**
1. Login to admin
2. Go to Profile tab
3. Click "Upload Image"
4. Select an image < 2MB
5. Should see "Image uploaded successfully"

### **2. Test Education Entry**
1. Go to Resume tab
2. Click Education
3. Click "Add New"
4. Fill in degree, institution
5. Click "Save"
6. Should appear in list

### **3. Test Contact Form**
1. Sign out
2. Go to /username/contact
3. Fill in contact form
4. Click "Send Message"
5. Should see "Message sent successfully"

---

## Summary

**Critical fixes needed:**
1. ✅ Create 'profile-images' storage bucket
2. ✅ Add RLS policies for education
3. ✅ Add RLS policies for certifications
4. ✅ Add RLS policies for contact_messages

**Run the SQL script above in Supabase to fix all database-related issues!**
