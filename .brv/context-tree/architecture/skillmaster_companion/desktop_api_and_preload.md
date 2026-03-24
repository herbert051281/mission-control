---
title: Desktop API and Preload
tags: []
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-03-21T03:57:13.049Z'
updatedAt: '2026-03-21T03:57:13.049Z'
---
## Raw Concept
**Task:**
Define the secure bridge between Electron renderer and companion service

**Files:**
- apps/companion-desktop/src/preload.mjs

**Flow:**
Renderer calls companionApi -> preload fetches from localhost:port -> returns data to renderer

**Timestamp:** 2026-03-21

## Narrative
### Structure
The preload script uses contextBridge to expose companionApi to the window object. It handles session token management internally via ensureToken().

### Highlights
The API includes health(), status(), tasks(), logs(), createTask(), approveTask(), startTask(), and panicStop().

### Rules
All sensitive operations (create, approve, start, panic) require Bearer token authentication.

## Facts
- **security**: companionApi is exposed to renderer via Electron contextBridge [project]
- **authentication**: Preload script manages session tokens automatically for authenticated requests [project]
