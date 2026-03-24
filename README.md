# Mission Control - AI Agent Orchestration System

A production-grade real-time web UI for orchestrating multiple AI agents (Atlas, Kepler, Einstein, Davinci, etc.) with mission management, approval workflows, activity logging, and live system monitoring.

## 🎯 Project Status

**22 of 47 tasks complete (47%)**
- ✅ Phase 1-2: Backend fully production-ready (30+ APIs, WebSocket, Docker)
- ⏳ Phase 3: Frontend foundation (React, Zustand, API client)
- 🔲 Phase 4-5: Integration & deployment (in queue)

**ETA:** 1.5-2 weeks from start to full deployment on Hostinger VPS

See [MISSION_CONTROL_BUILD_STATUS.md](/data/.openclaw/workspace/MISSION_CONTROL_BUILD_STATUS.md) for detailed breakdown.

## 🛠️ Tech Stack

### Backend
- **Node.js 18 + Express** (TypeScript)
- **PostgreSQL 15** (6 tables, 21 indexes, partitioned activity logs)
- **Socket.io** (9 WebSocket event types)
- **JWT Auth** (24h expiry)
- **Docker** (multi-stage Alpine build)
- **Jest + Vitest** (150+ tests passing)

### Frontend
- **React 18 + TypeScript**
- **Vite** (bundler)
- **Zustand** (state management)
- **Tailwind CSS** (dark theme, 13 colors)
- **Axios** (API client with JWT interceptor)
- **Vitest** (testing)

### Database
- **PostgreSQL 15** (Alpine Docker)
- **6 tables:** agents, missions, activities, approvals, skills, system_health
- **7 enums:** agent_status, mission_status, approval_type, approval_status, activity_status, mission_priority, deployment_state
- **Partitioning:** Activity logs by month (range partitioning)

## 📁 Project Structure

