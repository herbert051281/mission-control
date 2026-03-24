import React from 'react'
import { useStore } from '../store'

export default function TopCommandBar() {
  const { health, approvals } = useStore()
  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length

  const systemStatus = health ? 'ok' : 'unknown'
  const statusColor = systemStatus === 'ok' ? 'text-green-500' : 'text-yellow-500'

  return (
    <div className="bg-dark-panel border-b border-dark-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-accent-cyan">Mission Control</h1>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
          <span className="text-sm text-text-muted">
            {systemStatus === 'ok' ? 'System OK' : 'Checking...'}
          </span>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search missions, agents, approvals..."
        className="flex-1 mx-8 px-4 py-2 rounded bg-dark-secondary border border-dark-border text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-cyan"
      />

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">Pending</span>
          <div className="bg-yellow-500 bg-opacity-20 text-yellow-400 px-3 py-1 rounded text-sm font-semibold">
            {pendingApprovalsCount}
          </div>
        </div>

        <div className="text-sm text-text-muted">
          Models: <span className="text-accent-cyan font-semibold">9 active</span>
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-dark-border">
          <div className="w-8 h-8 rounded-full bg-accent-purple opacity-70"></div>
          <span className="text-sm text-text-primary">You</span>
        </div>
      </div>
    </div>
  )
}
