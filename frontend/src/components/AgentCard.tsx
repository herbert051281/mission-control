import React from 'react'
import { Agent, AgentStatus } from '../types'

interface Props {
  agent: Agent
}

const statusColors: Record<AgentStatus, { bg: string; text: string; dot: string }> = {
  idle: { bg: 'bg-gray-700', text: 'text-gray-300', dot: 'bg-gray-400' },
  running: { bg: 'bg-cyan-700', text: 'text-cyan-300', dot: 'bg-cyan-400' },
  waiting: { bg: 'bg-yellow-700', text: 'text-yellow-300', dot: 'bg-yellow-400' },
  completed: { bg: 'bg-green-700', text: 'text-green-300', dot: 'bg-green-400' },
  failed: { bg: 'bg-red-700', text: 'text-red-300', dot: 'bg-red-400' },
}

export default function AgentCard({ agent }: Props) {
  const statusStyle = statusColors[agent.status]

  return (
    <div className="bg-dark-panel border border-dark-border rounded-lg p-4 hover:border-accent-cyan transition">
      {/* Header: Name + Status */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-text-primary">{agent.name}</h3>
          <p className="text-xs text-text-muted">{agent.role}</p>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-semibold ${statusStyle.bg} ${statusStyle.text}`}
        >
          <div className={`w-2 h-2 rounded-full ${statusStyle.dot}`}></div>
          {agent.status}
        </div>
      </div>

      {/* Model */}
      <p className="text-xs text-text-muted mb-3">📦 {agent.model}</p>

      {/* Current Task */}
      {agent.current_task && (
        <div className="bg-dark-secondary p-3 rounded mb-3">
          <p className="text-xs text-accent-cyan font-semibold">Current Task</p>
          <p className="text-sm text-text-primary truncate">{agent.current_task.title}</p>
          {agent.current_task.started_at && (
            <p className="text-xs text-text-muted mt-1">
              Started: {new Date(agent.current_task.started_at).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Last Completed Task */}
      {agent.last_completed_task && (
        <div className="bg-dark-secondary p-3 rounded">
          <p className="text-xs text-green-400 font-semibold">Last Completed</p>
          <p className="text-sm text-text-primary truncate">{agent.last_completed_task.title}</p>
          {agent.last_completed_task.completed_at && (
            <p className="text-xs text-text-muted mt-1">
              Completed: {new Date(agent.last_completed_task.completed_at).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
