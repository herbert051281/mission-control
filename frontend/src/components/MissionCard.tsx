import React from 'react'
import { Mission } from '../types'
import { useStore } from '../store'

interface Props {
  mission: Mission
}

export default function MissionCard({ mission }: Props) {
  const { setSelectedMission } = useStore()

  return (
    <div
      onClick={() => setSelectedMission(mission.id)}
      className="bg-dark-panel p-3 rounded border border-dark-border hover:border-accent-cyan cursor-pointer transition"
    >
      {/* Title */}
      <h3 className="font-semibold text-text-primary text-sm truncate">{mission.title}</h3>

      {/* Category Badge */}
      <div className="mt-2 inline-block bg-dark-secondary px-2 py-1 rounded text-xs text-accent-cyan">
        {mission.category}
      </div>

      {/* Priority Badge */}
      <div className={`inline-block ml-2 px-2 py-1 rounded text-xs font-semibold ${
        mission.priority === 'high' ? 'bg-red-500 bg-opacity-20 text-red-400' :
        mission.priority === 'critical' ? 'bg-red-600 bg-opacity-30 text-red-300' :
        mission.priority === 'medium' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
        'bg-gray-500 bg-opacity-20 text-gray-400'
      }`}>
        {mission.priority}
      </div>

      {/* Assigned Agents */}
      {mission.assigned_agents && mission.assigned_agents.length > 0 && (
        <div className="mt-2 text-xs text-text-muted">
          Agents: {mission.assigned_agents.length}
        </div>
      )}

      {/* Approval Required Indicator */}
      {mission.approval_required && (
        <div className="mt-2 text-xs text-yellow-400">🔒 Approval required</div>
      )}
    </div>
  )
}
