# Mission Control Architecture

## Data Model

### Mission
```typescript
interface Mission {
  id: string;
  name: string;
  description: string;
  stage: 'intake' | 'routed' | 'in_progress' | 'review' | 'awaiting_approval' | 'completed';
  priority: 'critical' | 'high' | 'normal' | 'low';
  createdAt: ISO8601;
  updatedAt: ISO8601;
  assignedAgents: string[]; // agent IDs
  estimatedCompletion?: ISO8601;
  completedAt?: ISO8601;
  requiredApprovals: Approval[];
  status: 'queued' | 'active' | 'blocked' | 'succeeded' | 'failed';
  errorMessage?: string;
  metadata: Record<string, any>;
}
```

### Agent
```typescript
type AgentStatus = 'idle' | 'running' | 'waiting' | 'completed' | 'failed';

interface Agent {
  id: string;
  name: 'Atlas' | 'Kepler' | 'Einstein' | 'Gandalf' | 'Iris' | 'Davinci' | 'Newton' | 'Legolas' | 'Skillmaster';
  role: string;
  model: string;
  status: AgentStatus;
  currentTask?: {
    missionId: string;
    description: string;
    startedAt: ISO8601;
  };
  lastCompletedTask?: {
    missionId: string;
    description: string;
    completedAt: ISO8601;
    status: 'succeeded' | 'failed';
  };
  uptime: number; // ms
  successRate: number; // 0-1
  avgTaskDuration: number; // ms
  queuedTasks: number;
  totalTasks: number;
}
```

### Approval
```typescript
interface Approval {
  id: string;
  missionId: string;
  type: 'elevated_command' | 'external_action' | 'data_export' | 'model_override' | 'custom';
  status: 'pending' | 'approved' | 'denied' | 'expired';
  requestedBy: string;
  requiredApprovers: string[];
  approvedBy?: string[];
  deniedBy?: string[];
  requestedAt: ISO8601;
  expiresAt: ISO8601;
  actionDescription: string;
  riskLevel: 'low' | 'medium' | 'high';
}
```

### Activity Entry
```typescript
interface ActivityEntry {
  id: string;
  timestamp: ISO8601;
  agentId: string;
  action: string;
  status: 'success' | 'pending' | 'error' | 'warning';
  missionRef?: string;
  details?: string;
  metadata?: Record<string, any>;
}
```

### System Health
```typescript
interface SystemHealth {
  timestamp: ISO8601;
  cpu: {
    usage: number; // 0-100
    cores: number;
  };
  memory: {
    used: number; // bytes
    total: number;
    usage: number; // 0-100
  };
  queueDepth: number;
  activeAgents: number;
  totalAgents: number;
  uptime: number; // seconds
  avgResponseTime: number; // ms
}
```

### Skill
```typescript
interface Skill {
  id: string;
  name: string;
  version: string;
  owner: string;
  description: string;
  deploymentState: 'available' | 'updating' | 'failed' | 'deprecated';
  lastUpdated: ISO8601;
  compatibility: string[]; // agent IDs
  usageCount: number;
}
```

---

## State Management (Zustand)

### Root Store
```typescript
interface RootStore {
  // UI State
  ui: {
    activeView: string; // 'command_center' | 'missions' | 'agents' | 'activity' | 'approvals' | 'skills' | 'settings'
    sidebarCollapsed: boolean;
    approvalsVisible: boolean;
    activityVisible: boolean;
    selectedMission?: string;
    selectedAgent?: string;
    filters: FilterState;
  };

  // Data State
  missions: Mission[];
  agents: Agent[];
  approvals: Approval[];
  activities: ActivityEntry[];
  systemHealth: SystemHealth;
  skills: Skill[];

  // Connection State
  wsConnected: boolean;
  lastUpdate: ISO8601;

  // Actions
  setActiveView: (view: string) => void;
  toggleSidebar: () => void;
  selectMission: (id: string | undefined) => void;
  selectAgent: (id: string | undefined) => void;
  updateMission: (mission: Mission) => void;
  updateAgent: (agent: Agent) => void;
  approveAction: (approvalId: string) => Promise<void>;
  denyAction: (approvalId: string, reason?: string) => Promise<void>;
}
```

