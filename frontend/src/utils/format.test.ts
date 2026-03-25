import { describe, it, expect } from 'vitest'
import { formatDate, humanize, truncate } from './format'

describe('Format utilities', () => {
  it('formats date correctly', () => {
    const date = new Date('2026-03-25')
    const formatted = formatDate(date)
    expect(formatted).toContain('Mar')
    expect(formatted).toContain('25')
  })

  it('humanizes strings', () => {
    expect(humanize('mission_created')).toBe('Mission Created')
    expect(humanize('inProgress')).toBe('In Progress')
  })

  it('truncates long strings', () => {
    const long = 'This is a very long string that should be truncated'
    const truncated = truncate(long, 10)
    expect(truncated).toBe('This is a ...')
    expect(truncated.length).toBeLessThanOrEqual(14)
  })
})
