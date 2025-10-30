# Project Memory & Decisions

This document tracks architectural decisions and important context for Castaway Council.

## Architecture Decisions

### Database Choice: Drizzle ORM
- **Decision**: Using Drizzle instead of Prisma
- **Reason**: Better TypeScript support, lighter weight, works well with Supabase RLS
- **Impact**: All DB queries use Drizzle query builder

### Rate Limiting: In-Memory → Redis Migration
- **Current**: In-memory store (works for single instance)
- **Future**: Migrate to Redis/Upstash for serverless
- **Note**: Documented limitation, not blocking for initial launch

### Authentication: Supabase Auth
- **Pattern**: Session-based via HTTP-only cookies
- **Helper**: `getCurrentPlayer(seasonId)` maps session → player record
- **RLS**: Policies enforce access control at DB level

### Realtime: Supabase Realtime
- **Channels**: Structured naming for season/tribe/DM channels
- **Presence**: Show online status on tribe channels
- **Fallback**: Client polls if WebSocket fails

### RNG: Commit-Reveal Protocol
- **Method**: HMAC-SHA256 with server/client seeds
- **Verification**: All results reproducible from published seeds
- **Implementation**: `@game-logic` package handles all RNG

## Key Patterns

### Phase Management
- Phases are stored as events in `events` table
- Temporal workflows manage phase transitions
- Cron endpoint checks phase status every 5 minutes

### Vote Privacy
- Votes private until `revealed_at` timestamp set
- RLS policies enforce privacy
- Idols can be played during vote phase

### Challenge Scoring
- Players commit seed hashes during commit phase
- Server generates seed after commit phase closes
- Results calculated deterministically from seeds

## Known Limitations

1. **Rate Limiting**: In-memory store doesn't work across serverless instances
2. **Session Management**: No explicit session timeout (relies on Supabase)
3. **Error Tracking**: No Sentry/integration yet (placeholder in code)

## Future Improvements

- Redis migration for rate limiting
- Comprehensive error tracking (Sentry)
- Admin dashboard for season management
- Mobile app (React Native wrapper)
