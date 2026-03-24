---
title: Companion Service
tags: []
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-03-21T03:29:32.924Z'
updatedAt: '2026-03-21T03:29:32.924Z'
---
## Raw Concept
**Task:**
Implement companion service bootstrap

**Files:**
- apps/companion-service/src/server.ts

**Flow:**
startService -> bind to 127.0.0.1 -> listen on port -> serve /health

**Timestamp:** 2026-03-21

## Narrative
### Structure
HTTP server implementation using node:http.

### Highlights
Enforces localhost-only policy (127.0.0.1). Provides /health endpoint returning JSON status.

### Rules
Rule 1: Service must ONLY bind to 127.0.0.1. Any other host must be rejected.

### Examples
GET /health -> {"status": "healthy"}
