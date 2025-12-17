# Fix: Enable Leaked Password Protection

## What is this warning?

**Warning:** `auth_leaked_password_protection`  
**Issue:** Supabase Auth can check user passwords against the HaveIBeenPwned.org database of compromised passwords, but this feature is currently disabled.

## Why it matters

🔒 **Security Enhancement**: Prevents users from choosing passwords that have been exposed in data breaches.
- HaveIBeenPwned.org has a database of **over 11 billion compromised passwords**
- Checking passwords against this list helps prevent account takeovers
- The check is done securely using **k-anonymity** (your actual password is never sent)

## How to fix (Dashboard Only)

⚠️ **This cannot be fixed with SQL** - you must use the Supabase Dashboard:

### Step-by-step instructions:

1. **Go to your Supabase Dashboard**
   - Visit: https://app.supabase.com

2. **Navigate to Authentication Settings**
   - Click on **Authentication** (left sidebar)
   - Click on **Policies** or **Settings** tab
   - Look for **Password Security** section

3. **Enable Leaked Password Protection**
   - Find the toggle for **"Enable leaked password protection"**
   - Turn it **ON** ✅

4. **Save Changes**
   - Click **Save** or **Update**

### What happens when enabled?

✅ When a user signs up or changes their password:
- Supabase checks if the password appears in HaveIBeenPwned's database
- If compromised → **User is prompted to choose a different password**
- If safe → **Password is accepted normally**

### No code changes needed!

Once enabled in the dashboard, this protection works automatically for:
- ✅ New user registrations
- ✅ Password changes
- ✅ Password resets

## Verification

After enabling, the linter warning should disappear on the next check.

## Additional Password Security (Optional)

While you're in the Password Security settings, consider also enabling:

- ✅ **Minimum password length** (recommended: 8-12 characters)
- ✅ **Password complexity requirements** (uppercase, lowercase, numbers, symbols)
- ✅ **Password strength meter** (helps users choose stronger passwords)

---

**References:**
- [Supabase Password Security Docs](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
- [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3)
