import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // Login before each test
  await page.goto('/login')
  await page.fill('input[type="text"]', 'admin')
  await page.fill('input[type="password"]', 'admin')
  await page.click('button[type="submit"]')
  await page.waitForURL('/')
})

test.describe('Missions', () => {
  test('should display mission board with all stages', async ({ page }) => {
    await page.goto('/missions')
    await expect(page.getByText('Intake')).toBeVisible()
    await expect(page.getByText('Routed')).toBeVisible()
    await expect(page.getByText('In Progress')).toBeVisible()
    await expect(page.getByText('Review')).toBeVisible()
    await expect(page.getByText('Awaiting Approval')).toBeVisible()
    await expect(page.getByText('Completed')).toBeVisible()
  })

  test('should create a new mission', async ({ page }) => {
    await page.goto('/missions')
    await page.click('text=New Mission')

    // Fill form
    await page.fill('input[placeholder="Mission title"]', 'Test Mission')
    await page.fill('textarea', 'Test Description')
    await page.selectOption('select:first', 'urgent')
    await page.selectOption('select:last', 'high')

    // Submit
    await page.click('text=Create')

    // Verify
    await expect(page.getByText('Test Mission')).toBeVisible()
  })

  test('should view mission details', async ({ page }) => {
    await page.goto('/missions')
    const missionCard = page.locator('[class*="MissionCard"]').first()
    await missionCard.click()
    await expect(page.getByText(/Mission Details|Details/)).toBeVisible()
  })
})
