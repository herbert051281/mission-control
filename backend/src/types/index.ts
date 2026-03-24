/**
 * Iris Backend - Core Data Models
 * TypeScript interfaces and enums for all domain entities
 */

// ============================================================================
// AGENT
// ============================================================================

export enum AgentStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  WAITING = 'waiting',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  model: string;
  status: AgentStatus;
  current_task?: {
    id: string;
    title: string;
    started_at: Date;
  };
  last_completed_task?: {
    id: string;
    title: string;
    completed_at: Date;
  };
  last_updated: Date;
}

// ============================================================================
// MISSION
// ============================================================================

export enum MissionStatus {
  INTAKE = 'intake',
  ROUTED = 'routed',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  AWAITING_APPROVAL = 'awaiting_approval',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum MissionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface Mission {
  id: string;
  title: string;
  category: string;
  created_at: Date;
  status: MissionStatus;
  assigned_agents: string[];
  approval_required: boolean;
  priority: MissionPriority;
  summary: string;
  details: Record<string, unknown>;
}

// ============================================================================
// ACTIVITY LOG
// ============================================================================

export enum ActivityStatus {
  INITIATED = 'initiated',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  agent: string;
  action: string;
  target: string;
  status: ActivityStatus;
  details: Record<string, unknown>;
}

// ============================================================================
// APPROVAL
// ============================================================================

export enum ApprovalType {
  PRODUCTION = 'production',
  DESTRUCTIVE = 'destructive',
  EXTERNAL = 'external',
  INTEGRATION = 'integration',
  SKILL = 'skill'
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DENIED = 'denied'
}

export interface Approval {
  id: string;
  mission_id: string;
  type: ApprovalType;
  requested_by: string;
  status: ApprovalStatus;
  requested_at: Date;
  resolved_at?: Date;
  resolver?: string;
}

// ============================================================================
// SKILL
// ============================================================================

export enum DeploymentState {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production'
}

export interface Skill {
  id: string;
  name: string;
  version: string;
  owner: string;
  deployment_state: DeploymentState;
  updated_at: Date;
}

// ============================================================================
// SYSTEM HEALTH
// ============================================================================

export interface SystemHealth {
  agent_availability: Record<string, boolean>;
  queue_depth: number;
  last_heartbeat: Date;
  active_missions_count: number;
}
