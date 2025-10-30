# Deploying to Vercel

This guide will help you deploy Castaway Council to Vercel with GitHub integration.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A GitHub repository with your code
3. A Supabase project (or PostgreSQL database)
4. (Optional) Temporal Cloud account for orchestration

## Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/castaway-council.git
git push -u origin main
```

## Step 2: Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Vercel will auto-detect Next.js settings

## Step 3: Configure Environment Variables

In the Vercel project settings, add these environment variables:

### Required

```
DATABASE_URL=postgresql://user:pass@host:port/dbname
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your-jwt-secret-min-32-chars
```

### Push Notifications (Optional)

```
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_SUBJECT=mailto:your@email.com
```

### Temporal (Optional - for production orchestration)

```
TEMPORAL_ADDRESS=temporal.your-domain.com:7233
TEMPORAL_NAMESPACE=default
```

### App Config

```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

## Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at `https://your-project.vercel.app`

## Step 5: Run Database Migrations

After first deployment, you need to run migrations:

```bash
# Option 1: Via Vercel CLI
vercel env pull .env.local
pnpm db:migrate

# Option 2: Direct connection
psql $DATABASE_URL -f sql/rls_policies.sql
```

## Step 6: Seed Database (Optional)

For a prototype/demo:

```bash
# Set up local env
vercel env pull .env.local

# Run seed
pnpm db:seed
```

## Vercel-Specific Considerations

### Serverless Functions

- All API routes run as serverless functions
- Max execution time: 10s (Hobby), 60s (Pro)
- Temporal workflows cannot run on Vercel functions

### Database Connections

- Use connection pooling
- Supabase connection pooling recommended
- Each function uses 1 connection (configured)

### Build Configuration

- Vercel auto-detects Next.js
- No Docker needed
- Builds happen on Vercel's infrastructure

### Environment Variables

- Add via Vercel dashboard or CLI
- Different values for Production/Preview/Development
- Secrets are encrypted

## Temporary Workarounds for Vercel

### Temporal Workflows

Since Temporal can't run on Vercel, options:

1. **Use a separate Temporal Cloud instance**
   - Deploy Temporal worker separately
   - Connect from Vercel via Temporal Cloud

2. **Use Vercel Cron Jobs** (simplified)
   - Create `/api/cron/phase-transition`
   - Schedule with `vercel.json` crons
   - Less durable but simpler

3. **External scheduler** (e.g., GitHub Actions)
   - Run workflows on schedule
   - Call Vercel API to trigger actions

## Monitoring

- Vercel Analytics included
- Function logs in dashboard
- Error tracking (integrate Sentry if needed)

## Updating

After pushing to GitHub:

- Vercel auto-deploys on push to main
- Preview deployments for PRs
- Instant rollbacks available

## Troubleshooting

### Build Failures

- Check build logs in Vercel dashboard
- Verify all dependencies in package.json
- Ensure Node.js version is compatible

### Database Connection Issues

- Verify DATABASE_URL is correct
- Check if DB allows Vercel IP ranges
- Ensure SSL is enabled (Supabase requires)

### Function Timeouts

- Optimize long-running operations
- Consider breaking into smaller functions
- Use edge functions where possible

## Next Steps

1. Set up custom domain
2. Configure preview environments
3. Add monitoring/analytics
4. Set up CI/CD with GitHub Actions
5. Enable Vercel Analytics
