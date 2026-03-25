import React from 'react'
import { ActivityLog } from '../types'

interface Props {
  activity: ActivityLog
}

const actionIcons: Record<string, string> = {
  mission_created: '🎯',
  mission_assigned: '👥',
  mission_completed: '✅',
  agent_started: '▶️',
  agent_stopped: '⏹️',
  approval_requested: '❓',
  approval_approved: '✔️',
  approval_denied: '❌',
  skill_deployed: '🚀',
  default: '📝',
}

export default function ActivityEntry({ activity }: Props) {
  const icon = actionIcons[activity.action] || actionIcons.default
  const timestamp = new Date(activity.timestamp).toLocaleTimeString()

  return (
    <div className="text-xs flex gap-2 p-2 hover:bg-dark-secondary rounded transition">
      {/* Icon */}
      <span className="text-lg flex-shrink-0">{icon}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-text-primary">
          <span className="font-semibold">{activity.agent}</span>
          <span className="text-text-muted"> {activity.action.replace(/_/g, ' ')}</span>
        </div>
        <div className="text-text-muted">
          {activity.target && <span>Target: {activity.target.substring(0, 20)}</span>}
          {activity.status && <span className="ml-2">({activity.status})</span>}
        </div>
      </div>

      {/* Timestamp */}
      <div className="text-text-muted flex-shrink-0 text-right">
        {timestamp}
      </div>
    </div>
  )
}
