import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from './index'
import { Mission, Agent, ActivityLog, Approval, Skill, SystemHealth } from '../types'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('Zustand Store', () => {
  beforeEach(() => {
    useStore.setState({
      missions: [],
      agents: [],
      activities: [],
      approvals: [],
      skills: [],
      health: null,
      sidebarOpen: true,
      activeTab: 'command-center',
      selectedMission: null,
      token: null,
      agentId: null,
      agentName: null,
    })
    localStorageMock.clear()
  })

  // Mission Store Tests
  describe('Mission Store', () => {
    it('adds a mission', () => {
      const { addMission } = useStore.getState()
      const mission: Mission = {
        id: '1',
        title: 'Test Mission',
        description: 'Test Description',
        status: 'intake',
        priority: 'high',
        agentId: 'agent1',
        createdAt: '2026-03-25T00:00:00Z',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: ['test'],
      }
      addMission(mission)
      expect(useStore.getState().missions).toHaveLength(1)
      expect(useStore.getState().missions[0].title).toBe('Test Mission')
    })

    it('retrieves missions by status', () => {
      const { addMission, getMissionsByStatus } = useStore.getState()
      const mission1: Mission = {
        id: '1',
        title: 'Mission 1',
        description: 'Desc 1',
        status: 'intake',
        priority: 'high',
        agentId: 'agent1',
        createdAt: '2026-03-25T00:00:00Z',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: [],
      }
      const mission2: Mission = {
        id: '2',
        title: 'Mission 2',
        description: 'Desc 2',
        status: 'active',
        priority: 'low',
        agentId: 'agent1',
        createdAt: '2026-03-25T00:00:00Z',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: [],
      }
      addMission(mission1)
      addMission(mission2)
      const intakeMissions = getMissionsByStatus('intake')
      expect(intakeMissions).toHaveLength(1)
      expect(intakeMissions[0].id).toBe('1')
    })

    it('updates a mission', () => {
      const { addMission, updateMission } = useStore.getState()
      const mission: Mission = {
        id: '1',
        title: 'Original Title',
        description: 'Desc',
        status: 'intake',
        priority: 'high',
        agentId: 'agent1',
        createdAt: '2026-03-25T00:00:00Z',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: [],
      }
      addMission(mission)
      updateMission('1', { title: 'Updated Title', status: 'active' })
      expect(useStore.getState().missions[0].title).toBe('Updated Title')
      expect(useStore.getState().missions[0].status).toBe('active')
    })

    it('deletes a mission', () => {
      const { addMission, deleteMission } = useStore.getState()
      const mission: Mission = {
        id: '1',
        title: 'Test',
        description: 'Desc',
        status: 'intake',
        priority: 'high',
        agentId: 'agent1',
        createdAt: '2026-03-25T00:00:00Z',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: [],
      }
      addMission(mission)
      expect(useStore.getState().missions).toHaveLength(1)
      deleteMission('1')
      expect(useStore.getState().missions).toHaveLength(0)
    })
  })

  // Agent Store Tests
  describe('Agent Store', () => {
    it('adds an agent', () => {
      const { addAgent } = useStore.getState()
      const agent: Agent = {
        id: 'agent1',
        name: 'Test Agent',
        type: 'primary',
        status: 'idle',
        capabilities: ['task1', 'task2'],
        createdAt: '2026-03-25T00:00:00Z',
        updatedAt: '2026-03-25T00:00:00Z',
      }
      addAgent(agent)
      expect(useStore.getState().agents).toHaveLength(1)
    })

    it('retrieves agent by id', () => {
      const { addAgent, getAgentById } = useStore.getState()
      const agent: Agent = {
        id: 'agent1',
        name: 'Test Agent',
        type: 'primary',
        status: 'idle',
        capabilities: [],
        createdAt: '2026-03-25T00:00:00Z',
        updatedAt: '2026-03-25T00:00:00Z',
      }
      addAgent(agent)
      const retrieved = getAgentById('agent1')
      expect(retrieved).toBeDefined()
      expect(retrieved?.name).toBe('Test Agent')
    })

    it('retrieves agents by status', () => {
      const { addAgent, getAgentsByStatus } = useStore.getState()
      const agent1: Agent = {
        id: 'agent1',
        name: 'Agent 1',
        type: 'primary',
        status: 'idle',
        capabilities: [],
        createdAt: '2026-03-25T00:00:00Z',
        updatedAt: '2026-03-25T00:00:00Z',
      }
      const agent2: Agent = {
        id: 'agent2',
        name: 'Agent 2',
        type: 'secondary',
        status: 'busy',
        capabilities: [],
        createdAt: '2026-03-25T00:00:00Z',
        updatedAt: '2026-03-25T00:00:00Z',
      }
      addAgent(agent1)
      addAgent(agent2)
      const busyAgents = getAgentsByStatus('busy')
      expect(busyAgents).toHaveLength(1)
      expect(busyAgents[0].id).toBe('agent2')
    })
  })

  // Activity Store Tests
  describe('Activity Store', () => {
    it('adds an activity', () => {
      const { addActivity } = useStore.getState()
      const activity: ActivityLog = {
        id: '1',
        timestamp: '2026-03-25T00:00:00Z',
        agentId: 'agent1',
        type: 'mission_created',
        message: 'Mission created',
      }
      addActivity(activity)
      expect(useStore.getState().activities).toHaveLength(1)
    })

    it('prepends new activities to list', () => {
      const { addActivity } = useStore.getState()
      const activity1: ActivityLog = {
        id: '1',
        timestamp: '2026-03-25T00:00:00Z',
        agentId: 'agent1',
        type: 'mission_created',
        message: 'First',
      }
      const activity2: ActivityLog = {
        id: '2',
        timestamp: '2026-03-25T01:00:00Z',
        agentId: 'agent1',
        type: 'mission_updated',
        message: 'Second',
      }
      addActivity(activity1)
      addActivity(activity2)
      expect(useStore.getState().activities[0].id).toBe('2')
    })

    it('limits activities to 100', () => {
      const { addActivity } = useStore.getState()
      for (let i = 0; i < 150; i++) {
        addActivity({
          id: `${i}`,
          timestamp: '2026-03-25T00:00:00Z',
          agentId: 'agent1',
          type: 'system_event',
          message: `Activity ${i}`,
        })
      }
      expect(useStore.getState().activities).toHaveLength(100)
    })

    it('clears all activities', () => {
      const { addActivity, clearActivities } = useStore.getState()
      addActivity({
        id: '1',
        timestamp: '2026-03-25T00:00:00Z',
        agentId: 'agent1',
        type: 'system_event',
        message: 'Test',
      })
      expect(useStore.getState().activities).toHaveLength(1)
      clearActivities()
      expect(useStore.getState().activities).toHaveLength(0)
    })
  })

  // Approval Store Tests
  describe('Approval Store', () => {
    it('adds an approval', () => {
      const { addApproval } = useStore.getState()
      const approval: Approval = {
        id: '1',
        missionId: 'mission1',
        requestedBy: 'agent1',
        status: 'pending',
        type: 'high_risk_action',
        reason: 'High risk operation',
        createdAt: '2026-03-25T00:00:00Z',
      }
      addApproval(approval)
      expect(useStore.getState().approvals).toHaveLength(1)
    })

    it('retrieves pending approvals', () => {
      const { addApproval, getPendingApprovals } = useStore.getState()
      const approval1: Approval = {
        id: '1',
        missionId: 'mission1',
        requestedBy: 'agent1',
        status: 'pending',
        type: 'high_risk_action',
        reason: 'High risk',
        createdAt: '2026-03-25T00:00:00Z',
      }
      const approval2: Approval = {
        id: '2',
        missionId: 'mission2',
        requestedBy: 'agent1',
        status: 'approved',
        type: 'resource_allocation',
        reason: 'Resource request',
        createdAt: '2026-03-25T00:00:00Z',
      }
      addApproval(approval1)
      addApproval(approval2)
      const pending = getPendingApprovals()
      expect(pending).toHaveLength(1)
      expect(pending[0].id).toBe('1')
    })

    it('updates an approval', () => {
      const { addApproval, updateApproval } = useStore.getState()
      const approval: Approval = {
        id: '1',
        missionId: 'mission1',
        requestedBy: 'agent1',
        status: 'pending',
        type: 'high_risk_action',
        reason: 'High risk',
        createdAt: '2026-03-25T00:00:00Z',
      }
      addApproval(approval)
      updateApproval('1', { status: 'approved', respondedBy: 'admin1' })
      const updated = useStore.getState().approvals[0]
      expect(updated.status).toBe('approved')
      expect(updated.respondedBy).toBe('admin1')
    })

    it('deletes an approval', () => {
      const { addApproval, deleteApproval } = useStore.getState()
      const approval: Approval = {
        id: '1',
        missionId: 'mission1',
        requestedBy: 'agent1',
        status: 'pending',
        type: 'high_risk_action',
        reason: 'High risk',
        createdAt: '2026-03-25T00:00:00Z',
      }
      addApproval(approval)
      expect(useStore.getState().approvals).toHaveLength(1)
      deleteApproval('1')
      expect(useStore.getState().approvals).toHaveLength(0)
    })
  })

  // Skill Store Tests
  describe('Skill Store', () => {
    it('adds a skill', () => {
      const { addSkill } = useStore.getState()
      const skill: Skill = {
        id: '1',
        name: 'Data Analysis',
        description: 'Advanced data analysis',
        category: 'analytics',
        agentIds: ['agent1'],
        executionCount: 0,
        successRate: 0,
        enabled: true,
        createdAt: '2026-03-25T00:00:00Z',
        updatedAt: '2026-03-25T00:00:00Z',
      }
      addSkill(skill)
      expect(useStore.getState().skills).toHaveLength(1)
    })

    it('retrieves skills by category', () => {
      const { addSkill, getSkillsByCategory } = useStore.getState()
      const skill1: Skill = {
        id: '1',
        name: 'Skill 1',
        description: 'Desc 1',
        category: 'analytics',
        agentIds: [],
        executionCount: 0,
        successRate: 0,
        enabled: true,
        createdAt: '2026-03-25T00:00:00Z',
        updatedAt: '2026-03-25T00:00:00Z',
      }
      const skill2: Skill = {
        id: '2',
        name: 'Skill 2',
        description: 'Desc 2',
        category: 'coding',
        agentIds: [],
        executionCount: 0,
        successRate: 0,
        enabled: true,
        createdAt: '2026-03-25T00:00:00Z',
        updatedAt: '2026-03-25T00:00:00Z',
      }
      addSkill(skill1)
      addSkill(skill2)
      const analyticSkills = getSkillsByCategory('analytics')
      expect(analyticSkills).toHaveLength(1)
      expect(analyticSkills[0].id).toBe('1')
    })

    it('updates a skill', () => {
      const { addSkill, updateSkill } = useStore.getState()
      const skill: Skill = {
        id: '1',
        name: 'Test Skill',
        description: 'Desc',
        category: 'analytics',
        agentIds: [],
        executionCount: 0,
        successRate: 0,
        enabled: true,
        createdAt: '2026-03-25T00:00:00Z',
        updatedAt: '2026-03-25T00:00:00Z',
      }
      addSkill(skill)
      updateSkill('1', { executionCount: 5, successRate: 100 })
      const updated = useStore.getState().skills[0]
      expect(updated.executionCount).toBe(5)
      expect(updated.successRate).toBe(100)
    })
  })

  // Health Store Tests
  describe('Health Store', () => {
    it('sets system health', () => {
      const { setHealth } = useStore.getState()
      const health: SystemHealth = {
        timestamp: '2026-03-25T00:00:00Z',
        status: 'healthy',
        uptime: 3600,
        memoryUsage: 50,
        cpuUsage: 25,
        activeAgents: 5,
        activeMissions: 10,
        errors: [],
      }
      setHealth(health)
      expect(useStore.getState().health).toBeDefined()
      expect(useStore.getState().health?.status).toBe('healthy')
    })

    it('updates system health partially', () => {
      const { setHealth, updateHealth } = useStore.getState()
      const health: SystemHealth = {
        timestamp: '2026-03-25T00:00:00Z',
        status: 'healthy',
        uptime: 3600,
        memoryUsage: 50,
        cpuUsage: 25,
        activeAgents: 5,
        activeMissions: 10,
        errors: [],
      }
      setHealth(health)
      updateHealth({ status: 'degraded', memoryUsage: 85 })
      const updated = useStore.getState().health
      expect(updated?.status).toBe('degraded')
      expect(updated?.memoryUsage).toBe(85)
      expect(updated?.uptime).toBe(3600)
    })
  })

  // UI Store Tests
  describe('UI Store', () => {
    it('toggles sidebar', () => {
      const { toggleSidebar } = useStore.getState()
      expect(useStore.getState().sidebarOpen).toBe(true)
      toggleSidebar()
      expect(useStore.getState().sidebarOpen).toBe(false)
      toggleSidebar()
      expect(useStore.getState().sidebarOpen).toBe(true)
    })

    it('sets active tab', () => {
      const { setActiveTab } = useStore.getState()
      setActiveTab('missions')
      expect(useStore.getState().activeTab).toBe('missions')
      setActiveTab('agents')
      expect(useStore.getState().activeTab).toBe('agents')
    })

    it('sets selected mission', () => {
      const { setSelectedMission } = useStore.getState()
      setSelectedMission('mission1')
      expect(useStore.getState().selectedMission).toBe('mission1')
      setSelectedMission(null)
      expect(useStore.getState().selectedMission).toBeNull()
    })
  })

  // Auth Store Tests
  describe('Auth Store', () => {
    it('manages authentication state', () => {
      const { setAuth, isAuthenticated } = useStore.getState()
      expect(isAuthenticated()).toBe(false)
      setAuth('token123', 'agent1', 'Test Agent')
      expect(isAuthenticated()).toBe(true)
      expect(useStore.getState().token).toBe('token123')
      expect(useStore.getState().agentId).toBe('agent1')
      expect(useStore.getState().agentName).toBe('Test Agent')
    })

    it('persists auth to localStorage', () => {
      const { setAuth } = useStore.getState()
      setAuth('token123', 'agent1', 'Test Agent')
      expect(localStorageMock.getItem('token')).toBe('token123')
      expect(localStorageMock.getItem('agentId')).toBe('agent1')
      expect(localStorageMock.getItem('agentName')).toBe('Test Agent')
    })

    it('clears authentication state', () => {
      const { setAuth, clearAuth, isAuthenticated } = useStore.getState()
      setAuth('token123', 'agent1', 'Test Agent')
      expect(isAuthenticated()).toBe(true)
      clearAuth()
      expect(isAuthenticated()).toBe(false)
      expect(useStore.getState().token).toBeNull()
      expect(useStore.getState().agentId).toBeNull()
      expect(useStore.getState().agentName).toBeNull()
    })

    it('removes auth from localStorage on clear', () => {
      const { setAuth, clearAuth } = useStore.getState()
      setAuth('token123', 'agent1', 'Test Agent')
      expect(localStorageMock.getItem('token')).toBe('token123')
      clearAuth()
      expect(localStorageMock.getItem('token')).toBeNull()
      expect(localStorageMock.getItem('agentId')).toBeNull()
      expect(localStorageMock.getItem('agentName')).toBeNull()
    })
  })
})
