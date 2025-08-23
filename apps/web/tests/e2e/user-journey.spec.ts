// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
import { test, expect } from '@playwright/test'

test.describe('Complete User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the homepage
    await page.goto('/')
  })

  test('Complete user onboarding flow', async ({ page }) => {
    // 1. Homepage navigation
    await expect(page).toHaveTitle(/CodexOS/)
    await expect(page.locator('[data-testid="hero-title"]')).toBeVisible()
    
    // Navigate to sign up
    await page.click('[data-testid="signup-button"]')
    await expect(page).toHaveURL(/.*signup/)
    
    // 2. User registration
    await page.fill('[data-testid="email-input"]', `test-${Date.now()}@example.com`)
    await page.fill('[data-testid="password-input"]', 'TestPassword123!')
    await page.fill('[data-testid="confirm-password-input"]', 'TestPassword123!')
    await page.click('[data-testid="signup-submit"]')
    
    // Wait for registration success
    await expect(page.locator('[data-testid="registration-success"]')).toBeVisible()
    
    // 3. Dashboard access
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.locator('[data-testid="dashboard-welcome"]')).toBeVisible()
    
    // 4. Verify initial dashboard state
    await expect(page.locator('[data-testid="agents-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="marketplace-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="quick-actions"]')).toBeVisible()
  })

  test('Agent creation and management flow', async ({ page }) => {
    // Login first (assuming user exists)
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'TestPassword123!')
    await page.click('[data-testid="login-submit"]')
    
    // Navigate to dashboard
    await expect(page).toHaveURL(/.*dashboard/)
    
    // 1. Create new agent
    await page.click('[data-testid="create-agent-btn"]')
    await expect(page).toHaveURL(/.*create-agent/)
    
    // Fill agent details
    await page.fill('[data-testid="agent-name"]', 'Test Agent')
    await page.fill('[data-testid="agent-description"]', 'A test agent for E2E testing')
    await page.selectOption('[data-testid="agent-type"]', 'task')
    await page.click('[data-testid="agent-create"]')
    
    // 2. Verify agent creation
    await expect(page.locator('[data-testid="agent-created-success"]')).toBeVisible()
    await expect(page).toHaveURL(/.*agents\/.*/)
    
    // 3. Edit agent
    await page.click('[data-testid="edit-agent-btn"]')
    await page.fill('[data-testid="agent-description"]', 'Updated description for E2E testing')
    await page.click('[data-testid="save-changes-btn"]')
    
    // 4. Verify changes saved
    await expect(page.locator('[data-testid="changes-saved"]')).toBeVisible()
    
    // 5. Test agent execution
    await page.click('[data-testid="run-agent-btn"]')
    await expect(page.locator('[data-testid="execution-status"]')).toBeVisible()
    
    // Wait for execution to complete
    await expect(page.locator('[data-testid="execution-complete"]')).toBeVisible()
  })

  test('Marketplace browsing and purchase flow', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'TestPassword123!')
    await page.click('[data-testid="login-submit"]')
    
    // 1. Navigate to marketplace
    await page.click('[data-testid="marketplace-nav"]')
    await expect(page).toHaveURL(/.*marketplace/)
    
    // 2. Browse marketplace items
    await expect(page.locator('[data-testid="marketplace-items"]')).toBeVisible()
    await expect(page.locator('[data-testid="marketplace-item"]')).toHaveCount.greaterThan(0)
    
    // 3. View item details
    await page.click('[data-testid="marketplace-item"]').first()
    await expect(page.locator('[data-testid="item-details"]')).toBeVisible()
    await expect(page.locator('[data-testid="purchase-button"]')).toBeVisible()
    
    // 4. Test free item installation
    const freeItem = page.locator('[data-testid="free-item"]').first()
    if (await freeItem.isVisible()) {
      await freeItem.click()
      await expect(page.locator('[data-testid="install-success"]')).toBeVisible()
    }
    
    // 5. Test paid item purchase flow (mock)
    const paidItem = page.locator('[data-testid="paid-item"]').first()
    if (await paidItem.isVisible()) {
      await paidItem.click()
      
      // Should redirect to Stripe checkout or show payment form
      await expect(page.locator('[data-testid="payment-form"]')).toBeVisible()
      
      // Fill mock payment details
      await page.fill('[data-testid="card-number"]', '4242424242424242')
      await page.fill('[data-testid="expiry"]', '12/25')
      await page.fill('[data-testid="cvc"]', '123')
      await page.click('[data-testid="pay-button"]')
      
      // Verify purchase success
      await expect(page.locator('[data-testid="purchase-success"]')).toBeVisible()
    }
  })

  test('RAG engine integration flow', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'TestPassword123!')
    await page.click('[data-testid="login-submit"]')
    
    // 1. Navigate to RAG section
    await page.click('[data-testid="rag-nav"]')
    await expect(page).toHaveURL(/.*rag/)
    
    // 2. Upload document
    await page.click('[data-testid="upload-document-btn"]')
    
    // Create a test file
    const testFile = Buffer.from('This is a test document for RAG engine testing.')
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'test-document.txt',
      mimeType: 'text/plain',
      buffer: testFile
    })
    
    await page.click('[data-testid="upload-submit"]')
    
    // 3. Wait for processing
    await expect(page.locator('[data-testid="processing-status"]')).toBeVisible()
    await expect(page.locator('[data-testid="processing-complete"]')).toBeVisible()
    
    // 4. Test document search
    await page.fill('[data-testid="search-input"]', 'test document')
    await page.click('[data-testid="search-submit"]')
    
    // 5. Verify search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible()
    await expect(page.locator('[data-testid="search-result"]')).toHaveCount.greaterThan(0)
    
    // 6. Test document retrieval
    await page.click('[data-testid="search-result"]').first()
    await expect(page.locator('[data-testid="document-content"]')).toBeVisible()
  })

  test('Flow editor and agent chaining', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'TestPassword123!')
    await page.click('[data-testid="login-submit"]')
    
    // 1. Navigate to flow editor
    await page.click('[data-testid="flow-editor-nav"]')
    await expect(page).toHaveURL(/.*flow-editor/)
    
    // 2. Create new flow
    await page.click('[data-testid="new-flow-btn"]')
    await page.fill('[data-testid="flow-name"]', 'E2E Test Flow')
    await page.click('[data-testid="create-flow"]')
    
    // 3. Add nodes to flow
    await page.click('[data-testid="add-node-btn"]')
    await page.click('text=Task')
    await page.click('[data-testid="add-node-btn"]')
    await page.click('text=Decision')
    await page.click('[data-testid="add-node-btn"]')
    await page.click('text=Task')
    
    // 4. Configure nodes
    await page.click('[data-testid="node-Task"]').first()
    await page.fill('[data-testid="node-config-name"]', 'Start Task')
    await page.fill('[data-testid="node-config-description"]', 'Initial task for E2E testing')
    await page.click('[data-testid="save-node-config"]')
    
    // 5. Connect nodes
    const sourceHandle = page.locator('[data-testid="node-Task"]').first().locator('[data-testid="output-handle"]')
    const targetHandle = page.locator('[data-testid="node-Decision"]').locator('[data-testid="input-handle"]')
    await sourceHandle.dragTo(targetHandle)
    
    // 6. Save flow
    await page.click('[data-testid="save-flow-btn"]')
    await expect(page.locator('[data-testid="flow-saved"]')).toBeVisible()
    
    // 7. Test flow execution
    await page.click('[data-testid="run-flow-btn"]')
    await expect(page.locator('[data-testid="flow-execution-status"]')).toBeVisible()
    
    // Wait for execution
    await expect(page.locator('[data-testid="flow-execution-complete"]')).toBeVisible()
  })

  test('User settings and profile management', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'TestPassword123!')
    await page.click('[data-testid="login-submit"]')
    
    // 1. Navigate to settings
    await page.click('[data-testid="user-menu"]')
    await page.click('[data-testid="settings-nav"]')
    await expect(page).toHaveURL(/.*settings/)
    
    // 2. Update profile information
    await page.fill('[data-testid="display-name"]', 'E2E Test User')
    await page.fill('[data-testid="bio"]', 'User for end-to-end testing')
    await page.click('[data-testid="save-profile"]')
    
    // 3. Verify profile update
    await expect(page.locator('[data-testid="profile-updated"]')).toBeVisible()
    
    // 4. Test password change
    await page.click('[data-testid="change-password-tab"]')
    await page.fill('[data-testid="current-password"]', 'TestPassword123!')
    await page.fill('[data-testid="new-password"]', 'NewTestPassword123!')
    await page.fill('[data-testid="confirm-new-password"]', 'NewTestPassword123!')
    await page.click('[data-testid="change-password-submit"]')
    
    // 5. Verify password change
    await expect(page.locator('[data-testid="password-changed"]')).toBeVisible()
    
    // 6. Test notification preferences
    await page.click('[data-testid="notifications-tab"]')
    await page.check('[data-testid="email-notifications"]')
    await page.check('[data-testid="push-notifications"]')
    await page.click('[data-testid="save-notifications"]')
    
    // 7. Verify notification settings
    await expect(page.locator('[data-testid="notifications-saved"]')).toBeVisible()
  })

  test('Error handling and edge cases', async ({ page }) => {
    // 1. Test invalid login
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'invalid@example.com')
    await page.fill('[data-testid="password-input"]', 'wrongpassword')
    await page.click('[data-testid="login-submit"]')
    
    await expect(page.locator('[data-testid="login-error"]')).toBeVisible()
    
    // 2. Test network error handling
    await page.route('**/api/**', route => route.abort())
    
    await page.goto('/dashboard')
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible()
    
    // 3. Test form validation
    await page.goto('/signup')
    await page.click('[data-testid="signup-submit"]')
    
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible()
    
    // 4. Test 404 handling
    await page.goto('/nonexistent-page')
    await expect(page.locator('[data-testid="404-page"]')).toBeVisible()
    
    // 5. Test unauthorized access
    await page.goto('/admin')
    await expect(page.locator('[data-testid="unauthorized"]')).toBeVisible()
  })

  test('Performance and responsiveness', async ({ page }) => {
    // 1. Test page load performance
    const startTime = Date.now()
    await page.goto('/')
    const loadTime = Date.now() - startTime
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
    
    // 2. Test dashboard responsiveness
    await page.goto('/dashboard')
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('[data-testid="desktop-layout"]')).toBeVisible()
    
    // 3. Test search performance
    await page.fill('[data-testid="global-search"]', 'test')
    const searchStart = Date.now()
    await page.keyboard.press('Enter')
    
    // Wait for search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible()
    const searchTime = Date.now() - searchStart
    
    // Search should complete within 2 seconds
    expect(searchTime).toBeLessThan(2000)
  })
})