### API Integration (React Query)

```typescript
// useQueries.ts
export const missionQueries = {
  all: () => ['missions'],
  lists: () => [...missionQueries.all(), 'list'],
  list: (filters: FilterState) => [...missionQueries.lists(), filters],
  details: () => [...missionQueries.all(), 'detail'],
  detail: (id: string) => [...missionQueries.details(), id],
};

export const agentQueries = {
  all: () => ['agents'],
  lists: () => [...agentQueries.all(), 'list'],
  list: () => [...agentQueries.lists()],
  details: () => [...agentQueries.all(), 'detail'],
  detail: (id: string) => [...agentQueries.details(), id],
};

// Usage in components
const { data: missions } = useQuery({
  queryKey: missionQueries.list(filters),
  queryFn: () => fetchMissions(filters),
  refetchInterval: 3000, // 3s for mission updates
});
```

---

## Real-Time Updates

### WebSocket Event Types
```typescript
type WSEvent = 
  | { type: 'mission.created'; payload: Mission }
  | { type: 'mission.updated'; payload: Mission }
  | { type: 'mission.completed'; payload: { id: string; stage: string } }
  | { type: 'agent.status_changed'; payload: { id: string; status: AgentStatus } }
  | { type: 'approval.pending'; payload: Approval }
  | { type: 'approval.actioned'; payload: { id: string; action: string } }
  | { type: 'activity.logged'; payload: ActivityEntry }
  | { type: 'health.updated'; payload: SystemHealth }
  | { type: 'skill.deployed'; payload: Skill };
```

### Handlers
```typescript
// useWebSocket.ts
export function useWebSocket() {
  const store = useStore();
  
  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/mission-control`);
    
    ws.onmessage = (event) => {
      const wsEvent = JSON.parse(event.data) as WSEvent;
      
      switch (wsEvent.type) {
        case 'mission.updated':
          store.updateMission(wsEvent.payload);
          break;
        case 'agent.status_changed':
          queryClient.setQueryData(
            agentQueries.detail(wsEvent.payload.id),
            (old) => ({ ...old, status: wsEvent.payload.status })
          );
          break;
        case 'approval.pending':
          store.addApproval(wsEvent.payload);
          break;
        // ... other cases
      }
    };
    
    return () => ws.close();
  }, [store]);
}
```

---

## API Endpoints

```
GET  /api/missions                    # List missions (filters: stage, priority, assignee)
GET  /api/missions/:id                # Mission detail
POST /api/missions                    # Create mission
PATCH /api/missions/:id               # Update mission
GET  /api/agents                      # List all agents
GET  /api/agents/:id                  # Agent detail + full history
GET  /api/approvals                   # List pending approvals
POST /api/approvals/:id/approve       # Approve action (requires auth header + 2FA token)
POST /api/approvals/:id/deny          # Deny action
GET  /api/activity                    # Activity log (paginated, cursor-based)
GET  /api/system/health               # System health snapshot
GET  /api/skills                      # List all skills
POST /api/skills/:id/deploy           # Deploy skill version
WS   /ws/mission-control              # WebSocket for real-time updates
```

---

## Filter State

```typescript
interface FilterState {
  missionStage?: string[];
  missionPriority?: string[];
  agentStatus?: string[];
  activityStatus?: string[];
  timeRange?: {
    start: ISO8601;
    end: ISO8601;
  };
  searchText?: string;
}
```

---

## Keyboard Shortcuts

- `Ctrl+K` / `Cmd+K` — Command palette (search missions, agents, actions)
- `Ctrl+A` / `Cmd+A` — Toggle approvals panel visibility
- `Ctrl+L` / `Cmd+L` — Toggle activity feed
- `Ctrl+1-7` — Jump to view (1=Command Center, 2=Missions, 3=Agents, 4=Activity, 5=Approvals, 6=Skills, 7=Settings)
- `Enter` — Approve selected approval (when focused)
- `Shift+Enter` — Deny selected approval
- `Esc` — Close modals, deselect items
