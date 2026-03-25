export type MissionStatus = 'intake' | 'routed' | 'in_progress' | 'review' | 'awaiting_approval' | 'completed'
export type ApprovalStatus = 'pending' | 'approved' | 'denied'

export interface Mission { 
  id: string
  title: string
  description: string
  status: MissionStatus
  priority: 'low' | 'medium' | 'high' | 'critical'
  category?: string
  assigned_agents?: string[]
  approval_required?: boolean
  createdAt: string
  updatedAt: string
}
export type AgentStatus = 'idle' | 'running' | 'waiting' | 'completed' | 'failed'

export interface Task {
  id: string
  title: string
  started_at?: string
  completed_at?: string
}

export interface Agent {
  id: string
  name: string
  role: string
  model: string
  type: 'primary' | 'secondary' | 'specialized'
  status: AgentStatus
  capabilities: string[]
  current_task?: Task
  last_completed_task?: Task
  createdAt: string
  updatedAt: string
}
export interface ActivityLog { id: string; timestamp: string; agentId: string; missionId?: string; type: 'mission_created' | 'mission_updated' | 'mission_completed' | 'approval_requested' | 'approval_granted' | 'skill_executed' | 'system_event'; message: string; metadata?: Record<string, unknown> }
export interface Approval { id: string; missionId: string; requestedBy: string; status: 'pending' | 'approved' | 'rejected'; type: 'high_risk_action' | 'resource_allocation' | 'policy_override'; reason: string; createdAt: string; respondedAt?: string; respondedBy?: string; comments?: string }
export interface Skill { id: string; name: string; description: string; category: string; agentIds: string[]; lastExecuted?: string; executionCount: number; successRate: number; enabled: boolean; createdAt: string; updatedAt: string }
export interface SystemHealth { timestamp: string; status: 'healthy' | 'degraded' | 'critical'; uptime: number; memoryUsage: number; cpuUsage: number; activeAgents: number; activeMissions: number; errors: string[] }
