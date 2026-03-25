import React from 'react'
import { useStore } from '../store'
import { getHealthColor } from '../services/healthService'

export default function SystemHealth() {
  const { health } = useStore()

  if (!health) return null

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${
        health.status === 'healthy' ? 'bg-green-400' :
        health.status === 'degraded' ? 'bg-yellow-400' :
        'bg-red-400'
      }`} />
      <span className={`text-sm font-semibold ${getHealthColor(health.status)}`}>
        {health.status.toUpperCase()}
      </span>
      <span className="text-xs text-text-muted ml-2">
        ({health.responseTime}ms)
      </span>
    </div>
  )
}
