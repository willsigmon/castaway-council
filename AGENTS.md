# AI Agent Workflow Guide

This document provides context for AI assistants working on Castaway Council.

## Project Overview

Castaway Council is a real-time, slow-burn social survival RPG built as a PWA. Players compete in seasons with daily phases: camp tasks, challenges, and tribal council votes.

## Architecture Patterns

### API Route Pattern
All API routes follow this structure:
1. Authenticate via `requireAuth()` or `getCurrentPlayer(seasonId)`
2. Validate input with Zod schemas from `@schemas`
3. Check phase/state before allowing action
4. Perform DB operation with proper error handling
5. Return standardized JSON response

### Database Access
- Use `db` from `@/server/db/client`
- Always import schema types from `@/server/db/schema`
- Respect RLS policies (they're enforced at DB level)
- Use transactions for multi-step operations

### Error Handling
- Use `ApiError` from `@/server/errors` for API errors
- Log errors with structured logging
- Return appropriate HTTP status codes (400, 401, 403, 404, 500)

### Realtime Updates
- Use Supabase Realtime for live updates
- Channel naming: `season:{seasonId}:public`, `tribe:{tribeId}:chat`, `dm:{pairKey}`
- Always handle connection errors gracefully

### Temporal Workflows
- Workflows handle long-running season orchestration
- Activities perform discrete actions (scoring, vote tallying)
- Always emit events to DB for audit trail

## Common Tasks

### Adding a New API Route
1. Create route file in `app/api/{resource}/route.ts`
2. Add Zod schema to `packages/schemas/index.ts`
3. Implement authentication and validation
4. Add DB operations with error handling
5. Test with real data

### Adding a New Component
1. Create component in `app/_components/`
2. Use Tailwind for styling
3. Handle loading and error states
4. Connect to Supabase Realtime if needed
5. Add TypeScript types

### Working with Game Logic
- All RNG uses `@game-logic` package
- Commit-reveal protocol ensures fairness
- Results are verifiable from published seeds

## Git Workflow

- Commit after each complete feature vertical
- Commits trigger Vercel deploys automatically
- Test on preview deployments before merging
- Use conventional commit messages: `feat:`, `fix:`, `test:`, `docs:`

## Testing Strategy

- Unit tests for game logic and utilities
- Integration tests for API routes and RLS
- E2E tests for full season flows
- Always test edge cases and error conditions

