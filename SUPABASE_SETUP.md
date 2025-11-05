# Supabase Setup & Configuration

## Recent Changes (Nov 5, 2024)

We've migrated from the deprecated `@supabase/auth-helpers-nextjs` to the modern `@supabase/ssr` package. This fixes authentication issues and follows Supabase's latest best practices.

## Required Environment Variables

You **must** configure these environment variables in Vercel (or `.env.local` for local development):

### Required for Auth

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Required for Database

```bash
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Required for Security

```bash
JWT_SECRET=your-jwt-secret-min-32-chars-long
```

## How to Get These Values

### From Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Project Settings** → **API**

You'll find:
- **URL**: Copy to `NEXT_PUBLIC_SUPABASE_URL`
- **anon/public key**: Copy to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key**: Copy to `SUPABASE_SERVICE_ROLE_KEY`

### For DATABASE_URL

1. Go to **Project Settings** → **Database**
2. Under **Connection string** → **URI**, copy the connection string
3. Replace `[YOUR-PASSWORD]` with your database password

## Configuring in Vercel

### Via Dashboard

1. Go to your Vercel project
2. Click **Settings** → **Environment Variables**
3. Add each variable with:
   - **Key**: Variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: Your actual value
   - **Environment**: Select all (Production, Preview, Development)

### Via CLI

```bash
# Pull existing env vars
vercel env pull .env.local

# Add new variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add DATABASE_URL
vercel env add JWT_SECRET
```

## Email Confirmation Setup

### Update Supabase Email Template

1. Go to **Authentication** → **Email Templates** in Supabase dashboard
2. Select **Confirm signup** template
3. Change the confirmation URL to:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

This routes email confirmations through our new auth confirmation handler.

## Testing Locally

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your actual Supabase values

3. Start the dev server:
   ```bash
   pnpm dev
   ```

4. Test authentication:
   - Sign up at http://localhost:3000/auth/signin
   - Check your email for confirmation link
   - Confirm and sign in

## Architecture Overview

### Client-Side Auth (`app/_lib/supabase/client.ts`)
- Used in React components
- Handles browser-based auth operations
- Auto-refreshes sessions

### Server-Side Auth (`app/_lib/supabase/server.ts`)
- Used in API routes and Server Components
- Properly handles cookies
- Secure session management

### Middleware (`middleware.ts`)
- Intercepts all requests
- Refreshes expired auth tokens
- Prevents premature session termination

## Troubleshooting

### "Invalid API key" errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
- Make sure variables have `NEXT_PUBLIC_` prefix for client-side access

### Email confirmation not working
- Check that email template in Supabase uses the correct confirmation URL format
- Verify `/auth/confirm/route.ts` exists

### Sessions not persisting
- Ensure middleware is running (check `middleware.ts` exists at root)
- Verify cookie settings aren't being blocked

### Build failures
- Run `pnpm install` to ensure all dependencies are installed
- Check that `@supabase/ssr` is in `package.json`, not `@supabase/auth-helpers-nextjs`

## Migration Notes

### What Changed

- ✅ Replaced deprecated `@supabase/auth-helpers-nextjs` with `@supabase/ssr`
- ✅ Updated all auth imports to use new client patterns
- ✅ Added middleware for session refresh
- ✅ Added email confirmation route handler
- ✅ Updated 10+ files across the codebase

### No Breaking Changes For

- Database schema
- RLS policies
- API endpoint behavior
- User experience

The migration is purely internal to how we communicate with Supabase.

## Next Steps

1. ✅ Configure environment variables in Vercel
2. ✅ Update email template in Supabase
3. ✅ Deploy and test authentication
4. ✅ Verify email confirmation flow works
5. ✅ Test sign-out and re-sign-in

## References

- [Supabase SSR Docs](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Migration Guide](https://supabase.com/docs/guides/auth/server-side/migrating-to-ssr-from-auth-helpers)
- [Next.js App Router with Supabase](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
