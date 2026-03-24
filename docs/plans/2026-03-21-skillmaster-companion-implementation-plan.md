# Skillmaster Companion App — Implementation Plan (TDD-first)

Date: 2026-03-21
Design Ref: `docs/plans/2026-03-21-skillmaster-companion-design.md`
Execution Mode: Subagent-driven recommended

## Plan Rules
- Each task is 2–5 minute scope
- TDD: write failing test first, then implementation
- Commit after each green task
- No scope creep

---

## Task 1 — Scaffold project structure
**Goal:** Initialize repo structure for app/service/shared.

### Test first
- Verify directories/files exist:
  - `apps/companion-ui/`
  - `apps/companion-service/`
  - `packages/policy-engine/`
  - `packages/audit/`

### Implement
- Create folders + placeholder README files.

### Verify
- `find apps packages -maxdepth 2 -type d`

---

## Task 2 — Service bootstrap (localhost only)
**Goal:** Start service binding only to `127.0.0.1`.

### Test first
- Integration test asserts listener host is localhost.

### Implement
- Minimal TS service with `/health` endpoint.

### Verify
- `curl http://127.0.0.1:<port>/health` returns healthy.
- Attempt non-local bind path fails by policy.

---

## Task 3 — Task queue model
**Goal:** Add in-memory queue with states.

### Test first
- Unit tests for transitions: queued→running→done/failed/cancelled.

### Implement
- Queue manager + task schema.

### Verify
- Run tests for valid/invalid transitions.

---

## Task 4 — Policy engine core
**Goal:** Evaluate allow/deny/approval from JSON rules.

### Test first
- Unit tests:
  - allowed low-risk action passes
  - blocked high-risk action denied
  - approval-required action flagged

### Implement
- `packages/policy-engine` evaluator + sample policy file.

### Verify
- All policy tests pass.

---

## Task 5 — Approval workflow endpoints
**Goal:** Add approve/deny API for pending tasks.

### Test first
- API tests for pending action lifecycle.

### Implement
- Endpoints:
  - `POST /tasks/:id/approve`
  - `POST /tasks/:id/deny`

### Verify
- Pending tasks resume/terminate correctly.

---

## Task 6 — STOP/Panic kill path
**Goal:** Hard stop active task + block queue execution.

### Test first
- Test that running task receives cancellation and exits quickly.

### Implement
- Global stop controller + process kill tree.

### Verify
- Target: stop < 1s in synthetic long task.

---

## Task 7 — PowerShell adapter (Safe mode)
**Goal:** Execute allowlisted system/script actions.

### Test first
- Adapter tests for command templating and timeout.

### Implement
- Safe command runner with strict allowlist.

### Verify
- Allowed command succeeds; blocked command fails.

---

## Task 8 — AutoHotkey adapter (Controlled UI mode)
**Goal:** Run vetted AHK scripts after approval.

### Test first
- Tests for script path validation + approval gate.

### Implement
- AHK execution wrapper + path constraints.

### Verify
- Unapproved UI action denied; approved action runs.

---

## Task 9 — Playwright adapter
**Goal:** Browser automation adapter with bounded contexts.

### Test first
- Test adapter init and action timeout handling.

### Implement
- Launch/close lifecycle + action wrappers.

### Verify
- Basic page navigation task succeeds in test environment.

---

## Task 10 — Audit logging (SQLite)
**Goal:** Persist every action/event immutably.

### Test first
- DB tests for insert/retrieve and ordering.

### Implement
- `packages/audit` with event schema and write APIs.

### Verify
- All queue and execution events written with timestamps.

---

## Task 11 — Companion UI shell
**Goal:** Build dashboard with queue/log/pending approvals.

### Test first
- Component tests for rendering states.

### Implement
- Electron + React shell and panels.

### Verify
- UI shows live task updates and approval prompts.

---

## Task 12 — STOP button integration
**Goal:** Wire UI STOP button to panic endpoint.

### Test first
- E2E test: start task, press STOP, task halts.

### Implement
- Add persistent top-bar STOP control.

### Verify
- STOP reflected in UI and logs.

---

## Task 13 — Session token + TTL
**Goal:** Require local auth token for mutating APIs.

### Test first
- API tests for unauthorized vs authorized access.

### Implement
- Token middleware + expiry enforcement.

### Verify
- Expired token denied, fresh token accepted.

---

## Task 14 — Export logs/runbook docs
**Goal:** Provide JSON export and operator guide.

### Test first
- Test export contains expected fields and order.

### Implement
- `GET /logs/export` + docs in `docs/runbooks/`.

### Verify
- Export opens and is audit-readable.

---

## Task 15 — MVP hardening pass
**Goal:** Final security and reliability checks.

### Test first
- Regression test suite for policy/queue/stop/auth.

### Implement
- Fix gaps; lock defaults to Safe mode.

### Verify
- Full test suite green.
- Manual demo scenario passes end-to-end.

---

## Finalization
- Create summary report: implemented scope, known limits, next iteration backlog.
- Prepare branch completion options (merge / PR / keep / discard).
