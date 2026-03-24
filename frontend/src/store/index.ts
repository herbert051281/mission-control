import { create } from 'zustand'
import { Mission, Agent, ActivityLog, Approval, Skill, SystemHealth } from '../types'

/**
 * Mission Store Interface
 */
interface MissionStore {
  missions: Mission[]
  setMissions: (missions: Mission[]) => void
  addMission: (mission: Mission) => void
  updateMission: (id: string, mission: Partial<Mission>) => void
  getMissionsByStatus: (status: string) => Mission[]
  deleteMission: (id: string) => void
}

/**
 * Agent Store Interface
 */
interface AgentStore {
  agents: Agent[]
  setAgents: (agents: Agent[]) => void
  addAgent: (agent: Agent) => void
  updateAgent: (id: string, agent: Partial<Agent>) => void
  getAgentById: (id: string) => Agent | undefined
  getAgentsByStatus: (status: string) => Agent[]
}

/**
 * Activity Store Interface
 */
interface ActivityStore {
  activities: ActivityLog[]
  setActivities: (activities: ActivityLog[]) => void
  addActivity: (activity: ActivityLog) => void
  clearActivities: () => void
}

/**
 * Approval Store Interface
 */
interface ApprovalStore {
  approvals: Approval[]
  setApprovals: (approvals: Approval[]) => void
  addApproval: (approval: Approval) => void
  updateApproval: (id: string, approval: Partial<Approval>) => void
  getPendingApprovals: () => Approval[]
  deleteApproval: (id: string) => void
}

/**
 * Skill Store Interface
 */
interface SkillStore {
  skills: Skill[]
  setSkills: (skills: Skill[]) => void
  addSkill: (skill: Skill) => void
  updateSkill: (id: string, skill: Partial<Skill>) => void
  getSkillsByCategory: (category: string) => Skill[]
  deleteSkill: (id: string) => void
}

/**
 * Health Store Interface
 */
interface HealthStore {
  health: SystemHealth | null
  setHealth: (health: SystemHealth) => void
  updateHealth: (partial: Partial<SystemHealth>) => void
}

/**
 * UI Store Interface
 */
interface UIStore {
  sidebarOpen: boolean
  toggleSidebar: () => void
  activeTab: string
  setActiveTab: (tab: string) => void
  selectedMission: string | null
  setSelectedMission: (id: string | null) => void
}

/**
 * Auth Store Interface
 */
interface AuthStore {
  token: string | null
  agentId: string | null
  agentName: string | null
  setAuth: (token: string, agentId: string, agentName: string) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
}

/**
 * Combined Store Type
 */
type Store = MissionStore & AgentStore & ActivityStore & ApprovalStore & 
  SkillStore & HealthStore & UIStore & AuthStore

/**
 * Global Zustand Store
 * Manages 8 domains: Missions, Agents, Activities, Approvals, Skills, Health, UI, Auth
 */
export const useStore = create<Store>((set, get) => ({
  // ==================== MISSIONS ====================
  missions: [],
  setMissions: (missions) => set({ missions }),
  addMission: (mission) => set((state) => ({ missions: [...state.missions, mission] })),
  updateMission: (id, updates) => set((state) => ({
    missions: state.missions.map((m) => m.id === id ? { ...m, ...updates } : m),
  })),
  getMissionsByStatus: (status) => get().missions.filter((m) => m.status === status),
  deleteMission: (id) => set((state) => ({
    missions: state.missions.filter((m) => m.id !== id),
  })),

  // ==================== AGENTS ====================
  agents: [],
  setAgents: (agents) => set({ agents }),
  addAgent: (agent) => set((state) => ({ agents: [...state.agents, agent] })),
  updateAgent: (id, updates) => set((state) => ({
    agents: state.agents.map((a) => a.id === id ? { ...a, ...updates } : a),
  })),
  getAgentById: (id) => get().agents.find((a) => a.id === id),
  getAgentsByStatus: (status) => get().agents.filter((a) => a.status === status),

  // ==================== ACTIVITIES ====================
  activities: [],
  setActivities: (activities) => set({ activities }),
  addActivity: (activity) => set((state) => ({
    activities: [activity, ...state.activities].slice(0, 100),
  })),
  clearActivities: () => set({ activities: [] }),

  // ==================== APPROVALS ====================
  approvals: [],
  setApprovals: (approvals) => set({ approvals }),
  addApproval: (approval) => set((state) => ({ approvals: [...state.approvals, approval] })),
  updateApproval: (id, updates) => set((state) => ({
    approvals: state.approvals.map((a) => a.id === id ? { ...a, ...updates } : a),
  })),
  getPendingApprovals: () => get().approvals.filter((a) => a.status === 'pending'),
  deleteApproval: (id) => set((state) => ({
    approvals: state.approvals.filter((a) => a.id !== id),
  })),

  // ==================== SKILLS ====================
  skills: [],
  setSkills: (skills) => set({ skills }),
  addSkill: (skill) => set((state) => ({ skills: [...state.skills, skill] })),
  updateSkill: (id, updates) => set((state) => ({
    skills: state.skills.map((s) => s.id === id ? { ...s, ...updates } : s),
  })),
  getSkillsByCategory: (category) => get().skills.filter((s) => s.category === category),
  deleteSkill: (id) => set((state) => ({
    skills: state.skills.filter((s) => s.id !== id),
  })),

  // ==================== HEALTH ====================
  health: null,
  setHealth: (health) => set({ health }),
  updateHealth: (partial) => set((state) => ({
    health: state.health ? { ...state.health, ...partial } : null,
  })),

  // ==================== UI ====================
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  activeTab: 'command-center',
  setActiveTab: (tab) => set({ activeTab: tab }),
  selectedMission: null,
  setSelectedMission: (id) => set({ selectedMission: id }),

  // ==================== AUTH ====================
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  agentId: typeof window !== 'undefined' ? localStorage.getItem('agentId') : null,
  agentName: typeof window !== 'undefined' ? localStorage.getItem('agentName') : null,
  setAuth: (token, agentId, agentName) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
      localStorage.setItem('agentId', agentId)
      localStorage.setItem('agentName', agentName)
    }
    set({ token, agentId, agentName })
  },
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('agentId')
      localStorage.removeItem('agentName')
    }
    set({ token: null, agentId: null, agentName: null })
  },
  isAuthenticated: () => get().token !== null,
}))
