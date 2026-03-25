import { render, screen } from '@testing-library/react'
import Layout from './Layout'

describe('Layout', () => {
  it('renders all major sections', () => {
    render(<Layout />)
    expect(screen.getByText('TopCommandBar')).toBeInTheDocument()
    expect(screen.getByText('Command Center')).toBeInTheDocument() // From LeftNav
    expect(screen.getByText('MainContent')).toBeInTheDocument()
    expect(screen.getByText('Activity Feed')).toBeInTheDocument() // From ActivityFeed
  })
})
