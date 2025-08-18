import { test, expect } from '@playwright/test'

test.describe('Flow Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/flow-editor')
  })

  test('should load flow editor page', async ({ page }) => {
    await expect(page).toHaveTitle(/Flow Editor/)
    await expect(page.locator('[data-testid="flow-editor"]')).toBeVisible()
  })

  test('should add new node to canvas', async ({ page }) => {
    // Click add node button
    await page.click('[data-testid="add-node-btn"]')
    
    // Select node type
    await page.click('[data-testid="node-type-input"]')
    await page.click('text=Task')
    
    // Verify node appears on canvas
    await expect(page.locator('[data-testid="node-Task"]')).toBeVisible()
  })

  test('should connect nodes', async ({ page }) => {
    // Add two nodes
    await page.click('[data-testid="add-node-btn"]')
    await page.click('text=Task')
    await page.click('[data-testid="add-node-btn"]')
    await page.click('text=Decision')
    
    // Drag from first node output to second node input
    const sourceHandle = page.locator('[data-testid="node-Task"] [data-testid="output-handle"]')
    const targetHandle = page.locator('[data-testid="node-Decision"] [data-testid="input-handle"]')
    
    await sourceHandle.dragTo(targetHandle)
    
    // Verify connection line appears
    await expect(page.locator('[data-testid="connection-line"]')).toBeVisible()
  })

  test('should save flow', async ({ page }) => {
    // Add a node
    await page.click('[data-testid="add-node-btn"]')
    await page.click('text=Task')
    
    // Click save button
    await page.click('[data-testid="save-flow-btn"]')
    
    // Verify success message
    await expect(page.locator('[data-testid="save-success"]')).toBeVisible()
  })
})
