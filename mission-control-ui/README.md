# Mission Control UI System
## OpenClaw Orchestrator Dashboard

**Status:** Production-Ready Implementation  
**Architecture:** React 18+ with TypeScript  
**State Management:** Zustand + React Query  
**Styling:** CSS Modules + Design Tokens  
**Build Target:** Vite + shadcn/ui (modified for dark premium aesthetic)

---

## System Overview

Mission Control is a real-time orchestration dashboard for OpenClaw, enabling executive-grade visibility into 9 autonomous agents, mission pipelines, system health, and approval workflows.

### Key Principles
- **Dense information density** — maximize content area without cognitive overload
- **Real-time updates** — WebSocket/Server-Sent Events for live feeds
- **Hierarchical navigation** — rail-based with modal drill-downs
- **Color-coded semantics** — status, severity, and state immediately visible
- **Keyboard-first interaction** — power user shortcuts for approvals, routing, filtering

---

## Component Hierarchy

```
MissionControl (Root Layout Container)
├── TopCommandBar
│   ├── BrandingSection
│   ├── EnvironmentIndicator
│   ├── SystemStatusBadge
│   ├── ApprovalsCounter
│   ├── ActiveModelsDisplay
│   └── CommandSearchInput
├── LeftNavigationRail
│   ├── NavItem (Command Center, Missions, Agents, Activity, Approvals, Skills, Settings)
│   └── ContextualMenus
├── MainContentArea
│   ├── CommandCenterView (default view)
│   │   ├── MissionPipelineBoard
│   │   │   ├── PipelineStage (Intake, Routed, In Progress, Review, Awaiting Approval, Completed)
│   │   │   └── MissionCard (x N)
│   │   ├── AgentStatusGrid
│   │   │   └── AgentCard (x 9)
│   │   └── SystemHealthSummary
│   ├── MissionsView (alternate view)
│   ├── AgentsView (alternate view)
│   ├── ActivityFeedView (alternate view)
│   ├── ApprovalsView (alternate view)
│   ├── SkillsRegistryView (alternate view)
│   └── SettingsView (alternate view)
├── ApprovalsPanel (persistent sidebar, context-aware)
├── LiveActivityFeed (floating or sidebar-integrated)
└── Modals
    ├── MissionDetailModal
    ├── AgentDetailModal
    ├── ApprovalActionModal
    └── SkillDeploymentModal
```

---

## Implementation Files

See accompanying files:
- `ARCHITECTURE.md` — data flow, state shape, API contracts
- `COMPONENTS.md` — all component definitions with TypeScript signatures
- `STYLES.md` — CSS module structure and design tokens
- `IMPLEMENTATION.md` — step-by-step build guide
