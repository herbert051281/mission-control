import React, { useState } from 'react'
import { useStore } from '../store'
import { MissionBoard } from '../components'
import { CreateMissionModal } from '../components/modals'

export default function Missions() {
  const { missions } = useStore()
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Missions</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-accent-cyan text-dark-bg rounded font-semibold hover:bg-cyan-400 transition"
        >
          + New Mission
        </button>
      </div>

      <div className="bg-dark-panel border border-dark-border rounded-lg p-4 text-sm text-text-muted">
        Total Missions: <span className="font-bold text-accent-cyan">{missions.length}</span>
      </div>

      <MissionBoard />

      <CreateMissionModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  )
}
