import React from 'react'
import { useStore } from '../store'
import MissionCard from './MissionCard'

const STAGES = [
  { id: 'intake', label: 'Intake', color: 'bg-slate-700' },
  { id: 'routed', label: 'Routed', color: 'bg-blue-700' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-cyan-700' },
  { id: 'review', label: 'Review', color: 'bg-purple-700' },
  { id: 'awaiting_approval', label: 'Awaiting Approval', color: 'bg-yellow-700' },
  { id: 'completed', label: 'Completed', color: 'bg-green-700' },
]

export default function MissionBoard() {
  const { missions, getMissionsByStatus } = useStore()

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const stageMissions = getMissionsByStatus(stage.id)
        return (
          <div key={stage.id} className="flex-shrink-0 w-80">
            {/* Stage Column Header */}
            <div className={`${stage.color} text-white px-4 py-3 rounded-t font-semibold`}>
              {stage.label}
              <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
                {stageMissions.length}
              </span>
            </div>

            {/* Mission Cards Container */}
            <div className="bg-dark-secondary rounded-b min-h-96 p-3 space-y-3">
              {stageMissions.length > 0 ? (
                stageMissions.map((mission) => (
                  <MissionCard key={mission.id} mission={mission} />
                ))
              ) : (
                <div className="text-text-muted text-sm text-center py-8">
                  No missions
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
