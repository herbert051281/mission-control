import { useState } from 'react'
import { useStore } from '../store'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const { agentName, agentId, clearAuth } = useStore()
  const navigate = useNavigate()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Settings</h1>
        <p className="text-text-muted">Manage your agent configuration and preferences</p>
      </div>

      {/* Agent Profile */}
      <div className="bg-dark-panel border border-dark-border rounded-lg p-6">
        <h2 className="text-lg font-bold text-text-primary mb-4">Agent Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1">Agent Name</label>
            <input
              type="text"
              value={agentName || ''}
              readOnly
              className="w-full px-4 py-2 bg-dark-secondary border border-dark-border rounded text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1">Agent ID</label>
            <input
              type="text"
              value={agentId || ''}
              readOnly
              className="w-full px-4 py-2 bg-dark-secondary border border-dark-border rounded text-text-primary font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-dark-panel border border-dark-border rounded-lg p-6">
        <h2 className="text-lg font-bold text-text-primary mb-4">Preferences</h2>
        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded border border-dark-border"
            />
            <span className="text-text-primary">Enable notifications</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded border border-dark-border"
            />
            <span className="text-text-primary">Auto-refresh data</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border border-dark-border"
            />
            <span className="text-text-primary">Dark mode (always on)</span>
          </label>
        </div>
      </div>

      {/* Security */}
      <div className="bg-dark-panel border border-dark-border rounded-lg p-6">
        <h2 className="text-lg font-bold text-text-primary mb-4">Security</h2>
        <div className="space-y-4">
          <p className="text-sm text-text-muted">Session management and authentication</p>
          <button
            onClick={() => setShowConfirm(!showConfirm)}
            className="px-4 py-2 bg-red-600 bg-opacity-20 border border-red-600 rounded text-red-400 hover:bg-opacity-30 transition"
          >
            Logout
          </button>
          {showConfirm && (
            <div className="p-4 bg-red-600 bg-opacity-10 border border-red-600 rounded space-y-3">
              <p className="text-text-primary">Are you sure you want to logout?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-red-600 rounded text-white font-semibold hover:bg-red-700 transition"
                >
                  Yes, Logout
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2 bg-dark-secondary border border-dark-border rounded text-text-primary hover:bg-dark-border transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* About */}
      <div className="bg-dark-panel border border-dark-border rounded-lg p-6">
        <h2 className="text-lg font-bold text-text-primary mb-4">About</h2>
        <div className="space-y-2 text-sm text-text-muted">
          <p><strong>Mission Control</strong> v1.0.0</p>
          <p>Agent Command & Control System</p>
          <p className="mt-4">Built with React, Zustand, and WebSocket integration</p>
        </div>
      </div>
    </div>
  )
}
