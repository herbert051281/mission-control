import { render, screen } from '@testing-library/react'
import CommandCenter from './CommandCenter'
import { useStore } from '../store'

vi.mock('../store')

describe('CommandCenter', () => {
  it('renders health metrics', () => {
    vi.mocked(useStore).mockReturnValue({
      health: {
        active_agents: 5,
        pending_missions: 3,
        pending_approvals: 1,
        backend_health: 'healthy',
      },
    })
    render(<CommandCenter />)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
