---
title: Companion Service API
tags: []
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-03-21T03:35:43.115Z'
updatedAt: '2026-03-21T03:35:43.115Z'
---
## Raw Concept
**Task:**
Companion Service API for task management and system control

**Files:**
- apps/companion-service/src/server.ts

**Flow:**
Client -> HTTP Request -> Policy Evaluation -> Task Queue -> Response

**Timestamp:** 2026-03-21

## Narrative
### Structure
Node.js http server binding to 127.0.0.1. Integrates Policy Engine and Task Queue.

### Highlights
Implements task lifecycle management (create, approve, deny, start). Features a global panic stop mechanism.

### Rules
1. POST /tasks: Creates task after policy check.
2. POST /tasks/:id/approve: Transitions task to queued.
3. POST /tasks/:id/deny: Transitions task to cancelled.
4. POST /tasks/:id/start: Begins synthetic execution (5s default).
5. POST /panic-stop: Halts all execution and blocks new tasks.
6. GET /tasks/:id: Returns task status.

## Facts
- **Endpoint Definitions**: The Companion Service API exposes the following endpoints: POST /tasks for task creation, POST /tasks/:id/approve for approving pending tasks, POST /tasks/:id/deny for rejecting tasks, POST /tasks/:id/start for initiating execution, GET /tasks/:id for status retrieval, and POST /panic-stop for emergency system halting.
- **HTTP Status Codes**: The API returns HTTP 201 for successful creation of low-risk tasks, 202 for medium-risk tasks (pending approval) or task start requests, 200 for successful state updates (approve/deny/panic-stop), and 423 (Locked) for task creation attempts while the system is in a panic stop state.
- **POST /tasks**: The POST /tasks endpoint evaluates the policy for a given action and riskLevel, returning 201 for allowed tasks, 202 for tasks requiring approval, and 403 for denied tasks.
- **POST /tasks/:id/approve**: The POST /tasks/:id/approve endpoint transitions a task from the 'pending_approval' state to the 'queued' state.
- **POST /tasks/:id/deny**: The POST /tasks/:id/deny endpoint transitions a task from the 'pending_approval' state to the 'cancelled' state.
- **POST /tasks/:id/start**: The POST /tasks/:id/start endpoint initiates synthetic execution of a task, transitioning its state from 'queued' to 'running'.
- **GET /tasks/:id**: The GET /tasks/:id endpoint retrieves the current state and metadata for a specific task.
