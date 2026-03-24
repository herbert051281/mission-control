---
title: Panic Stop Mechanism
tags: []
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-03-21T03:35:43.118Z'
updatedAt: '2026-03-21T03:35:43.118Z'
---
## Raw Concept
**Task:**
Emergency system halt and execution blocking

**Files:**
- apps/companion-service/src/server.ts

**Flow:**
POST /panic-stop -> abort running -> cancel queue -> block new tasks

**Timestamp:** 2026-03-21

## Narrative
### Structure
Uses AbortController for immediate cancellation of synthetic execution timers. Sets a global panicStopped flag.

### Highlights
Integration tests verify completion in <1000ms. Returns HTTP 423 Locked for blocked requests.

### Rules
1. Abort all running controllers.
2. Transition all queued/pending/running tasks to cancelled.
3. Return HTTP 423 for subsequent task-related POST requests.

## Facts
- **System Blocking and Cancellation**: A panic stop, invoked via POST /panic-stop, immediately cancels active tasks and blocks the task queue, causing subsequent POST /tasks requests to fail with an HTTP 423 status code.
- **Task Cancellation**: The panic stop mechanism automatically transitions all tasks in 'queued', 'pending_approval', or 'running' states to 'cancelled'.
- **Execution Blocking**: When a panic stop is active, the service returns a 423 'panic_stopped' error for POST /tasks and POST /tasks/:id/start requests.
- **AbortController**: The panic stop implementation uses AbortController to immediately terminate running synthetic executions.
- **Performance Requirements**: The panic stop mechanism is designed for low latency; integration tests in tests/task6-panic-stop.test.ts verify that the stop operation and task cancellation complete in less than 1000ms.
