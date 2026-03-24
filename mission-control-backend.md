# Mission Control Backend Architecture
## OpenClaw Multi-Agent Orchestration System

**Date:** March 2026  
**Version:** 1.0  
**Status:** Production-Ready Design  
**Audience:** Herb (Product Owner), Davinci (Frontend), Backend Implementation Team

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Data Models & Schema](#data-models--schema)
4. [State Machines](#state-machines)
5. [Event Flow Design](#event-flow-design)
6. [Activity Logging System](#activity-logging-system)
7. [Approval System](#approval-system)
8. [API Endpoints](#api-endpoints)
9. [Real-Time Mechanisms](#real-time-mechanisms)
10. [Database Schema](#database-schema)
11. [Integration Points](#integration-points)
12. [Implementation Plan](#implementation-plan)
13. [Deployment & Operations](#deployment--operations)

---

## System Overview

### Purpose
Mission Control is a real-time backend orchestration system that:
- Tracks agent status, task assignment, and execution
- Manages mission lifecycles from intake through completion
- Enforces approval checkpoints for sensitive operations
- Logs all agent actions for audit and debugging
- Provides real-time visibility into multi-agent operations

### Key Principles
1. **Event-Driven:** All state changes propagate via events for loose coupling
2. **Immutable Audit Trail:** Activity logs are append-only and cannot be modified
3. **Distributed Ready:** Designed for horizontal scaling (multi-instance backend)
4. **Real-Time First:** WebSocket-based for live updates; polling as fallback
5. **Approval-Gated:** Sensitive operations require explicit approval tracking

### Target Scale
- 10-100 agents concurrently
- 100-1000 missions in-flight daily
- 10,000+ activity log entries per day
- <1 second latency for status queries
- <500ms latency for real-time updates

---

## Architecture Patterns

### Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer (UI)                   │
│                   (Davinci's domain)                     │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│              API Gateway & Authentication                │
│  (JWT validation, rate limiting, request routing)       │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│              Business Logic Layer                        │
│  (Mission, Agent, Approval orchestration)               │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│           Data Access & Event Bus Layer                  │
│  (Repository pattern, transaction management)           │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│   Database & Message Queue Infrastructure               │
│  (PostgreSQL, Redis, Kafka/RabbitMQ)                   │
└──────────────────────────────────────────────────────────┘
```

### Core Concepts

**Agent Registry:** Central source of truth for agent metadata and status
- Updated by agent heartbeats
- Monitored for health anomalies
- Tracks capability/model alignment

**Mission Lifecycle:** Deterministic state machine for mission progression
- Well-defined transitions
- Checkpoint enforcement at approval gates
- Automatic retry/escalation policies

**Activity Trail:** Immutable log of all system actions
- Searchable by agent, mission, timestamp, action type
- Used for debugging, audit, and replay
- Cannot be deleted; only appended to

**Approval Workflow:** Critical for production and destructive operations
- Clear separation of request and resolution
- Resolver audit trail
- Configurable approval types

---

## Data Models & Schema

### 1. Agent Model

```typescript
interface Agent {
  id: string;                    // UUID v4
  name: string;                  // e.g., "Atlas", "Davinci", "Codex"
  role: string;                  // e.g., "data_analyst", "frontend_specialist", "coding_agent"
  model: string;                 // e.g., "claude-3.5-sonnet", "gpt-4", "custom-model"
  status: AgentStatus;           // Current state: idle, running, waiting, completed, failed
  capabilities: string[];        // e.g., ["sql", "python", "ui_design"]
  current_task: TaskReference;   // Currently executing task (if status === running)
  last_completed_task: TaskReference;  // Most recent completed task
  queue_position: number;        // Position in execution queue
  resource_limits: {
    max_concurrent_tasks: number;
    timeout_ms: number;
  };
  heartbeat_interval_ms: number; // Expected heartbeat frequency (default: 30000)
  last_heartbeat: ISO8601;       // Timestamp of last heartbeat
  last_updated: ISO8601;         // Timestamp of any status change
  created_at: ISO8601;
  metadata: object;              // Custom agent-specific metadata
}

enum AgentStatus {
  IDLE = "idle",                 // Waiting for task assignment
  RUNNING = "running",           // Actively executing task
  WAITING = "waiting",           // Blocked (approval pending, dependency waiting)
  COMPLETED = "completed",       // Task finished successfully
  FAILED = "failed",             // Task ended with error
  UNAVAILABLE = "unavailable",   // Missed heartbeats, offline
}

interface TaskReference {
  mission_id: string;            // UUID of parent mission
  task_id: string;               // UUID of specific task within mission
  assigned_at: ISO8601;
  started_at?: ISO8601;
  completed_at?: ISO8601;
  result?: object;               // Task output/result
  error?: string;                // Error message if failed
}
```

### 2. Mission Model

```typescript
interface Mission {
  id: string;                    // UUID v4
  title: string;                 // e.g., "Refresh Q1 Revenue Dashboard"
  description: string;           // Detailed mission narrative
  category: string;              // e.g., "analytics", "deployment", "maintenance", "bug_fix"
  status: MissionStatus;         // Current lifecycle state
  priority: Priority;            // Execution priority
  created_at: ISO8601;
  updated_at: ISO8601;
  completed_at?: ISO8601;
  
  // Routing & Assignment
  assigned_agents: string[];     // Array of agent IDs currently assigned
  required_capabilities: string[];  // Skills this mission needs
  routing_strategy: "auto" | "manual" | "round_robin";  // How to assign agents
  
  // Approval & Controls
  approval_required: boolean;
  approval_gates: ApprovalGate[];  // Multi-stage approvals (e.g., code review, then production deploy)
  approval_status: ApprovalStatus;  // Current approval state
  
  // Content & Details
  summary: string;               // Concise executive summary
  details: {
    steps?: string[];            // Ordered execution steps
    context?: object;            // Domain-specific context
    parameters?: object;         // Configuration parameters
    expected_output?: string;    // Description of success criteria
  };
  
  // Tracking
  estimated_duration_ms?: number;
  actual_duration_ms?: number;
  subtasks: Subtask[];           // Breakdown of mission into smaller units
  dependencies: string[];        // Mission IDs that must complete first
  
  // Metadata
  tags: string[];                // For filtering, search, analytics
  related_missions: string[];    // Cross-referenced missions
  created_by: string;            // Agent or user ID that created mission
  metadata: object;
}

enum MissionStatus {
  INTAKE = "intake",             // Just created, not yet routed
  ROUTED = "routed",             // Assigned to agent(s), awaiting start
  IN_PROGRESS = "in_progress",   // Active execution
  REVIEW = "review",             // Awaiting review (pre-approval)
  AWAITING_APPROVAL = "awaiting_approval",  // Blocked on approval gate
  COMPLETED = "completed",       // Finished successfully
  FAILED = "failed",             // Execution failed
  CANCELLED = "cancelled",       // Manually terminated
}

enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

interface ApprovalGate {
  id: string;
  mission_id: string;
  sequence_number: number;       // Order in approval chain
  type: ApprovalType;
  required_role?: string;        // e.g., "admin", "tech_lead"
  created_at: ISO8601;
  approval_id?: string;          // Reference to Approval record once initiated
}

interface Subtask {
  id: string;
  mission_id: string;
  title: string;
  status: MissionStatus;         // Can have own lifecycle
  assigned_agent?: string;
  completed_at?: ISO8601;
  result?: object;
}
```

### 3. Activity Log Model

```typescript
interface ActivityLog {
  id: string;                    // UUID v4
  timestamp: ISO8601;            // When action occurred
  
  // Who & What
  agent_id: string;              // Actor (agent or system)
  action: string;                // e.g., "TASK_STARTED", "APPROVAL_REQUESTED", "AGENT_HEARTBEAT"
  action_category: ActivityCategory;  // For grouping
  
  // Context
  mission_id?: string;           // Associated mission (if any)
  target: string;                // e.g., mission ID, agent ID, approval ID
  target_type: TargetType;       // "mission", "agent", "approval", "skill", "system"
  
  // Outcome
  status: ActivityStatus;        // initiated, in_progress, completed, failed
  result: object;                // Output/result of action
  error?: {
    code: string;
    message: string;
    stacktrace?: string;
  };
  
  // Duration & Metrics
  duration_ms?: number;          // How long action took
  resource_usage?: {
    cpu_percent?: number;
    memory_mb?: number;
    tokens_used?: number;        // For LLM agents
  };
  
  // Metadata
  details: object;               // Additional context (searchable JSON)
  environment: "development" | "staging" | "production";
}

enum ActivityCategory {
  AGENT = "agent",               // Agent status, heartbeat, assignment
  MISSION = "mission",           // Mission created, status changed
  APPROVAL = "approval",         // Approval requested, resolved
  TASK = "task",                 // Task lifecycle
  EXECUTION = "execution",       // Agent executing code/query
  SYSTEM = "system",             // Health checks, maintenance
  INTEGRATION = "integration",   // External API calls
}

enum TargetType {
  MISSION = "mission",
  AGENT = "agent",
  APPROVAL = "approval",
  SKILL = "skill",
  SYSTEM = "system",
}

enum ActivityStatus {
  INITIATED = "initiated",       // Action started
  IN_PROGRESS = "in_progress",   // Still executing
  COMPLETED = "completed",       // Finished successfully
  FAILED = "failed",             // Ended with error
}
```

### 4. Approval Model

```typescript
interface Approval {
  id: string;                    // UUID v4
  mission_id: string;            // Associated mission
  gate_id: string;               // Reference to ApprovalGate
  
  // Request Details
  type: ApprovalType;
  requested_by: string;          // Agent ID or user ID
  requested_at: ISO8601;
  
  // Approval Tracking
  status: ApprovalStatus;
  required_role?: string;        // e.g., "admin", "tech_lead"
  assigned_to?: string;          // Optional: specific person to approve
  
  // Resolution
  resolved_at?: ISO8601;
  resolver?: string;             // Agent/user who approved/denied
  decision_reason?: string;      // Why approved or denied
  
  // Multi-stage Support
  sequence_number: number;       // Position in approval chain
  previous_approval_id?: string; // Dependency chain
  
  // SLA
  timeout_at: ISO8601;           // When approval expires
  reminder_sent: boolean;
  
  context: {
    mission_title: string;
    mission_summary: string;
    details?: object;            // What specifically needs approval
  };
}

enum ApprovalType {
  PRODUCTION = "production",     // Deploy to production
  DESTRUCTIVE = "destructive",   // Delete, drop, or breaking change
  EXTERNAL = "external",         // Call external API with side effects
  INTEGRATION = "integration",   // Modify system integrations
  SKILL = "skill",               // Deploy new agent skill
  BUDGET = "budget",             // Resource consumption over threshold
}

enum ApprovalStatus {
  PENDING = "pending",           // Awaiting decision
  APPROVED = "approved",         // Granted
  DENIED = "denied",             // Rejected
  EXPIRED = "expired",           // Timeout reached
  REVOKED = "revoked",           // Approval withdrawn
}
```

### 5. Skill Model

```typescript
interface Skill {
  id: string;                    // UUID v4
  name: string;                  // e.g., "data_analysis", "code_generation"
  description: string;
  version: string;               // Semver: 1.2.3
  
  // Ownership & Lineage
  owner_agent_id: string;        // Agent that owns/authored this skill
  created_at: ISO8601;
  updated_at: ISO8601;
  
  // Deployment
  deployment_state: DeploymentState;
  
  // Capabilities
  capabilities: string[];        // What this skill enables
  required_permissions: string[];  // e.g., ["database.read", "external_api.write"]
  dependencies: {
    skill_id: string;
    version: string;             // Minimum version required
  }[];
  
  // Execution
  timeout_ms: number;
  max_retries: number;
  retry_backoff_ms: number;
  
  // Metadata
  tags: string[];
  compatible_models: string[];   // Which agent models can use this
  
  // Versioning & History
  previous_versions: {
    version: string;
    deployed_at: ISO8601;
    rolled_back_at?: ISO8601;
    rollback_reason?: string;
  }[];
  
  // Approval Gate (if skill writes to production)
  requires_approval: boolean;
  approval_type?: ApprovalType;
}

enum DeploymentState {
  DEVELOPMENT = "development",   // Local development only
  STAGING = "staging",           // Testing environment
  PRODUCTION = "production",     // Live environment
}
```

### 6. System Health Model

```typescript
interface SystemHealth {
  id: string;                    // UUID v4 or "system-health-latest"
  timestamp: ISO8601;            // When snapshot was taken
  
  // Agent Metrics
  agent_availability: {
    [agent_id: string]: boolean;  // true = heartbeat received within interval
  };
  agents_total: number;
  agents_idle: number;
  agents_running: number;
  agents_failed: number;
  
  // Mission Metrics
  missions_active: number;
  missions_pending: number;
  missions_in_review: number;
  approvals_pending: number;
  
  // Queue Metrics
  queue_depth: number;           // Tasks waiting to execute
  avg_wait_time_ms: number;
  median_wait_time_ms: number;
  
  // Performance Metrics
  heartbeat_latency_ms: number;  // P50
  heartbeat_latency_p99_ms: number;
  api_response_time_p50_ms: number;
  api_response_time_p99_ms: number;
  
  // Capacity
  resource_usage: {
    cpu_percent: number;
    memory_percent: number;
    disk_percent: number;
    database_connections_used: number;
    database_connections_max: number;
  };
  
  // Reliability
  error_rate_percent: number;    // % of failed operations in last 5min
  last_heartbeat: ISO8601;
  
  // Alerts
  active_alerts: Alert[];
}

interface Alert {
  id: string;
  severity: "info" | "warning" | "critical";
  type: string;                  // e.g., "high_error_rate", "queue_depth_high", "agent_offline"
  message: string;
  triggered_at: ISO8601;
  resolved_at?: ISO8601;
  related_entity: {
    type: "agent" | "mission" | "system";
    id: string;
  };
}
```

---

## State Machines

### 1. Mission Lifecycle State Machine

```
┌────────────────────────────────────────────────────────────────────────┐
│                     MISSION STATUS FLOW                                 │
└────────────────────────────────────────────────────────────────────────┘

                              START
                                │
                                ▼
                        ┌──────────────┐
                        │    INTAKE    │  ← Mission created, initial validation
                        └──────┬───────┘
                               │
                    [validate & route]
                               │
                               ▼
                        ┌──────────────┐
                        │    ROUTED    │  ← Assigned to agent(s), ready to execute
                        └──────┬───────┘
                               │
                    [agent accepts & starts]
                               │
                               ▼
                        ┌──────────────┐
                        │ IN_PROGRESS  │  ← Active execution
                        └──────┬───────┘
                               │
                  [on completion/checkpoint]
                               │
                    ┌──────────┴──────────┐
                    │                     │
        [approval required?]   [approval not required?]
                    │                     │
                    ▼                     ▼
            ┌──────────────┐       ┌──────────────┐
            │    REVIEW    │       │  COMPLETED   │  ← Success terminal state
            └──────┬───────┘       └──────────────┘
                   │
        [submission for approval]
                   │
                   ▼
            ┌──────────────────────┐
            │ AWAITING_APPROVAL    │  ← Blocked on approval gate
            └──────┬───────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    [APPROVED]         [DENIED]
        │                 │
        ▼                 ▼
    ┌──────────────┐   [Rejection handling]
    │  COMPLETED   │   [notify agent]
    └──────────────┘   │
                       ▼
                  ┌──────────────┐
                  │    FAILED    │  ← Terminal state (failure path)
                  └──────────────┘

CANCELLATION PATH (from any state):
    Any state → [manual cancellation] → CANCELLED (terminal)

FAILURE PATH (from any state):
    Any state → [execution error] → FAILED (terminal)
```

### State Transition Table

| From | To | Trigger | Conditions | Actions |
|------|----|---------| -----------|---------|
| INTAKE | ROUTED | route_mission() | Route validation passes, agent available | Log activity, update assigned_agents |
| ROUTED | IN_PROGRESS | agent.start_task() | Agent confirms acceptance | Record start_time, log activity |
| IN_PROGRESS | REVIEW | agent.mark_review() | Approval required, execution complete | Log submission, notify reviewers |
| IN_PROGRESS | COMPLETED | agent.mark_complete() | No approval needed, execution complete | Record completion_time, log success |
| REVIEW | AWAITING_APPROVAL | create_approval_gate() | Create approval request | Generate approval ID, notify approvers |
| AWAITING_APPROVAL | COMPLETED | approval.approve() | All approval gates passed | Log approval, continue execution or mark complete |
| AWAITING_APPROVAL | FAILED | approval.deny() | Any gate rejected | Log denial, notify agent, trigger retry/escalation |
| IN_PROGRESS, ROUTED, REVIEW | FAILED | [error occurs] | Execution throws exception | Log error, capture stacktrace, trigger retry if configured |
| ANY | CANCELLED | manual_cancel() | User/system initiated | Log cancellation reason, clean up resources |

### 2. Approval Workflow State Machine

```
┌────────────────────────────────────────────────────────────────┐
│                   APPROVAL FLOW                                 │
└────────────────────────────────────────────────────────────────┘

    [approval required by mission]
                │
                ▼
        ┌──────────────┐
        │   PENDING    │  ← Approval created, awaiting decision
        └──────┬───────┘
               │
        ┌──────┴────────┐
        │               │
        │         [timeout?]
        │               │
        │               ▼
        │        ┌──────────────┐
        │        │   EXPIRED    │  ← No decision made within SLA
        │        └──────────────┘
        │               
        │ [decision made]
        │ within SLA
        │
    ┌───┴───┐
    │       │
    ▼       ▼
┌────┐  ┌────────┐
│APPR│  │ DENIED │  ← Explicit rejection
│OVED│  └────────┘
└────┘

[optional: REVOKED]
    APPROVED → [external change] → REVOKED

APPROVAL CHAIN (multi-stage):
  Gate 1: PENDING → APPROVED → Chain continues
  Gate 2: PENDING → APPROVED → Mission proceeds
  
  Any Gate: DENIED → Mission status = FAILED
```

---

## Event Flow Design

### Event-Driven Architecture

All state changes propagate as immutable events. This enables:
- Loose coupling between components
- Real-time UI updates via WebSocket
- Event replay for debugging
- Distributed transaction support

### Core Events

```typescript
interface BaseEvent {
  id: string;                    // UUID v4
  timestamp: ISO8601;
  event_type: EventType;
  source: {
    agent_id?: string;
    system: boolean;
  };
  mission_id?: string;
  data: object;                  // Event-specific payload
  version: string;               // Schema version (for future migrations)
}

enum EventType {
  // Agent Events
  AGENT_REGISTERED = "agent.registered",
  AGENT_HEARTBEAT = "agent.heartbeat",
  AGENT_STATUS_CHANGED = "agent.status_changed",
  AGENT_TASK_ACCEPTED = "agent.task_accepted",
  
  // Mission Events
  MISSION_CREATED = "mission.created",
  MISSION_ROUTED = "mission.routed",
  MISSION_STARTED = "mission.started",
  MISSION_STATUS_CHANGED = "mission.status_changed",
  MISSION_COMPLETED = "mission.completed",
  MISSION_FAILED = "mission.failed",
  
  // Task Events
  TASK_ASSIGNED = "task.assigned",
  TASK_STARTED = "task.started",
  TASK_PROGRESS = "task.progress",           // Heartbeat during execution
  TASK_COMPLETED = "task.completed",
  TASK_FAILED = "task.failed",
  
  // Approval Events
  APPROVAL_REQUESTED = "approval.requested",
  APPROVAL_APPROVED = "approval.approved",
  APPROVAL_DENIED = "approval.denied",
  APPROVAL_EXPIRED = "approval.expired",
  APPROVAL_REVOKED = "approval.revoked",
  
  // Skill Events
  SKILL_DEPLOYED = "skill.deployed",
  SKILL_VERSION_UPDATED = "skill.version_updated",
  SKILL_ROLLED_BACK = "skill.rolled_back",
  
  // System Events
  SYSTEM_HEALTH_SNAPSHOT = "system.health_snapshot",
  SYSTEM_ALERT_TRIGGERED = "system.alert_triggered",
  SYSTEM_ALERT_RESOLVED = "system.alert_resolved",
}

// Example: Agent Heartbeat Event
interface AgentHeartbeatEvent extends BaseEvent {
  event_type: EventType.AGENT_HEARTBEAT;
  data: {
    agent_id: string;
    status: AgentStatus;
    current_task?: TaskReference;
    queue_position: number;
    metrics: {
      cpu_percent: number;
      memory_mb: number;
      uptime_ms: number;
    };
  };
}

// Example: Mission Created Event
interface MissionCreatedEvent extends BaseEvent {
  event_type: EventType.MISSION_CREATED;
  data: {
    mission_id: string;
    title: string;
    category: string;
    priority: Priority;
    approval_required: boolean;
    created_by: string;
  };
}

// Example: Approval Requested Event
interface ApprovalRequestedEvent extends BaseEvent {
  event_type: EventType.APPROVAL_REQUESTED;
  data: {
    approval_id: string;
    mission_id: string;
    type: ApprovalType;
    requested_by: string;
    required_role?: string;
    context: object;
  };
}
```

### Event Processing Flow

```
Agent/System                                         Backend
     │                                                  │
     │─── Event (JSON) ──────────────────────────────>│
     │                                                  │
     │                                      Validate & Enrich
     │                                                  │
     │                                    Persist to Event Log
     │                                                  │
     │                                    Update State (idempotent)
     │                                                  │
     │                                    Emit to Event Bus
     │                                                  │
     │<──────────── Acknowledgement (id) ─────────────│
     │
     │                          [Event Bus Subscribers]
     │                                   │
     │                    ┌──────────────┼──────────────┐
     │                    │              │              │
     │             WebSocket Pub   Activity Log   Derived Views
     │             (Real-time UI)   (Audit Trail)  (Caches, Indices)
```

### Event Ordering & Idempotency

- **Strict ordering:** Events within a mission must be processed in order
- **Idempotent processing:** Duplicate event IDs are skipped
- **Deduplication window:** 24 hours (configurable)
- **Out-of-order handling:** Events arriving late are queued and retried

---

## Activity Logging System

### Logging Architecture

Activity logs are **immutable, append-only** records of all system actions. They serve:
1. **Audit trail** for compliance and debugging
2. **Search/filter** for UI and analytics
3. **Replay** for troubleshooting failed missions
4. **Analytics** for agent performance tracking

### Logging Levels

```typescript
enum LogLevel {
  DEBUG = "debug",               // Detailed execution flow
  INFO = "info",                 // Important state changes
  WARN = "warn",                 // Recoverable issues
  ERROR = "error",               // Execution failures
  CRITICAL = "critical",         // System-wide failures
}
```

### Log Entry Schema

```typescript
interface ActivityLogEntry {
  id: string;                    // UUID, immutable identifier
  timestamp: ISO8601;            // When logged
  log_level: LogLevel;
  
  // Identity
  agent_id: string;              // Who performed the action
  mission_id: string;
  parent_log_id?: string;        // For nested operations
  
  // Event Data
  action: string;                // e.g., "EXECUTE_SQL_QUERY"
  action_category: string;       // e.g., "execution", "approval"
  target: string;                // What it operated on
  status: ActivityStatus;        // Outcome
  
  // Metrics
  duration_ms: number;
  tokens_used?: number;          // For LLM agents
  cost_usd?: number;             // Resource cost
  
  // Context
  environment: "dev" | "staging" | "prod";
  user_id?: string;              // If triggered by human
  
  // Result
  result: {
    status: "success" | "failure";
    message: string;
    output_size_bytes?: number;
    error?: {
      code: string;
      message: string;
      category: "validation" | "execution" | "integration" | "authorization" | "timeout";
    };
  };
  
  // Search Tags
  tags: string[];
  metadata: object;              // Custom fields, queryable
}
```

### Log Queries

Common queries the frontend will run:

```sql
-- Agent activity history
SELECT * FROM activity_logs 
WHERE agent_id = ? AND timestamp > NOW() - INTERVAL '7 days'
ORDER BY timestamp DESC;

-- Mission execution timeline
SELECT * FROM activity_logs 
WHERE mission_id = ?
ORDER BY timestamp ASC;

-- Agent errors in last 24h
SELECT * FROM activity_logs 
WHERE agent_id = ? AND status = 'failed' AND timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;

-- Approval workflow tracking
SELECT * FROM activity_logs 
WHERE action_category = 'approval' AND mission_id = ?
ORDER BY timestamp ASC;

-- Cost analysis by agent
SELECT agent_id, SUM(cost_usd) as total_cost
FROM activity_logs
WHERE timestamp > NOW() - INTERVAL '30 days' AND cost_usd IS NOT NULL
GROUP BY agent_id
ORDER BY total_cost DESC;
```

### Storage Strategy

- **Hot data:** Last 7 days in main table (frequent queries)
- **Warm data:** 7-90 days in time-partitioned table (archive queries)
- **Cold data:** >90 days in object storage (compliance holds)
- **Real-time stream:** Kafka/Redis for live tailing

---

## Approval System

### Approval Workflow Design

Approvals are **explicit, auditable, and gated**. They prevent accidental production changes.

### Single-Stage Approval

```
Mission enters review state
           │
           ▼
Create approval record (PENDING)
           │
           ▼
Notify approver (email, webhook)
           │
      ┌────┴────┐
      │          │
   APPROVE    DENY
      │          │
      ▼          ▼
   Continue   Fail mission
   execution  + notify agent
```

### Multi-Stage Approval Chain

```
Stage 1: Code Review
    ├─ Gate 1: PENDING → APPROVED ─┐
                                     │
                                     ▼
Stage 2: Security Review       Continue to Stage 2
    ├─ Gate 2: PENDING → APPROVED ─┐
                                     │
                                     ▼
Stage 3: Production Gate        Continue to Stage 3
    ├─ Gate 3: PENDING → APPROVED ─┐
                                     │
                                     ▼
                              Proceed with execution
                              (all gates satisfied)
```

### Approval API Contract

```typescript
// Request Approval
POST /api/missions/{mission_id}/approval-gates
{
  "gate_id": "code-review",
  "type": "production",
  "sequence_number": 1,
  "required_role": "tech_lead",
  "context": {
    "what_changed": "Updated SQL query for Q1 dashboard",
    "why": "Performance optimization, 3x faster",
    "impact": "Production database, 50 concurrent users",
    "rollback_plan": "Previous version is v1.2.3"
  }
}

Response:
{
  "approval_id": "app_abc123",
  "status": "PENDING",
  "created_at": "2026-03-25T12:00:00Z",
  "timeout_at": "2026-03-25T18:00:00Z"  // 6 hour SLA
}

// Approve
POST /api/approvals/{approval_id}/approve
{
  "decision_reason": "Verified impact analysis. Changes look good.",
  "approved_by": "user_or_agent_id"
}

Response:
{
  "approval_id": "app_abc123",
  "status": "APPROVED",
  "resolved_at": "2026-03-25T12:15:00Z",
  "resolver": "user_or_agent_id"
}

// Deny
POST /api/approvals/{approval_id}/deny
{
  "decision_reason": "Need more test coverage. Resubmit when ready.",
  "approved_by": "user_or_agent_id"
}

Response:
{
  "approval_id": "app_abc123",
  "status": "DENIED",
  "resolved_at": "2026-03-25T12:20:00Z",
  "resolver": "user_or_agent_id"
}
```

### Approval Types & Gates

| Type | Use Case | Default SLA | Required Role |
|------|----------|-------------|---------------|
| **production** | Deploy to production | 6 hours | `tech_lead` |
| **destructive** | Drop table, delete records | 4 hours | `dba`, `admin` |
| **external** | Call external API with side effects | 2 hours | `tech_lead` |
| **integration** | Modify system integrations | 8 hours | `admin` |
| **skill** | Deploy new agent skill | 24 hours | `agent_owner`, `tech_lead` |
| **budget** | Resource spend over threshold | 1 hour | `finance`, `admin` |

### Approval Escalation

If approval times out:
1. Send reminder to assigned approver
2. After SLA: escalate to manager level
3. After 2x SLA: escalate to exec level
4. After 3x SLA: auto-deny (safeguard)

---

## API Endpoints

### Authentication & Headers

```
Authorization: Bearer <JWT_TOKEN>
X-Request-ID: <UUID>              # For tracing
X-Idempotency-Key: <UUID>         # For idempotent operations
Content-Type: application/json
```

### 1. Agent Management API

#### Register Agent
```
POST /api/agents
{
  "name": "Atlas",
  "role": "data_analyst",
  "model": "claude-3.5-sonnet",
  "capabilities": ["sql", "python", "power_bi"],
  "resource_limits": {
    "max_concurrent_tasks": 3,
    "timeout_ms": 300000
  }
}

Response: 201 Created
{
  "id": "agent_abc123",
  "name": "Atlas",
  "status": "IDLE",
  "created_at": "2026-03-25T12:00:00Z"
}
```

#### Get Agent Status
```
GET /api/agents/{agent_id}

Response: 200 OK
{
  "id": "agent_abc123",
  "name": "Atlas",
  "status": "RUNNING",
  "current_task": {
    "mission_id": "mis_xyz789",
    "task_id": "tsk_123",
    "started_at": "2026-03-25T12:05:00Z"
  },
  "last_heartbeat": "2026-03-25T12:15:30Z"
}
```

#### List All Agents
```
GET /api/agents?status=running&limit=50&offset=0

Response: 200 OK
{
  "agents": [...],
  "total": 12,
  "limit": 50,
  "offset": 0
}
```

#### Agent Heartbeat
```
POST /api/agents/{agent_id}/heartbeat
{
  "status": "running",
  "current_task": { "mission_id": "mis_xyz", "task_id": "tsk_123" },
  "metrics": {
    "cpu_percent": 45,
    "memory_mb": 512,
    "uptime_ms": 3600000
  }
}

Response: 200 OK
{
  "heartbeat_acknowledged": true,
  "next_heartbeat_due_ms": 30000
}
```

### 2. Mission API

#### Create Mission
```
POST /api/missions
{
  "title": "Refresh Q1 Revenue Dashboard",
  "description": "Weekly refresh of revenue KPIs",
  "category": "analytics",
  "priority": "high",
  "approval_required": true,
  "approval_gates": [
    {
      "gate_id": "data_quality_check",
      "type": "production",
      "sequence_number": 1,
      "required_role": "data_lead"
    }
  ],
  "required_capabilities": ["sql", "power_bi"],
  "summary": "Execute ETL, validate data, publish dashboard",
  "details": {
    "steps": [
      "Execute fact_revenue stored procedure",
      "Validate row counts match upstream",
      "Publish to Power BI"
    ],
    "parameters": {
      "date_range": "2026-01-01 to 2026-03-31"
    }
  },
  "routing_strategy": "auto",
  "tags": ["weekly", "revenue", "power_bi"]
}

Response: 201 Created
{
  "id": "mis_xyz789",
  "status": "INTAKE",
  "created_at": "2026-03-25T12:00:00Z"
}
```

#### Route Mission (Assign Agents)
```
POST /api/missions/{mission_id}/route
{
  "assigned_agents": ["agent_abc123"],
  "routing_strategy": "auto"
}

Response: 200 OK
{
  "id": "mis_xyz789",
  "status": "ROUTED",
  "assigned_agents": ["agent_abc123"]
}
```

#### Get Mission
```
GET /api/missions/{mission_id}

Response: 200 OK
{
  "id": "mis_xyz789",
  "title": "Refresh Q1 Revenue Dashboard",
  "status": "IN_PROGRESS",
  "assigned_agents": ["agent_abc123"],
  "created_at": "2026-03-25T12:00:00Z",
  "updated_at": "2026-03-25T12:05:00Z"
}
```

#### List Missions
```
GET /api/missions?status=in_progress&category=analytics&limit=50

Response: 200 OK
{
  "missions": [...],
  "total": 145,
  "limit": 50,
  "offset": 0
}
```

#### Update Mission Status
```
PATCH /api/missions/{mission_id}/status
{
  "status": "REVIEW",
  "reason": "Manual transition to review state"
}

Response: 200 OK
{
  "id": "mis_xyz789",
  "status": "REVIEW",
  "updated_at": "2026-03-25T12:30:00Z"
}
```

#### Get Mission Activity Timeline
```
GET /api/missions/{mission_id}/activity?limit=100

Response: 200 OK
{
  "activities": [
    {
      "id": "log_123",
      "timestamp": "2026-03-25T12:00:00Z",
      "agent_id": "agent_abc123",
      "action": "MISSION_CREATED",
      "status": "completed"
    },
    ...
  ]
}
```

### 3. Approval API

#### List Pending Approvals
```
GET /api/approvals?status=pending&required_role=tech_lead&limit=50

Response: 200 OK
{
  "approvals": [
    {
      "id": "app_123",
      "mission_id": "mis_xyz789",
      "type": "production",
      "status": "PENDING",
      "requested_at": "2026-03-25T12:00:00Z",
      "timeout_at": "2026-03-25T18:00:00Z"
    }
  ],
  "total": 3
}
```

#### Approve
```
POST /api/approvals/{approval_id}/approve
{
  "decision_reason": "Verified. Ready for production."
}

Response: 200 OK
{
  "id": "app_123",
  "status": "APPROVED",
  "resolved_at": "2026-03-25T12:15:00Z"
}
```

#### Deny
```
POST /api/approvals/{approval_id}/deny
{
  "decision_reason": "Need more unit tests. Resubmit when ready."
}

Response: 200 OK
{
  "id": "app_123",
  "status": "DENIED",
  "resolved_at": "2026-03-25T12:20:00Z"
}
```

#### Get Approval History
```
GET /api/missions/{mission_id}/approvals

Response: 200 OK
{
  "approvals": [
    {
      "id": "app_123",
      "gate_id": "code_review",
      "type": "production",
      "status": "APPROVED",
      "requested_at": "2026-03-25T12:00:00Z",
      "resolved_at": "2026-03-25T12:15:00Z",
      "resolver": "user_tech_lead"
    }
  ]
}
```

### 4. Activity Log API

#### Query Activity Logs
```
GET /api/activity-logs?agent_id=agent_abc123&mission_id=mis_xyz789&limit=100&order=desc

Response: 200 OK
{
  "logs": [
    {
      "id": "log_abc",
      "timestamp": "2026-03-25T12:10:00Z",
      "agent_id": "agent_abc123",
      "action": "TASK_COMPLETED",
      "status": "completed",
      "duration_ms": 45000,
      "result": {
        "status": "success",
        "message": "Processed 50K rows"
      }
    }
  ],
  "total": 42
}
```

#### Get Agent Activity History
```
GET /api/agents/{agent_id}/activity?limit=50&days=7

Response: 200 OK
{
  "agent_id": "agent_abc123",
  "period": "7_days",
  "activities": [...],
  "summary": {
    "total_tasks": 15,
    "successful_tasks": 14,
    "failed_tasks": 1,
    "total_duration_ms": 1234567,
    "error_rate": 0.067
  }
}
```

### 5. System Health API

#### Get System Health
```
GET /api/system/health

Response: 200 OK
{
  "timestamp": "2026-03-25T12:15:00Z",
  "agents": {
    "total": 12,
    "available": 11,
    "idle": 6,
    "running": 5
  },
  "missions": {
    "active": 8,
    "pending_approvals": 3,
    "in_queue": 12
  },
  "performance": {
    "api_response_time_p50_ms": 45,
    "api_response_time_p99_ms": 230,
    "queue_depth": 12,
    "avg_wait_ms": 1500
  },
  "alerts": []
}
```

#### Get System Metrics
```
GET /api/system/metrics?period=24h

Response: 200 OK
{
  "period": "24h",
  "timestamp_range": {
    "start": "2026-03-24T12:15:00Z",
    "end": "2026-03-25T12:15:00Z"
  },
  "metrics": {
    "missions_completed": 45,
    "missions_failed": 2,
    "approvals_processed": 18,
    "total_execution_time_hours": 120.5,
    "error_rate_percent": 4.2
  }
}
```

### 6. Skill API

#### List Skills
```
GET /api/skills?deployment_state=production&owner_agent_id=agent_abc123

Response: 200 OK
{
  "skills": [
    {
      "id": "skl_123",
      "name": "sql_query_executor",
      "version": "1.2.3",
      "deployment_state": "production",
      "capabilities": ["sql", "performance_analysis"],
      "updated_at": "2026-03-20T10:00:00Z"
    }
  ]
}
```

#### Deploy Skill
```
POST /api/skills/{skill_id}/deploy
{
  "target_state": "production",
  "requires_approval": true,
  "approval_type": "skill"
}

Response: 201 Created
{
  "id": "skl_123",
  "deployment_state": "production",
  "deployed_at": "2026-03-25T12:00:00Z"
}
```

---

## Real-Time Mechanisms

### WebSocket Subscription

Clients subscribe to real-time events via WebSocket.

#### Connection
```
WS /ws/live?token=<JWT_TOKEN>&session_id=<UUID>

Initial handshake response:
{
  "status": "connected",
  "session_id": "ws_abc123",
  "server_time": "2026-03-25T12:00:00Z"
}
```

#### Subscribe to Mission Events
```
{
  "action": "subscribe",
  "channel": "missions",
  "mission_id": "mis_xyz789"
}

Response:
{
  "action": "subscribed",
  "channel": "missions",
  "mission_id": "mis_xyz789"
}
```

#### Subscribe to Agent Status
```
{
  "action": "subscribe",
  "channel": "agent_status",
  "agent_id": "agent_abc123"
}

Response:
{
  "action": "subscribed",
  "channel": "agent_status"
}
```

#### Subscribe to System Health
```
{
  "action": "subscribe",
  "channel": "system_health"
}

Response:
{
  "action": "subscribed",
  "channel": "system_health"
}
```

#### Real-Time Event (pushed from server)
```
{
  "type": "event",
  "event_type": "mission.status_changed",
  "mission_id": "mis_xyz789",
  "timestamp": "2026-03-25T12:05:00Z",
  "data": {
    "mission_id": "mis_xyz789",
    "old_status": "IN_PROGRESS",
    "new_status": "REVIEW",
    "changed_by": "agent_abc123"
  }
}
```

#### Heartbeat (server → client, every 30s)
```
{
  "type": "heartbeat",
  "server_time": "2026-03-25T12:05:30Z"
}

Client responds with:
{
  "type": "heartbeat_ack",
  "client_time": "2026-03-25T12:05:30Z"
}
```

### WebSocket Channel Mapping

| Channel | Subscription Params | Events | Use Case |
|---------|-------------------|--------|----------|
| `missions` | `mission_id` | status_changed, completed, failed | Single mission monitoring |
| `agent_status` | `agent_id` | status_changed, heartbeat, task_updated | Agent monitoring |
| `agent_status` | (none) | All agent events | Dashboard overview |
| `approvals` | `mission_id` or (none) | requested, approved, denied | Approval queue |
| `system_health` | (none) | health_snapshot, alert_triggered | System monitoring |
| `activity_feed` | `mission_id` or `agent_id` | All activity logs | Detailed audit trail |

### Polling Fallback (if WebSocket unavailable)

```
GET /api/missions/{mission_id}/changes?since=2026-03-25T12:00:00Z

Response: 200 OK
{
  "changes": [
    {
      "timestamp": "2026-03-25T12:05:00Z",
      "event_type": "mission.status_changed",
      "data": {...}
    },
    {
      "timestamp": "2026-03-25T12:10:00Z",
      "event_type": "mission.activity_logged",
      "data": {...}
    }
  ],
  "last_timestamp": "2026-03-25T12:10:00Z"
}
```

Polling interval: 5 seconds (configurable)

---

## Database Schema

### PostgreSQL Implementation

#### Core Tables

```sql
-- Agents Table
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('idle', 'running', 'waiting', 'completed', 'failed', 'unavailable')),
  current_task_id UUID REFERENCES agent_tasks(id) ON DELETE SET NULL,
  last_completed_task_id UUID REFERENCES agent_tasks(id) ON DELETE SET NULL,
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  capabilities TEXT[] NOT NULL,
  heartbeat_interval_ms INTEGER DEFAULT 30000,
  max_concurrent_tasks INTEGER DEFAULT 3,
  metadata JSONB DEFAULT '{}',
  
  CONSTRAINT valid_status CHECK (status != '')
);

CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_last_heartbeat ON agents(last_heartbeat DESC);

-- Missions Table
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('intake', 'routed', 'in_progress', 'review', 'awaiting_approval', 'completed', 'failed', 'cancelled')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  summary TEXT,
  details JSONB DEFAULT '{}',
  approval_required BOOLEAN DEFAULT FALSE,
  approval_status VARCHAR(50),
  
  assigned_agents UUID[] DEFAULT '{}',
  required_capabilities TEXT[] DEFAULT '{}',
  routing_strategy VARCHAR(50) DEFAULT 'auto',
  
  estimated_duration_ms INTEGER,
  actual_duration_ms INTEGER,
  dependencies UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_priority CHECK (priority != '')
);

CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_created_at ON missions(created_at DESC);
CREATE INDEX idx_missions_assigned_agents ON missions USING GIN (assigned_agents);
CREATE INDEX idx_missions_priority_status ON missions(priority, status);

-- Agent Tasks (assignment records)
CREATE TABLE agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('assigned', 'accepted', 'started', 'completed', 'failed')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  result JSONB,
  error TEXT,
  
  CONSTRAINT unique_mission_agent_assignment UNIQUE (mission_id, agent_id)
);

CREATE INDEX idx_agent_tasks_agent_id ON agent_tasks(agent_id);
CREATE INDEX idx_agent_tasks_mission_id ON agent_tasks(mission_id);
CREATE INDEX idx_agent_tasks_status ON agent_tasks(status);

-- Approval Gates & Requests
CREATE TABLE approval_gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  gate_id VARCHAR(255) NOT NULL,
  sequence_number INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('production', 'destructive', 'external', 'integration', 'skill', 'budget')),
  required_role VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_mission_gate UNIQUE (mission_id, gate_id)
);

CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  gate_id UUID NOT NULL REFERENCES approval_gates(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  requested_by VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'approved', 'denied', 'expired', 'revoked')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolver VARCHAR(255),
  timeout_at TIMESTAMP WITH TIME ZONE NOT NULL,
  decision_reason TEXT,
  sequence_number INTEGER NOT NULL,
  context JSONB DEFAULT '{}',
  reminder_sent BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_mission_id ON approvals(mission_id);
CREATE INDEX idx_approvals_timeout_at ON approvals(timeout_at);
CREATE INDEX idx_approvals_requested_by ON approvals(requested_by);

-- Activity Log (immutable)
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  agent_id VARCHAR(255),
  mission_id UUID,
  action VARCHAR(255) NOT NULL,
  action_category VARCHAR(100) NOT NULL,
  target VARCHAR(255) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('initiated', 'in_progress', 'completed', 'failed')),
  result JSONB DEFAULT '{}',
  error JSONB,
  duration_ms INTEGER,
  resource_usage JSONB,
  environment VARCHAR(50) DEFAULT 'production',
  details JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  
  CONSTRAINT no_update CHECK (TRUE)  -- Hint: no UPDATE allowed on this table
);

CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX idx_activity_logs_agent_id ON activity_logs(agent_id, timestamp DESC);
CREATE INDEX idx_activity_logs_mission_id ON activity_logs(mission_id, timestamp DESC);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_tags ON activity_logs USING GIN (tags);

-- Skills Registry
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(20) NOT NULL,
  owner_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  deployment_state VARCHAR(50) NOT NULL CHECK (deployment_state IN ('development', 'staging', 'production')),
  capabilities TEXT[] DEFAULT '{}',
  required_permissions TEXT[] DEFAULT '{}',
  timeout_ms INTEGER DEFAULT 300000,
  max_retries INTEGER DEFAULT 3,
  retry_backoff_ms INTEGER DEFAULT 1000,
  tags TEXT[] DEFAULT '{}',
  requires_approval BOOLEAN DEFAULT FALSE,
  approval_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_skills_name_version ON skills(name, version);
CREATE INDEX idx_skills_deployment_state ON skills(deployment_state);
CREATE INDEX idx_skills_owner_agent_id ON skills(owner_agent_id);

-- System Health Snapshots
CREATE TABLE system_health_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  agents_total INTEGER,
  agents_idle INTEGER,
  agents_running INTEGER,
  agents_failed INTEGER,
  missions_active INTEGER,
  missions_pending INTEGER,
  approvals_pending INTEGER,
  queue_depth INTEGER,
  avg_wait_time_ms NUMERIC,
  error_rate_percent NUMERIC,
  resource_usage JSONB DEFAULT '{}',
  alerts JSONB DEFAULT '[]'
);

CREATE INDEX idx_system_health_timestamp ON system_health_snapshots(timestamp DESC);

-- Events Log (for event streaming)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  event_type VARCHAR(100) NOT NULL,
  source_agent_id VARCHAR(255),
  mission_id UUID,
  data JSONB NOT NULL,
  version VARCHAR(10) DEFAULT '1.0',
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_events_timestamp ON events(timestamp DESC);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_mission_id ON events(mission_id);
CREATE INDEX idx_events_processed ON events(processed, timestamp);
```

### Partitioning Strategy

Activity logs grow fast. Partition by month:

```sql
CREATE TABLE activity_logs_2026_03 PARTITION OF activity_logs
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE TABLE activity_logs_2026_04 PARTITION OF activity_logs
  FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
  
-- Continue monthly...
```

### Views for Common Queries

```sql
-- Agent Status Summary
CREATE VIEW agent_status_summary AS
SELECT
  status,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (NOW() - last_heartbeat))) as avg_seconds_since_heartbeat
FROM agents
GROUP BY status;

-- Mission Progress Dashboard
CREATE VIEW mission_progress AS
SELECT
  DATE_TRUNC('day', created_at) as day,
  status,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_duration_seconds
FROM missions
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), status;

