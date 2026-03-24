---
title: Desktop Wrapper and Packaging
tags: []
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-03-21T03:57:13.048Z'
updatedAt: '2026-03-21T03:57:13.048Z'
---
## Raw Concept
**Task:**
Implement Electron desktop wrapper and Windows packaging for Skillmaster Companion

**Changes:**
- Added Electron desktop wrapper in apps/companion-desktop
- Configured Windows NSIS packaging with electron-builder
- Added companion:dev, companion:build, and companion:package:win scripts
- Implemented PowerShell demo automation script
- Created Windows installation and operator runbook

**Files:**
- package.json
- apps/companion-desktop/src/main.mjs
- apps/companion-desktop/src/preload.mjs
- scripts/demo-companion.ps1
- docs/runbooks/windows-install-and-run.md

**Flow:**
App Start -> startServiceProcess (spawn service-runner.mjs) -> capture SERVICE_PORT -> createWindow (Electron) -> load index.html with preload.mjs

**Timestamp:** 2026-03-21

## Narrative
### Structure
The desktop application uses Electron to wrap the companion service. The main process (main.mjs) manages the lifecycle of the companion service as a background child process. The preload script (preload.mjs) exposes a secure API (companionApi) to the renderer process via contextBridge.

### Dependencies
Electron (^33.3.1), electron-builder (^25.1.8), tsx (^4.20.5), and pptxgenjs (^4.0.1). Requires Node.js 20+ and PowerShell 5.1+ on Windows.

### Highlights
Preserves security defaults: localhost-only bind, safe-mode execution, and session token TTL. Includes a global STOP NOW panic-stop control in the UI API.

### Rules
Rule 1: Companion service must bind to 127.0.0.1 only.
Rule 2: Execution mode defaults to safe.
Rule 3: Session token TTL defaults to 30 minutes.
Rule 4: Building Windows installer on Linux requires Wine/Mono (Windows CI recommended).

### Examples
Dev run: npm run companion:dev
Package Windows: npm run companion:package:win
Demo run: powershell -ExecutionPolicy Bypass -File .\scripts\demo-companion.ps1

## Facts
- **process_management**: Electron main process spawns companion service using service-runner.mjs [project]
- **service_integration**: SERVICE_PORT is captured from service stdout to configure Electron BrowserWindow [project]
- **packaging**: Electron builder is configured for NSIS target on Windows x64 [project]
- **automation**: PowerShell demo script automates health check, session token issuance, task creation, and panic stop [convention]
