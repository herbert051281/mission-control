# Atlas Companion Project

## Hot (Recent)

- **GitHub Command Bridge DEPLOYED** (2026-03-23): Full Telegram → Atlas VPS → GitHub → Windows watcher → localhost execution pipeline working
- **Command queue repo**: https://github.com/herbert051281/atlas-commands (JSON command files)
- **PowerShell watcher**: `watcher.ps1` polls every 5 sec, executes via HTTP, auto-deletes after execution
- **NLP parser**: `AtlasCommandBridge` class converts natural language ("Open Notepad") → structured JSON commands
- **Latest commit**: `2d037af` (app.launch test)
- **Pending verification**: Did last test command (Open Notepad) execute on Herb's machine?

## Warm (Active Context)

- **GitHub Repos**: 
  - Main: https://github.com/herbert051281/AtlasCompanion
  - Command Queue: https://github.com/herbert051281/atlas-commands
- **Stack**: Electron (Windows), localhost-only service (port 9999)
- **Block 2 COMPLETE**: AutoHotkey primitives + PowerShell window/app management with TDD
- **Block 3 MOSTLY COMPLETE**: NLP command parser, control window manager, approval engine, HTTP client, command executor, Atlas handler, deployment guide
- **Build flow**: Portable packaging preferred (`npm run companion:package:portable`)
- **Safety Architecture**: Safe Mode default, timed Grant Control (TTL ≤30 min), Approval workflow, Panic STOP kill-switch, all commands logged to Git history (audit trail)

## Cold (Historical)

- Initial build: 2026-03-21
- Resolved CSP issues, path normalization, Device Guard blocks
- Code-signing runbook created