-- Approval Throughput
CREATE VIEW approval_metrics AS
SELECT
  type,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
  COUNT(CASE WHEN status = 'denied' THEN 1 END) as denied,
  AVG(EXTRACT(EPOCH FROM (resolved_at - requested_at))) as avg_resolution_seconds
FROM approvals
WHERE requested_at > NOW() - INTERVAL '30 days'
GROUP BY type;
```

---

## Integration Points

### Frontend Integration (Davinci's Domain)

#### What the UI Needs from Backend

```typescript
// Dashboard Page
GET /api/agents?limit=50
GET /api/missions?status=in_progress&limit=50
GET /api/system/health

// Mission Detail Page
GET /api/missions/{mission_id}
GET /api/missions/{mission_id}/activity?limit=100
GET /api/missions/{mission_id}/approvals

// Approval Queue Page
GET /api/approvals?status=pending&limit=50

// Agent Detail Page
GET /api/agents/{agent_id}
GET /api/agents/{agent_id}/activity?days=7

// Real-Time Subscriptions
WS /ws/live
  → subscribe to "missions"
  → subscribe to "agent_status"
  → subscribe to "approvals"
  → subscribe to "system_health"
```

#### Real-Time Event Flow (UI ← Backend)

```typescript
// When agent starts a task
{
  "type": "event",
  "event_type": "agent.status_changed",
  "data": {
    "agent_id": "agent_abc123",
    "old_status": "IDLE",
    "new_status": "RUNNING",
    "current_task": {...}
  }
}

