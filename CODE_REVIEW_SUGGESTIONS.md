# Code Review Suggestions

Generated on: $(date)

## 🔴 Critical Issues

### 1. Rate Limiting - In-Memory Store Won't Work in Serverless

**Location**: `app/_server/middleware/rateLimit.ts`

**Issue**: The rate limiting uses an in-memory store that won't persist across serverless function invocations (Vercel). Each request might hit a different instance.

**Recommendation**:
- Use Redis (e.g., Upstash Redis on Vercel) or Supabase Edge Functions for distributed rate limiting
- Consider using `@upstash/ratelimit` or similar library
- Add IP-based fallback for anonymous users

**Code Fix**:
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "30 s"),
});
```

### 2. Missing .gitignore for Environment Files

**Issue**: No `.gitignore` found. Environment variables could be accidentally committed.

**Recommendation**: Create `.gitignore` with:
```
.env
.env.local
.env*.local
node_modules/
.next/
.vercel/
dist/
*.log
.DS_Store
```

### 3. Missing .env.example

**Issue**: No template for required environment variables.

**Recommendation**: Create `.env.example` documenting all required variables:
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `TEMPORAL_ADDRESS`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `CRON_SECRET`

### 4. Error Handling - Information Leakage

**Location**: Multiple API routes

**Issue**: Generic error messages don't help debugging, and some catch blocks mask all errors as "Unauthorized".

**Example**: `app/api/task/forage/route.ts` line 36-38
```typescript
} catch (error) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

**Recommendation**:
- Create a centralized error handler
- Log errors server-side
- Return appropriate status codes (400 for validation, 500 for server errors)
- Don't leak implementation details in client responses

**Suggested Pattern**:
```typescript
// app/_server/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
  }
}

// In routes:
} catch (error) {
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  console.error("Unexpected error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
```

## 🟡 High Priority

### 5. Incomplete Implementation - Many TODOs

**Issue**: Many critical functions have TODO comments indicating incomplete implementation:
- Rate limiting user extraction
- Phase validation in vote/challenge endpoints
- Database writes (stats, messages, votes, etc.)
- Supabase Realtime integration
- Temporal workflow initialization

**Recommendation**:
- Prioritize completing authentication context extraction
- Implement missing database operations
- Complete Supabase Realtime integration
- Finish Temporal workflow setup

**Specific TODOs to Address First**:
1. `app/_server/middleware/rateLimit.ts:45` - Extract user ID from session
2. `app/api/messages/route.ts:15-16` - Validate channel access and create message
3. `app/_components/Chat.tsx:26` - Connect to Supabase Realtime
4. `app/api/vote/route.ts:12` - Implement vote validation and creation
5. `app/_server/temporal/client.ts:30` - Import and start workflow

### 6. Database Connection - Potential Pool Exhaustion

**Location**: `app/_server/db/client.ts`

**Issue**: `max: 1` connection might be too restrictive, and connection isn't properly closed on serverless.

**Recommendation**:
```typescript
const client = postgres(connectionString, {
  max: 10, // Increase for better concurrency
  idle_timeout: 20,
  connect_timeout: 10,
  // Add cleanup for serverless
  onnotice: () => {}, // Suppress notices
});
```

### 7. Console.log Statements in Production Code

**Location**: Multiple files (43 instances found)

**Issue**: `console.log`, `console.error`, `console.warn` should be replaced with proper logging.

**Recommendation**:
- Use a logging library (e.g., `pino`, `winston`)
- Create environment-based log levels
- Replace all console statements
- Keep console statements only in scripts, not runtime code

**Example**:
```typescript
// app/_server/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});
```

### 8. Missing Type Safety - Record<string, unknown>

**Location**: `app/(season)/log/page.tsx:9`

**Issue**: Using `unknown` instead of specific types.

**Recommendation**: Create proper TypeScript interfaces for event payloads based on `eventKindEnum`.

### 9. Rate Limiting Missing Session Extraction

**Location**: `app/_server/middleware/rateLimit.ts:45`

**Issue**: Uses `x-user-id` header which can be spoofed.

**Recommendation**: Extract user ID from Supabase session:
```typescript
import { getServerSession } from "@/server/auth";

export async function rateLimitMiddleware(request: NextRequest) {
  const session = await getServerSession();
  const userId = session?.user.id || request.ip || "anonymous";
  // ...
}
```

## 🟢 Medium Priority

### 10. Missing Input Validation on Some Routes

**Issue**: Some routes parse body but don't validate all required fields or check phase status.

**Recommendation**:
- Add Zod validation middleware
- Validate phase state before allowing actions
- Add request size limits

### 11. Error Messages Too Generic

**Location**: All API routes

**Issue**: Most routes return "Invalid request" for any error.

**Recommendation**: 
- Use Zod error formatting
- Provide specific validation messages
- Include field-level errors

### 12. Missing Transaction Support

**Issue**: Related database operations aren't wrapped in transactions.

**Example**: Vote + idol play should be atomic.

**Recommendation**: Use Drizzle transactions:
```typescript
await db.transaction(async (tx) => {
  await tx.insert(votes).values(...);
  await tx.update(items).set({ charges: sql`${items.charges} - 1` });
});
```

### 13. Missing Indexes on Composite Queries

**Location**: `app/_server/db/schema.ts`

**Issue**: Some queries might need composite indexes not defined.

