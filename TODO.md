# Implementation TODO

This file tracks the implementation progress. Items are managed automatically via the plan.

## Phase 1: Foundation & Infrastructure

- [x] Create foundation files (.env.example, AGENTS.md, Memory.md, TODO.md)
- [ ] Fix auth helpers and add getCurrentPlayer function
- [ ] Create ApiError class and structured error handling utilities

## Phase 2: Core Game Systems

- [ ] Implement camp task routes (forage, water, rest, help)
- [ ] Complete messaging API and wire Chat component to Supabase Realtime
- [ ] Implement challenge commit/score endpoints and UI
- [ ] Implement voting and idol playing with UI
- [ ] Implement confessional creation and viewing

## Phase 3: Orchestration & Automation

- [ ] Implement all Temporal activities and workflows
- [ ] Implement cron endpoint for phase transitions
- [ ] Implement web push subscription and notifications

## Phase 4: Admin & Analytics

- [ ] Implement analytics queries
- [ ] Implement public event log UI

## Phase 5: Testing & Quality

- [ ] Add RLS policy integration tests
- [ ] Add E2E season flow test
- [ ] Add game logic verification tests

## Phase 6: Polish & Deploy Prep

- [ ] Add structured logging and error tracking
- [ ] Update documentation for production readiness
- [ ] Add performance and security hardening
