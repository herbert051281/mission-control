# Mission Control 🎯

Agent Command & Control System — Real-time mission orchestration, agent management, and approval workflow for distributed AI agents.

[![GitHub](https://img.shields.io/badge/github-mission--control-blue)](https://github.com/herbert051281/mission-control)
[![TypeScript](https://img.shields.io/badge/language-typescript-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node-20%2B-green)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/containerization-docker-blue)](https://www.docker.com/)

## Features 🚀

- **Real-time Mission Orchestration** — Kanban-style mission pipeline with 6 stages
- **Multi-Agent Management** — Monitor 9+ concurrent agents with live status
- **Approval Workflow** — Fine-grained approval system for production/destructive actions
- **Activity Feed** — Live system activity log with 100-item capacity
- **Health Monitoring** — Periodic backend health checks with 3-tier status (healthy/degraded/unhealthy)
- **WebSocket Integration** — Real-time event sync (missions, agents, approvals, activities)
- **Dark Theme UI** — Modern, responsive frontend with Tailwind CSS
- **Production-Ready** — Docker, PostgreSQL, Nginx, full-stack orchestration

## Quick Start 🏃

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Docker & Docker Compose (for containerized deployment)

### Local Development

```bash
# Clone repository
git clone https://github.com/herbert051281/mission-control.git
cd mission-control

# Install dependencies
npm install

# Backend setup
cd backend
npm install
npm run build

# Frontend setup
cd ../frontend
npm install

# Start dev servers (from root)
npm run dev

# Backend: http://localhost:3000
# Frontend: http://localhost:5173
# Demo credentials: admin / admin
```

### Docker Deployment

```bash
# Build & start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

## Architecture 📐

```
┌─────────────────────────────────────────────────────┐
│                   MISSION CONTROL                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │          FRONTEND (React + TypeScript)       │  │
│  │  • Pages (7): CommandCenter, Missions, etc.  │  │
│  │  • Components: Layout, Cards, Modals         │  │
│  │  • Hooks: useStore, useWebSocket, etc.       │  │
│  │  • Zustand Store (8 domains)                 │  │
│  └──────────────────────────────────────────────┘  │
│                      ↕️                             │
│  ┌──────────────────────────────────────────────┐  │
│  │        BACKEND API (Node + Express)          │  │
│  │  • REST endpoints (missions, agents, etc.)   │  │
│  │  • WebSocket (Socket.io) for real-time      │  │
│  │  • Authentication (JWT)                      │  │
│  │  • Database layer (TypeORM + PostgreSQL)     │  │
│  └──────────────────────────────────────────────┘  │
│                      ↕️                             │
│  ┌──────────────────────────────────────────────┐  │
│  │      DATABASE (PostgreSQL 16)                │  │
│  │  • Missions, Agents, Activities              │  │
│  │  • Approvals, Skills, Health                 │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## API Reference 📡

See [`/docs/API.md`](./docs/API.md) for complete REST & WebSocket endpoint documentation.

### Key Endpoints

```
POST   /auth/login              — Authenticate agent
GET    /missions                — List all missions
POST   /missions                — Create mission
GET    /missions/:id            — Get mission details
PATCH  /missions/:id            — Update mission
GET    /agents                  — List all agents
GET    /approvals               — List pending approvals
POST   /approvals/:id/approve   — Approve request
POST   /approvals/:id/deny      — Deny request
GET    /health                  — System health check
WS     /socket.io               — WebSocket connection
```

## Configuration 🔧

### Environment Variables

```bash
# Backend
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/mission_control
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173

# Frontend
VITE_API_BASE_URL=http://localhost:3000/api
```

See `.env.production` for production defaults.

## Deployment 🚀

### One-Command Deployment

```bash
./scripts/deploy.sh
```

### Manual Steps

```bash
# Build Docker images
docker-compose build

# Start services
docker-compose up -d

# Apply database migrations
docker-compose exec backend npm run migrate

# Verify health
curl http://localhost:3000/health
```

See [`/docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) for production setup.

## Testing 🧪

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# E2E UI mode
npm run test:e2e:ui

# Coverage
npm run test:coverage
```

## Project Structure 📁

```
mission-control/
├── backend/               # Node.js API server
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Database entities
│   │   ├── middleware/    # Auth, error handling
│   │   └── app.ts         # Express app setup
│   ├── migrations/        # Database migrations
│   └── package.json
│
├── frontend/              # React + TypeScript SPA
│   ├── src/
│   │   ├── pages/         # Route pages
│   │   ├── components/    # Reusable components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API & realtime
│   │   ├── store/         # Zustand state
│   │   ├── types/         # TypeScript types
│   │   └── styles/        # Tailwind CSS
│   └── package.json
│
├── e2e/                   # End-to-end tests
│   └── tests/             # Playwright test suite
│
├── docker-compose.yml     # Full-stack orchestration
├── README.md              # This file
└── docs/                  # Additional docs
```

## Team 👥

Built with ❤️ by the Mission Control team.

## License 📄

MIT

## Support 💬

- GitHub Issues: [Report bugs](https://github.com/herbert051281/mission-control/issues)
- Documentation: [Read docs](./docs/)
- Demo: admin / admin
