import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders Layout with all major sections', () => {
    render(<App />)
    expect(screen.getByText('TopCommandBar')).toBeInTheDocument()
    expect(screen.getByText('Command Center')).toBeInTheDocument() // From LeftNav
    expect(screen.getByText('MainContent')).toBeInTheDocument()
    expect(screen.getByText('Activity Feed')).toBeInTheDocument() // From ActivityFeed
  })
})
