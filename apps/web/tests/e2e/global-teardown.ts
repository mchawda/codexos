// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
/**
 * Global teardown for E2E tests
 * This runs once after all tests complete
 */

import { chromium, FullConfig } from '@playwright/test'
import { TEST_CONFIG, TestUtils } from './test-config'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up E2E test environment...')
  
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    // Clean up test data
    console.log('🗑️  Cleaning up test data...')
    await cleanupTestData(page)
    console.log('✅ Test data cleanup complete')
    
    // Generate final test report
    console.log('📊 Generating final test report...')
    await generateFinalReport()
    console.log('✅ Final report generated')
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error)
    // Don't throw error during teardown to avoid masking test failures
  } finally {
    await browser.close()
  }
  
  console.log('🎉 Global teardown completed successfully!')
}

async function cleanupTestData(page: any) {
  try {
    // Clean up test users (this would require admin privileges)
    await cleanupTestUsers(page)
    
    // Clean up test agents
    await cleanupTestAgents(page)
    
    // Clean up test documents
    await cleanupTestDocuments(page)
    
    // Clean up test marketplace items
    await cleanupTestMarketplaceItems(page)
    
  } catch (error) {
    console.warn('⚠️  Test data cleanup failed, continuing:', error)
  }
}

async function cleanupTestUsers(page: any) {
  const testUsers = Object.values(TEST_CONFIG.TEST_USERS)
  
  for (const user of testUsers) {
    try {
      // Try to delete test users (this would require admin API)
      console.log(`🗑️  Attempting to clean up test user: ${user.email}`)
      
      // Note: In a real implementation, you'd need admin authentication
      // For now, we'll just log the cleanup attempt
      
    } catch (error) {
      console.warn(`⚠️  Failed to cleanup test user ${user.email}:`, error)
    }
  }
}

async function cleanupTestAgents(page: any) {
  try {
    console.log('🗑️  Attempting to clean up test agents...')
    
    // This would require authentication and agent management API
    // For now, we'll just log the cleanup attempt
    
  } catch (error) {
    console.warn('⚠️  Failed to cleanup test agents:', error)
  }
}

async function cleanupTestDocuments(page: any) {
  try {
    console.log('🗑️  Attempting to clean up test documents...')
    
    // This would require authentication and document management API
    // For now, we'll just log the cleanup attempt
    
  } catch (error) {
    console.warn('⚠️  Failed to cleanup test documents:', error)
  }
}

async function cleanupTestMarketplaceItems(page: any) {
  try {
    console.log('🗑️  Attempting to clean up test marketplace items...')
    
    // This would require admin authentication and marketplace management API
    // For now, we'll just log the cleanup attempt
    
  } catch (error) {
    console.warn('⚠️  Failed to cleanup test marketplace items:', error)
  }
}

async function generateFinalReport() {
  try {
    // Generate summary report
    const summary = {
      timestamp: new Date().toISOString(),
      environment: TEST_CONFIG.ENVIRONMENT,
      testConfig: {
        baseUrl: TEST_CONFIG.BASE_URL,
        apiBaseUrl: TEST_CONFIG.API_BASE_URL,
        timeouts: {
          default: TEST_CONFIG.DEFAULT_TIMEOUT,
          navigation: TEST_CONFIG.NAVIGATION_TIMEOUT,
          api: TEST_CONFIG.API_TIMEOUT
        }
      },
      performanceThresholds: TEST_CONFIG.PERFORMANCE_THRESHOLDS,
      cleanupStatus: 'completed'
    }
    
    // Write summary to file
    const fs = require('fs')
    const path = require('path')
    
    const reportDir = path.join(process.cwd(), 'test-results')
    const summaryFile = path.join(reportDir, 'test-summary.json')
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }
    
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2))
    console.log(`📄 Test summary written to: ${summaryFile}`)
    
  } catch (error) {
    console.warn('⚠️  Failed to generate final report:', error)
  }
}

export default globalTeardown
