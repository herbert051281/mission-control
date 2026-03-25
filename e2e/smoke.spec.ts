import { test, expect } from '@playwright/test'

test.describe('Smoke Tests - Production Validation', () => {
  test('API is responsive', async ({ request }) => {
    const response = await request.get('/health')
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.status).toMatch(/healthy|degraded/)
  })

  test('Frontend loads', async ({ page }) => {
    await page.goto('/')
    await expect(page.title()).toContain('Mission Control')
  })

  test('Login works', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="text"]', 'admin')
    await page.fill('input[type="password"]', 'admin')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/')
  })

  test('Database is connected', async ({ request }) => {
    const response = await request.get('/missions')
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(Array.isArray(body)).toBe(true)
  })

  test('WebSocket connects', async ({ page }) => {
    await page.goto('/')
    await page.fill('input[type="text"]', 'admin')
    await page.fill('input[type="password"]', 'admin')
    await page.click('button[type="submit"]')
    
    // Wait for WebSocket connection
    await page.waitForFunction(() => {
      return (window as any).io?.connected === true
    }, { timeout: 5000 })
  })
})
