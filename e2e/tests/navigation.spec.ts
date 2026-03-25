import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="text"]', 'admin')
  await page.fill('input[type="password"]', 'admin')
  await page.click('button[type="submit"]')
  await page.waitForURL('/')
})

test.describe('Navigation', () => {
  test('should navigate through all main pages', async ({ page }) => {
    const navItems = [
      { label: 'Missions', url: '/missions' },
      { label: 'Agents', url: '/agents' },
      { label: 'Activity', url: '/activity' },
      { label: 'Approvals', url: '/approvals' },
      { label: 'Skills', url: '/skills' },
      { label: 'Settings', url: '/settings' },
    ]

    for (const item of navItems) {
      await page.click(`text=${item.label}`)
      await expect(page).toHaveURL(item.url)
      await expect(page.getByText(item.label)).toBeVisible()
    }
  })

  test('should maintain nav state on page refresh', async ({ page }) => {
    await page.goto('/missions')
    await page.reload()
    await expect(page).toHaveURL('/missions')
    await expect(page.getByText('Missions')).toBeVisible()
  })
})
