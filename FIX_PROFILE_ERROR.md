# 🔧 Fix Profile Update Error

## ❌ **Error**
```
400 Bad Request
Failed to load resource: the server responded with a status of 400
```

## 🔍 **Cause**
The `status` and `theme_color` columns don't exist in your `profile_info` table yet.

---

## ✅ **Solution**

### **Run this SQL in Supabase:**

1. Go to Supabase Dashboard
2. Click "SQL Editor"
3. Copy and paste this SQL:

```sql
-- Add missing columns to profile_info table

-- 1. Add status column
ALTER TABLE profile_info 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available';

ALTER TABLE profile_info 
ADD CONSTRAINT status_check 
CHECK (status IN ('available', 'not_available', 'open_to_opportunities'));

-- 2. Add theme_color column
ALTER TABLE profile_info 
ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#3b82f6';

ALTER TABLE profile_info 
ADD CONSTRAINT theme_color_format 
CHECK (theme_color IS NULL OR theme_color ~ '^#[0-9A-Fa-f]{6}$');

-- 3. Update existing rows
UPDATE profile_info 
SET status = 'available' 
WHERE status IS NULL;

UPDATE profile_info 
SET theme_color = '#3b82f6' 
WHERE theme_color IS NULL;
```

4. Click "Run"
5. Refresh your admin page
6. Try updating profile again ✅

---

## 📊 **What This Does**

**Adds 2 new columns:**
1. **`status`** - Work availability status
   - Values: 'available', 'not_available', 'open_to_opportunities'
   - Default: 'available'

2. **`theme_color`** - Custom brand color
   - Format: Hex color (#RRGGBB)
   - Default: '#3b82f6' (blue)
   - Validation: Must be valid hex color

**Updates existing data:**
- Sets default values for existing users
- Ensures no NULL values

---

## ✅ **After Running SQL**

1. Refresh admin page
2. Go to Profile Editor
3. You should see:
   - ✅ Status dropdown working
   - ✅ Theme color picker working
4. Save profile - should work! ✅

---

## 🧪 **Verify It Worked**

Run this SQL to check:
```sql
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profile_info' 
AND column_name IN ('status', 'theme_color')
ORDER BY column_name;
```

Should show both columns exist! ✅

---

**After running the SQL, your profile updates will work!** 🎉
