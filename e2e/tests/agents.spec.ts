import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="text"]', 'admin')
  await page.fill('input[type="password"]', 'admin')
  await page.click('button[type="submit"]')
  await page.waitForURL('/')
})

test.describe('Agents', () => {
  test('should display agent grid', async ({ page }) => {
    await page.goto('/agents')
    const agents = page.locator('[class*="AgentCard"]')
    await expect(agents.first()).toBeVisible()
  })

  test('should show agent status indicators', async ({ page }) => {
    await page.goto('/agents')
    const statusBadges = page.locator('text=/idle|running|waiting|completed|failed/')
    await expect(statusBadges.first()).toBeVisible()
  })

  test('should display agent stats', async ({ page }) => {
    await page.goto('/agents')
    await expect(page.getByText('Total Agents')).toBeVisible()
    await expect(page.getByText('Running')).toBeVisible()
    await expect(page.getByText('Idle')).toBeVisible()
    await expect(page.getByText('Failed')).toBeVisible()
  })
})