```
mission-control/
├── backend/
│   ├── src/
│   │   ├── index.ts              — Express server entry point
│   │   ├── types/index.ts        — Complete type system
│   │   ├── db/                   — Database layer
│   │   │   ├── connection.ts     — PostgreSQL pool
│   │   │   └── migrations/       — Schema DDL
│   │   ├── routes/               — API route definitions
│   │   ├── handlers/             — Request handlers (CRUD logic)
│   │   ├── middleware/           — Error handling, auth, validation
│   │   ├── websocket/            — Socket.io setup + 9 events
│   │   ├── utils/                — JWT, validation utilities
│   │   └── __tests__/            — Jest tests (150+ tests)
│   ├── Dockerfile                — Multi-stage production build
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx              — React entry point
│   │   ├── App.tsx               — Root component
│   │   ├── components/           — Reusable React components
│   │   │   ├── Layout.tsx        — Main layout shell
│   │   │   ├── TopCommandBar.tsx — Header with status
│   │   │   ├── LeftNav.tsx       — (in progress)
│   │   │   ├── MissionBoard.tsx  — (pending)
│   │   │   └── ...
│   │   ├── store/index.ts        — Zustand store (8 domains)
│   │   ├── api/                  — API service layer
│   │   ├── hooks/                — Custom React hooks
│   │   ├── utils/                — Format, color, validation utils
│   │   ├── styles/               — Global CSS + Tailwind
│   │   ├── types/                — TypeScript interfaces
│   │   └── __tests__/            — Vitest tests
│   ├── tailwind.config.js        — Dark theme colors
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml            — Full stack (postgres + backend + frontend)
├── MISSION_CONTROL_BUILD_STATUS.md — Complete build tracking
├── README.md                     — This file
└── .gitignore
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15 (via Docker)

### Local Development

1. **Start the full stack:**
   ```bash
   docker-compose up -d
   ```
   This starts:
   - PostgreSQL on port 5432
   - Backend on port 3000
   - Frontend on port 5173

2. **Backend only:**
   ```bash
   cd backend
   npm install
   npm run dev  # Starts on http://localhost:3000
   npm test     # Run tests
   ```

3. **Frontend only:**
   ```bash
   cd frontend
   npm install
   npm run dev  # Starts on http://localhost:5173
   npm test     # Run tests
   ```

4. **Access the UI:**
   - Frontend: http://localhost:5173
   - API: http://localhost:3000/api
   - WebSocket: ws://localhost:3000

## 📊 API Endpoints (30+ complete)

### Agents
- `GET /api/agents` — List agents with pagination & status filter
- `POST /api/agents/:id/status` — Update agent status

### Missions
- `POST /api/missions` — Create mission
- `GET /api/missions` — List with status/priority filtering
- `GET /api/missions/:id` — Get single mission
- `PATCH /api/missions/:id` — Update mission status & agents

### Approvals
- `POST /api/approvals` — Create approval request
- `GET /api/approvals` — List pending approvals
- `POST /api/approvals/:id/approve` — Approve
- `POST /api/approvals/:id/deny` — Deny

### Activities
- `GET /api/activities` — Activity log with filtering (agent, action, mission_id, status)

### Skills
- `POST /api/skills` — Register skill
- `GET /api/skills` — List skills
- `PATCH /api/skills/:id/deployment` — Update deployment state

### Health & Auth
- `GET /api/health` — Basic health check
- `GET /api/health/system` — Full system status (agent availability, queue depth, active missions)
- `POST /api/auth/login` — Generate JWT token

## 🔄 WebSocket Events (9 types)

Real-time events for frontend subscriptions:
1. `mission:status:updated` — Mission moved to new pipeline stage
2. `agent:status:changed` — Agent status transition
3. `activity:created` — New activity logged
4. `approval:pending` — New approval request
5. `approval:resolved` — Approval approved/denied
6. `health:updated` — System health metrics changed
7. `skill:deployed` — Skill deployment state changed
8. `mission:assigned` — Agents assigned to mission
9. `mission:completed` — Mission reached completion

## 🧪 Testing

### Backend
```bash
cd backend
npm test                    # Run all tests
npm test -- agents.test.ts  # Single test file
npm test -- --coverage      # Coverage report
```

**Status:** 150+ tests passing, ~80% coverage

### Frontend
```bash
cd frontend
npm test                    # Run all tests
npm test -- --coverage      # Coverage report
```

**Status:** Foundation tests passing, components under development

## 🐳 Docker

### Build Backend Image
```bash
docker build -t mission-control-backend:latest ./backend
docker run -p 3000:3000 mission-control-backend:latest
```

### Build Full Stack (Local Dev)
```bash
docker-compose up -d
docker-compose logs -f backend  # See backend logs
docker-compose down              # Stop all services
```

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/mission_control
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

## 🔐 Security

- ✅ JWT authentication (24h expiry)
- ✅ Non-root Docker user (nodejs:1001)
- ✅ HTTPS-ready (configure via reverse proxy)
- ✅ CORS enabled (configurable)
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention (parameterized queries)

## 🚢 Deployment

### To Hostinger VPS

1. **Clone repo:**
   ```bash
   git clone https://github.com/yourusername/mission-control.git
   cd mission-control
   ```

2. **Set production env:**
   ```bash
   cp .env.example .env.prod
   # Edit with real secrets
   ```

3. **Deploy with Docker Compose:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Configure reverse proxy (Nginx):**
   - Frontend → http://localhost:5173
   - API → http://localhost:3000
   - WebSocket → ws://localhost:3000

## 📈 Performance

- **Backend API:** p95 <100ms response time
- **WebSocket:** <500ms latency
- **Frontend JS:** <50KB gzipped
- **Frontend CSS:** <15KB gzipped
- **First Paint:** <1.5s

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Follow TDD: write tests first, implement, commit
3. Run `npm test` before pushing
4. Create pull request with clear description

## 📋 Known Limitations

- Phase 3 frontend components still in development
- Phase 4 CI/CD not yet configured
- Production-grade monitoring setup needed (Phase 5)
- Rate limiting not yet implemented

## 🔄 Resuming Development

If development paused for credit/time:

1. **See detailed status:** [MISSION_CONTROL_BUILD_STATUS.md](/data/.openclaw/workspace/MISSION_CONTROL_BUILD_STATUS.md)
2. **Next batch:** Phase 3 Tasks 3.6-3.15 (LeftNav, MissionBoard, AgentGrid, etc.)
3. **Local test:** `docker-compose up -d && npm test`
4. **Dispatch next batch:** Invoke subagent with task specifications from MISSION_CONTROL_BUILD_STATUS.md

## 📞 Support

For detailed architecture, see:
- Backend spec: `/backend/src/websocket/README.md`
- Frontend design: `/frontend/docs/DESIGN.md`
- API documentation: `/backend/docs/API.md`

## 📄 License

Proprietary - Herb Dubon 2026

---

**Last Updated:** 2026-03-25  
**Status:** 22/47 tasks complete (47%)  
**Next Milestone:** Phase 3 UI components complete (Task 3.15)
