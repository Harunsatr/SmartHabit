# 🚀 Deploying SmartHabit to Vercel

This guide will help you deploy SmartHabit to Vercel with a PostgreSQL database.

## Prerequisites

1. A Vercel account (https://vercel.com)
2. A PostgreSQL database (use one of these):
   - **Vercel Postgres** (Recommended - easiest integration)
   - **Neon** (https://neon.tech) - Free tier available
   - **Supabase** (https://supabase.com) - Free tier available
   - **Railway** (https://railway.app) - Generous free tier

## Step 1: Setup Database

### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel dashboard
2. Go to the "Storage" tab
3. Click "Create Database" → "Postgres"
4. Follow the wizard to create your database
5. Copy the `DATABASE_URL` connection string

### Option B: Neon (Free PostgreSQL)

1. Go to https://neon.tech and create a free account
2. Create a new project
3. Copy the connection string (starts with `postgresql://`)
4. Make sure to use the "Pooled connection" string for serverless

### Option C: Supabase

1. Go to https://supabase.com and create a project
2. Go to Project Settings → Database
3. Copy the "Connection string" (Transaction mode for Vercel)
4. Copy the "Connection pooling" string (Session mode for local)

## Step 2: Prepare Your Repository

1. Make sure your code is pushed to GitHub, GitLab, or Bitbucket:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - SmartHabit app"
   git remote add origin YOUR_REPOSITORY_URL
   git push -u origin main
   ```

2. Make sure `.env` is in `.gitignore` (it already is!)

## Step 3: Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your repository
3. Configure the project:
   - **Framework Preset**: Next.js
   - **Build Command**: `prisma generate && next build`
   - **Install Command**: `npm install`

4. Add Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32` or use a random 32+ character string
   - `NEXTAUTH_URL`: Your Vercel app URL (e.g., `https://your-app.vercel.app`)
   - `OPENAI_API_KEY`: (Optional) Your OpenAI API key for AI insights

5. Click "Deploy"

## Step 4: Run Database Migrations

After your first deployment, you need to initialize the database:

### Method 1: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Link your project:
   ```bash
   vercel link
   ```

3. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

4. Run database migrations:
   ```bash
   npx prisma db push
   ```

5. Seed the database with demo accounts:
   ```bash
   npx prisma db seed
   ```

### Method 2: Using Local PostgreSQL Client

If you have PostgreSQL tools installed, connect to your production database and run:

```sql
-- Apply the schema (or use Prisma Studio)
```

Or use Prisma Studio:
```bash
npx prisma studio
```

Then manually create the admin and user accounts.

## Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Try logging in with the demo accounts:
   - **Admin**: `admin321@gmail.com` / `admin320`
   - **User**: `userbrok@gmail.com` / `brokuser`

## Demo Accounts

After seeding, these accounts will be available:

### Admin Account
- **Email**: `admin321@gmail.com`
- **Password**: `admin320`
- **Access**: Full admin panel access

### User Account
- **Email**: `userbrok@gmail.com`
- **Password**: `brokuser`
- **Access**: Regular user features

## Troubleshooting

### Build Fails

1. **Prisma Error**: Make sure `DATABASE_URL` is set in Vercel environment variables
2. **Module Not Found**: Clear build cache in Vercel project settings
3. **Timeout**: Increase function timeout in `vercel.json`

### Database Connection Errors

1. **Connection Pooling**: For serverless, use connection pooling URL (not direct connection)
2. **SSL Required**: Add `?sslmode=require` to your DATABASE_URL if needed
3. **IP Whitelist**: Make sure Vercel IPs are allowed (most managed databases allow all by default)

### Runtime Errors

1. **NEXTAUTH_URL**: Must be your actual domain (no localhost in production)
2. **NEXTAUTH_SECRET**: Must be at least 32 characters
3. **Database Not Initialized**: Run `prisma db push` and `prisma db seed`

## Updating Your Deployment

1. Push changes to your repository:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

2. Vercel will automatically deploy the new version

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Random 32+ character secret |
| `NEXTAUTH_URL` | Yes | Your app's URL |
| `OPENAI_API_KEY` | No | For AI insights feature |

## Performance Optimization

1. **Enable Edge Functions**: Update `middleware.ts` to use edge runtime
2. **Connection Pooling**: Use Prisma Data Proxy or PgBouncer
3. **Caching**: Configure CDN caching in Vercel settings
4. **Image Optimization**: Next.js handles this automatically

## Security Checklist

- [ ] Changed `NEXTAUTH_SECRET` to a secure random value
- [ ] Updated default admin password after first login
- [ ] Enabled 2FA for your database provider
- [ ] Configured CORS if using external APIs
- [ ] Set up monitoring and error tracking

## Next Steps

1. Change the default admin password
2. Set up custom domain in Vercel
3. Configure email provider for password reset (future feature)
4. Set up monitoring with Vercel Analytics
5. Enable Vercel Web Analytics

## Support

If you encounter issues:
- Check Vercel deployment logs
- Check database connection strings
- Verify all environment variables are set
- Check Prisma client generation logs

---

**Happy Deploying! 🎉**