// When mission advances
{
  "type": "event",
  "event_type": "mission.status_changed",
  "data": {
    "mission_id": "mis_xyz789",
    "old_status": "IN_PROGRESS",
    "new_status": "REVIEW"
  }
}

// When approval requested
{
  "type": "event",
  "event_type": "approval.requested",
  "data": {
    "approval_id": "app_123",
    "mission_id": "mis_xyz789",
    "type": "production",
    "context": {...}
  }
}
```

#### UI Actions → Backend API

```
User clicks "Approve" → POST /api/approvals/{approval_id}/approve
User clicks "Assign Agent" → POST /api/missions/{mission_id}/route
User clicks "View Activity" → GET /api/missions/{mission_id}/activity
User clicks "Refresh Dashboard" → GET /api/system/health + active subscriptions
```

### Agent Integration

#### What Agents Call

```
Agent lifecycle:
1. POST /api/agents (register)
2. POST /api/agents/{agent_id}/heartbeat (every 30s)
3. POST /api/missions/{mission_id}/start (accept task)
4. POST /api/missions/{mission_id}/activity (log action)
5. POST /api/missions/{mission_id}/status (update status)
6. POST /api/approvals/{approval_id}/approve or /deny (resolve)
```

#### Agent Event Listeners

Agents can subscribe to their own events:

```
POST /api/agents/{agent_id}/subscribe
{
  "event_types": ["TASK_ASSIGNED", "APPROVAL_REQUESTED", "MISSION_CANCELLED"]
}

