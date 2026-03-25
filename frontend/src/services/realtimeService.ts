import { useWebSocket } from '../hooks/useWebSocket'
import { useStore } from '../store'
import { Mission, Agent, ActivityLog, Approval } from '../types'

export function useRealtimeService() {
  const store = useStore()
  const { on, off, emit, connected } = useWebSocket()

  // ==================== MISSION EVENTS ====================
  const onMissionCreated = (callback: (mission: Mission) => void) => {
    on('mission:created', callback)
  }

  const onMissionUpdated = (callback: (mission: Mission) => void) => {
    on('mission:updated', callback)
  }

  const onMissionCompleted = (callback: (missionId: string) => void) => {
    on('mission:completed', callback)
  }

  // ==================== AGENT EVENTS ====================
  const onAgentStatusChanged = (callback: (agent: Agent) => void) => {
    on('agent:status', callback)
  }

  const onAgentTaskStarted = (callback: (data: { agentId: string; taskId: string }) => void) => {
    on('agent:task:started', callback)
  }

  // ==================== ACTIVITY EVENTS ====================
  const onActivityLogged = (callback: (activity: ActivityLog) => void) => {
    on('activity:logged', callback)
  }

  // ==================== APPROVAL EVENTS ====================
  const onApprovalRequested = (callback: (approval: Approval) => void) => {
    on('approval:requested', callback)
  }

  const onApprovalResolved = (callback: (approval: Approval) => void) => {
    on('approval:resolved', callback)
  }

  // ==================== HEALTH EVENTS ====================
  const onHealthUpdate = (callback: (health: any) => void) => {
    on('health:update', callback)
  }

  // ==================== EVENT EMISSION ====================
  const emitMissionUpdate = (mission: Mission) => {
    emit('mission:update', mission)
  }

  const emitApprovalRequest = (approval: Approval) => {
    emit('approval:request', approval)
  }

  const emitActivityLog = (activity: ActivityLog) => {
    emit('activity:log', activity)
  }

  return {
    connected,
    emit,
    // Mission Listeners
    onMissionCreated,
    onMissionUpdated,
    onMissionCompleted,
    // Agent Listeners
    onAgentStatusChanged,
    onAgentTaskStarted,
    // Activity Listeners
    onActivityLogged,
    // Approval Listeners
    onApprovalRequested,
    onApprovalResolved,
    // Health Listeners
    onHealthUpdate,
    // Event Emitters
    emitMissionUpdate,
    emitApprovalRequest,
    emitActivityLog,
  }
}
