# Mission Control Build Plan
**Date:** 2026-03-25  
**Duration:** 2-3 weeks (full sprint)  
**Tech Stack:** Node.js + Express (backend) | React + TypeScript (frontend) | PostgreSQL (Docker)  
**Deployment:** Docker Compose → Hostinger VPS  

---

## Phase 1: Backend Foundation (Days 1-4)

### Task 1.1: Project Setup & Dependencies
**Goal:** Bootstrap Node.js + Express project with TypeScript & testing  
**Time:** 2-3 min  
**TDD:** Write package.json test script first; verify `npm test` works  
**Output:** `/backend` folder with:
- `package.json` (Express, TypeScript, Jest, ts-node, dotenv)
- `tsconfig.json`
- `.env` template (DB_URL, PORT, JWT_SECRET, etc.)
- `src/index.ts` entry point (basic server start test)
- `jest.config.js`

**Verification:**
```bash
npm test  # All tests pass
npm run dev  # Server starts on port 3000
```

---

### Task 1.2: Database Models Layer
**Goal:** Create TypeScript interfaces for all 6 data models  
**Time:** 3-4 min  
**TDD:** Write interfaces first, then test they compile  
**Output:** `src/types/index.ts`
```typescript
// Enums + Interfaces for:
// - Agent (id, name, role, model, status, current_task, last_completed_task, last_updated)
// - Mission (id, title, category, created_at, status, assigned_agents, approval_required, priority, summary, details)
// - ActivityLog (id, timestamp, agent, action, target, status, details)
// - Approval (id, mission_id, type, requested_by, status, requested_at, resolved_at, resolver)
// - Skill (id, name, version, owner, deployment_state, updated_at)
// - SystemHealth (agent_availability, queue_depth, last_heartbeat, active_missions_count)
```

**Verification:**
```bash
npm test -- types.test.ts  # All type tests pass
```

---

### Task 1.3: PostgreSQL Connection Pool
**Goal:** Set up TypeScript-safe database connection using pg  
**Time:** 3-4 min  
**TDD:** Write test that connects to Docker PostgreSQL and queries version  
**Output:** `src/db/connection.ts`
- Connection pool initialization
- Error handling
- Connection test endpoint (`GET /api/health`)

**Verification:**
```bash
docker run -d --name mission-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15
npm test -- db.test.ts  # Connection test passes
curl http://localhost:3000/api/health  # Returns { status: 'ok', db: 'connected' }
```

---

### Task 1.4: Database Schema (DDL)
**Goal:** Create PostgreSQL schema from Iris spec  
**Time:** 4-5 min  
**TDD:** Write migration file + test that schema creates successfully  
**Output:** `src/db/migrations/001-init-schema.sql`
- All 6 tables with exact column types & enums
- Foreign keys
- Indexes (from Iris spec)
- Partitioning for activity_logs (by month)

**Verification:**
```bash
npm run migrate  # Schema creation test passes
psql postgres -h localhost -U postgres -c "\\dt"  # Shows all 6 tables
```

---

### Task 1.5: Agent Registry API (Read)
**Goal:** First full API endpoint: GET /api/agents  
**Time:** 3-4 min  
**TDD:** Test-first: write Jest test expecting agent list, then implement  
**Output:** `src/routes/agents.ts` + `src/handlers/agentHandler.ts`
- GET /api/agents → returns all agents with status
- Pagination support (limit, offset)
- Filter by status (idle, running, waiting, completed, failed)

**Verification:**
```bash
npm test -- agents.test.ts  # All tests pass
curl http://localhost:3000/api/agents  # Returns { agents: [], total: 0 }
```

---

### Task 1.6: Agent Status Update API
**Goal:** POST endpoint to update agent status  
**Time:** 2-3 min  
**TDD:** Test agent status transitions (idle → running → completed)  
**Output:** `src/handlers/agentHandler.ts` → POST /api/agents/:id/status
- Update agent status
- Auto-timestamp last_updated
- Log to activity_logs table

**Verification:**
```bash
npm test -- agents.test.ts  # Status update tests pass
curl -X POST http://localhost:3000/api/agents/kepler/status -d '{"status":"running"}'
```

