# 📧 Setup Resend for Custom Email Notifications

## 🎯 Goal
Send professional "New Access Request" emails with custom subject and design.

---

## ⚠️ Current Issue

**Problem:** Using `resetPasswordForEmail()` sends emails with:
- ❌ Subject: "Reset Your Password" (can't be changed)
- ❌ Generic Supabase template
- ✅ But it works (no errors)

**Solution:** Use Resend API for full control!

---

## 🚀 Quick Setup (5 Minutes)

### **Step 1: Sign Up for Resend**

1. Go to: https://resend.com/signup
2. Sign up (free - no credit card needed)
3. Verify your email

### **Step 2: Get API Key**

1. Go to: https://resend.com/api-keys
2. Click "Create API Key"
3. Name it: "Portfolio Notifications"
4. Copy the API key (starts with `re_`)

### **Step 3: Add API Key to Supabase**

```bash
npx supabase secrets set RESEND_API_KEY=re_your_key_here
```

### **Step 4: Deploy Updated Function**

I'll create the updated function for you, then:

```bash
npx supabase functions deploy notify-admin-email
```

**Done!** 🎉

---

## 📧 What You'll Get

**Subject:** 🔔 New Access Request - Portfolio Platform

**Email Design:**
- ✅ Beautiful gradient header with "P" logo
- ✅ Professional HTML layout
- ✅ Requestor details (name, email, date)
- ✅ "Review Request" button
- ✅ Branded footer
- ✅ Responsive design
- ✅ Dark mode friendly

---

## 💰 Cost

**FREE!**
- 3,000 emails/month free
- 100 emails/day free
- No credit card required
- Perfect for your use case

---

## 🔧 Technical Details

**What changes:**
- Edge Function will use Resend API instead of Supabase Auth
- Custom email template (the beautiful HTML one I created)
- Full control over subject, sender, content

**What stays the same:**
- Everything else works exactly as before
- No changes to React app needed
- Same trigger (when request submitted)

---

## ✨ Benefits

✅ **Custom subject line** - "New Access Request" instead of "Reset Password"
✅ **Professional design** - Beautiful HTML email
✅ **Your branding** - Portfolio logo and colors
✅ **Reliable** - Works for all users (new and existing)
✅ **Free** - 3,000 emails/month
✅ **Fast** - Emails arrive in seconds

---

## 🎯 Next Steps

**Ready to set this up?**

1. **Sign up for Resend** (2 minutes)
2. **Get API key** (30 seconds)
3. **Add to Supabase** (1 command)
4. **Deploy** (1 command)

**Total time: 5 minutes**

Then you'll get beautiful custom emails! 📧✨

---

**Want me to create the updated Edge Function code for you?** 

Just say yes and provide your Resend API key, and I'll:
1. Update the Edge Function to use Resend
2. Keep the beautiful HTML email template
3. Deploy it for you

**Or keep current solution?**
- ✅ Works (no errors)
- ⚠️ Subject says "Reset Password"
- ⚠️ Generic template

Your choice! 🚀
