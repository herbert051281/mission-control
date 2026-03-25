import React from 'react'
import { useStore } from '../store'
import { AgentGrid } from '../components'

export default function Agents() {
  const { agents } = useStore()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-text-primary">Agents</h1>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-dark-panel border border-dark-border rounded-lg p-4">
          <p className="text-xs text-text-muted">Total Agents</p>
          <p className="text-3xl font-bold text-accent-cyan">{agents.length}</p>
        </div>
        <div className="bg-dark-panel border border-dark-border rounded-lg p-4">
          <p className="text-xs text-text-muted">Running</p>
          <p className="text-3xl font-bold text-cyan-400">{agents.filter(a => a.status === 'running').length}</p>
        </div>
        <div className="bg-dark-panel border border-dark-border rounded-lg p-4">
          <p className="text-xs text-text-muted">Idle</p>
          <p className="text-3xl font-bold text-gray-400">{agents.filter(a => a.status === 'idle').length}</p>
        </div>
        <div className="bg-dark-panel border border-dark-border rounded-lg p-4">
          <p className="text-xs text-text-muted">Failed</p>
          <p className="text-3xl font-bold text-red-400">{agents.filter(a => a.status === 'failed').length}</p>
        </div>
      </div>

      <AgentGrid />
    </div>
  )
}
