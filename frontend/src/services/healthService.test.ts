import { describe, it, expect } from 'vitest'
import { getHealthStatus, getHealthColor } from './healthService'

describe('Health Service', () => {
  it('returns healthy for response time < 5s', () => {
    expect(getHealthStatus(1000)).toBe('healthy')
    expect(getHealthStatus(4999)).toBe('healthy')
  })

  it('returns degraded for response time 5s-10s', () => {
    expect(getHealthStatus(5000)).toBe('degraded')
    expect(getHealthStatus(7500)).toBe('degraded')
  })

  it('returns unhealthy for response time > 10s', () => {
    expect(getHealthStatus(10000)).toBe('unhealthy')
    expect(getHealthStatus(15000)).toBe('unhealthy')
  })

  it('maps status to color', () => {
    expect(getHealthColor('healthy')).toContain('green')
    expect(getHealthColor('degraded')).toContain('yellow')
    expect(getHealthColor('unhealthy')).toContain('red')
  })
})