Webhook callback (agent provides):
POST {agent_callback_url}
{
  "event_type": "TASK_ASSIGNED",
  "mission_id": "mis_xyz789",
  "task_id": "tsk_123"
}
```

---

## Implementation Plan

### Phase 1: Foundation (Weeks 1-2)

**Goal:** Core data models and API skeleton

- [ ] PostgreSQL schema setup (agents, missions, approvals, activity_logs)
- [ ] Redis cache layer (agent status, mission state)
- [ ] Basic CRUD endpoints (agents, missions)
- [ ] Authentication & JWT token validation
- [ ] Activity logging infrastructure
- [ ] Unit tests for data models

**Deliverables:**
- Database running and tested
- `/api/agents`, `/api/missions` endpoints functional
- Swagger/OpenAPI docs generated

### Phase 2: State Machine & Core Logic (Weeks 2-3)

**Goal:** Mission lifecycle, routing, and basic orchestration

- [ ] Mission state machine implementation
- [ ] Agent registry and health monitoring
- [ ] Agent-mission routing logic
- [ ] Mission status update endpoints
- [ ] Agent heartbeat system
- [ ] Integration tests for state transitions

**Deliverables:**
- Mission routing and assignment working
- Agent heartbeat detection
- Mission status updates flowing through system
- Mission lifecycle tests passing

### Phase 3: Approval System (Week 3-4)

**Goal:** Multi-stage approval workflow

- [ ] Approval gates and requests
- [ ] Approval decision (approve/deny)
- [ ] SLA enforcement and reminders
- [ ] Approval state machine
- [ ] Approval audit trail
- [ ] End-to-end approval tests

**Deliverables:**
- Approval requests created and tracked
- Approval decisions enforced
- Approval notifications sent
- Mission progression blocked/unblocked based on approvals

### Phase 4: Real-Time & Events (Week 4-5)

**Goal:** WebSocket streaming and event bus

- [ ] Event schema and event log table
- [ ] Event publishing system (internal event bus)
- [ ] WebSocket server setup
- [ ] WebSocket subscription channels
- [ ] Real-time mission/agent updates
- [ ] Polling fallback implementation
- [ ] Load testing for concurrent connections

**Deliverables:**
- WebSocket connections accepted
- Real-time mission updates flowing to UI
- Agent status streamed in real-time
- Polling fallback working

### Phase 5: Activity Logging & Queries (Week 5-6)

**Goal:** Rich activity log, searchable audit trail

- [ ] Activity log ingestion pipeline
- [ ] Structured logging for all actions
- [ ] Activity log queries (by agent, mission, action type)
- [ ] Search filters and full-text indexing
- [ ] Activity log partitioning strategy
- [ ] Retention policy enforcement

**Deliverables:**
- All agent actions logged
- Activity log API queryable
- Audit trail complete and immutable

### Phase 6: System Health & Monitoring (Week 6-7)

**Goal:** Health checks, alerting, metrics

- [ ] Health snapshot generation (every 5 min)
- [ ] Alert triggering logic (error rate, queue depth, agent offline)
- [ ] Metrics aggregation (missions/day, approval throughput, etc.)
- [ ] Health API endpoints
- [ ] Prometheus metrics export
- [ ] Dashboard metrics ready for Davinci

**Deliverables:**
- System health API working
- Health snapshots logged periodically
- Alerts triggered and resolved correctly
- Metrics available for monitoring

### Phase 7: Optimization & Hardening (Week 7-8)

**Goal:** Production-readiness, performance, reliability

- [ ] Connection pooling optimization
- [ ] Query optimization and index review
- [ ] Cache warming strategy
- [ ] Rate limiting implementation
- [ ] Error handling and retry logic
- [ ] Distributed tracing (OpenTelemetry setup)
- [ ] Load testing (1000+ concurrent missions)
- [ ] Failover and recovery testing

**Deliverables:**
- <100ms API response times (p95)
- <500ms WebSocket latency
- No query N+1 problems
- Graceful degradation under load

### Phase 8: Documentation & Handoff (Week 8)

**Goal:** Complete docs for Davinci and operators

- [ ] API documentation (Swagger)
- [ ] Data model reference
- [ ] Deployment guide
- [ ] Operations runbook
- [ ] Troubleshooting guide
- [ ] Performance tuning guide
- [ ] Integration examples for agents

**Deliverables:**
- Complete OpenAPI spec
- Runbooks for common ops tasks
- Example agent integration code
- Performance baseline documented

---

## Deployment & Operations

### Infrastructure Requirements

```yaml
# PostgreSQL
- Version: 14+
- Storage: 100 GB (scalable)
- Connections: 100 max
- Backups: Daily, retained 30 days
- Replication: Read replicas for scale

