# Castaway Council Setup Guide

## Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL client (optional, for direct DB access)

## Initial Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Generate VAPID Keys

```bash
node -e "const webpush = require('web-push'); console.log(JSON.stringify(webpush.generateVAPIDKeys(), null, 2))"
```

Copy the output to your `.env` file.

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:
- Database URLs
- Supabase keys (if using Supabase cloud, or leave as local)
- VAPID keys from step 2
- Temporal address

### 4. Start Infrastructure

```bash
docker compose -f infra/docker-compose.yml up -d
```

Wait for services to be healthy (check with `docker ps`).

### 5. Run Migrations

```bash
pnpm db:generate  # Generate migration files
pnpm db:migrate   # Apply migrations
```

### 6. Apply RLS Policies

```bash
psql -h localhost -U postgres -d castaway -f sql/rls_policies.sql
```

Or if using Supabase:

```bash
psql -h localhost -p 54321 -U postgres -f sql/rls_policies.sql
```

### 7. Seed Database

```bash
pnpm db:seed
```

This creates:
- 18 users
- 1 active season
- 3 tribes (6 players each)
- Initial stats for all players

### 8. Start Development Servers

**Terminal 1 - Next.js:**
```bash
pnpm dev
```

**Terminal 2 - Temporal Worker:**
```bash
pnpm temporal:dev
```

The app should be available at http://localhost:3000

## Running Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:coverage
```

## Fast-Forward Season (Development)

To simulate a full season quickly:

```bash
pnpm fast-forward <season-id>
```

Or create a season and run:

```bash
# Set in .env
FAST_FORWARD_ENABLED=true

# Start workflow via Temporal client
```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running: `docker ps | grep postgres`
- Check DATABASE_URL in `.env`
- Verify credentials match docker-compose.yml

### Temporal Issues

- Check Temporal server: http://localhost:8088
- Verify TEMPORAL_ADDRESS in `.env`
- Check worker logs for connection errors

### Supabase RLS Errors

- Ensure RLS policies are applied
- Check `auth.uid()` function exists
- Verify user sessions are authenticated

### Port Conflicts

- Change ports in `docker-compose.yml` if 3000, 5432, 7233, or 8088 are in use

## Production Deployment

1. Build Docker image:
```bash
docker build -f infra/Dockerfile.web -t castaway-web .
```

2. Set production environment variables

3. Run migrations on production DB

4. Deploy Temporal worker separately

5. Configure reverse proxy (nginx/traefik) for HTTPS

## Next Steps

- Configure Supabase Auth providers (email, OAuth)
- Set up monitoring (Prometheus, Grafana)
- Configure CI/CD pipeline secrets
- Add production logging (e.g., DataDog, Sentry)
