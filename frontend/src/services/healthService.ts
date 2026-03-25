import { useEffect, useRef } from 'react'
import { useStore } from '../store'
import { apiClient } from '../api/client'
import { SystemHealth } from '../types'

interface HealthCheckResult extends Omit<SystemHealth, 'memoryUsage' | 'cpuUsage' | 'activeMissions' | 'errors'> {
  responseTime: number
  pendingMissions: number
  pendingApprovals: number
}

export function useHealthCheck(intervalMs: number = 30000) {
  const { setHealth } = useStore()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const checkHealth = async () => {
    const startTime = Date.now()
    try {
      const response = await apiClient.get('/health')
      const responseTime = Date.now() - startTime

      const healthData: HealthCheckResult = {
        status: response.data.status || 'healthy',
        timestamp: new Date(),
        responseTime,
        activeAgents: response.data.active_agents || 0,
        pendingMissions: response.data.pending_missions || 0,
        pendingApprovals: response.data.pending_approvals || 0,
        uptime: response.data.uptime || 0,
      }

      setHealth(healthData)
      return healthData
    } catch (error) {
      const unhealthyState: HealthCheckResult = {
        status: 'unhealthy',
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        activeAgents: 0,
        pendingMissions: 0,
        pendingApprovals: 0,
        uptime: 0,
      }

      setHealth(unhealthyState)
      console.error('Health check failed:', error)
      return unhealthyState
    }
  }

  useEffect(() => {
    // Check immediately on mount
    checkHealth()

    // Set up periodic checks
    intervalRef.current = setInterval(checkHealth, intervalMs)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [intervalMs])

  return { checkHealth }
}

export function getHealthStatus(responseTime: number): 'healthy' | 'degraded' | 'unhealthy' {
  if (responseTime >= 10000) return 'unhealthy'
  if (responseTime >= 5000) return 'degraded'
  return 'healthy'
}

export function getHealthColor(status: string): string {
  switch (status) {
    case 'healthy':
      return 'text-green-400'
    case 'degraded':
      return 'text-yellow-400'
    case 'unhealthy':
      return 'text-red-400'
    default:
      return 'text-gray-400'
  }
}
