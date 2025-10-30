# Castaway Council

A real-time, slow-burn social survival RPG built as a PWA.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (PWA)                        │
│              Next.js App Router + React                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   Tribe  │ │   DMs    │ │ Challenge│ │   Vote   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP/WebSocket
┌──────────────────▼──────────────────────────────────────────┐
│              Next.js Route Handlers                          │
│         Auth, Validation, Business Logic                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
┌───────▼───┐ ┌───▼─────┐ ┌──▼──────────┐
│  Supabase │ │ Temporal│ │  Game Logic │
│  Postgres │ │Workflows│ │  (RNG/Score)│
│  RLS      │ │         │ │             │
│  Realtime │ │         │ │             │
└───────────┘ └─────────┘ └─────────────┘
```

## Core Loop

1. **Camp Tasks** (8h) - Forage, water, rest, help allies
2. **Challenge** (8h) - Commit seeds, then reveal & score
3. **Tribal Vote** (6h) - Eliminate one player
4. **Repeat** until day 10
5. **Merge** at day 10
6. **Final 3** → Jury vote

## Quick Start

### Option 1: Deploy to Vercel (Recommended for Prototype)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/castaway-council.git
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Add environment variables (see `VERCEL_DEPLOY.md`)

3. **Deploy!** Vercel will automatically build and deploy.

See [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) for detailed Vercel setup.

### Option 2: Local Development

```bash
# Install dependencies
pnpm install

# Generate VAPID keys
node -e "const webpush = require('web-push'); console.log(webpush.generateVAPIDKeys())"

# Copy environment
cp .env.example .env
# Edit .env with your keys

# Start infrastructure
docker compose -f infra/docker-compose.yml up -d

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Start dev server
pnpm dev
```

## Development

- **Fast-forward mode**: Set `FAST_FORWARD_ENABLED=true` to use minutes instead of hours
- **Temporal UI**: http://localhost:8088
- **Database Studio**: `pnpm db:studio`

### Known Limitations

- **Rate Limiting**: Currently uses in-memory store (works for single instance). For production serverless deployment, migrate to Redis/Upstash for shared state across instances.

## Testing

```bash
pnpm test          # Unit tests
pnpm test:e2e      # E2E tests
pnpm fast-forward  # Simulate full season
```

## Project Structure

```
/app
  /api/*              # Route handlers
  /(season)/*         # Client routes
  /_components/*     # UI components
  /_lib/*            # Shared client lib
  /_server/*         # Server-only helpers

/infra
  docker-compose.yml
  Dockerfile.web
  temporal.worker.ts

/packages
  /game-logic         # RNG, scoring, types
  /schemas            # Zod schemas

/prisma               # (Using Drizzle instead)

/scripts
  seed.ts
  fast-forward-season.ts
```

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, PWA
- **Backend**: Next.js Route Handlers
- **Database**: PostgreSQL via Supabase
- **Realtime**: Supabase Realtime
- **Orchestration**: Temporal Workflows
- **Auth**: Supabase Auth
- **Push**: Web Push API (VAPID)
- **Type Safety**: TypeScript strict + Zod
