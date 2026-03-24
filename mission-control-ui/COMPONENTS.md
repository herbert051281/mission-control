# Component Definitions & Implementation

## Layout Components

### MissionControl (Root)
```typescript
// src/layouts/MissionControl.tsx
interface MissionControlProps {
  initialView?: string;
}

export function MissionControl({ initialView = 'command_center' }: MissionControlProps) {
  const [isLoading, setIsLoading] = useState(true);
  const store = useStore();
  
  useEffect(() => {
    // Initialize data
    Promise.all([
      fetchMissions(),
      fetchAgents(),
      fetchApprovals(),
      fetchSystemHealth(),
    ]).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="mission-control">
      <TopCommandBar />
      <div className="mission-control__main">
        <LeftNavigationRail />
        <MainContentArea />
        <ApprovalsPanel />
      </div>
      {store.ui.activityVisible && <LiveActivityFeed />}
    </div>
  );
}
```

---

## Top Bar Components

### TopCommandBar
```typescript
// src/components/TopCommandBar.tsx
export function TopCommandBar() {
  const store = useStore();
  const { data: health } = useQuery({
    queryKey: ['system', 'health'],
    queryFn: fetchSystemHealth,
    refetchInterval: 5000,
  });

  return (
    <header className="top-bar">
      <div className="top-bar__left">
        <h1 className="top-bar__title">
          <span className="icon-mission-control">⚙️</span>
          Mission Control
        </h1>
        <EnvironmentIndicator />
      </div>

      <div className="top-bar__center">
        <CommandSearchInput />
      </div>

      <div className="top-bar__right">
        <SystemStatusBadge health={health} />
        <ActiveModelsDisplay />
        <ApprovalsCounter count={store.approvals.filter(a => a.status === 'pending').length} />
        <UserMenu />
      </div>
    </header>
  );
}
```

### EnvironmentIndicator
```typescript
// src/components/EnvironmentIndicator.tsx
export function EnvironmentIndicator() {
  const env = process.env.REACT_APP_ENV || 'production';
  
  const config = {
    production: { label: 'PROD', color: '#22C55E' },
    staging: { label: 'STAGING', color: '#F59E0B' },
    development: { label: 'DEV', color: '#8B5CF6' },
  };

  const current = config[env as keyof typeof config] || config.development;

  return (
    <span className="environment-indicator" style={{ borderColor: current.color }}>
      {current.label}
    </span>
  );
}
```

### SystemStatusBadge
```typescript
// src/components/SystemStatusBadge.tsx
interface SystemStatusBadgeProps {
  health?: SystemHealth;
}

export function SystemStatusBadge({ health }: SystemStatusBadgeProps) {
  if (!health) return <SkeletonLoader width={120} />;

  const getStatus = () => {
    if (health.cpu.usage > 80 || health.memory.usage > 85) return 'critical';
    if (health.cpu.usage > 60 || health.memory.usage > 70) return 'warning';
    return 'healthy';
  };

  const status = getStatus();
  const statusConfig = {
    healthy: { icon: '✓', color: '#22C55E', label: 'Healthy' },
    warning: { icon: '⚠', color: '#F59E0B', label: 'Warning' },
    critical: { icon: '✕', color: '#EF4444', label: 'Critical' },
  };

  const config = statusConfig[status];

  return (
    <button 
      className="status-badge"
      style={{ borderColor: config.color }}
      onClick={() => showHealthModal(health)}
    >
      <span className="status-badge__icon">{config.icon}</span>
      <span className="status-badge__label">{config.label}</span>
      <span className="status-badge__detail">
        CPU {health.cpu.usage}% | Mem {health.memory.usage}%
      </span>
    </button>
  );
}
```

