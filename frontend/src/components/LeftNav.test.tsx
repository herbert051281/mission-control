import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LeftNav from './LeftNav'
import { useStore } from '../store'

vi.mock('../store')

describe('LeftNav', () => {
  it('renders all 7 navigation items', () => {
    render(<LeftNav />)
    expect(screen.getByText('Command Center')).toBeInTheDocument()
    expect(screen.getByText('Missions')).toBeInTheDocument()
    expect(screen.getByText('Agents')).toBeInTheDocument()
    expect(screen.getByText('Activity')).toBeInTheDocument()
    expect(screen.getByText('Approvals')).toBeInTheDocument()
    expect(screen.getByText('Skills')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('highlights active tab', () => {
    vi.mocked(useStore).mockReturnValue({ activeTab: 'missions', setActiveTab: vi.fn() })
    render(<LeftNav />)
    const missionsBtn = screen.getByText('Missions').closest('button')
    expect(missionsBtn).toHaveClass('text-accent-cyan')
  })

  it('calls setActiveTab when clicking item', async () => {
    const mockSetActiveTab = vi.fn()
    vi.mocked(useStore).mockReturnValue({ activeTab: 'command-center', setActiveTab: mockSetActiveTab })
    render(<LeftNav />)
    await userEvent.click(screen.getByText('Missions'))
    expect(mockSetActiveTab).toHaveBeenCalledWith('missions')
  })
})
