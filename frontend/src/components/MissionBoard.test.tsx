import { render, screen } from '@testing-library/react'
import MissionBoard from './MissionBoard'
import { useStore } from '../store'

vi.mock('../store')

describe('MissionBoard', () => {
  it('renders all 6 stages', () => {
    vi.mocked(useStore).mockReturnValue({ missions: [], getMissionsByStatus: () => [] })
    render(<MissionBoard />)
    expect(screen.getByText('Intake')).toBeInTheDocument()
    expect(screen.getByText('Routed')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
    expect(screen.getByText('Awaiting Approval')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('displays mission count per stage', () => {
    const mockMissions = [
      { id: '1', title: 'Test', status: 'intake' },
      { id: '2', title: 'Test 2', status: 'intake' },
    ]
    vi.mocked(useStore).mockReturnValue({
      missions: mockMissions,
      getMissionsByStatus: (status) => mockMissions.filter((m) => m.status === status),
    })
    render(<MissionBoard />)
    expect(screen.getByText('2')).toBeInTheDocument() // Intake count
  })
})
