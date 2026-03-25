import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="text"]', 'admin')
  await page.fill('input[type="password"]', 'admin')
  await page.click('button[type="submit"]')
  await page.waitForURL('/')
})

test.describe('Approvals', () => {
  test('should display approvals dashboard', async ({ page }) => {
    await page.goto('/approvals')
    await expect(page.getByText('Approvals')).toBeVisible()
    await expect(page.getByText('Total')).toBeVisible()
    await expect(page.getByText('Pending')).toBeVisible()
    await expect(page.getByText('Resolved')).toBeVisible()
  })

  test('should approve a pending request', async ({ page }) => {
    await page.goto('/approvals')
    const approveBtn = page.locator('text=Approve').first()
    if (await approveBtn.isVisible()) {
      await approveBtn.click()
      await expect(page.getByText(/approved|success/i)).toBeVisible()
    }
  })

  test('should deny a pending request', async ({ page }) => {
    await page.goto('/approvals')
    const denyBtn = page.locator('text=Deny').first()
    if (await denyBtn.isVisible()) {
      await denyBtn.click()
      await expect(page.getByText(/denied|rejected/i)).toBeVisible()
    }
  })
})
