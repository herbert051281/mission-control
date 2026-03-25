import { render, screen } from '@testing-library/react'
import ActivityFeed from './ActivityFeed'
import { useStore } from '../store'

vi.mock('../store')

describe('ActivityFeed', () => {
  it('renders activity list', () => {
    const activities = [
      {
        id: '1',
        timestamp: new Date(),
        agent: 'kepler',
        action: 'mission_created',
        target: 'mission-123',
        status: 'completed',
      },
    ]
    vi.mocked(useStore).mockReturnValue({ activities, setActivities: vi.fn() })
    render(<ActivityFeed />)
    expect(screen.getByText(/kepler/)).toBeInTheDocument()
  })

  it('shows empty state when no activities', () => {
    vi.mocked(useStore).mockReturnValue({ activities: [], setActivities: vi.fn() })
    render(<ActivityFeed />)
    expect(screen.getByText('No activities yet')).toBeInTheDocument()
  })
})
