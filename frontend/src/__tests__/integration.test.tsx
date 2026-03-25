import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'
import { useStore } from '../store'

vi.mock('../store')

describe('Frontend Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to login when not authenticated', () => {
    const mockUseStore = useStore as any
    mockUseStore.mockReturnValue({
      isAuthenticated: () => false,
      token: null,
    })

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    expect(screen.getByText('Mission Control')).toBeInTheDocument()
  })

  it('renders layout when authenticated', () => {
    const mockUseStore = useStore as any
    mockUseStore.mockReturnValue({
      isAuthenticated: () => true,
      activeTab: 'command-center',
      token: 'test-token',
      agentId: 'agent-1',
      agentName: 'TestAgent',
      health: {
        active_agents: 5,
        pending_missions: 3,
        pending_approvals: 1,
        backend_health: 'healthy',
      },
      missions: [],
      agents: [],
      activities: [],
      approvals: [],
      skills: [],
      sidebarOpen: true,
      toggleSidebar: vi.fn(),
      setActiveTab: vi.fn(),
      selectedMission: null,
      setSelectedMission: vi.fn(),
    })

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    expect(screen.getByText('Command Center')).toBeInTheDocument()
  })

  it('renders login page on unauthenticated access', () => {
    const mockUseStore = useStore as any
    mockUseStore.mockReturnValue({
      isAuthenticated: () => false,
      token: null,
    })

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    expect(screen.getByText('Agent Command & Control System')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument()
  })

  it('shows login button on login page', () => {
    const mockUseStore = useStore as any
    mockUseStore.mockReturnValue({
      isAuthenticated: () => false,
      token: null,
    })

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    const loginButton = screen.getByRole('button', { name: /login/i })
    expect(loginButton).toBeInTheDocument()
  })
})
