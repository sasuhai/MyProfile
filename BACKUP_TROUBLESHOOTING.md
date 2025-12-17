# 🚨 Backup Connection Troubleshooting

## Current Issue

Your Supabase database is not accepting external connections on either:
- Port 5432 (Direct database connection)
- Port 6543 (Connection pooler/session pooler)

## Most Likely Causes

### 1. ⏸️ **Supabase Project is Paused** (Most Common)

Free tier Supabase projects automatically pause after **7 days of inactivity**.

**Solution:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Find your project: `oqctmbjsepdwgfs`
3. If you see a "Restore" or "Resume" button, click it
4. Wait 2-3 minutes for the project to fully restart
5. Try the backup script again

### 2. 🔒 **Network/Firewall Restrictions**

Some networks block outgoing database connections.

**Test:**
```bash
# Test port 6543
nc -zv db.oqctmbjsepdwgddymgfs.supabase.co 6543

# Test port 5432  
nc -zv db.oqctmbjsepdwgddymgfs.supabase.co 5432
```

### 3. 🚫 **IP Ban**

Too many failed login attempts can temporarily ban your IP.

**Solution:**
- Wait 30 minutes for auto-unban
- Or unban via Supabase Dashboard: Project Settings → Database → IP Ban

## Alternative Backup Methods

While troubleshooting the direct connection, you can use these alternatives:

### Method 1: Supabase Dashboard (Manual)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/oqctmbjsepdwgddymgfs/database/backups)
2. Navigate to **Database** → **Backups**
3. Click "Create backup" or download existing backups
4. Download the `.sql` file manually

### Method 2: Supabase CLI (Recommended Alternative)

Install Supabase CLI and use integrated backup:

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref oqctmbjsepdwgddymgfs

# Create database dump
supabase db dump -f backup/database_backup_$(date +%Y%m%d_%H%M%S).sql

# This works even when direct pg_dump doesn't!
```

### Method 3: Supabase Management API

Use the Supabase Management API to trigger backups programmatically.

## Quick Check: Is Your Project Active?

Run this to check basic connectivity:

```bash
# Check if Supabase API is responding
curl -I https://oqctmbjsepdwgddymgfs.supabase.co/rest/v1/

# If you get a 200 response, project is active
# If you get connection error, project is paused
```

## Recommended Next Steps

1. **Check if project is paused** - Go to Supabase Dashboard
2. **If paused**: Restore/resume the project
3. **If active**: Try Supabase CLI method (Method 2)
4. **Last resort**: Manual dashboard backup (Method 1)

## Testing After Restoring Project

Once your project is active:

```bash
# Test connection
./diagnose-connection.sh

# Try backup again
./backup-database.sh
```

## Need Connection String?

Get the correct connection details from Supabase Dashboard:
1. Project Settings → **Database**
2. Look for "**Connection string**" section
3. Use the "**Session pooler**" connection string (port 6543)

Connection format should be:
```
postgresql://postgres:[YOUR-PASSWORD]@db.oqctmbjsepdwgddymgfs.supabase.co:6543/postgres
```

## Still Having Issues?

Check these:
- ✅ Database password is correct in `.env`
- ✅ Project is not paused
- ✅ You're on the correct Supabase plan (free tier has some limitations)
- ✅ Your network allows outgoing connections on ports 5432 and 6543

---

**Quick Test:**
```bash
# Test if project API is responding
curl https://oqctmbjsepdwgddymgfs.supabase.co/rest/v1/

# Should return {"hint":"...","message":"..."} if active
# Should fail/timeout if paused
```
