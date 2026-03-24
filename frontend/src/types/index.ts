/**
 * Core domain types for Mission Control
 */

export interface Mission {
  id: string
  title: string
  description: string
  status: 'intake' | 'planning' | 'active' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'critical'
  agentId: string
  createdAt: string
  updatedAt: string
  dueDate?: string
  tags: string[]
}

export interface Agent {
  id: string
  name: string
  type: 'primary' | 'secondary' | 'specialized'
  status: 'idle' | 'busy' | 'offline'
  capabilities: string[]
  createdAt: string
  updatedAt: string
}

export interface ActivityLog {
  id: string
  timestamp: string
  agentId: string
  missionId?: string
  type: 'mission_created' | 'mission_updated' | 'mission_completed' | 'approval_requested' | 'approval_granted' | 'skill_executed' | 'system_event'
  message: string
  metadata?: Record<string, unknown>
}

export interface Approval {
  id: string
  missionId: string
  requestedBy: string
  status: 'pending' | 'approved' | 'rejected'
  type: 'high_risk_action' | 'resource_allocation' | 'policy_override'
  reason: string
  createdAt: string
  respondedAt?: string
  respondedBy?: string
  comments?: string
}

export interface Skill {
  id: string
  name: string
  description: string
  category: string
  agentIds: string[]
  lastExecuted?: string
  executionCount: number
  successRate: number
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface SystemHealth {
  timestamp: string
  status: 'healthy' | 'degraded' | 'critical'
  uptime: number
  memoryUsage: number
  cpuUsage: number
  activeAgents: number
  activeMissions: number
  errors: string[]
}

export interface UIState {
  sidebarOpen: boolean
  activeTab: string
  selectedMission: string | null
}

export interface AuthState {
  token: string | null
  agentId: string | null
  agentName: string | null
}