---

### Task 1.7: Mission CRUD APIs
**Goal:** Create, read, update missions (foundation for pipeline)  
**Time:** 4-5 min  
**TDD:** Test full CRUD lifecycle  
**Output:** `src/routes/missions.ts` + `src/handlers/missionHandler.ts`
- POST /api/missions → create
- GET /api/missions → list (with status filter: intake, routed, in_progress, review, awaiting_approval, completed)
- GET /api/missions/:id → read single
- PATCH /api/missions/:id → update status
- Auto-assign to agents based on category

**Verification:**
```bash
npm test -- missions.test.ts  # All CRUD tests pass
```

---

### Task 1.8: Approval Gates API
**Goal:** Core safety system: track + enforce approvals  
**Time:** 4-5 min  
**TDD:** Test approval workflow (pending → approved/denied → resolved)  
**Output:** `src/routes/approvals.ts` + `src/handlers/approvalHandler.ts`
- POST /api/approvals → create approval request
- GET /api/approvals → list pending
- POST /api/approvals/:id/approve → approve
- POST /api/approvals/:id/deny → deny
- Approval required gates: production, destructive, external, integration, skill

**Verification:**
```bash
npm test -- approvals.test.ts  # Approval workflow tests pass
```

---

### Task 1.9: Activity Logging API
**Goal:** Immutable audit trail  
**Time:** 3-4 min  
**TDD:** Test logging for every action (mission created, agent started, approval approved, etc.)  
**Output:** `src/routes/activity.ts` + `src/handlers/activityHandler.ts`
- POST /api/activities → log action (internal, not external)
- GET /api/activities → paginated activity feed (searchable by agent, action, mission)
- Partition by month for performance

**Verification:**
```bash
npm test -- activity.test.ts  # Logging tests pass
```

---

### Task 1.10: System Health Monitoring API
**Goal:** Real-time system status  
**Time:** 2-3 min  
**TDD:** Test agent availability + queue depth calculation  
**Output:** `src/routes/health.ts` + `src/handlers/healthHandler.ts`
- GET /api/health → system overview
- GET /api/health/agents → agent availability map
- GET /api/health/queue → active missions count + queue depth

**Verification:**
```bash
npm test -- health.test.ts  # Health monitoring tests pass
curl http://localhost:3000/api/health
```

---

## Phase 2: Backend Real-Time & Polish (Days 5-7)

### Task 2.1: WebSocket Setup
**Goal:** Real-time event broadcasting  
**Time:** 3-4 min  
**TDD:** Test WebSocket connection + message broadcast  
**Output:** `src/websocket/index.ts`
- Socket.io or ws library initialization
- Connection pooling
- Event broadcast handlers
- Reconnection with exponential backoff

**Verification:**
```bash
npm test -- websocket.test.ts  # WebSocket tests pass
```

---

### Task 2.2: WebSocket Events
**Goal:** Broadcast 9 event types (from Iris spec)  
**Time:** 4-5 min  
**TDD:** Test each event emission  
**Output:** `src/websocket/events.ts`
- mission:status:updated
- agent:status:changed
- activity:created
- approval:pending
- approval:resolved
- health:updated
- skill:deployed
- mission:assigned
- mission:completed

**Verification:**
```bash
npm test -- websocket-events.test.ts  # Event emission tests pass
```

---

### Task 2.3: Skill Registry API
**Goal:** Track skills and deployment state  
**Time:** 3-4 min  
**TDD:** Test CRUD for skills  
**Output:** `src/routes/skills.ts` + `src/handlers/skillHandler.ts`
- GET /api/skills → all skills
- POST /api/skills → register new skill
- PATCH /api/skills/:id → update deployment state (development → staging → production)

**Verification:**
```bash
npm test -- skills.test.ts  # Skill CRUD tests pass
```

---

### Task 2.4: Error Handling & Validation
**Goal:** Standardized error responses  
**Time:** 3-4 min  
**TDD:** Test error response format for all error types  
**Output:** `src/middleware/errorHandler.ts` + `src/utils/validation.ts`
- Error boundary middleware
- Input validation (Zod or Joi)
- Standard error response format
- HTTP status code mapping

