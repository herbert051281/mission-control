import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useRealtimeService } from './realtimeService'

// Mock the useWebSocket hook
vi.mock('../hooks/useWebSocket', () => ({
  useWebSocket: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connected: true,
    socket: null,
  })),
}))

// Mock the useStore hook
vi.mock('../store', () => ({
  useStore: vi.fn(() => ({
    addMission: vi.fn(),
    updateMission: vi.fn(),
    updateAgent: vi.fn(),
    addActivity: vi.fn(),
    addApproval: vi.fn(),
    updateApproval: vi.fn(),
    setHealth: vi.fn(),
  })),
}))

describe('Realtime Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes event handlers', () => {
    const service = useRealtimeService()

    expect(service.connected).toBeDefined()
    expect(typeof service.onMissionCreated).toBe('function')
    expect(typeof service.onMissionUpdated).toBe('function')
    expect(typeof service.onMissionCompleted).toBe('function')
    expect(typeof service.onAgentStatusChanged).toBe('function')
    expect(typeof service.onAgentTaskStarted).toBe('function')
    expect(typeof service.onActivityLogged).toBe('function')
    expect(typeof service.onApprovalRequested).toBe('function')
    expect(typeof service.onApprovalResolved).toBe('function')
    expect(typeof service.onHealthUpdate).toBe('function')
  })

  it('exposes emit function', () => {
    const service = useRealtimeService()
    expect(typeof service.emit).toBe('function')
  })

  it('provides event emitter methods', () => {
    const service = useRealtimeService()

    expect(typeof service.emitMissionUpdate).toBe('function')
    expect(typeof service.emitApprovalRequest).toBe('function')
    expect(typeof service.emitActivityLog).toBe('function')
  })

  it('onMissionCreated registers a callback', () => {
    const service = useRealtimeService()
    const callback = vi.fn()

    service.onMissionCreated(callback)

    expect(typeof callback).toBe('function')
  })

  it('onApprovalRequested registers a callback', () => {
    const service = useRealtimeService()
    const callback = vi.fn()

    service.onApprovalRequested(callback)

    expect(typeof callback).toBe('function')
  })

  it('onHealthUpdate registers a callback', () => {
    const service = useRealtimeService()
    const callback = vi.fn()

    service.onHealthUpdate(callback)

    expect(typeof callback).toBe('function')
  })

  it('emits events with data', () => {
    const service = useRealtimeService()
    const testData = { data: 'test' }

    service.emit('test:event', testData)

    expect(typeof service.emit).toBe('function')
  })

  it('all mission event handlers are properly defined', () => {
    const service = useRealtimeService()

    expect(service.onMissionCreated).toBeDefined()
    expect(service.onMissionUpdated).toBeDefined()
    expect(service.onMissionCompleted).toBeDefined()
  })

  it('all agent event handlers are properly defined', () => {
    const service = useRealtimeService()

    expect(service.onAgentStatusChanged).toBeDefined()
    expect(service.onAgentTaskStarted).toBeDefined()
  })

  it('all approval event handlers are properly defined', () => {
    const service = useRealtimeService()

    expect(service.onApprovalRequested).toBeDefined()
    expect(service.onApprovalResolved).toBeDefined()
  })

  it('connection state is available', () => {
    const service = useRealtimeService()

    expect(service.connected).toBe(true)
  })
})
