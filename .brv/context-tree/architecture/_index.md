---
children_hash: 3065cbc1d6bad6dc4823cc90040aef6ede6a887343f9af80c0dffaf6f7cc0c20
compression_ratio: 0.8670886075949367
condensation_order: 2
covers: [context.md, skillmaster_companion/_index.md]
covers_token_total: 1106
summary_level: d2
token_count: 959
type: summary
---
# Domain: Architecture - Skillmaster Companion Structural Summary (Level D2)

The Skillmaster Companion is a secure, desktop-integrated automation platform structured as a monorepo. It leverages an Electron-based Windows wrapper to orchestrate a local Node.js backend, a risk-aware policy engine, and a task execution pipeline equipped with a global emergency halt mechanism.

## System Topology and Distribution
The project is organized into a modular monorepo (`monorepo_structure.md`) containing three primary applications: `companion-desktop` (Electron), `companion-service` (Backend), and `companion-ui` (Dashboard). Supporting these are shared packages for `policy-engine` logic and `audit` logging. The system is packaged for Windows via **NSIS** using `electron-builder` (`desktop_wrapper_and_packaging.md`).

## Core Components and Process Model

### Desktop and Security Bridge
The Electron wrapper (`main.mjs`) serves as the process orchestrator, spawning the companion service as a child process and managing the `SERVICE_PORT` configuration.
*   **Secure API Bridge**: A preload script (`preload.mjs`) utilizes `contextBridge` to expose a restricted `companionApi` to the renderer. This bridge internally manages session tokens via `ensureToken()`, abstracting security complexity from the UI (`desktop_api_and_preload.md`).
*   **Access Control**: All mutating service endpoints require **Bearer tokens** with a 30-minute TTL, issued via `POST /session/token` (`security_and_authentication.md`).

### Orchestration Service and Policy Engine
The `companion-service` (implemented in `server.ts`) acts as the central coordinator, strictly bound to **127.0.0.1** for local-only security (`companion_service.md`).
*   **Execution Modes**: The service defaults to **Safe Mode**, which restricts UI-automation actions (prefixes `ui_`, `ahk_`) unless the `controlled_ui` flag is active (`security_and_authentication.md`).
*   **Risk Evaluation**: The `policy-engine` package evaluates actions against `RiskLevel` (low, medium, high) and a `policy.sample.json` rule set. It returns a `PolicyDecision` of `allow`, `deny`, or `approval_required` (`policy_engine.md`).

## Task Lifecycle and Operational Safety

### Task Management Pipeline
Tasks follow a rigid lifecycle: `queued` → `pending_approval` → `running` → `done/failed/cancelled`.
*   **API Control**: The lifecycle is managed via `POST /tasks`, `/:id/approve`, and `/:id/start`, the latter initiating a 5s synthetic execution window (`companion_service_api.md`, `task_queue_model.md`).
*   **Auditability**: System events are captured by the `audit` package and accessible via `GET /logs/export`, returning a sorted JSON array of logs (`api_and_operations.md`).

### Panic Stop Mechanism
A critical safety feature triggered via `POST /panic-stop` (`panic_stop_mechanism.md`).
*   **Emergency Flow**: Uses `AbortController` to immediately terminate running tasks, clears the queue, and transitions all active tasks to `cancelled`.
*   **Lockdown**: While the panic state is active, the service returns **HTTP 423 (Locked)** to prevent new task submissions.

## User Interface Shell
The `companion-ui` is a lightweight SSR dashboard providing real-time visibility into system state (`ui_shell_and_model.md`).
*   **Dashboard**: Displays operational mode, panic status, task metrics, and the 30 most recent audit logs.
*   **Emergency Control**: Includes a dedicated "STOP NOW" control (`stop-control.ts`) wired directly to the panic stop mechanism.

---
**Reference Entries**: `monorepo_structure.md`, `desktop_wrapper_and_packaging.md`, `desktop_api_and_preload.md`, `companion_service.md`, `companion_service_api.md`, `task_queue_model.md`, `policy_engine.md`, `panic_stop_mechanism.md`, `security_and_authentication.md`, `ui_shell_and_model.md`, `api_and_operations.md`.