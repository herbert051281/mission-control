import { useEffect } from 'react'
import { useStore } from '../store'
import { useRealtimeService } from '../services/realtimeService'

/**
 * Hook to initialize and manage WebSocket event listeners
 * Connects frontend state to real-time backend events
 * 
 * Handles:
 * - Mission lifecycle (created, updated, completed)
 * - Agent status changes and task events
 * - Activity logging
 * - Approval requests and resolutions
 * - Health updates
 */
export function useWebSocketEvents() {
  const store = useStore()
  const realtime = useRealtimeService()

  useEffect(() => {
    if (!realtime.connected) return

    // ==================== MISSION EVENTS ====================
    realtime.onMissionCreated((mission) => {
      store.addMission(mission)
    })

    realtime.onMissionUpdated((mission) => {
      store.updateMission(mission.id, mission)
    })

    realtime.onMissionCompleted((missionId) => {
      store.updateMission(missionId, { status: 'completed' })
    })

    // ==================== AGENT EVENTS ====================
    realtime.onAgentStatusChanged((agent) => {
      store.updateAgent(agent.id, agent)
    })

    realtime.onAgentTaskStarted(({ agentId, taskId }) => {
      store.addActivity({
        id: taskId,
        timestamp: new Date().toISOString(),
        agentId,
        type: 'skill_executed',
        message: `Agent ${agentId} started task ${taskId}`,
        metadata: {
          taskId,
          source: 'realtime',
        },
      })
    })

    // ==================== ACTIVITY EVENTS ====================
    realtime.onActivityLogged((activity) => {
      store.addActivity(activity)
    })

    // ==================== APPROVAL EVENTS ====================
    realtime.onApprovalRequested((approval) => {
      store.addApproval(approval)
    })

    realtime.onApprovalResolved((approval) => {
      store.updateApproval(approval.id, approval)
    })

    // ==================== HEALTH EVENTS ====================
    realtime.onHealthUpdate((health) => {
      store.setHealth(health)
    })

    return () => {
      // Cleanup is handled by useWebSocket hook's disconnect
    }
  }, [realtime.connected, store, realtime])
}
