# Architecture Guide

## System Design Overview

Mission Control is built on a **3-tier architecture** with clear separation of concerns, enabling scalability, maintainability, and independent evolution of each layer.

```
┌─────────────────────────────────────────────────────┐
│             PRESENTATION TIER                       │
│          React SPA + Tailwind CSS                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Pages       │ Components      │ Hooks              │
│  - Command   │ - Layout        │ - useStore         │
│  - Missions  │ - Cards         │ - useWebSocket     │
│  - Agents    │ - Modals        │ - useQuery         │
│  - etc.      │ - Forms         │ - useAuth          │
│              │                 │                    │
├─────────────────────────────────────────────────────┤
│         BUSINESS LOGIC TIER (REST + WS)             │
│            Node.js Express Server                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Controllers │ Services        │ Middleware         │
│  - Missions  │ - Mission Logic  │ - Auth Guard       │
│  - Agents    │ - Agent Mgmt     │ - Error Handler    │
│  - Approvals │ - Approval Flow  │ - Request Logger   │
│  - Health    │ - Health Check   │ - CORS             │
│              │                 │                    │
├─────────────────────────────────────────────────────┤
│         DATA & PERSISTENCE TIER                     │
│    PostgreSQL + TypeORM + Database Models           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Models        │ Migrations      │ Repositories      │
│  - Mission     │ - Schema        │ - Query builders  │
│  - Agent       │ - Seeds         │ - Transactions    │
│  - Approval    │ - Rollbacks     │ - Indexing        │
│  - Activity    │ - Versioning    │ - Performance     │
│  - Health      │                 │                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Pages (7 main views)

- **CommandCenter** — Dashboard with mission pipeline, agent status, and health overview
- **Missions** — Mission management interface with CRUD operations
- **Agents** — Agent roster with real-time status and capabilities
- **Approvals** — Approval queue with request details and decision interface
- **Activities** — System activity log with filtering and search
- **Settings** — Configuration and preferences (JWT secret, CORS, etc.)
- **Login** — Authentication entry point

### State Management (Zustand)

Frontend uses **Zustand** for lightweight, scalable state management across 8 integrated domains:

```javascript
// Store structure
const useStore = create((set) => ({
  // Missions domain
  missions: [],
  addMission: (mission) => set((state) => ({
    missions: [...state.missions, mission]
  })),
  updateMission: (id, updates) => ...,
  
  // Agents domain
  agents: [],
  updateAgent: (id, status) => ...,
  
  // Approvals domain
  approvals: [],
  approveRequest: (id, notes) => ...,
  denyRequest: (id, reason) => ...,
  
  // Activities domain
  activities: [],
  logActivity: (activity) => ...,
  
  // Health domain
  health: null,
  updateHealth: (status) => ...,
  
  // UI domain
  ui: { darkMode: true, sidebarOpen: true },
  toggleDarkMode: () => ...,
  
  // Auth domain
  auth: { token: null, user: null },
  login: (credentials) => ...,
  logout: () => ...
}));
```

### Component Hierarchy

```
App
├── Layout
│   ├── Sidebar
│   │   └── Navigation
│   └── MainContent
│       ├── Header
│       └── PageContainer
│           └── [Page Component]
│
├── Login (route)
├── CommandCenter (route)
│   ├── MissionPipeline
│   │   └── MissionCard (×N)
│   ├── AgentStatus
│   │   └── AgentBadge (×N)
│   └── HealthMonitor
├── Missions (route)
│   ├── MissionList
│   │   └── MissionRow (×N)
│   └── MissionModal
├── Agents (route)
│   └── AgentGrid
│       └── AgentCard (×N)
├── Approvals (route)
│   ├── ApprovalQueue
│   │   └── ApprovalCard (×N)
│   └── DecisionModal
└── Activities (route)
    ├── ActivityFeed
    │   └── ActivityEntry (×N)
    └── FilterPanel
```

### Data Flow

```
User Interaction
    ↓
React Event Handler
    ↓
Zustand Store Update (optimistic)
    ↓
API Call (REST or WebSocket)
    ↓
Backend Processing
    ↓
Database Update
    ↓
Response / WebSocket Event
    ↓
Store Confirmation Update
    ↓
Component Re-render
    ↓
UI Update
```

## Backend Architecture

### Layers

#### 1. Controller Layer
HTTP request handlers that parse input and delegate to services.

```typescript
// Example: MissionController
export class MissionController {
  constructor(private missionService: MissionService) {}
  
  async listMissions(req: Request, res: Response) {
    const missions = await this.missionService.listMissions();
    res.json(missions);
  }
  
  async createMission(req: Request, res: Response) {
    const mission = await this.missionService.createMission(req.body);
    res.status(201).json(mission);
  }
}
```

#### 2. Service Layer
Business logic, validation, and orchestration.

```typescript
// Example: MissionService
export class MissionService {
  constructor(private missionRepo: Repository<Mission>) {}
  
  async createMission(data: CreateMissionDTO): Promise<Mission> {
    // Validate
    if (!data.title) throw new ValidationError('Title required');
    
    // Create
    const mission = this.missionRepo.create({
      ...data,
      status: 'todo',
      created_at: new Date()
    });
    
    // Persist
    await this.missionRepo.save(mission);
    
    // Emit event for real-time sync
    eventEmitter.emit('mission:created', mission);
    
    return mission;
  }
}
```

#### 3. Middleware Layer
Cross-cutting concerns: authentication, error handling, logging.

```typescript
// Authentication middleware
export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.agent = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
```

#### 4. Model & Repository Layer
Database entities and query builders.

```typescript
// Example: Mission entity (TypeORM)
@Entity('missions')
export class Mission {
  @PrimaryColumn()
  id: string;
  
