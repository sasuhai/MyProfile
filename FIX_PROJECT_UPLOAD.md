# 🖼️ Fix Project Image Upload

## ❌ **Issue**
Project images fail to upload.

## 🔍 **Cause**
The `project-images` storage bucket doesn't exist in Supabase.

---

## ✅ **Solution**

### **Create Storage Bucket in Supabase:**

1. **Go to Supabase Dashboard**
2. **Click "Storage" in sidebar**
3. **Click "New bucket"**
4. **Enter details:**
   - Name: `project-images`
   - Public bucket: ✅ **YES** (check this!)
   - File size limit: 5MB (or your preference)
5. **Click "Create bucket"**

6. **Set bucket policy (make it public):**
   - Click on the `project-images` bucket
   - Go to "Policies" tab
   - Click "New Policy"
   - Select "For full customization"
   - Policy name: `Public Access`
   - Allowed operation: `SELECT`
   - Target roles: `public`
   - USING expression: `true`
   - Click "Review" then "Save policy"

7. **Add upload policy:**
   - Click "New Policy" again
   - Policy name: `Authenticated Upload`
   - Allowed operation: `INSERT`
   - Target roles: `authenticated`
   - WITH CHECK expression: `true`
   - Click "Review" then "Save policy"

---

## 🧪 **Test Upload**

1. Go to Admin → Projects
2. Click "Add New Project"
3. Click "Upload Image"
4. Select an image
5. Should upload successfully! ✅

---

## 📊 **Check Console**

If it still fails:
1. Open browser console (F12)
2. Try uploading again
3. Look for error messages
4. Share the error for more help

---

**After creating the bucket, image uploads will work!** 🎉
