# 🔧 Education & Certifications Fix

## ✅ Contact Form - FIXED!

Updated the code to use `contact_messages` table instead of `messages`.

---

## 🔍 Education & Certifications - Debugging

The issue is likely one of these:

### **Possible Issue 1: Missing Table Columns**

The form might be sending fields that don't exist in the database.

**Check your table structure in Supabase:**

```sql
-- Check education table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'education'
ORDER BY ordinal_position;

-- Check certifications table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'certifications'
ORDER BY ordinal_position;
```

### **Expected Columns:**

**Education table should have:**
- `id` (uuid)
- `user_id` (uuid)
- `degree` (text)
- `institution` (text)
- `field_of_study` (text)
- `start_date` (date)
- `end_date` (date)
- `location` (text)
- `description` (text)
- `achievements` (jsonb or text[])
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Certifications table should have:**
- `id` (uuid)
- `user_id` (uuid)
- `name` (text)
- `issuer` (text)
- `issue_date` (date)
- `expiry_date` (date)
- `credential_id` (text)
- `credential_url` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

---

## 🔧 If Tables Don't Exist - Create Them

Run this SQL in Supabase:

```sql
-- Create education table
CREATE TABLE IF NOT EXISTS education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    degree TEXT NOT NULL,
    institution TEXT NOT NULL,
    field_of_study TEXT,
    start_date DATE,
    end_date DATE,
    location TEXT,
    description TEXT,
    achievements JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_education_user_id ON education(user_id);

-- Create certifications table
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    credential_id TEXT,
    credential_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_certifications_user_id ON certifications(user_id);

-- Enable RLS
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- Add RLS policies (same as before)
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
```

---

## 🧪 Testing Steps

### **Test Education:**
1. Open browser console (F12)
2. Go to Admin → Resume → Education
3. Click "Add New"
4. Fill in:
   - Degree: "Bachelor of Science"
   - Institution: "Test University"
5. Click "Save"
6. **Check console for errors**
7. Share the error message if it fails

### **Test Certifications:**
1. Go to Certifications tab
2. Click "Add New"
3. Fill in:
   - Name: "Test Certification"
   - Issuer: "Test Org"
4. Click "Save"
5. **Check console for errors**
6. Share the error message if it fails

### **Test Contact Form:**
1. Sign out
2. Go to /your-username/contact
3. Fill in form
4. Click "Send Message"
5. Should work now! ✅

---

## 📊 Summary of Fixes

### **✅ Fixed:**
- Contact form now uses `contact_messages` table
- Contact form no longer requires `portfolio_owner_id`
- Messages viewer updated

### **🔍 Need to Check:**
- Do education and certifications tables exist?
- Do they have the right columns?
- Are there any console errors?

---

## 🎯 Next Steps

1. **Run the table check SQL** (see above)
2. **If tables don't exist**, run the CREATE TABLE SQL
3. **Try adding education/certification again**
4. **Share any console errors** if it still fails

---

**Contact form should work now! Test it and let me know about education/certifications!** 🚀