# Redis
- Version: 7+
- Memory: 4 GB
- Persistence: RDB snapshots + AOF
- Replication: Sentinel for HA

# Application Server
- Runtime: Node.js 18+ or Python 3.10+
- Memory: 2 GB per instance
- Instances: 3-5 (auto-scale)
- Load Balancer: Round-robin

# Message Queue (Events)
- RabbitMQ or Kafka
- Retention: 7 days
- Partitions: 1 per agent (for ordering)
```

### Monitoring & Alerting

```yaml
Key Metrics to Monitor:
  - API response time (p50, p95, p99)
  - Database query time
  - Queue depth
  - Error rate
  - WebSocket connection count
  - Agent heartbeat failures
  - Approval timeout rate
  - Disk usage

Alerts to Configure:
  - Error rate > 5% (critical)
  - API response time p95 > 1s (warning)
  - Queue depth > 100 (warning)
  - Agent offline > 2 min (warning)
  - Approval timeout SLA breach (critical)
  - Database connections > 80 (warning)
```

### Deployment Checklist

```
Pre-Deploy:
  ☐ All tests passing (unit + integration)
  ☐ Database migrations tested
  ☐ Performance baseline met (latency, throughput)
  ☐ Load testing completed (sustained 1000 missions)
  ☐ Security review completed
  ☐ Documentation updated

Deploy:
  ☐ Database migrations applied (with rollback plan)
  ☐ App instances updated (rolling deploy)
  ☐ Health checks passing
  ☐ Smoke tests run
  ☐ Monitoring dashboards loaded

Post-Deploy:
  ☐ Monitor error rates (5 min)
  ☐ Check WebSocket connections stable
  ☐ Verify approvals flowing through
  ☐ Monitor queue depth
  ☐ Sample activity logs for correctness
```

---

## Summary

This Mission Control backend is designed to be:

✅ **Scalable:** Handles 100+ agents, 1000+ missions daily  
✅ **Real-Time:** <500ms updates via WebSocket  
✅ **Auditable:** Immutable activity trail for all actions  
✅ **Approval-Gated:** Multi-stage workflows for sensitive ops  
✅ **Production-Ready:** Error handling, retry logic, monitoring  
✅ **Observable:** Rich logging, metrics, distributed tracing  

**Next Steps:**
1. Davinci reviews this spec and coordinates frontend data needs
2. Backend team implements Phase 1 (foundation)
3. Weekly sync-ups to align frontend/backend integration points
4. Parallel development on UI and API

---

**Version:** 1.0  
**Last Updated:** 2026-03-25  
**Status:** Ready for Implementation
