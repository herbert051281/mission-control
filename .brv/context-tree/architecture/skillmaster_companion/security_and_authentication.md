---
title: Security and Authentication
tags: []
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-03-21T03:47:58.428Z'
updatedAt: '2026-03-21T03:47:58.428Z'
---
## Raw Concept
**Task:**
Implement and document Skillmaster Companion security model

**Changes:**
- Introduced session token auth with TTL for all mutating endpoints
- Implemented safe mode default blocking ui_/ahk_ actions
- Added localhost-only binding policy (127.0.0.1)

**Files:**
- apps/companion-service/src/server.ts
- tests/task13-auth-ttl.test.ts

**Flow:**
request -> check auth header -> validate token/TTL -> check execution mode -> evaluate policy -> execute

**Timestamp:** 2026-03-21

## Narrative
### Structure
Authentication is handled by `requireAuth` middleware. Tokens are issued via `POST /session/token` and stored in an in-memory `sessions` Map with expiration timestamps.

### Dependencies
Relies on `crypto.randomUUID()` for token generation and `evaluatePolicy` for action-level security.

### Highlights
Default session TTL is 30 minutes. Safe mode blocks restricted actions (prefixes `ui_`, `ahk_`) to prevent unauthorized UI control.

### Rules
Rule 1: All mutating endpoints MUST require a valid Bearer token.
Rule 2: Service MUST only bind to 127.0.0.1.
Rule 3: Safe mode is the default and blocks ui_/ahk_ actions unless controlled_ui mode is active.

### Examples
Authorization Header: `Authorization: Bearer <uuid-token>`

## Facts
- **Hardening**: The service defaults to a 'safe' execution mode which blocks actions prefixed with 'ui_' or 'ahk_' unless 'controlled_ui' mode is explicitly enabled.
- **Authentication**: All mutating endpoints are protected by session token authentication with a configurable Time-To-Live (TTL).
- **Network Security**: The service enforces a localhost-only policy, requiring the server to bind to 127.0.0.1.
- **Session Management**: POST /session/token: Issues a new session token with a default TTL of 30 minutes.
- **Safe Mode**: If iControlAction(action) returns true while the system is in safe mode, the API returns a 403 error with the code 'safe_mode_blocks_ui_control'.
- **Authentication**: Mutating API endpoints (approve, deny, start, panic-stop) utilize the requireAuth function to enforce security, and the service supports a configurable token TTL via 'authTtlMs'.
