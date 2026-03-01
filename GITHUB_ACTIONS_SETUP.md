# GitHub Actions + Neon Preview Database Setup Guide

This guide explains how to set up GitHub Actions to automatically create and manage Neon database branches for pull requests.

## What This Workflow Does

The `.github/workflows/neon-preview-branches.yml` workflow:

✅ **On PR Open/Update:**
- Creates an isolated Neon database branch
- Automatically applies Prisma migrations
- Seeds the database with demo data
- Posts connection details to the PR
- Auto-deletes after 14 days of inactivity

✅ **On PR Close:**
- Deletes the preview database branch
- Posts cleanup confirmation

## Setup Instructions

### Step 1: Get Neon Credentials

1. **Get your Neon Project ID:**
   - Go to https://console.neon.tech
   - Select SmartHabit project
   - Copy the Project ID from URL or dashboard
   - Example: `abc123xyz`

2. **Create Neon API Key:**
   - Go to https://console.neon.tech/app/settings/api-keys
   - Click "Create API Key"
   - Select scope: "Editor" or "Admin"
   - Copy the API key (you'll need this next)

### Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"

**Add these two secrets:**

| Secret Name | Value |
|---|---|
| `NEON_API_KEY` | Your Neon API Key from Step 1 |
| `NEON_PROJECT_ID` | Your Neon Project ID from Step 1 |

> ⚠️ Keep these values secret! Never commit them to the repository.

### Step 3: Add Repository Variables

Still in Settings → Secrets and variables → Actions:

Click "New repository variable"

| Variable Name | Value |
|---|---|
| `NEON_PROJECT_ID` | Your Neon Project ID |

> 📌 Variables can be public, but keep your API key in Secrets!

### Step 4: Verify Setup

1. Make sure `.github/workflows/neon-preview-branches.yml` exists in your repository root
2. Go to your repository
3. Click on "Actions" tab
4. You should see "Create/Delete Neon Preview Database Branch" workflow

## Testing the Workflow

### Test by Creating a PR:

1. Create a new branch locally:
   ```bash
   git checkout -b test/github-actions
   echo "# Test PR" >> README.md
   git add README.md
   git commit -m "Test GitHub Actions"
   git push origin test/github-actions
   ```

2. Go to GitHub → Click "Compare & pull request"
3. Create the PR
4. Watch the "Actions" tab for workflow execution
5. Once complete (2-3 minutes), check PR comments for:
   - ✅ Database branch created
   - ✅ Migrations applied
   - ✅ Demo data seeded
   - ✅ Connection details posted

### Check Workflow Status:

- Go to "Actions" tab in GitHub
- Click on the workflow run (e.g., "Create/Delete Neon Preview Database Branch")
- Check each job for logs and status

## Understanding the Workflow

### Triggered Events:
- `opened` - Initial PR creation
- `reopened` - PR reopened after being dismissed
- `synchronize` - PR updated with new commits
- `closed` - PR merged or dismissed

### Automatic Cleanups:
- ✅ Deletes database when PR closes
- ✅ 14-day expiration if PR stays open too long
- ✅ No manual cleanup needed

### Database Features:
- 🔒 Isolated per PR - doesn't affect production
- 🔄 Auto-migrated with latest schema
- 🌱 Pre-seeded with demo accounts:
  - admin321@gmail.com / admin320
  - userbrok@gmail.com / brokuser
- 📊 Full data for testing

## Using Preview Database Locally

### Option 1: Test Locally with Preview DB

```bash
# Get the DATABASE_URL from PR comment
export DATABASE_URL="postgres://...preview/pr-123..."

# Run local dev server with preview DB
npm run dev
```

### Option 2: Pull Connection String to .env.local

PR comment will include the full connection string:

```env
DATABASE_URL=postgresql://...
```

Copy to `.env.local` (add to `.gitignore` if not already):

```bash
# .env.local (never commit this)
DATABASE_URL=postgresql://neondb_owner:...@...preview/pr-123...
```

## Troubleshooting

### Workflow shows "failed"

**Check the logs:**
1. Go to Actions tab
2. Click the failed run
3. Click "Create Neon Preview Branch" job
4. Look for red error messages

**Common issues:**
- ❌ Wrong API key or Project ID → Re-check Step 1-3
- ❌ Permissions error → Check Neon API key scope (needs Editor+)
- ❌ Node.js cache issue → Manually clear by re-running:
  ```bash
  # In Actions tab, click "Re-run all jobs"
  ```

### Preview branch not being deleted

- Check if `NEON_API_KEY` has sufficient permissions
- Verify Project ID is still correct
- Check GitHub Actions permissions → "Allow write to repository"

### Database not seeded properly

1. Check seed file exists: `prisma/seed.ts`
2. Verify it runs without errors:
   ```bash
   npm run seed
   ```
3. Add to `package.json` if missing:
   ```json
   "prisma": {
     "seed": "node prisma/seed.ts"
   }
   ```

## Workflow File Location

The workflow should be at:
```
SmartHabit/
└── .github/
    └── workflows/
        └── neon-preview-branches.yml
```

## Next Steps

1. ✅ Complete all setup steps above
2. ✅ Test by creating a PR
3. ✅ Review PR comments for connection details
4. ✅ Merge the PR when ready
5. ✅ Watch database auto-delete on closure

## Advanced: Customizing the Workflow

### Change database expiration (currently 14 days):

Edit `.github/workflows/neon-preview-branches.yml`:

```yaml
- name: Get branch expiration date (14 days from now)
  id: get_expiration_date
  run: echo "EXPIRES_AT=$(date -u --date '+14 days' +'%Y-%m-%dT%H:%M:%SZ')" >> "$GITHUB_ENV"
```

Change `'+14 days'` to desired duration (e.g., `'+7 days'`)

### Disable auto-seeding:

Remove or comment out this section:

```yaml
- name: Seed database with demo data
  run: npx prisma db seed
  env:
    DATABASE_URL: "${{ steps.create_neon_branch.outputs.db_url_with_pooler }}"
```

### Add custom notification:

Modify the "Comment PR" sections to add your own messages.

## Support

If you encounter issues:

1. Check GitHub Actions documentation: https://docs.github.com/actions
2. Check Neon documentation: https://neon.tech/docs
3. Review workflow logs for specific error messages
4. Verify all secrets and variables are correctly set

---

**Status:** ✅ Workflow file created and ready to use  
**Last Updated:** $(date)  
**Repository:** SmartHabit
