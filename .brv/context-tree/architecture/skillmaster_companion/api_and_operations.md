---
title: API and Operations
tags: []
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-03-21T03:47:58.431Z'
updatedAt: '2026-03-21T03:47:58.431Z'
---
## Raw Concept
**Task:**
Document Skillmaster Companion API and operational procedures

**Changes:**
- Added logs export endpoint (GET /logs/export)
- Implemented panic stop mechanism (POST /panic-stop)
- Created operator runbook

**Files:**
- apps/companion-service/src/server.ts
- docs/runbooks/companion-operator-runbook.md

**Flow:**
POST /panic-stop -> flag panicStopped -> abort running tasks -> cancel queued tasks

**Timestamp:** 2026-03-21

## Narrative
### Structure
Operational endpoints provide health check, status monitoring, task management, and audit logging. Audit events are stored in an in-memory array and can be exported as a chronologically sorted JSON.

### Highlights
Panic stop provides an emergency halt for all task execution. Log export includes `generatedAt`, `count`, and `events[]`.

### Rules
Panic Stop Procedure:
1. Call `POST /panic-stop` (or press UI STOP NOW).
2. Confirm 200 "stopped" response.
3. Verify blocked execution (423 panic_stopped).
4. Export logs for review.

### Examples
Log Export Response: `{"generatedAt": 1742528868000, "count": 10, "events": [...]}`

## Facts
- **Operations**: The system includes a logs export endpoint and an operator runbook for operational maintenance.
- **Health Check**: GET /health: Returns the health status of the service.
- **Service Status**: GET /status: Returns the current execution mode, panic status, and counts for queued and pending approval tasks.
- **Audit Logging**: GET /logs/export: Returns a chronologically sorted list of audit events.
- **Emergency Shutdown**: The panicStop procedure sets the panicStopped flag, aborts all active AbortControllers for running tasks, and transitions all queued, pending, or running tasks to a 'cancelled' state.
