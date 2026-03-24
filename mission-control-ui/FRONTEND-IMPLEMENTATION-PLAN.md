# Mission Control Frontend - Complete Implementation Plan

## Executive Summary

Mission Control is a production-grade React dashboard for managing OpenClaw's 9 autonomous agents, mission pipelines, system health, and approval workflows. The system delivers executive-grade density with a dark premium aesthetic, real-time updates, and power-user keyboard shortcuts.

**Tech Stack:**
- React 18+ / TypeScript
- Zustand (state management)
- React Query (async state)
- CSS Modules (tokens + component styles)
- WebSocket (real-time updates)
- Vite (build tool)

**Target:** Full feature-parity deployment in 2-3 sprints

---

## Component Architecture

### Layout Hierarchy
```
MissionControl (Grid Layout)
├── TopCommandBar (Sticky Header)
│   ├── Branding + Environment
│   ├── Command Search
│   └── System Status + Approvals Counter
├── MainContent
│   ├── LeftNavigationRail (Collapsible)
│   ├── MainContentArea (View Router)
│   │   ├── CommandCenterView (default)
│   │   │   ├── MissionPipelineBoard (6-stage kanban)
│   │   │   ├── AgentStatusGrid (3x3 card grid)
│   │   │   └── SystemHealthSummary (4-metric dashboard)
│   │   ├── MissionsView
│   │   ├── AgentsView
│   │   ├── ActivityView
│   │   ├── ApprovalsView
│   │   ├── SkillsView
│   │   └── SettingsView
│   └── ApprovalsPanel (Right sidebar, persistent)
└── LiveActivityFeed (Floating or sidebar)
```

### Component Count & Dependencies
- **Top-level:** 3 (MissionControl, TopCommandBar, MainContentArea)
- **Layout:** 4 (LeftNavigationRail, ApprovalsPanel, LiveActivityFeed, ViewRouter)
- **Feature:** 12 (MissionPipelineBoard, AgentStatusGrid, SystemHealthSummary, etc.)
- **Reusable:** 8 (MissionCard, AgentCard, ApprovalItem, ActivityEntry, StatusBadge, Skeleton, Modal, ContextMenu)
- **Total:** ~30-35 components

---

## Data Flow & State Shape

### Root Store (Zustand)
```
ui: {
  activeView: string
  sidebarCollapsed: boolean
  approvalsVisible: boolean
  activityVisible: boolean
  selectedMission?: string
  selectedAgent?: string
  filters: FilterState
}
missions: Mission[]
agents: Agent[]
approvals: Approval[]
activities: ActivityEntry[]
systemHealth: SystemHealth
skills: Skill[]
wsConnected: boolean
```

### API Layer
- **Missions:** CRUD + filter/search
- **Agents:** Status polling + detail history
- **Approvals:** Pending list + approve/deny actions
- **Activity:** Paginated log stream (cursor-based)
- **Health:** Snapshot metrics (CPU, memory, queue, uptime)
- **Skills:** Registry with deployment state

### Real-Time Updates (WebSocket)
- Mission state transitions (intake → routed → in progress → review → awaiting approval → completed)
- Agent status changes (idle ↔ running ↔ waiting ↔ completed ↔ failed)
- New approvals pending
- Activity log entries
- System health snapshots
- Skill deployments

---

## Critical UI Behaviors

### Mission Pipeline Board
**Design Pattern:** Horizontal Kanban with drag-and-drop

- **6 Stages:** Intake | Routed | In Progress | Review | Awaiting Approval | Completed
- **Card Actions:**
  - Drag to move between stages (triggers API update)
  - Click to select & show details modal
  - Right-click for context menu (reassign agents, force completion, etc.)
- **Density:** Show 3-5 cards per stage at normal scroll height
- **Visual Hierarchy:** Priority color (left border), status indicator, agent badges, error overlay

### Agent Status Grid
**Design Pattern:** 3×3 card grid (9 agents fixed)

**Each Card Shows:**
- Name + Role + Model
- Status badge (idle/running/waiting/completed/failed) with color + icon
- Current task description + elapsed time
- Last completed task + result (✓ or ✕)
- 3 metrics: queued tasks, success rate %, avg duration (seconds)
- Progress bar (if running, animated)
- Hover state: show context menu (force stop, reassign, view logs)

**Colors:**
- Idle: #94A3B8 (muted)
- Running: #22D3EE (cyan, animated pulse)
- Waiting: #F59E0B (amber)
- Completed: #22C55E (green)
- Failed: #EF4444 (red, shake animation)

