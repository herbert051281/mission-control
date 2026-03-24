---
title: Task Queue Model
tags: []
keywords: []
importance: 55
recency: 1
maturity: draft
updateCount: 1
createdAt: '2026-03-21T03:29:32.928Z'
updatedAt: '2026-03-21T03:35:43.116Z'
---
## Raw Concept
**Task:**
Task Queue management and state transitions

**Files:**
- apps/companion-service/src/task-queue.ts

**Flow:**
queued <-> pending_approval -> running -> done|failed|cancelled

**Timestamp:** 2026-03-21

## Narrative
### Structure
In-memory Map-based storage for QueueTask objects. Enforces valid state transitions.

### Highlights
Supports UUID generation for task IDs. Tracks createdAt and updatedAt timestamps.

### Rules
Allowed Transitions:
- queued: running, cancelled, pending_approval
- pending_approval: queued, cancelled
- running: done, failed, cancelled

## Facts
- **apps/companion-service/src/task-queue.ts**: The TaskQueue class in apps/companion-service/src/task-queue.ts manages task persistence, metadata like riskLevel, and state transitions.
- **Task States**: Tasks can exist in one of six states: 'queued', 'pending_approval', 'running', 'done', 'failed', or 'cancelled'.
- **State Transitions**: The 'queued' state can transition to 'running', 'cancelled', or 'pending_approval'.
- **State Transitions**: The 'pending_approval' state can transition to 'queued' or 'cancelled'.
- **State Transitions**: The 'running' state can transition to 'done', 'failed', or 'cancelled'.
- **State Transitions**: The system manages task state transitions including 'pending_approval' to 'queued' upon approval, 'pending_approval' to 'cancelled' upon denial, and 'running' to 'cancelled' when a panic stop is triggered.
- **updateTaskState Implementation**: The updateTaskState(id, nextState) method in the Task Queue updates the 'state' and 'updatedAt' properties of a QueueTask object and logs the transition using the format: `Task ${id} state: ${task.state} -> ${nextState}`.
