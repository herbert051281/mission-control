---
children_hash: 178ba3093d4a85880c98c83ed61dec7a1fc039db0d74dfa1d69c79cb441c70d3
compression_ratio: 0.19887834339948232
condensation_order: 1
covers: [api_and_operations.md, companion_service.md, companion_service_api.md, context.md, desktop_api_and_preload.md, desktop_wrapper_and_packaging.md, monorepo_structure.md, panic_stop_mechanism.md, policy_engine.md, security_and_authentication.md, task_queue_model.md, ui_shell_and_model.md]
covers_token_total: 4636
summary_level: d1
token_count: 922
type: summary
---
# Skillmaster Companion Structural Summary (Level D1)

The Skillmaster Companion is a desktop-integrated automation system organized as a monorepo, featuring a secure Electron wrapper, a risk-aware policy engine, and a robust task execution pipeline with emergency halt capabilities.

## Architectural Overview

### Core System Structure
The project follows a monorepo pattern (`monorepo_structure.md`) comprising:
*   **Apps**: `companion-desktop` (Electron wrapper), `companion-service` (Node.js backend), and `companion-ui` (SSR dashboard).
*   **Packages**: `policy-engine` (risk evaluation) and `audit` (event logging).

### Desktop Wrapper & Packaging
The system is delivered as a Windows application (`desktop_wrapper_and_packaging.md`) using **Electron (^33.3.1)**. 
*   **Process Management**: The main process (`main.mjs`) spawns the companion service as a background child process and captures the `SERVICE_PORT` to configure the UI.
*   **Secure Bridge**: A preload script (`preload.mjs`) uses `contextBridge` to expose a restricted `companionApi` to the renderer, handling session token management internally via `ensureToken()` (`desktop_api_and_preload.md`).
*   **Distribution**: Configured for **NSIS** packaging via `electron-builder`.

## Service Architecture & API

### Companion Service
Implemented in `apps/companion-service/src/server.ts`, the service acts as the central orchestrator (`companion_service.md`).
*   **Network Policy**: Strictly enforced **localhost-only** binding (127.0.0.1).
*   **Execution Modes**: Defaults to **Safe Mode**, which blocks UI-control actions (prefixes `ui_`, `ahk_`) unless `controlled_ui` mode is active (`security_and_authentication.md`).

### Task Management & Queue
The system manages a complex task lifecycle (`task_queue_model.md`) using an in-memory Map-based storage.
*   **States**: `queued`, `pending_approval`, `running`, `done`, `failed`, and `cancelled`.
*   **Lifecycle API**: Endpoints include `POST /tasks` (creation), `/:id/approve`, `/:id/deny`, `/:id/start` (initiating 5s synthetic execution), and `GET /tasks/:id` (`companion_service_api.md`).

### Policy Engine
A standalone package (`policy_engine.md`) evaluates actions against a rule set (`policy.sample.json`) to return a `PolicyDecision`: `allow`, `deny`, or `approval_required`. Decisions are based on `RiskLevel` (low, medium, high).

## Security & Operations

### Authentication Model
All mutating endpoints require **Bearer token authentication** (`security_and_authentication.md`). 
*   **Session Management**: Tokens are issued via `POST /session/token` with a default **30-minute TTL**.
*   **Auditability**: The `GET /logs/export` endpoint provides a chronologically sorted JSON array of audit events (`api_and_operations.md`).

### Panic Stop Mechanism
A global emergency halt system (`panic_stop_mechanism.md`) triggered via `POST /panic-stop`.
*   **Flow**: Immediately aborts running tasks using `AbortController`, clears the queue, and transitions all active tasks to `cancelled`.
*   **Blocking**: While active, the service returns **HTTP 423 (Locked)** for new task requests.

## User Interface

The UI is a lightweight, server-side rendered shell (`ui_shell_and_model.md`).
*   **Dashboard**: Displays system mode, panic status, task counts, and the 30 most recent logs.
*   **Controls**: Features a prominent **STOP NOW** button wired directly to the panic stop handler (`stop-control.ts`).

---
**Reference Entries**: `monorepo_structure.md`, `desktop_wrapper_and_packaging.md`, `companion_service_api.md`, `policy_engine.md`, `task_queue_model.md`, `panic_stop_mechanism.md`, `security_and_authentication.md`, `ui_shell_and_model.md`.