### ActiveModelsDisplay
```typescript
// src/components/ActiveModelsDisplay.tsx
export function ActiveModelsDisplay() {
  const { data: agents } = useQuery({
    queryKey: agentQueries.list(),
    queryFn: fetchAgents,
  });

  if (!agents) return null;

  const activeModels = [...new Set(
    agents
      .filter(a => a.status === 'running')
      .map(a => a.model)
  )];

  return (
    <div className="active-models">
      <label className="active-models__label">Active:</label>
      <div className="active-models__list">
        {activeModels.map(model => (
          <span key={model} className="active-models__tag">
            {model.split('/')[1] || model}
          </span>
        ))}
      </div>
    </div>
  );
}
```

### CommandSearchInput
```typescript
// src/components/CommandSearchInput.tsx
export function CommandSearchInput() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const store = useStore();

  const handleSearch = debounce(async (text: string) => {
    if (!text.trim()) {
      setResults([]);
      return;
    }

    const allResults = [
      ...store.missions
        .filter(m => m.name.toLowerCase().includes(text.toLowerCase()))
        .slice(0, 5)
        .map(m => ({ type: 'mission' as const, id: m.id, label: m.name })),
      ...store.agents
        .filter(a => a.name.toLowerCase().includes(text.toLowerCase()))
        .slice(0, 5)
        .map(a => ({ type: 'agent' as const, id: a.id, label: a.name })),
    ];

    setResults(allResults);
  }, 300);

  return (
    <div className="command-search">
      <input
        type="text"
        placeholder="Search missions, agents... (Ctrl+K)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          handleSearch(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setQuery('');
          if (e.key === 'Enter' && results.length > 0) {
            const result = results[0];
            if (result.type === 'mission') store.selectMission(result.id);
            else store.selectAgent(result.id);
            setQuery('');
            setResults([]);
          }
        }}
        className="command-search__input"
      />
      {results.length > 0 && (
        <div className="command-search__results">
          {results.map(result => (
            <button
              key={`${result.type}-${result.id}`}
              className="command-search__result-item"
              onClick={() => {
                if (result.type === 'mission') store.selectMission(result.id);
                else store.selectAgent(result.id);
                setQuery('');
                setResults([]);
              }}
            >
              <span className="command-search__result-type">{result.type}</span>
              <span className="command-search__result-label">{result.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Navigation Components

### LeftNavigationRail
```typescript
// src/components/LeftNavigationRail.tsx
const navItems = [
  { id: 'command_center', label: 'Command Center', icon: '⚙️' },
  { id: 'missions', label: 'Missions', icon: '📋' },
  { id: 'agents', label: 'Agents', icon: '🤖' },
  { id: 'activity', label: 'Activity', icon: '📊' },
  { id: 'approvals', label: 'Approvals', icon: '✓' },
  { id: 'skills', label: 'Skills', icon: '🛠️' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export function LeftNavigationRail() {
  const store = useStore();
  const [expanded, setExpanded] = useState(false);

  return (
    <nav className={`nav-rail ${expanded ? 'nav-rail--expanded' : ''}`}>
      <div className="nav-rail__header">
        <button
          className="nav-rail__toggle"
          onClick={() => setExpanded(!expanded)}
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? '◀' : '▶'}
        </button>
      </div>

      <ul className="nav-rail__items">
        {navItems.map(item => (
          <li key={item.id}>
            <button
              className={`nav-item ${store.ui.activeView === item.id ? 'nav-item--active' : ''}`}
              onClick={() => store.setActiveView(item.id)}
              title={item.label}
            >
              <span className="nav-item__icon">{item.icon}</span>
              {expanded && <span className="nav-item__label">{item.label}</span>}
            </button>
          </li>
        ))}
      </ul>

      <div className="nav-rail__footer">
        <button className="nav-rail__profile" title="Profile">👤</button>
      </div>
    </nav>
  );
}
```

---

## Mission Pipeline Components

### MissionPipelineBoard
```typescript
// src/components/MissionPipelineBoard.tsx
const stages: Array<Mission['stage']> = [
  'intake',
  'routed',
  'in_progress',
  'review',
  'awaiting_approval',
  'completed',
];

const stageLabels: Record<Mission['stage'], string> = {
  intake: 'Intake',
  routed: 'Routed',
  in_progress: 'In Progress',
  review: 'Review',
  awaiting_approval: 'Awaiting Approval',
  completed: 'Completed',
};

export function MissionPipelineBoard() {
  const store = useStore();
  const [draggedMission, setDraggedMission] = useState<Mission | null>(null);

  const missionsByStage = stages.reduce((acc, stage) => {
    acc[stage] = store.missions.filter(m => m.stage === stage);
    return acc;
  }, {} as Record<Mission['stage'], Mission[]>);

  return (
    <div className="pipeline-board">
      <h2 className="pipeline-board__title">Mission Pipeline</h2>
      
      <div className="pipeline-stages">
        {stages.map(stage => (
          <div
            key={stage}
            className="pipeline-stage"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              if (draggedMission) {
                store.updateMission({ ...draggedMission, stage });
                setDraggedMission(null);
              }
            }}
          >
            <div className="pipeline-stage__header">
              <h3 className="pipeline-stage__title">{stageLabels[stage]}</h3>
              <span className="pipeline-stage__count">
                {missionsByStage[stage].length}
              </span>
            </div>

            <div className="pipeline-stage__cards">
              {missionsByStage[stage].map(mission => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  onDragStart={() => setDraggedMission(mission)}
                  onClick={() => store.selectMission(mission.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### MissionCard
```typescript
// src/components/MissionCard.tsx
interface MissionCardProps {
  mission: Mission;
  onDragStart?: () => void;
  onClick?: () => void;
}

export function MissionCard({ mission, onDragStart, onClick }: MissionCardProps) {
  const priorityConfig = {
    critical: '#EF4444',
    high: '#F59E0B',
    normal: '#22D3EE',
    low: '#8B5CF6',
  };

  const statusConfig = {
    queued: { label: '◯', color: '#94A3B8' },
    active: { label: '●', color: '#22D3EE' },
    blocked: { label: '●', color: '#EF4444' },
    succeeded: { label: '✓', color: '#22C55E' },
    failed: { label: '✕', color: '#EF4444' },
  };

  const status = statusConfig[mission.status];

  return (
    <div
      className="mission-card"
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      style={{
        borderLeftColor: priorityConfig[mission.priority],
      }}
    >
      <div className="mission-card__header">
        <h4 className="mission-card__title">{mission.name}</h4>
        <span className="mission-card__status" style={{ color: status.color }}>
          {status.label}
        </span>
      </div>

      <p className="mission-card__description">{mission.description}</p>

      {mission.assignedAgents.length > 0 && (
        <div className="mission-card__agents">
          {mission.assignedAgents.slice(0, 3).map(agentId => (
            <span key={agentId} className="mission-card__agent-badge">
              {agentId.substring(0, 2).toUpperCase()}
            </span>
          ))}
          {mission.assignedAgents.length > 3 && (
            <span className="mission-card__agent-badge">
              +{mission.assignedAgents.length - 3}
            </span>
          )}
        </div>
      )}

      {mission.estimatedCompletion && (
        <div className="mission-card__meta">
          <time className="mission-card__time">
            {formatDistance(new Date(mission.estimatedCompletion), new Date(), {
              addSuffix: true,
            })}
          </time>
        </div>
      )}

      {mission.errorMessage && (
        <div className="mission-card__error">
          <span>⚠</span> {mission.errorMessage}
        </div>
      )}
    </div>
  );
}
```

---

## Agent Grid Components

### AgentStatusGrid
```typescript
// src/components/AgentStatusGrid.tsx
export function AgentStatusGrid() {
  const { data: agents } = useQuery({
    queryKey: agentQueries.list(),
    queryFn: fetchAgents,
    refetchInterval: 2000,
  });

  if (!agents) return <GridSkeleton columns={3} rows={3} />;

  return (
    <div className="agent-grid">
      <h2 className="agent-grid__title">Agent Status</h2>
      
      <div className="agent-grid__container">
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
```

### AgentCard
```typescript
// src/components/AgentCard.tsx
interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const store = useStore();
  const isSelected = store.ui.selectedAgent === agent.id;

  const statusConfig = {
    idle: { color: '#94A3B8', label: 'Idle', icon: '◯' },
    running: { color: '#22D3EE', label: 'Running', icon: '⚡' },
    waiting: { color: '#F59E0B', label: 'Waiting', icon: '⏳' },
    completed: { color: '#22C55E', label: 'Completed', icon: '✓' },
    failed: { color: '#EF4444', label: 'Failed', icon: '✕' },
  };

  const status = statusConfig[agent.status];

  return (
    <div
      className={`agent-card ${isSelected ? 'agent-card--selected' : ''}`}
      onClick={() => {
        onClick?.();
        store.selectAgent(agent.id);
      }}
    >
      {/* Header */}
      <div className="agent-card__header">
        <div className="agent-card__title-section">
          <h3 className="agent-card__name">{agent.name}</h3>
          <span
            className="agent-card__status"
            style={{
              color: status.color,
              backgroundColor: `${status.color}15`,
            }}
          >
            <span className="agent-card__status-icon">{status.icon}</span>
            {status.label}
          </span>
        </div>
        <button
          className="agent-card__menu"
          onClick={(e) => {
            e.stopPropagation();
            showAgentContextMenu(agent);
          }}
        >
          ⋮
        </button>
      </div>

      {/* Meta */}
      <div className="agent-card__meta">
        <div className="agent-card__meta-item">
          <span className="agent-card__meta-label">Role</span>
          <span className="agent-card__meta-value">{agent.role}</span>
        </div>
        <div className="agent-card__meta-item">
          <span className="agent-card__meta-label">Model</span>
          <span className="agent-card__meta-value">{agent.model.split('/')[1]}</span>
        </div>
      </div>

      {/* Current Task */}
      {agent.currentTask && (
        <div className="agent-card__current-task">
          <div className="agent-card__task-label">Current</div>
          <div className="agent-card__task-content">
            <p className="agent-card__task-description">
              {agent.currentTask.description.substring(0, 60)}...
            </p>
            <time className="agent-card__task-time">
              Since {formatDistance(new Date(agent.currentTask.startedAt), new Date(), {
                addSuffix: true,
              })}
            </time>
          </div>
        </div>
      )}

      {/* Last Completed Task */}
      {agent.lastCompletedTask && (
        <div className="agent-card__last-task">
          <div className="agent-card__task-label">Completed</div>
          <div className="agent-card__task-content">
            <p className="agent-card__task-description">
              {agent.lastCompletedTask.description.substring(0, 60)}...
            </p>
            <time className="agent-card__task-time">
              {agent.lastCompletedTask.status === 'succeeded' ? '✓' : '✕'}{' '}
              {formatDistance(new Date(agent.lastCompletedTask.completedAt), new Date(), {
                addSuffix: true,
              })}
            </time>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="agent-card__stats">
        <div className="agent-card__stat">
          <span className="agent-card__stat-value">{agent.queuedTasks}</span>
          <span className="agent-card__stat-label">Queued</span>
        </div>
        <div className="agent-card__stat">
          <span className="agent-card__stat-value">{(agent.successRate * 100).toFixed(0)}%</span>
          <span className="agent-card__stat-label">Success Rate</span>
        </div>
        <div className="agent-card__stat">
          <span className="agent-card__stat-value">{Math.round(agent.avgTaskDuration / 1000)}s</span>
          <span className="agent-card__stat-label">Avg Duration</span>
        </div>
      </div>

      {/* Progress Bar (if running) */}
      {agent.status === 'running' && agent.currentTask && (
        <div className="agent-card__progress">
          <div className="agent-card__progress-bar">
            <div
              className="agent-card__progress-fill"
              style={{
                width: `${Math.min(
                  100,
                  ((Date.now() - new Date(agent.currentTask.startedAt).getTime()) /
                    agent.avgTaskDuration) *
                    100
                )}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Activity & Approvals Components

### LiveActivityFeed
```typescript
// src/components/LiveActivityFeed.tsx
export function LiveActivityFeed() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activity', 'feed'],
    queryFn: () => fetchActivities({ limit: 100 }),
    refetchInterval: 1000,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [activities]);

  if (isLoading) return <SkeletonLoader height={400} />;

  return (
    <aside className="activity-feed">
      <div className="activity-feed__header">
        <h3 className="activity-feed__title">Activity</h3>
        <button className="activity-feed__close">×</button>
      </div>

      <div className="activity-feed__container" ref={containerRef}>
        {activities?.map(entry => (
          <ActivityEntry key={entry.id} entry={entry} />
        ))}
      </div>
    </aside>
  );
}

interface ActivityEntryProps {
  entry: ActivityEntry;
}

function ActivityEntry({ entry }: ActivityEntryProps) {
  const statusConfig = {
    success: { color: '#22C55E', icon: '✓' },
    pending: { color: '#F59E0B', icon: '⏳' },
    error: { color: '#EF4444', icon: '✕' },
    warning: { color: '#F59E0B', icon: '⚠' },
  };

  const status = statusConfig[entry.status];

  return (
    <div className="activity-entry">
      <time className="activity-entry__timestamp">
        {format(new Date(entry.timestamp), 'HH:mm:ss')}
      </time>
      <span className="activity-entry__agent">{entry.agentId}</span>
      <div className="activity-entry__content">
        <span className="activity-entry__status" style={{ color: status.color }}>
          {status.icon}
        </span>
        <span className="activity-entry__action">{entry.action}</span>
        {entry.missionRef && (
          <span className="activity-entry__mission-ref">({entry.missionRef})</span>
        )}
      </div>
    </div>
  );
}
```

### ApprovalsPanel
```typescript
// src/components/ApprovalsPanel.tsx
export function ApprovalsPanel() {
  const store = useStore();
  const pendingApprovals = store.approvals.filter(a => a.status === 'pending');

  if (!store.ui.approvalsVisible) return null;

  return (
    <aside className="approvals-panel">
      <div className="approvals-panel__header">
        <h3 className="approvals-panel__title">
          Pending Approvals ({pendingApprovals.length})
        </h3>
        <button
          className="approvals-panel__close"
          onClick={() => store.ui.approvalsVisible = false}
        >
          ×
        </button>
      </div>

      <div className="approvals-panel__list">
        {pendingApprovals.length === 0 ? (
          <div className="approvals-panel__empty">
            <p>No pending approvals</p>
          </div>
        ) : (
          pendingApprovals.map(approval => (
            <ApprovalItem key={approval.id} approval={approval} />
          ))
        )}
      </div>
    </aside>
  );
}

interface ApprovalItemProps {
  approval: Approval;
}

function ApprovalItem({ approval }: ApprovalItemProps) {
  const store = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const riskConfig = {
    low: { color: '#22C55E' },
    medium: { color: '#F59E0B' },
    high: { color: '#EF4444' },
  };

  return (
    <div className="approval-item" style={{ borderLeftColor: riskConfig[approval.riskLevel].color }}>
      <div className="approval-item__header">
        <h4 className="approval-item__mission">{approval.missionId}</h4>
        <span className="approval-item__type">{approval.type.replace(/_/g, ' ')}</span>
      </div>

      <p className="approval-item__description">{approval.actionDescription}</p>

      <div className="approval-item__meta">
        <span className="approval-item__risk" style={{ color: riskConfig[approval.riskLevel].color }}>
          {approval.riskLevel.toUpperCase()} RISK
        </span>
        <time className="approval-item__expires">
          Expires {formatDistance(new Date(approval.expiresAt), new Date(), { addSuffix: true })}
        </time>
      </div>

      <div className="approval-item__actions">
        <button
          className="approval-item__btn approval-item__btn--approve"
          disabled={isLoading}
          onClick={async () => {
            setIsLoading(true);
            await store.approveAction(approval.id);
            setIsLoading(false);
          }}
        >
          {isLoading ? '...' : 'Approve'}
        </button>
        <button
          className="approval-item__btn approval-item__btn--deny"
          disabled={isLoading}
          onClick={async () => {
            setIsLoading(true);
            await store.denyAction(approval.id);
            setIsLoading(false);
          }}
        >
          {isLoading ? '...' : 'Deny'}
        </button>
        <button
          className="approval-item__btn approval-item__btn--details"
          onClick={() => setShowDetails(!showDetails)}
        >
          ⋯
        </button>
      </div>

      {showDetails && (
        <div className="approval-item__details">
          <pre>{JSON.stringify(approval.metadata || {}, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

---

## System Health Component

### SystemHealthSummary
```typescript
// src/components/SystemHealthSummary.tsx
export function SystemHealthSummary() {
  const { data: health, isPending } = useQuery({
    queryKey: ['system', 'health'],
    queryFn: fetchSystemHealth,
    refetchInterval: 5000,
  });

  if (isPending) return <SkeletonLoader width="100%" height={120} />;
  if (!health) return null;

  return (
    <div className="health-summary">
      <h2 className="health-summary__title">System Health</h2>

      <div className="health-summary__grid">
        {/* CPU */}
        <div className="health-summary__item">
          <div className="health-summary__item-header">
            <label className="health-summary__item-label">CPU Usage</label>
            <span className="health-summary__item-value">{health.cpu.usage}%</span>
          </div>
          <div className="health-summary__progress-bar">
            <div
              className="health-summary__progress-fill"
              style={{
                width: `${health.cpu.usage}%`,
                backgroundColor:
                  health.cpu.usage > 80
                    ? '#EF4444'
                    : health.cpu.usage > 60
                      ? '#F59E0B'
                      : '#22C55E',
              }}
            />
          </div>
          <span className="health-summary__item-detail">
            {health.cpu.cores} cores
          </span>
        </div>

        {/* Memory */}
        <div className="health-summary__item">
          <div className="health-summary__item-header">
            <label className="health-summary__item-label">Memory</label>
            <span className="health-summary__item-value">{health.memory.usage}%</span>
          </div>
          <div className="health-summary__progress-bar">
            <div
              className="health-summary__progress-fill"
              style={{
                width: `${health.memory.usage}%`,
                backgroundColor:
                  health.memory.usage > 85
                    ? '#EF4444'
                    : health.memory.usage > 70
                      ? '#F59E0B'
                      : '#22C55E',
              }}
            />
          </div>
          <span className="health-summary__item-detail">
            {formatBytes(health.memory.used)} / {formatBytes(health.memory.total)}
          </span>
        </div>

        {/* Queue */}
        <div className="health-summary__item">
          <div className="health-summary__item-header">
            <label className="health-summary__item-label">Queue Depth</label>
            <span className="health-summary__item-value">{health.queueDepth}</span>
          </div>
          <div className="health-summary__progress-bar">
            <div
              className="health-summary__progress-fill"
              style={{
                width: `${Math.min(100, (health.queueDepth / 100) * 100)}%`,
                backgroundColor:
                  health.queueDepth > 100
                    ? '#EF4444'
                    : health.queueDepth > 50
                      ? '#F59E0B'
                      : '#22C55E',
              }}
            />
          </div>
          <span className="health-summary__item-detail">
            {health.activeAgents}/{health.totalAgents} agents active
          </span>
        </div>

        {/* Response Time */}
        <div className="health-summary__item">
          <div className="health-summary__item-header">
            <label className="health-summary__item-label">Avg Response Time</label>
            <span className="health-summary__item-value">{health.avgResponseTime}ms</span>
          </div>
          <div className="health-summary__metric">
            Uptime: {formatUptime(health.uptime)}
          </div>
        </div>
      </div>
    </div>
  );
}
```
