---
title: UI Shell and Model
tags: []
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-03-21T03:47:58.433Z'
updatedAt: '2026-03-21T03:47:58.433Z'
---
## Raw Concept
**Task:**
Document Skillmaster Companion UI architecture

**Changes:**
- Added lightweight UI shell model and rendering
- Implemented dashboard model derivation from system snapshot
- Wired STOP NOW button to panic stop handler

**Files:**
- apps/companion-ui/src/shell.ts
- apps/companion-ui/src/stop-control.ts

**Flow:**
system snapshot -> deriveDashboardModel -> renderShellHtml

**Timestamp:** 2026-03-21

## Narrative
### Structure
The UI is a server-side rendered (SSR) HTML shell. `deriveDashboardModel` transforms a system snapshot into a format suitable for the dashboard view.

### Highlights
Dashboard displays mode, panic status, queue/pending counts, and recent logs (last 30). Includes a prominent STOP NOW button.

### Rules
UI Rendering Rules:
1. Filter tasks by state (queued/running for queue, pending_approval for approvals).
2. Sort and slice logs to the most recent 30 entries.
3. Render HTML using template literals.

### Examples
Dashboard Model: `{ mode: "safe", panicStopped: false, queueCount: 5, ... }`

## Facts
- **UI Shell**: Skillmaster Companion includes a lightweight UI shell model and rendering system.
- **Dashboard Shell**: The renderShellHtml function generates an HTML dashboard featuring a 'STOP NOW' button, system status indicators, and lists for the task queue and pending approvals.
- **Stop Control**: The createStopHandler function creates an asynchronous 'stopNow' function that sends a POST request to the /panic-stop endpoint with a Bearer token.