**Recommendation**: Review query patterns and add indexes for:
- `(seasonId, day, phase)` - phase status queries
- `(playerId, seasonId)` - player lookup in season context

### 14. CORS Configuration Missing

**Issue**: No explicit CORS configuration for API routes.

**Recommendation**: Add CORS middleware if frontend is on different domain:
```typescript
// next.config.js
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGIN || '*' },
        // ...
      ],
    },
  ];
}
```

### 15. Missing Health Check Endpoint

**Issue**: No `/api/health` endpoint for monitoring.

**Recommendation**: Add health check:
```typescript
// app/api/health/route.ts
export async function GET() {
  // Check DB connection, Temporal availability, etc.
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
```

### 16. Potential SQL Injection in Comments

**Location**: `app/api/task/forage/route.ts:33`

**Issue**: Commented code uses template literal SQL which could be vulnerable.

**Recommendation**: Use Drizzle's query builder properly (not raw SQL).

### 17. Missing Request Timeout

**Issue**: Long-running requests could hang.

**Recommendation**: Add timeout middleware or use Next.js timeout configuration.

### 18. Session Handling Could Be Improved

**Location**: `app/_server/auth.ts`

**Issue**: `requireAuth()` throws Error instead of HTTPError.

**Recommendation**: Throw HTTP-specific error that can be caught properly:
```typescript
export class UnauthorizedError extends Error {
  statusCode = 401;
}
```

## 🟦 Low Priority / Nice to Have

### 19. TypeScript Strict Mode Enhancements

**Issue**: Some areas use `any` implicitly (ESLint warns but doesn't enforce).

**Recommendation**: 
- Enable `strict: true` in tsconfig (already enabled)
- Add `noImplicitAny: true` explicitly
- Fix remaining type issues

### 20. Missing JSDoc/Comments

**Issue**: Some complex functions lack documentation.

**Recommendation**: Add JSDoc to:
- Game logic functions
- Workflow activities
- Complex database queries

### 21. Test Coverage Gaps

**Issue**: Many TODO comments in test files, limited test coverage.

**Recommendation**:
- Complete RLS policy tests
- Add integration tests for API routes
- Add E2E tests for critical flows

### 22. Missing Request ID for Tracing

**Issue**: No correlation IDs for request tracking.

**Recommendation**: Add request ID middleware:
```typescript
const requestId = crypto.randomUUID();
response.headers.set('X-Request-ID', requestId);
```

### 23. Missing Rate Limit Headers in Some Routes

**Issue**: Only message route returns rate limit headers.

**Recommendation**: Standardize rate limit headers across all protected routes.

### 24. PWA Manifest Could Be Enhanced

**Issue**: Basic manifest exists but could include more metadata.

**Recommendation**: Add:
- Icons (multiple sizes)
- Categories
- Screenshots
- Related applications

### 25. Missing Database Migration Strategy

**Issue**: Drizzle config exists but migration strategy not documented.

**Recommendation**: Document migration workflow:
- Development: `pnpm db:push`
- Production: `pnpm db:generate` → review → `pnpm db:migrate`

### 26. Missing API Versioning

**Issue**: No version prefix for API routes (`/api/v1/...`).

**Recommendation**: Add versioning early if API will evolve:
```
/api/v1/messages
/api/v2/messages
```

### 27. Missing Input Sanitization

**Issue**: Message body stored as-is without sanitization.

**Recommendation**: 
- Sanitize HTML if allowing markdown
- Consider using DOMPurify or similar
- Validate string length (already done via Zod)

### 28. Missing Pagination

**Issue**: No pagination for messages, events, etc.

**Recommendation**: Add cursor-based pagination:
```typescript
// Query parameter: ?cursor=uuid&limit=50
```

### 29. Missing Soft Deletes

**Issue**: Tables use hard deletes (cascade).

**Recommendation**: Consider soft deletes for audit trail:
```typescript
deletedAt: timestamp("deleted_at")
```

### 30. Missing Database Constraints

**Issue**: Some business rules not enforced at DB level.

**Recommendation**: Add check constraints:
- Stats values 0-100
- Vote: voter can't vote for themselves
- Challenge: one commit per player per challenge

## 📊 Summary Statistics

- **Total Files Analyzed**: ~50+
- **Critical Issues**: 4
- **High Priority**: 5
- **Medium Priority**: 10
- **Low Priority**: 11
- **TODOs Found**: 59
- **Console Statements**: 43
- **Missing Implementations**: ~15 major features

## 🎯 Recommended Action Plan

### Phase 1 (Week 1) - Critical Fixes
1. Add `.gitignore` and `.env.example`
2. Fix rate limiting (use Redis)
3. Improve error handling
4. Extract user ID from session in rate limiter

### Phase 2 (Week 2) - Core Completion
5. Complete database operations in API routes
6. Implement Supabase Realtime in Chat component
7. Complete Temporal workflow initialization
8. Add proper logging infrastructure

### Phase 3 (Week 3) - Quality Improvements
9. Add comprehensive error handling
10. Implement transaction support
11. Add health checks
12. Replace console statements

### Phase 4 (Ongoing) - Enhancements
13. Add tests for critical paths
14. Improve type safety
15. Add monitoring/logging
16. Complete remaining TODOs

---

**Note**: This is a comprehensive review. Prioritize based on your immediate needs and deployment timeline.
