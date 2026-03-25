import { render, screen } from '@testing-library/react'
import AgentCard from './AgentCard'
import { Agent } from '../types'

const mockAgent: Agent = {
  id: '1',
  name: 'Kepler',
  role: 'BI Systems',
  model: 'GPT 5.4',
  type: 'primary',
  status: 'idle',
  capabilities: [],
  createdAt: '2026-03-25T00:00:00Z',
  updatedAt: '2026-03-25T00:00:00Z',
}

describe('AgentCard', () => {
  it('displays agent name, role, and model', () => {
    const agent: Agent = {
      id: '1',
      name: 'Kepler',
      role: 'BI Systems',
      model: 'GPT 5.4',
      type: 'primary',
      status: 'idle',
      capabilities: [],
      createdAt: '2026-03-25T00:00:00Z',
      updatedAt: '2026-03-25T00:00:00Z',
    }
    render(<AgentCard agent={agent} />)
    expect(screen.getByText('Kepler')).toBeInTheDocument()
    expect(screen.getByText('BI Systems')).toBeInTheDocument()
    expect(screen.getByText(/GPT 5.4/)).toBeInTheDocument()
  })

  it('shows status badge with correct color for running status', () => {
    const agent: Agent = { ...mockAgent, status: 'running' }
    render(<AgentCard agent={agent} />)
    const statusBadge = screen.getByText('running')
    expect(statusBadge).toHaveClass('bg-cyan-700')
  })

  it('shows status badge with correct color for idle status', () => {
    const agent: Agent = { ...mockAgent, status: 'idle' }
    render(<AgentCard agent={agent} />)
    const statusBadge = screen.getByText('idle')
    expect(statusBadge).toHaveClass('bg-gray-700')
  })

  it('shows status badge with correct color for failed status', () => {
    const agent: Agent = { ...mockAgent, status: 'failed' }
    render(<AgentCard agent={agent} />)
    const statusBadge = screen.getByText('failed')
    expect(statusBadge).toHaveClass('bg-red-700')
  })

  it('displays current task when present', () => {
    const agent: Agent = {
      ...mockAgent,
      current_task: {
        id: 'task-1',
        title: 'Data Pipeline Optimization',
        started_at: '2026-03-25T10:00:00Z',
      },
    }
    render(<AgentCard agent={agent} />)
    expect(screen.getByText('Current Task')).toBeInTheDocument()
    expect(screen.getByText('Data Pipeline Optimization')).toBeInTheDocument()
  })

  it('displays last completed task when present', () => {
    const agent: Agent = {
      ...mockAgent,
      last_completed_task: {
        id: 'task-2',
        title: 'Schema Migration',
        completed_at: '2026-03-24T15:30:00Z',
      },
    }
    render(<AgentCard agent={agent} />)
    expect(screen.getByText('Last Completed')).toBeInTheDocument()
    expect(screen.getByText('Schema Migration')).toBeInTheDocument()
  })

  it('does not display current task when absent', () => {
    const agent: Agent = { ...mockAgent }
    render(<AgentCard agent={agent} />)
    expect(screen.queryByText('Current Task')).not.toBeInTheDocument()
  })

  it('does not display last completed task when absent', () => {
    const agent: Agent = { ...mockAgent }
    render(<AgentCard agent={agent} />)
    expect(screen.queryByText('Last Completed')).not.toBeInTheDocument()
  })

  it('shows status dot with correct color', () => {
    const agent: Agent = { ...mockAgent, status: 'waiting' }
    render(<AgentCard agent={agent} />)
    const statusBadge = screen.getByText('waiting')
    const dot = statusBadge.querySelector('.rounded-full')
    expect(dot).toHaveClass('bg-yellow-400')
  })
})