**Verification:**
```bash
npm test -- errors.test.ts  # All error tests pass
```

---

### Task 2.5: Authentication Middleware (Basic)
**Goal:** Simple JWT auth for agents  
**Time:** 3-4 min  
**TDD:** Test JWT generation + verification  
**Output:** `src/middleware/auth.ts` + `src/utils/jwt.ts`
- JWT secret from .env
- Token generation for agents
- Token verification middleware
- Agent identity extraction from token

**Verification:**
```bash
npm test -- auth.test.ts  # Auth tests pass
```

---

### Task 2.6: Full Integration Test
**Goal:** End-to-end backend test (mission creation → approval → completion)  
**Time:** 4-5 min  
**TDD:** Complete workflow test  
**Output:** `src/__tests__/integration.test.ts`
- Create mission
- Assign agents
- Trigger approval
- Complete mission
- Verify activity log

**Verification:**
```bash
npm test -- integration.test.ts  # Full workflow test passes
```

---

### Task 2.7: Docker Backend Container
**Goal:** Containerize backend for deployment  
**Time:** 2-3 min  
**Output:** `Dockerfile` (backend) + `.dockerignore`
- Multi-stage build
- Node 18+
- Production-ready

**Verification:**
```bash
docker build -t mission-control-backend .
docker run -p 3000:3000 mission-control-backend
curl http://localhost:3000/api/health
```

---

## Phase 3: Frontend Foundation (Days 8-11)

### Task 3.1: React Project Setup
**Goal:** Bootstrap React + TypeScript + Zustand  
**Time:** 2-3 min  
**TDD:** Write Jest test for basic component render  
**Output:** `frontend/` folder with:
- `package.json` (React 18, TypeScript, Zustand, Axios, Jest, Testing Library)
- `tsconfig.json`
- `.env` template (VITE_API_URL, VITE_WS_URL)
- `src/main.tsx` entry point
- `src/App.tsx` with routing setup

**Verification:**
```bash
npm test  # All tests pass
npm run dev  # App starts on port 5173
```

---

### Task 3.2: Store Setup (Zustand)
**Goal:** Global state management  
**Time:** 3-4 min  
**TDD:** Test store creation + actions  
**Output:** `src/store/index.ts`
- 8 store domains: agents, missions, activities, approvals, skills, health, ui, auth
- 15+ actions (dispatch mission, update agent status, etc.)
- Hydration from localStorage

**Verification:**
```bash
npm test -- store.test.ts  # Store tests pass
```

---

### Task 3.3: API Client Setup
**Goal:** Axios wrapper + interceptors  
**Time:** 2-3 min  
**TDD:** Test API call success + error handling  
**Output:** `src/api/client.ts`
- Base URL from env
- JWT token injection
- Error interceptor
- Retry logic

**Verification:**
```bash
npm test -- api.test.ts  # API client tests pass
```

---

### Task 3.4: Layout Component (Shell)
**Goal:** Main layout structure  
**Time:** 3-4 min  
**TDD:** Test layout renders all 7 sections  
**Output:** `src/components/Layout.tsx` + `src/components/Layout.module.css`
- Top command bar
- Left navigation rail
- Main content area
- Approvals panel (right)
- Activity feed (right bottom)
- CSS Grid layout with exact colors

**Verification:**
```bash
npm test -- Layout.test.tsx  # Layout renders all sections
```

---

### Task 3.5: Top Command Bar Component
**Goal:** Header with system status  
**Time:** 2-3 min  
**TDD:** Test displays title, status, approvals count, models  
**Output:** `src/components/TopCommandBar.tsx` + styling
- Mission Control title
- Environment indicator
- System status (● green/yellow/red)
- Pending approvals badge
- Active models summary
- Command/search input

**Verification:**
```bash
npm test -- TopCommandBar.test.tsx  # All elements render
```

---

