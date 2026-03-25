import React from 'react'
import { useStore } from '../store'

const NAV_ITEMS = [
  { id: 'command-center', label: 'Command Center', icon: '🎮' },
  { id: 'missions', label: 'Missions', icon: '🎯' },
  { id: 'agents', label: 'Agents', icon: '🤖' },
  { id: 'activity', label: 'Activity', icon: '📊' },
  { id: 'approvals', label: 'Approvals', icon: '✅' },
  { id: 'skills', label: 'Skills', icon: '⚙️' },
  { id: 'settings', label: 'Settings', icon: '⚡' },
]

export default function LeftNav() {
  const { activeTab, setActiveTab } = useStore()

  return (
    <nav className="w-64 bg-dark-panel border-r border-dark-border flex flex-col p-4">
      {/* Logo/Branding */}
      <div className="mb-8 pb-6 border-b border-dark-border">
        <div className="text-2xl font-bold text-accent-cyan">MC</div>
        <p className="text-xs text-text-muted mt-1">Mission Control</p>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition ${
              activeTab === item.id
                ? 'bg-dark-secondary text-accent-cyan'
                : 'text-text-muted hover:text-text-primary hover:bg-dark-secondary'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Footer: Version Info */}
      <div className="pt-6 border-t border-dark-border text-xs text-text-muted">
        <p>v1.0.0</p>
        <p>Backend: Connected ✓</p>
      </div>
    </nav>
  )
}
