// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
/**
 * Global setup for E2E tests
 * This runs once before all tests
 */

import { chromium, FullConfig } from '@playwright/test'
import { TEST_CONFIG, TestUtils } from './test-config'

async function globalSetup(config: FullConfig) {
  console.log('🧪 Setting up E2E test environment...')
  
  // Validate test environment
  TestUtils.validateTestEnvironment()
  
  // Check if services are available
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    // Check backend health
    console.log('🔍 Checking backend health...')
    const backendResponse = await page.request.get(`${TEST_CONFIG.API_BASE_URL}/health`)
    if (!backendResponse.ok()) {
      throw new Error(`Backend not healthy: ${backendResponse.status()}`)
    }
    console.log('✅ Backend is healthy')
    
    // Check frontend availability
    console.log('🔍 Checking frontend availability...')
    await page.goto(TEST_CONFIG.BASE_URL)
    await page.waitForLoadState('networkidle')
    console.log('✅ Frontend is available')
    
    // Setup test data if needed
    console.log('🔧 Setting up test data...')
    await setupTestData(page)
    console.log('✅ Test data setup complete')
    
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
  
  console.log('🎉 Global setup completed successfully!')
}

async function setupTestData(page: any) {
  try {
    // Create test users if they don't exist
    await createTestUsers(page)
    
    // Create test agents if needed
    await createTestAgents(page)
    
    // Create test marketplace items if needed
    await createTestMarketplaceItems(page)
    
  } catch (error) {
    console.warn('⚠️  Test data setup failed, continuing with existing data:', error)
  }
}

async function createTestUsers(page: any) {
  const testUsers = Object.values(TEST_CONFIG.TEST_USERS)
  
  for (const user of testUsers) {
    try {
      // Try to register the user
      const response = await page.request.post(`${TEST_CONFIG.API_BASE_URL}/auth/register`, {
        data: {
          email: user.email,
          password: user.password,
          full_name: user.fullName
        }
      })
      
      if (response.ok()) {
        console.log(`✅ Created test user: ${user.email}`)
      } else if (response.status() === 422) {
        console.log(`ℹ️  Test user already exists: ${user.email}`)
      } else {
        console.warn(`⚠️  Failed to create test user ${user.email}: ${response.status()}`)
      }
    } catch (error) {
      console.warn(`⚠️  Error creating test user ${user.email}:`, error)
    }
  }
}

async function createTestAgents(page: any) {
  // This would require authentication, so we'll skip for now
  // In a real implementation, you'd authenticate and create test agents
  console.log('ℹ️  Test agents will be created during individual tests')
}

async function createTestMarketplaceItems(page: any) {
  // This would require authentication and admin privileges
  // In a real implementation, you'd authenticate as admin and create test items
  console.log('ℹ️  Test marketplace items will be created during individual tests')
}

export default globalSetup
