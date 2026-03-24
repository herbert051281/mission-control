# Skillmaster Companion App (Windows Surface) — Design Doc

Date: 2026-03-21  
Owner: Atlas (orchestrated)  
Status: Approved for planning

## 1) Objective
Build a local Windows companion app that enables controlled computer automation with human oversight.

User-selected control mode: **C (Hybrid)**
- Mode A: script/app automation
- Mode B: UI control (mouse/keyboard/window ops)
- Mode C: both, with **Safe Mode default**

## 2) Non-Negotiables (Safety)
1. No unattended persistent full control by default.
2. Human approval required for sensitive actions.
3. Global STOP button must instantly halt execution.
4. Localhost-only command ingress in MVP.
5. Full audit trail for every action.

## 3) Scope
### In Scope (MVP)
- Desktop app shell with status, queue, logs, STOP
- Local task engine with safe command execution
- Two execution profiles: Safe + Controlled UI
- Rule-based policy guard (allow/deny/approval)
- Local auth token and session TTL
- Local audit database (SQLite) and JSON export

### Out of Scope (MVP)
- Internet-exposed control endpoint
- Autonomous always-on remote takeover
- Privilege escalation workflows
- Kernel-level hooks

## 4) Architecture
## 4.1 Components
1. **Electron App (UI Layer)**
   - Screens: Dashboard, Queue, Policy, Logs, Settings
   - Panic control: STOP button pinned in top bar

2. **Local Agent Service (Node.js + TypeScript)**
   - REST/WebSocket on `127.0.0.1` only
   - Task queue + scheduler + cancellation

3. **Execution Adapters**
   - PowerShell adapter (system/tasks)
   - AutoHotkey v2 adapter (UI control)
   - Playwright adapter (browser automation)

4. **Policy Engine**
   - JSON rules with fields:
     - `action`, `riskLevel`, `allowed`, `requiresApproval`, `timeoutMs`

5. **Audit Layer**
   - SQLite events table + immutable append-only logs
   - Export command for review/share

## 4.2 Execution Flow
1. Task submitted (UI/API)
2. Policy evaluation
3. If `requiresApproval=true` → approval dialog
4. Executor runs adapter command
5. Result + artifacts logged
6. Task marked completed/failed/cancelled

## 5) Security Model (MVP)
- Bind service only to localhost
- Session token required for API calls
- Token expiry default: 30 minutes
- High-risk commands blocked by denylist
- File operations restricted to allowlisted roots
- STOP triggers hard cancel and adapter kill

## 6) UX
- Decision-first interface:
  - What is running now?
  - What is queued?
  - What is awaiting approval?
- Red “STOP NOW” action always visible
- One-click “Lock to Safe Mode”

## 7) Acceptance Criteria
1. User can submit tasks and see queue state.
2. Safe mode executes only approved low-risk actions.
3. UI-control actions require explicit approval.
4. STOP halts active task within 1 second (target).
5. Every action has timestamped audit record.
6. App restarts without losing queue history/logs.

## 8) Risks & Mitigations
- UI automation fragility → robust selectors/fallbacks + retry policy
- Over-permissioning → deny-by-default policy templates
- Stuck processes → process watchdog + timeout + kill tree
- Human error approvals → contextual warnings with diff preview

## 9) Recommended Build Stack
- Electron + React (UI)
- Node.js + TypeScript (service)
- PowerShell + AutoHotkey v2 (desktop automation)
- Playwright (browser automation)
- SQLite (audit/log state)

## 10) Definition of Done
- MVP runs on Surface with both modes
- Safety controls verified in test scenarios
- Basic docs + runbook complete
- Demo script completed end-to-end
