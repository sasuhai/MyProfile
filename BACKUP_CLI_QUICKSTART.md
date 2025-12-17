# 🎯 Quick Start: Supabase CLI Backup Method

## Why Use This Method?

The Supabase CLI method is **recommended** because:
- ✅ Works even when direct database connections are blocked
- ✅ No need to configure database passwords
- ✅ Uses Supabase's secure authentication
- ✅ Simpler setup
- ✅ Official Supabase-supported method

## Setup (5 Minutes)

### Step 1: Install Supabase CLI

```bash
brew install supabase/tap/supabase
```

Verify installation:
```bash
supabase --version
```

### Step 2: Login to Supabase

```bash
supabase login
```

This will open your browser to authenticate with Supabase.

### Step 3: Link Your Project

```bash
supabase link --project-ref oqctmbjsepdwgddymgfs
```

When prompted, enter your database password (same one you tried to add to `.env`).

### Step 4: Test the Backup

```bash
./backup-database-cli.sh
```

You should see:
```
🚀 Starting Supabase database backup (using CLI method)...
✅ Supabase CLI found
📦 Creating backup file: database_backup_20251215_234500.sql
✅ Backup created successfully
✅ Successfully pushed backup to GitHub
🎉 Backup process completed successfully!
```

## Set Up Automated Backups (Cron Job)

Once the manual backup works, set up a cron job:

```bash
# Open crontab
crontab -e

# Add this line for daily backups at 2 AM:
0 2 * * * /Users/sasuhai/Documents/GitHub/MyProfile/backup-database-cli.sh >> /Users/sasuhai/Documents/GitHub/MyProfile/backup/cron.log 2>&1
```

## Comparison: CLI vs pg_dump Methods

| Feature | CLI Method (Recommended) | pg_dump Method |
|---------|-------------------------|----------------|
| Setup | ✅ Simple - just login | ⚠️ Complex - needs password config |
| Connectivity | ✅ Works with Supabase auth | ❌ Often blocked by firewall |
| Security | ✅ OAuth-based | ⚠️ Password in .env |
| Reliability | ✅ Official method | ⚠️ May fail with network issues |
| Speed | ✅ Fast | ✅ Fast |

## Which Script to Use?

**Use `backup-database-cli.sh`** (this method) if:
- Direct database connection fails (most common)
- You want the simplest setup
- You prefer official Supabase tools

**Use `backup-database.sh`** (pg_dump) if:
- You need more control over backup format
- You want to backup from a server without browser access
- Direct database connection works for you

## Common Commands

```bash
# Manual backup
./backup-database-cli.sh

# Check last backup
cat backup/backup_summary.txt

# View logs
tail -f backup/backup.log

# List all backups
ls -lh backup/*.sql
```

## Troubleshooting

### "Supabase CLI not found"
```bash
brew install supabase/tap/supabase
```

### "Not logged in"
```bash
supabase login
```

### "Project not linked"
```bash
supabase link --project-ref oqctmbjsepdwgddymgfs
```

### "Permission denied"
```bash
chmod +x backup-database-cli.sh
```

## Next Steps

1. ✅ Install Supabase CLI
2. ✅ Run `supabase login`
3. ✅ Link project with `supabase link`
4. ✅ Test with `./backup-database-cli.sh`
5. ✅ Set up cron job for automation

---

**Ready to try?** Run:
```bash
./backup-database-cli.sh
```