### Task 3.6: Left Navigation Rail
**Goal:** Sidebar navigation  
**Time:** 2-3 min  
**TDD:** Test navigation links render + click handlers  
**Output:** `src/components/LeftNav.tsx` + styling
- Command Center
- Missions
- Agents
- Activity
- Approvals
- Skills
- Settings
- Active state indication

**Verification:**
```bash
npm test -- LeftNav.test.tsx  # Nav links render + click
```

---

### Task 3.7: Agent Status Card Component
**Goal:** Individual agent display  
**Time:** 3-4 min  
**TDD:** Test card renders all agent fields + status badge styling  
**Output:** `src/components/AgentCard.tsx` + `AgentCard.module.css`
- Agent name + emoji/icon
- Role label
- Model (GPT 5.4, Claude Sonnet 4.5, etc.)
- Status badge (color-coded: idle=gray, running=cyan, waiting=amber, completed=green, failed=red)
- Current task (truncated)
- Last completed task

**Verification:**
```bash
npm test -- AgentCard.test.tsx  # Card renders all fields + colors
```

---

### Task 3.8: Agent Status Grid
**Goal:** 9 agent cards in responsive grid  
**Time:** 2-3 min  
**TDD:** Test grid renders 9 agent cards  
**Output:** `src/components/AgentGrid.tsx` + `AgentGrid.module.css`
- CSS Grid (3x3 on desktop, 1x9 on mobile)
- Connects to store.agents
- Real-time updates via WebSocket

**Verification:**
```bash
npm test -- AgentGrid.test.tsx  # 9 cards render in grid
```

---

### Task 3.9: Mission Card Component
**Goal:** Individual mission in pipeline  
**Time:** 3-4 min  
**TDD:** Test card renders mission fields + draggable  
**Output:** `src/components/MissionCard.tsx` + `MissionCard.module.css`
- Mission title
- Category badge
- Status badge
- Assigned agents (avatars)
- Priority indicator
- Approval required (🔒 if yes)
- Drag handle

**Verification:**
```bash
npm test -- MissionCard.test.tsx  # Card renders + draggable
```

---

### Task 3.10: Mission Pipeline Board
**Goal:** Kanban-style 6-stage mission board  
**Time:** 4-5 min  
**TDD:** Test board renders 6 columns + drag-drop between columns  
**Output:** `src/components/MissionBoard.tsx` + `MissionBoard.module.css`
- 6 columns: Intake, Routed, In Progress, Review, Awaiting Approval, Completed
- Cards in columns via store.missions filtered by status
- Drag-drop mission between columns
- Real-time updates

**Verification:**
```bash
npm test -- MissionBoard.test.tsx  # 6 columns + drag-drop works
```

---

## Phase 4: Frontend Components & Real-Time (Days 12-16)

### Task 4.1: Activity Feed Component
**Goal:** Live scrolling activity log  
**Time:** 3-4 min  
**TDD:** Test feed renders activities + auto-scrolls new items  
**Output:** `src/components/ActivityFeed.tsx` + `ActivityFeed.module.css`
- Timestamp + agent + action + status + mission reference
- Paginated (infinite scroll)
- Real-time new entries append to top
- Color-coded by action type

**Verification:**
```bash
npm test -- ActivityFeed.test.tsx  # Feed renders + auto-scrolls
```

---