### Approvals Panel
**Design Pattern:** Right-sidebar badge-driven action queue

- **Persistent sidebar** (right column, 320px fixed width)
- **Badge counter** in top bar (red dot if >0 pending)
- **Each approval item:**
  - Risk level (left border: green/amber/red)
  - Approval type label (elevated_command, external_action, etc.)
  - Action description (truncate to 2 lines)
  - Risk level badge (UPPERCASE)
  - Expiration countdown
  - [Approve] [Deny] [⋯ Details] buttons
  - Expandable metadata/code preview

### Activity Feed
**Design Pattern:** Real-time scrolling log (auto-scroll to bottom)

- **Columns:** Timestamp | Agent | Action | Status | Mission Ref
- **Fixed-width font** for timestamps
- **Color-coded status icons:** ✓ (green), ✕ (red), ⏳ (amber), ⚠ (orange)
- **150-entry max** in memory, paginate older entries
- **Entry rate:** 2-10 entries/second under normal load
- **Filtering:** by agent, status, mission, time range

### System Health Summary
**Design Pattern:** Metric dashboard with progress bars

- **4 Cards:**
  1. CPU Usage (%)
  2. Memory Usage (%)
  3. Queue Depth (count)
  4. Avg Response Time (ms) + Uptime

- **Progress bars:** Color shifts green → amber → red based on thresholds
- **Threshold values:**
  - CPU: 60% (amber), 80% (red)
  - Memory: 70% (amber), 85% (red)
  - Queue: 50 (amber), 100 (red)
- **Click to expand** and show 10-minute historical graphs (optional Phase 2)

---

## Visual Design Specification

### Color System (Exact Hex Values)
```
Background:    #0A0F1A (near-black)
Panel BG:      #111827 (dark blue-gray)
Secondary BG:  #0F172A (darker blue)
Border:        #1F2937 (medium gray)

Primary Accent:    #22D3EE (bright cyan)
Secondary Accent:  #8B5CF6 (purple)
Success:           #22C55E (bright green)
Warning:           #F59E0B (amber)
Error:             #EF4444 (red)

Text Primary:  #E5E7EB (light gray)
Text Muted:    #94A3B8 (medium gray)
Text Subtle:   #64748B (dark gray)
```

### Typography
- **Font Stack:** System fonts (SF Pro Display on macOS, Segoe UI on Windows)
- **Sizes:** 11px (xs) → 12px (sm) → 14px (base) → 16px (lg) → 20-24px (headings)
- **Font Weight:** 400 (normal) | 500 (medium) | 600 (semibold) | 700 (bold)
- **Line Height:** 1.2 (tight) | 1.4 (normal) | 1.6 (relaxed)

### Spacing System
- **Grid Unit:** 8px
- **Scale:** 4px (xs) → 8px (sm) → 12px (md) → 16px (lg) → 24px (xl) → 32px (2xl) → 48px (3xl)
- **Padding:** md for cards, lg for sections, xl for major gaps
- **Gaps:** md between items, lg between groups

### Border Radius
- Subtle: 4px (buttons, small elements)
- Standard: 6-8px (cards, panels)
- Large: 12px (modal dialogs)
- Circle: 50% (avatar badges)

### Shadows
- Subtle: 0 1px 2px rgba(0,0,0,0.3)
- Medium: 0 4px 6px rgba(0,0,0,0.4)
- Large: 0 10px 15px rgba(0,0,0,0.5)
- Inner: inset 0 1px 2px rgba(0,0,0,0.3)

### Transitions
- Fast: 100ms (hover states, micro-interactions)
- Base: 150ms (standard transitions)
- Slow: 200ms (modals, major layout shifts)

---

## Keyboard Shortcuts (Power User Workflow)

| Keys | Action |
|------|--------|
| Ctrl+K / Cmd+K | Focus command search |
| Ctrl+A / Cmd+A | Toggle approvals panel |
| Ctrl+L / Cmd+L | Toggle activity feed |
| Ctrl+1-7 / Cmd+1-7 | Jump to view (1=Command, 2=Missions, etc.) |
| Enter | Approve selected approval |
| Shift+Enter | Deny selected approval |
| Esc | Close modal, deselect item |
| ? (Help) | Show keyboard shortcuts |

---

## Implementation Phases

### Phase 1: Core Foundation (Sprint 1, ~1 week)
**Deliverables:**
- [ ] Project setup (Vite + React + TypeScript)
- [ ] Design token system (CSS variables)
- [ ] Layout grid (TopBar, LeftNav, MainContent, ApprovalsPanel, ActivityFeed)
- [ ] Zustand store (basic UI state)
- [ ] API client + mock endpoints
- [ ] MissionCard & AgentCard components (styled, not interactive)

