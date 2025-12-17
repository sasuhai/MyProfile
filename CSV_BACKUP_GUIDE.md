# 📊 CSV Database Backup Guide (Free Tier)

Since the Supabase Free plan doesn't include backups, here's how to manually export your data.

## 🎯 Quick Process (10-15 minutes)

### Step 1: Go to Table Editor

Open: **https://supabase.com/dashboard/project/oqctmbjsepdwgddymgfs/editor**

### Step 2: Export Each Table

For each table in your database:

1. **Click on the table name** (e.g., `profile_info`, `skills`, `education`, etc.)
2. **Click the "•••" menu** (three dots in the top right)
3. **Select "Download as CSV"**
4. Save to your Downloads folder

**Tables to export:**
- `profile_info`
- `skills`
- `education`
- `work_experience`
- `certifications`
- `projects`
- `messages`
- `access_requests` (if exists)
- `custom_sections` (if exists)
- Any other tables you've created

### Step 3: Organize and Commit

Once all CSV files are downloaded:

```bash
# Run the import helper
./import-csv-backup.sh
```

The script will:
1. Create a timestamped backup folder
2. Wait for you to move CSV files there
3. Create a README documenting the backup
4. Commit everything to git
5. Offer to push to GitHub

## 🔄 Recommended Schedule

**Monthly Backups:**
- First Sunday of each month
- Set a calendar reminder
- Takes 10-15 minutes
- Better than nothing!

## ⚠️ Limitations

**CSV exports include:**
- ✅ All table data
- ✅ Easy to restore

**CSV exports DON'T include:**
- ❌ Database schema (table structure)
- ❌ Indexes
- ❌ Foreign key relationships
- ❌ Functions and triggers
- ❌ Row-level security policies

**Why this matters:**
- If you lose your database, you'll need to:
  1. Recreate schema (use `DATABASE_SETUP_MULTIUSER.sql`)
  2. Then import CSV data

## 📋 Full Backup Checklist

- [ ] Export all tables as CSV
- [ ] Move CSV files to backup folder
- [ ] Run `./import-csv-backup.sh`
- [ ] Commit and push to GitHub
- [ ] Verify files are in GitHub repository

## 💡 Alternative: Schema Backup

To backup your schema separately (do this once):

### Option 1: Using Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/oqctmbjsepdwgddymgfs/sql
2. Create and run this query:

```sql
SELECT 
    'CREATE TABLE ' || table_name || ' (' ||
    string_agg(
        column_name || ' ' || data_type ||
        CASE 
            WHEN character_maximum_length IS NOT NULL 
            THEN '(' || character_maximum_length || ')' 
            ELSE '' 
        END,
        ', '
    ) || ');'
FROM information_schema.columns
WHERE table_schema = 'public'
GROUP BY table_name;
```

3. Copy the results and save as `backup/schema_backup.sql`

### Option 2: Manual Documentation

Your schema is already documented in:
- `DATABASE_SETUP_MULTIUSER.sql` ✅

Keep this file updated when you make schema changes.

## 🚀 Upgrade Path

When you're ready for real automated backups:

**Supabase Pro ($25/month):**
- ✅ Automated daily backups (7-day retention)
- ✅ Point-in-time recovery
- ✅ All the automated scripts will work
- ✅ Direct database access

Then switch to using:
```bash
# Set up once
crontab -e
# Add: 0 2 * * * /path/to/backup-database-simple.sh >> /path/to/backup/cron.log 2>&1

# Automated daily backups forever!
```

## 📞 Need Help?

If you get stuck:
1. Check that you're exporting from the correct project
2. Make sure CSVs are in the right folder
3. Check `backup/csv_backup_summary.txt` for details

---

**Ready to start?** 

1. Open: https://supabase.com/dashboard/project/oqctmbjsepdwgddymgfs/editor
2. Export your tables
3. Run: `./import-csv-backup.sh`

Let's protect your data! 🛡️
