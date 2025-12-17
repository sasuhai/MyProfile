# Database Backup Automation Guide

This guide explains how to set up automated database backups for your MyProfile application.

## Overview

The backup system automatically:
- ✅ Backs up your Supabase PostgreSQL database
- ✅ Stores backups in the `/backup` folder
- ✅ Maintains the last 7 backups (to save space)
- ✅ Commits and pushes backups to GitHub
- ✅ Creates detailed logs of each backup operation
- ✅ Can run manually or via cron job

## Prerequisites

### 1. Install PostgreSQL Client Tools

The backup script uses `pg_dump` which comes with PostgreSQL client tools.

**On macOS:**
```bash
brew install postgresql
```

**On Ubuntu/Debian:**
```bash
sudo apt-get install postgresql-client
```

**Verify installation:**
```bash
pg_dump --version
```

### 2. Get Your Supabase Database Password

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** > **Database**
3. Scroll down to **Connection string**
4. Click **URI** tab
5. Copy the password from the connection string: `postgres://postgres:[YOUR-PASSWORD]@db...`

## Setup Instructions

### Step 1: Configure Environment Variables

Add your Supabase database password to your `.env` file:

```bash
# Add this line to your .env file
SUPABASE_DB_PASSWORD=your_actual_database_password
```

**⚠️ IMPORTANT:** Never commit the `.env` file to git! It should already be in `.gitignore`.

### Step 2: Test the Backup Script

Run the backup script manually to ensure it works:

```bash
./backup-database.sh
```

You should see output like:
```
[2025-12-15 23:32:29] Starting database backup...
[2025-12-15 23:32:29] Project: your-project-ref
[2025-12-15 23:32:29] Database Host: db.your-project-ref.supabase.co
[2025-12-15 23:32:30] Creating backup file: database_backup_20251215_233230.sql
[2025-12-15 23:32:35] Backup created successfully
[2025-12-15 23:32:35] Backup size: 245K
[2025-12-15 23:32:35] Successfully pushed backup to GitHub
```

### Step 3: Set Up Cron Job

To run backups automatically, set up a cron job.

#### Open crontab editor:
```bash
crontab -e
```

#### Add one of these cron job schedules:

**Daily backup at 2:00 AM:**
```bash
0 2 * * * /Users/sasuhai/Documents/GitHub/MyProfile/backup-database.sh >> /Users/sasuhai/Documents/GitHub/MyProfile/backup/cron.log 2>&1
```

**Every 12 hours (2:00 AM and 2:00 PM):**
```bash
0 2,14 * * * /Users/sasuhai/Documents/GitHub/MyProfile/backup-database.sh >> /Users/sasuhai/Documents/GitHub/MyProfile/backup/cron.log 2>&1
```

**Every 6 hours:**
```bash
0 */6 * * * /Users/sasuhai/Documents/GitHub/MyProfile/backup-database.sh >> /Users/sasuhai/Documents/GitHub/MyProfile/backup/cron.log 2>&1
```

**Weekly on Sunday at 3:00 AM:**
```bash
0 3 * * 0 /Users/sasuhai/Documents/GitHub/MyProfile/backup-database.sh >> /Users/sasuhai/Documents/GitHub/MyProfile/backup/cron.log 2>&1
```

#### Understanding Cron Syntax:
```
* * * * * command
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, Sunday = 0 or 7)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

#### Save and exit:
- In vim: Press `ESC`, then type `:wq` and press `ENTER`
- In nano: Press `CTRL+X`, then `Y`, then `ENTER`

#### Verify cron job is set:
```bash
crontab -l
```

## File Structure

After running the backup, you'll see:

```
MyProfile/
├── backup/
│   ├── database_backup_20251215_233230.sql  # Timestamped backup
│   ├── database_backup_20251214_020000.sql  # Previous backups
│   ├── database_backup_latest.sql           # Always the most recent backup
│   ├── backup.log                          # Detailed backup logs
│   ├── backup_summary.txt                  # Last backup summary
│   └── cron.log                            # Cron job execution log (if using cron)
└── backup-database.sh                       # Backup script
```

## Monitoring Backups

### Check Last Backup Status:
```bash
cat backup/backup_summary.txt
```

### View Backup Logs:
```bash
tail -f backup/backup.log
```

### View Cron Job Logs:
```bash
tail -f backup/cron.log
```

### List All Backups:
```bash
ls -lh backup/*.sql
```

## Restoring from Backup

If you need to restore your database from a backup:

### 1. Using the latest backup:
```bash
psql -h db.YOUR-PROJECT-REF.supabase.co \
     -p 5432 \
     -U postgres \
     -d postgres \
     -f backup/database_backup_latest.sql
```

### 2. Using a specific backup:
```bash
psql -h db.YOUR-PROJECT-REF.supabase.co \
     -p 5432 \
     -U postgres \
     -d postgres \
     -f backup/database_backup_20251215_233230.sql
```

You'll be prompted for your database password.

## Troubleshooting

### Error: "pg_dump not found"
Install PostgreSQL client tools (see Prerequisites section above).

### Error: "SUPABASE_DB_PASSWORD not found"
Add your database password to the `.env` file (see Step 1).

### Error: "Failed to push to GitHub"
1. Check your git credentials: `git config --list`
2. Ensure you have push access to the repository
3. Try pushing manually: `git push origin main`

### Cron job not running?
1. Check if cron service is running: `ps aux | grep cron`
2. Check cron logs: `tail -f backup/cron.log`
3. Verify cron syntax: `crontab -l`
4. Make sure the script has execute permissions: `chmod +x backup-database.sh`

### Backups taking too much space?
The script automatically keeps only the last 7 backups. To change this, edit line 134 in `backup-database.sh`:
```bash
ls -t database_backup_*.sql | grep -v "latest" | tail -n +8 | xargs -r rm -f
```
Change `+8` to `+N+1` where N is the number of backups you want to keep.

## Security Notes

- ✅ `.env` file is gitignored (contains database password)
- ✅ Backup files are committed to git (they don't contain sensitive data beyond your app data)
- ✅ Database password is never stored in git
- ⚠️ If your backup repository is public, consider making it private or excluding backups

## Advanced Configuration

### GitHub Authentication

If you're running this on a server or want to automate GitHub pushes without manual authentication:

#### Using SSH:
```bash
git remote set-url origin git@github.com:sasuhai/MyProfile.git
```

#### Using Personal Access Token:
```bash
git remote set-url origin https://YOUR_TOKEN@github.com/sasuhai/MyProfile.git
```

### Email Notifications

To receive email notifications when backups complete, add this to the end of `backup-database.sh`:

```bash
# Send email notification
echo "Backup completed at $(date)" | mail -s "Database Backup Success" your-email@example.com
```

## Support

For issues or questions:
1. Check the logs: `cat backup/backup.log`
2. Test manually: `./backup-database.sh`
3. Verify database connection: Check Supabase dashboard for connection details

---

**Created:** 2025-12-15
**Last Updated:** 2025-12-15
