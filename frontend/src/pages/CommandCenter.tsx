import React from 'react'
import { useStore } from '../store'
import { MissionBoard, AgentGrid, ActivityFeed, ApprovalsPanel } from '../components'

export default function CommandCenter() {
  const { health } = useStore()

  return (
    <div className="space-y-6">
      {/* System Health Summary */}
      <div className="bg-dark-panel border border-dark-border rounded-lg p-4">
        <h2 className="text-xl font-bold text-text-primary mb-3">System Health</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-accent-cyan">{health?.active_agents ?? 0}</div>
            <p className="text-xs text-text-muted">Active Agents</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400">{health?.pending_missions ?? 0}</div>
            <p className="text-xs text-text-muted">Pending Missions</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">{health?.pending_approvals ?? 0}</div>
            <p className="text-xs text-text-muted">Approvals</p>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${health?.backend_health === 'healthy' ? 'text-green-400' : 'text-red-400'}`}>
              {health?.backend_health === 'healthy' ? '✓' : '✗'}
            </div>
            <p className="text-xs text-text-muted">Backend</p>
          </div>
        </div>
      </div>

      {/* Mission Board */}
      <MissionBoard />

      {/* Agent Grid */}
      <h3 className="text-lg font-bold text-text-primary">Agents</h3>
      <AgentGrid />

      {/* Right Sidebar: Approvals + Activity */}
      <div className="grid grid-cols-2 gap-4">
        <ApprovalsPanel />
        <ActivityFeed />
      </div>
    </div>
  )
}