### Task 4.2: Approvals Panel Component
**Goal:** Approval request management  
**Time:** 3-4 min  
**TDD:** Test panel renders approvals + approve/deny buttons work  
**Output:** `src/components/ApprovalsPanel.tsx` + `ApprovalsPanel.module.css`
- List of pending approvals
- Approval type badge (production, destructive, external, integration, skill)
- Mission reference
- Approve button (green #22C55E)
- Deny button (red #EF4444)
- Requested by + timestamp

**Verification:**
```bash
npm test -- ApprovalsPanel.test.tsx  # Panel renders + buttons work
```

---

### Task 4.3: System Health Summary
**Goal:** System status dashboard  
**Time:** 2-3 min  
**TDD:** Test displays health metrics  
**Output:** `src/components/SystemHealth.tsx` + `SystemHealth.module.css`
- Agent availability count (8/9 online)
- Queue depth (45 missions)
- Last heartbeat (2s ago)
- Active missions count
- Overall system status (● green/yellow/red)

**Verification:**
```bash
npm test -- SystemHealth.test.tsx  # Health metrics render
```

---

### Task 4.4: Skill Registry Component
**Goal:** Skill browsing + deployment state  
**Time:** 2-3 min  
**TDD:** Test renders skills + state badges  
**Output:** `src/components/SkillRegistry.tsx` + `SkillRegistry.module.css`
- Skill name + version
- Owner (agent name)
- Deployment state badge (development=gray, staging=amber, production=green)
- Last updated timestamp
- List view + pagination

**Verification:**
```bash
npm test -- SkillRegistry.test.tsx  # Skills render + states show
```

---

### Task 4.5: WebSocket Integration
**Goal:** Connect React to backend real-time events  
**Time:** 4-5 min  
**TDD:** Test WebSocket connection + message handling  
**Output:** `src/api/websocket.ts` + `src/hooks/useWebSocket.ts`
- Socket.io or ws connection to backend
- Event listeners: mission:status:updated, agent:status:changed, activity:created, approval:pending, etc.
- Auto-dispatch to store when events arrive
- Reconnection logic

**Verification:**
```bash
npm test -- websocket.test.ts  # WS connection + events dispatch to store
```

---

### Task 4.6: Custom Hooks
**Goal:** Reusable data fetching + local state patterns  
**Time:** 4-5 min  
**TDD:** Test hooks data fetching + caching  
**Output:** `src/hooks/`
- `useStore` — Zustand store access
- `useAsync` — Data fetching with loading/error
- `useQuery` — React Query integration
- `usePagination` — Pagination state
- `useLocalStorage` — Persist UI state
- `useRealTime` — Real-time subscription pattern
- `useKeyboard` — Keyboard shortcuts (Ctrl+K for search)

**Verification:**
```bash
npm test -- hooks.test.ts  # All hooks work correctly
```

---

### Task 4.7: Views/Pages Setup
**Goal:** Routing to 7 main views  
**Time:** 3-4 min  
**TDD:** Test routing between views  
**Output:** `src/views/` with 7 pages:
- `CommandCenterView.tsx`
- `MissionsView.tsx`
- `AgentsView.tsx`
- `ActivityView.tsx`
- `ApprovalsView.tsx`
- `SkillsView.tsx`
- `SettingsView.tsx`

**Verification:**
```bash
npm test -- routing.test.ts  # All routes work
```

---

### Task 4.8: Modals & Dialogs
**Goal:** Create mission / approve action UIs  
**Time:** 3-4 min  
**TDD:** Test modals open/close + form submission  
**Output:** `src/components/Modals/`
- `CreateMissionModal.tsx` (form: title, category, priority, approval_required)
- `ApproveActionModal.tsx` (confirmation)
- `AgentDetailsModal.tsx` (agent info + task history)

**Verification:**
```bash
npm test -- modals.test.ts  # Modals open/close + submit
```

---

### Task 4.9: Status Badges & Color Utilities
**Goal:** Consistent styling for states  
**Time:** 2-3 min  
**TDD:** Test color functions for all status types  
**Output:** `src/utils/colors.ts` + `src/components/StatusBadge.tsx`
```typescript
// Exported functions:
// statusColor(status) → CSS class or color hex
// priorityColor(priority) → color
// approvalTypeColor(type) → color
// agentModelColor(model) → color
```

**Verification:**
```bash
npm test -- colors.test.ts  # All color mappings work
```

---

### Task 4.10: Docker Frontend Container
**Goal:** Containerize React for deployment  
**Time:** 2-3 min  
**Output:** `Dockerfile` (frontend) + `.dockerignore`
- Multi-stage build (node build → nginx serve)
- Environment variable injection
- Production-ready

**Verification:**
```bash
docker build -t mission-control-frontend .
docker run -p 80:80 mission-control-frontend
# Open http://localhost
```

---

## Phase 5: Integration & Deployment (Days 17-18)

### Task 5.1: Docker Compose (Local Dev)
**Goal:** Full stack in one command  
**Time:** 2-3 min  
**Output:** `docker-compose.yml`
- PostgreSQL (port 5432)
- Backend (port 3000)
- Frontend (port 5173)
- Network + volumes
- Environment setup

**Verification:**
```bash
docker-compose up -d
# Wait 5s
curl http://localhost:3000/api/health
# Browser: http://localhost:5173
```

---

### Task 5.2: End-to-End Test
**Goal:** Full system workflow test  
**Time:** 4-5 min  
**TDD:** Create mission via UI → assign agent → approve → complete → verify activity log  
**Output:** `e2e/full-workflow.test.ts` (Playwright)
- Create mission from modal
- See it appear in pipeline
- Drag to next stage
- Approve if needed
- Complete mission
- Verify in activity feed

**Verification:**
```bash
npm run e2e
# All tests pass
```

---

### Task 5.3: Deployment to Hostinger VPS
**Goal:** Deploy Docker Compose stack to production  
**Time:** 4-5 min  
**Output:** Deployment script + VPS setup docs
- SSH into Hostinger
- Clone repo
- `docker-compose -f docker-compose.prod.yml up -d`
- Verify endpoints
- Set up systemd auto-restart

**Verification:**
```bash
ssh user@hostinger-ip
# Stack running
curl http://mission-control.yourserver.com/api/health
```

---

### Task 5.4: Environment & Secrets Management
**Goal:** Secure configuration  
**Time:** 2-3 min  
**Output:**
- `.env.example` template
- `.env` (ignored in git)
- Production env variables (in systemd service or .env.prod)

**Verification:**
```bash
# All required vars set
source .env
echo $DATABASE_URL  # Not empty
echo $JWT_SECRET    # Not empty
```

---

### Task 5.5: Monitoring & Logging Setup (Optional Polish)
**Goal:** Basic observability  
**Time:** 3-4 min  
**Output:** `src/middleware/logging.ts` + log aggregation setup
- Access logs (incoming requests)
- Error logs (exceptions)
- Activity logs (mission events)
- stdout → syslog or external logger

**Verification:**
```bash
# Logs visible
docker-compose logs backend
docker-compose logs frontend
```

---

### Task 5.6: Final Integration Verification
**Goal:** All components working together  
**Time:** 2-3 min  
**Verification Checklist:**
- [ ] Backend API all 30+ endpoints respond
- [ ] Frontend loads without errors
- [ ] WebSocket real-time updates work
- [ ] Create mission → see in pipeline
- [ ] Agent status changes → reflected in UI
- [ ] Approvals required → block and enforce
- [ ] Activity log shows all actions
- [ ] Docker stack runs on VPS
- [ ] Startup/restart works

---

## Timeline Summary

| Phase | Tasks | Days | Output |
|-------|-------|------|--------|
| 1: Backend Foundation | 1.1-1.10 | 1-4 | 30+ API endpoints, DB schema, real-time ready |
| 2: Backend Real-Time | 2.1-2.7 | 5-7 | WebSocket, full integration test, Docker |
| 3: Frontend Foundation | 3.1-3.10 | 8-11 | Layout, components, state management |
| 4: Frontend & Real-Time | 4.1-4.10 | 12-16 | All 35+ components, WebSocket wiring, hooks |
| 5: Integration & Deploy | 5.1-5.6 | 17-18 | Docker Compose, E2E tests, VPS deployment |

**Total:** 47 tasks, 2-3 weeks, all TDD, fully testable.

---

## Execution Mode Options

**After approval of this plan:**

**Option A: Subagent-Driven (Recommended)**
- I dispatch specialized subagents (Iris for backend, Davinci for frontend)
- Per-task cycle: implement → review spec match → review code quality → fix → proceed
- Faster, parallel execution, guaranteed spec compliance
- Auto-announcement when each task completes

**Option B: Manual Execution**
- You run tasks yourself using this plan as a cookbook
- I'm available for debugging or guidance
- Slower but full control

**Which would you prefer?**