**Metrics:**
- Empty state rendering
- 0 console errors
- Mobile responsive (768px breakpoint)

---

### Phase 2: Feature Implementation (Sprint 1-2, ~2 weeks)
**Deliverables:**
- [ ] Mission Pipeline Board (6-stage Kanban)
- [ ] Agent Status Grid (9 cards, real agent data)
- [ ] System Health Summary (4 metrics)
- [ ] Live Activity Feed (scroll + filter)
- [ ] Approvals Panel (list + approve/deny buttons)
- [ ] Command Search Input (client-side filtering)
- [ ] Navigation Rail (view switching)

**Metrics:**
- Real data flowing from API mock
- WebSocket connection (mock events)
- All keyboard shortcuts working
- <100ms interaction latency on 2G throttled

---

### Phase 3: Polish & Real-Time (Sprint 2-3, ~1.5 weeks)
**Deliverables:**
- [ ] WebSocket integration (real events)
- [ ] Drag-and-drop mission cards
- [ ] Right-click context menus
- [ ] Modal dialogs (mission/agent detail, approval action)
- [ ] Error boundaries & error states
- [ ] Loading skeletons
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance optimization (code splitting, lazy loading)
- [ ] Responsive design (desktop, tablet, mobile)

**Metrics:**
- Lighthouse score >90 (performance, accessibility)
- Real-time updates <100ms latency
- 0 accessibility violations (Level AA)
- <50KB JS bundle (with lazy loading)

---

### Phase 4: Deployment & Monitoring (Sprint 3, ~1 week)
**Deliverables:**
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Environment configuration (.env management)
- [ ] Docker containerization
- [ ] Error monitoring (Sentry/LogRocket)
- [ ] Analytics (Google Analytics 4)
- [ ] Deployment runbook
- [ ] User documentation

**Metrics:**
- 99.9% uptime
- <500ms TTFB (time to first byte)
- Real-time sync latency <200ms

---

## Component Checklist (Implementation Order)

### Priority 1: Layout Foundation
- [ ] MissionControl (root layout)
- [ ] TopCommandBar
- [ ] LeftNavigationRail
- [ ] MainContentArea (view router)
- [ ] ApprovalsPanel
- [ ] LiveActivityFeed

### Priority 2: Data Display
- [ ] MissionPipelineBoard
- [ ] MissionCard
- [ ] AgentStatusGrid
- [ ] AgentCard
- [ ] SystemHealthSummary
- [ ] ActivityEntry (list item)

### Priority 3: Interaction
- [ ] CommandSearchInput
- [ ] ApprovalItem
- [ ] ContextMenu
- [ ] Modal wrapper
- [ ] Tooltip

### Priority 4: Utils & Polish
- [ ] Skeleton loaders
- [ ] Error boundary
- [ ] Toast notifications
- [ ] Keyboard shortcut handler
- [ ] WebSocket manager

---

## CSS Architecture

### File Organization
```
src/styles/
├── tokens.css              # Design tokens (colors, spacing, typography, z-index)
├── layout.module.css       # Layout components (grid, nav, panels)
└── components.module.css   # Feature components (cards, badges, buttons)
```

### Token Usage Pattern
```css
.my_component {
  background: var(--color-bg-secondary);
  padding: var(--space-lg);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.my_component:hover {
  background: rgba(34, 211, 238, 0.05);
  border-color: var(--color-accent-primary);
}
```

### No Framework Dependencies
- ✅ Pure CSS Modules (NO Tailwind, Styled Components, or CSS-in-JS)
- ✅ Design tokens via CSS custom properties
- ✅ BEM naming convention for clarity
- ✅ Responsive queries (max-width breakpoints)
- ✅ Reduced-motion & print media support

---

## Performance Targets

### Bundle Size
- JS (gzipped): <50KB
- CSS (gzipped): <15KB
- Images/Assets: <5MB total

### Runtime Performance
- First Paint: <1.5s (on 3G)
- Time to Interactive: <2.5s
- Mission card render: <16ms (60 FPS)
- Agent card render: <16ms
- Approval action latency: <100ms

### Network
- WebSocket latency: <100ms
- API response time: <200ms (p95)
- Real-time event propagation: <500ms (end-to-end)

### Memory
- Bundle gzip: <50KB
- Memory usage: <80MB (Chrome DevTools)
- Scroll smoothness: 60 FPS (no jank)

