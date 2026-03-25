import { MissionStatus, AgentStatus, ApprovalStatus } from '../types'

export const missionStatusColors: Record<MissionStatus, { bg: string; text: string; icon: string }> = {
  intake: { bg: 'bg-slate-700', text: 'text-slate-300', icon: '📥' },
  routed: { bg: 'bg-blue-700', text: 'text-blue-300', icon: '🔀' },
  in_progress: { bg: 'bg-cyan-700', text: 'text-cyan-300', icon: '▶️' },
  review: { bg: 'bg-purple-700', text: 'text-purple-300', icon: '👀' },
  awaiting_approval: { bg: 'bg-yellow-700', text: 'text-yellow-300', icon: '⏳' },
  completed: { bg: 'bg-green-700', text: 'text-green-300', icon: '✅' },
}

export const agentStatusColors: Record<AgentStatus, { bg: string; text: string; dot: string }> = {
  idle: { bg: 'bg-gray-700', text: 'text-gray-300', dot: 'bg-gray-400' },
  running: { bg: 'bg-cyan-700', text: 'text-cyan-300', dot: 'bg-cyan-400' },
  waiting: { bg: 'bg-yellow-700', text: 'text-yellow-300', dot: 'bg-yellow-400' },
  completed: { bg: 'bg-green-700', text: 'text-green-300', dot: 'bg-green-400' },
  failed: { bg: 'bg-red-700', text: 'text-red-300', dot: 'bg-red-400' },
}

export const approvalStatusColors: Record<ApprovalStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-600 bg-opacity-20', text: 'text-yellow-400' },
  approved: { bg: 'bg-green-600 bg-opacity-20', text: 'text-green-400' },
  denied: { bg: 'bg-red-600 bg-opacity-20', text: 'text-red-400' },
}

export function getMissionStatusColor(status: MissionStatus) {
  return missionStatusColors[status] || missionStatusColors.intake
}

export function getAgentStatusColor(status: AgentStatus) {
  return agentStatusColors[status] || agentStatusColors.idle
}

export function getApprovalStatusColor(status: ApprovalStatus) {
  return approvalStatusColors[status] || approvalStatusColors.pending
}