  @Column()
  title: string;
  
  @Column()
  description: string;
  
  @Column({ enum: ['todo', 'in_progress', 'in_review', 'approved', 'completed', 'failed'] })
  status: string;
  
  @Column({ enum: ['low', 'medium', 'high', 'critical'] })
  priority: string;
  
  @Column()
  assigned_to: string;
  
  @CreateDateColumn()
  created_at: Date;
  
  @UpdateDateColumn()
  updated_at: Date;
  
  @Column({ nullable: true })
  completed_at: Date;
}
```

### Event-Driven Architecture

Real-time synchronization uses **Socket.io** with an event emitter pattern:

```typescript
// Backend emits events
eventEmitter.on('mission:created', (mission) => {
  io.emit('mission:created', mission);
});

// Frontend receives and updates state
socket.on('mission:created', (mission) => {
  store.addMission(mission);
});
```

### API Routing

```typescript
// Express app setup
const app = express();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use(authMiddleware);
app.use(errorHandler);

// Routes
app.post('/auth/login', authController.login);
app.get('/missions', missionController.listMissions);
app.post('/missions', missionController.createMission);
app.get('/missions/:id', missionController.getMission);
app.patch('/missions/:id', missionController.updateMission);

// WebSocket
const io = socketIO(server, { cors: { origin: process.env.CORS_ORIGIN } });
io.use(authMiddleware);
io.on('connection', (socket) => {
  // Handle real-time events
});
```

## Database Schema

```sql
-- Missions table
CREATE TABLE missions (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('todo', 'in_progress', 'in_review', 'approved', 'completed', 'failed'),
  priority ENUM('low', 'medium', 'high', 'critical'),
  category VARCHAR(100),
  assigned_to VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  INDEX idx_status (status),
  INDEX idx_assigned_to (assigned_to)
);

-- Agents table
CREATE TABLE agents (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('controller', 'worker', 'monitor'),
  status ENUM('online', 'offline', 'degraded'),
  capabilities JSON,
  last_seen TIMESTAMP,
  active_missions INT DEFAULT 0,
  completed_missions INT DEFAULT 0,
  INDEX idx_status (status)
);

-- Approvals table
CREATE TABLE approvals (
  id VARCHAR(36) PRIMARY KEY,
  mission_id VARCHAR(36) NOT NULL,
  action VARCHAR(255),
  status ENUM('pending', 'approved', 'denied'),
  requester VARCHAR(36) NOT NULL,
  approver VARCHAR(36),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (mission_id) REFERENCES missions(id),
  INDEX idx_status (status)
);

-- Activities table
CREATE TABLE activities (
  id VARCHAR(36) PRIMARY KEY,
  type VARCHAR(100),
  actor VARCHAR(36),
  target VARCHAR(36),
  description TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_timestamp (timestamp),
  INDEX idx_type (type)
);

-- Health table
CREATE TABLE health (
  id VARCHAR(36) PRIMARY KEY,
  status ENUM('healthy', 'degraded', 'unhealthy'),
  backend_status VARCHAR(50),
  database_status VARCHAR(50),
  agents_online INT,
  missions_active INT,
  approvals_pending INT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_timestamp (timestamp)
);
```

## Deployment Architecture

### Development

```
Local Machine
├── Frontend (npm run dev) → Vite dev server :5173
├── Backend (npm run dev) → Express :3000
└── Database → PostgreSQL :5432
```

### Production (Docker)

```
Docker Compose
├── nginx:latest → Reverse proxy, static assets :80 → :443
├── node:20-alpine → Express API :3000
├── postgres:16 → Database :5432
└── pgadmin (optional) → Database management
```

### Scaling

For high-traffic scenarios:

```
Load Balancer (HAProxy/ALB)
├── Backend Instance 1 :3000
├── Backend Instance 2 :3000
└── Backend Instance 3 :3000
    ↓
PostgreSQL Primary
├── Replica 1 (read-only)
└── Replica 2 (read-only)
```

Redis can be added for:
- Session caching
- Real-time subscriptions
- Rate limiting

## Performance Considerations

1. **Database Indexing** — Indexes on `status`, `assigned_to`, `timestamp` fields
2. **Connection Pooling** — TypeORM connection pool (default: 10 connections)
3. **WebSocket Optimization** — Event throttling, selective broadcasting
4. **Frontend Caching** — Zustand state persistence to localStorage
5. **Image Optimization** — Serve via CDN, lazy-load components
6. **API Response Pagination** — Limit: 20-100 items per page

## Security Architecture

- **Authentication** — JWT tokens with 24-hour expiry
- **Authorization** — Role-based access control (admin, agent, viewer)
- **HTTPS/TLS** — Required in production
- **CORS** — Whitelist origin in `.env.production`
- **Rate Limiting** — 1000 requests/hour per agent
- **Input Validation** — Schema validation in services
- **SQL Injection Prevention** — TypeORM parameterized queries
- **XSS Prevention** — React DOM escaping by default

## Monitoring & Observability

- **Health Checks** — Backend periodically checks database connectivity
- **Activity Logging** — All significant events logged to `activities` table
- **Error Tracking** — Errors logged with stack traces (development) or sanitized (production)
- **WebSocket Monitoring** — Connection counts and event throughput
- **Database Metrics** — Query performance, connection pool stats

## Future Enhancements

1. **Horizontal Scaling** — Add load balancer, session storage (Redis)
2. **Microservices** — Separate mission, agent, and approval services
3. **Message Queue** — Use RabbitMQ/Kafka for async job processing
4. **Machine Learning** — Predict mission completion times, optimize scheduling
5. **Multi-tenant** — Support organization isolation
6. **GraphQL** — Add GraphQL endpoint alongside REST
7. **Webhooks** — External system integration hooks