---

## Testing Strategy

### Unit Tests (Vitest)
- Store actions (mutations, selectors)
- Utility functions (format, debounce, etc.)
- Component rendering (with props variations)
- Event handlers (keyboard shortcuts, clicks)

**Coverage Target:** >80% lines, >75% branches

### Integration Tests
- Data flow (store → components → API)
- WebSocket event handling
- View switching & navigation
- Approval workflow (pending → approved/denied)

### E2E Tests (Playwright)
- Command palette search
- Mission card drag-and-drop
- Approval approve/deny action
- Keyboard shortcuts
- Real-time activity feed updates

**Test Structure:**
```
tests/
├── unit/
│   ├── stores.test.ts
│   ├── hooks.test.ts
│   └── utils.test.ts
├── integration/
│   ├── mission-pipeline.test.ts
│   ├── agent-grid.test.ts
│   └── approvals.test.ts
└── e2e/
    ├── workflow.spec.ts
    ├── keyboard-shortcuts.spec.ts
    └── real-time-updates.spec.ts
```

---

## Deployment Architecture

### Environments
- **Development:** `http://localhost:3000` (dev server)
- **Staging:** `https://staging-mission-control.your-domain.com`
- **Production:** `https://mission-control.your-domain.com`

### Environment Variables
```env
# .env.development
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=ws://localhost:3001/ws

# .env.production
REACT_APP_API_URL=https://api.your-domain.com/api
REACT_APP_WS_URL=wss://api.your-domain.com/ws
REACT_APP_SENTRY_DSN=https://...
REACT_APP_GA_TRACKING_ID=G-...
```

### Docker Deployment
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci && npm run build

FROM node:18-alpine
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

### Infrastructure
- **CDN:** CloudFlare / AWS CloudFront
- **Origin:** nginx reverse proxy
- **SSL:** Let's Encrypt (auto-renew)
- **Caching:** 1h for index.html, 1y for assets
- **Monitoring:** Sentry (errors), DataDog (performance)

---

## Success Metrics

### User Experience
- Time to view command center: <1.5s (LCP)
- Keyboard shortcut latency: <50ms
- Approval action latency: <100ms
- Real-time event propagation: <200ms
- Scroll smoothness: 60 FPS (no jank)

### Business
- Agent uptime visibility: 100% (real-time)
- Mission completion tracking accuracy: 100%
- Approval response time: <2 minutes (95th percentile)
- System health alert accuracy: >99%

### Quality
- Test coverage: >80% lines
- Lighthouse score: >90 (all categories)
- WCAG 2.1 AA compliance: 100%
- Production errors: <1 per 10k sessions

---

## Known Limitations & Future Enhancements

### Phase 1 (Current)
- Mission detail modal (basic)
- No mission history view
- No agent log streaming
- No approval audit trail

### Phase 2 (Next Quarter)
- [ ] Historical charts (CPU, memory trends)
- [ ] Custom filter save/load
- [ ] Bulk approval actions
- [ ] Mission replay/rerun
- [ ] Agent performance analytics
- [ ] Skills marketplace (install/deploy)

### Phase 3 (Roadmap)
- [ ] Dark mode toggle (currently forced dark)
- [ ] Multi-user collaboration (locks, presence)
- [ ] Workflow templates (quick-start missions)
- [ ] Mobile app (native iOS/Android)
- [ ] Voice commands (Alexa/Google Home)

---

## File Summary

| File | Purpose |
|------|---------|
| README.md | Project overview & setup |
| ARCHITECTURE.md | Data model, state shape, API contracts |
| COMPONENTS.md | Component definitions & TypeScript signatures |
| STYLES.md | Design tokens, CSS modules, responsive rules |
| IMPLEMENTATION.md | Build guide, project structure, deployment |
| FRONTEND-IMPLEMENTATION-PLAN.md | This file; complete execution blueprint |

---

## Quick Start

```bash
# Clone and setup
git clone <repo>
cd mission-control
npm install

# Development
npm run dev          # http://localhost:3000
npm run dev:vite    # With Vite in debug mode

# Testing
npm run test        # Unit tests
npm run test:e2e   # E2E tests
npm run test:cov   # Coverage report

# Production
npm run build       # Output: dist/
npm run preview     # Preview build
npm run serve       # Serve with http-server

# Deployment
npm run deploy:staging
npm run deploy:prod
```

---

**Status:** Implementation-ready | Last Updated: 2026-03-25 | Owner: Davinci (Frontend Specialist)
