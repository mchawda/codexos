// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
/**
 * E2E Test Configuration and Utilities
 */

export interface TestUser {
  email: string
  password: string
  fullName: string
  role: 'user' | 'admin' | 'maintainer'
}

export interface TestAgent {
  name: string
  description: string
  agentType: 'task' | 'decision' | 'loop' | 'parallel'
  configuration: Record<string, any>
}

export interface TestDocument {
  name: string
  content: string
  type: 'text' | 'pdf' | 'markdown'
  metadata: Record<string, any>
}

export interface TestMarketplaceItem {
  name: string
  description: string
  pricingModel: 'free' | 'one-time' | 'subscription'
  price?: number
  currency?: string
  hasFreeTrial?: boolean
  trialDays?: number
}

// Test Configuration
export const TEST_CONFIG = {
  // URLs
  BASE_URL: process.env.TEST_BASE_URL || 'http://localhost:3000',
  API_BASE_URL: process.env.TEST_API_BASE_URL || 'http://localhost:8000/api/v1',
  
  // Timeouts
  DEFAULT_TIMEOUT: 30000,
  NAVIGATION_TIMEOUT: 10000,
  API_TIMEOUT: 15000,
  
  // Test Data
  TEST_USERS: {
    ADMIN: {
      email: 'admin@codexos.test',
      password: 'AdminTest123!',
      fullName: 'Admin Test User',
      role: 'admin' as const
    },
    USER: {
      email: 'user@codexos.test',
      password: 'UserTest123!',
      fullName: 'Regular Test User',
      role: 'user' as const
    },
    MAINTAINER: {
      email: 'maintainer@codexos.test',
      password: 'MaintainerTest123!',
      fullName: 'Maintainer Test User',
      role: 'maintainer' as const
    }
  },
  
  // Test Agents
  TEST_AGENTS: {
    SIMPLE_TASK: {
      name: 'Simple Task Agent',
      description: 'A basic task agent for testing',
      agentType: 'task' as const,
      configuration: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000
      }
    },
    DECISION_AGENT: {
      name: 'Decision Agent',
      description: 'An agent that makes decisions based on input',
      agentType: 'decision' as const,
      configuration: {
        model: 'gpt-4',
        temperature: 0.3,
        maxTokens: 500
      }
    },
    LOOP_AGENT: {
      name: 'Loop Agent',
      description: 'An agent that processes items in a loop',
      agentType: 'loop' as const,
      configuration: {
        model: 'gpt-4',
        temperature: 0.5,
        maxTokens: 2000,
        maxIterations: 10
      }
    }
  },
  
  // Test Documents
  TEST_DOCUMENTS: {
    SIMPLE_TEXT: {
      name: 'Simple Test Document',
      content: 'This is a simple test document for RAG engine testing. It contains basic information about testing procedures and best practices.',
      type: 'text' as const,
      metadata: {
        category: 'testing',
        tags: ['test', 'document', 'rag'],
        author: 'Test User'
      }
    },
    TECHNICAL_DOC: {
      name: 'Technical Documentation',
      content: 'This technical document covers advanced testing methodologies including unit testing, integration testing, and end-to-end testing. It also discusses test automation and continuous integration practices.',
      type: 'markdown' as const,
      metadata: {
        category: 'technical',
        tags: ['testing', 'automation', 'ci-cd'],
        author: 'Technical Writer',
        version: '1.0.0'
      }
    },
    LARGE_DOC: {
      name: 'Large Test Document',
      content: 'A'.repeat(5000) + ' This is a large document to test performance and chunking capabilities of the RAG engine.',
      type: 'text' as const,
      metadata: {
        category: 'performance',
        tags: ['large', 'performance', 'chunking'],
        author: 'Performance Tester'
      }
    }
  },
  
  // Test Marketplace Items
  TEST_MARKETPLACE_ITEMS: {
    FREE_AGENT: {
      name: 'Free Test Agent',
      description: 'A free agent for testing purposes',
      pricingModel: 'free' as const,
      hasFreeTrial: false
    },
    PAID_AGENT: {
      name: 'Premium Test Agent',
      description: 'A premium agent with advanced features',
      pricingModel: 'one-time' as const,
      price: 29.99,
      currency: 'USD',
      hasFreeTrial: true,
      trialDays: 7
    },
    SUBSCRIPTION_AGENT: {
      name: 'Subscription Test Agent',
      description: 'A subscription-based agent with monthly updates',
      pricingModel: 'subscription' as const,
      price: 9.99,
      currency: 'USD',
      hasFreeTrial: true,
      trialDays: 14
    }
  },
  
  // Test Flows
  TEST_FLOWS: {
    SIMPLE_WORKFLOW: {
      name: 'Simple Test Workflow',
      description: 'A basic workflow for testing flow editor functionality',
      nodes: [
        { type: 'start', name: 'Start', position: { x: 100, y: 100 } },
        { type: 'task', name: 'Process Data', position: { x: 300, y: 100 } },
        { type: 'decision', name: 'Check Result', position: { x: 500, y: 100 } },
        { type: 'task', name: 'Handle Success', position: { x: 500, y: 300 } },
        { type: 'task', name: 'Handle Error', position: { x: 500, y: -100 } },
        { type: 'end', name: 'End', position: { x: 700, y: 100 } }
      ],
      connections: [
        { from: 'Start', to: 'Process Data' },
        { from: 'Process Data', to: 'Check Result' },
        { from: 'Check Result', to: 'Handle Success', condition: 'success' },
        { from: 'Check Result', to: 'Handle Error', condition: 'error' },
        { from: 'Handle Success', to: 'End' },
        { from: 'Handle Error', to: 'End' }
      ]
    }
  },
  
  // Performance Thresholds
  PERFORMANCE_THRESHOLDS: {
    PAGE_LOAD_TIME: 3000,        // 3 seconds
    API_RESPONSE_TIME: 1000,     // 1 second
    SEARCH_RESPONSE_TIME: 2000,  // 2 seconds
    AGENT_EXECUTION_TIME: 10000, // 10 seconds
    FLOW_EXECUTION_TIME: 15000   // 15 seconds
  },
  
  // Test Environment
  ENVIRONMENT: {
    IS_CI: process.env.CI === 'true',
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
    IS_PRODUCTION: process.env.NODE_ENV === 'production',
    HEADLESS: process.env.HEADLESS !== 'false',
    SLOW_MO: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0
  }
}

// Test Utilities
export class TestUtils {
  /**
   * Generate a unique test email
   */
  static generateTestEmail(prefix: string = 'test'): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `${prefix}-${timestamp}-${random}@codexos.test`
  }

  /**
   * Generate a unique test name
   */
  static generateTestName(prefix: string = 'Test'): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 6)
    return `${prefix} ${timestamp} ${random}`
  }

  /**
   * Wait for a condition to be true
   */
  static async waitForCondition(
    condition: () => boolean | Promise<boolean>,
    timeout: number = TEST_CONFIG.DEFAULT_TIMEOUT,
    interval: number = 100
  ): Promise<void> {
    const startTime = Date.now()
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return
      }
      await new Promise(resolve => setTimeout(resolve, interval))
    }
    
    throw new Error(`Condition not met within ${timeout}ms`)
  }

  /**
   * Generate test data based on template
   */
  static generateTestData<T>(template: T, overrides: Partial<T> = {}): T {
    return {
      ...template,
      ...overrides,
      name: overrides.name || this.generateTestName(),
      email: overrides.email || this.generateTestEmail()
    }
  }

  /**
   * Clean up test data
   */
  static async cleanupTestData(cleanupFunctions: (() => Promise<void>)[]): Promise<void> {
    const cleanupPromises = cleanupFunctions.map(cleanup => 
      cleanup().catch(error => console.warn('Cleanup failed:', error))
    )
    
    await Promise.all(cleanupPromises)
  }

  /**
   * Generate performance report
   */
  static generatePerformanceReport(metrics: Record<string, number>): string {
    const report = ['Performance Report:', '================']
    
    Object.entries(metrics).forEach(([metric, value]) => {
      const threshold = TEST_CONFIG.PERFORMANCE_THRESHOLDS[metric as keyof typeof TEST_CONFIG.PERFORMANCE_THRESHOLDS]
      const status = threshold ? (value <= threshold ? '✅' : '❌') : '📊'
      report.push(`${status} ${metric}: ${value}ms${threshold ? ` (threshold: ${threshold}ms)` : ''}`)
    })
    
    return report.join('\n')
  }

  /**
   * Validate test environment
   */
  static validateTestEnvironment(): void {
    const requiredEnvVars = ['TEST_BASE_URL', 'TEST_API_BASE_URL']
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar])
    
    if (missing.length > 0) {
      console.warn(`Missing environment variables: ${missing.join(', ')}`)
      console.warn('Using default values from test configuration')
    }
  }

  /**
   * Setup test data
   */
  static async setupTestData(): Promise<{
    users: TestUser[]
    agents: TestAgent[]
    documents: TestDocument[]
    marketplaceItems: TestMarketplaceItem[]
  }> {
    const users = Object.values(TEST_CONFIG.TEST_USERS)
    const agents = Object.values(TEST_CONFIG.TEST_AGENTS)
    const documents = Object.values(TEST_CONFIG.TEST_DOCUMENTS)
    const marketplaceItems = Object.values(TEST_CONFIG.TEST_MARKETPLACE_ITEMS)
    
    return { users, agents, documents, marketplaceItems }
  }
}

// Test Data Factory
export class TestDataFactory {
  /**
   * Create a test user
   */
  static createUser(overrides: Partial<TestUser> = {}): TestUser {
    return TestUtils.generateTestData(TEST_CONFIG.TEST_USERS.USER, overrides)
  }

  /**
   * Create a test agent
   */
  static createAgent(overrides: Partial<TestAgent> = {}): TestAgent {
    return TestUtils.generateTestData(TEST_CONFIG.TEST_AGENTS.SIMPLE_TASK, overrides)
  }

  /**
   * Create a test document
   */
  static createDocument(overrides: Partial<TestDocument> = {}): TestDocument {
    return TestUtils.generateTestData(TEST_CONFIG.TEST_DOCUMENTS.SIMPLE_TEXT, overrides)
  }

  /**
   * Create a test marketplace item
   */
  static createMarketplaceItem(overrides: Partial<TestMarketplaceItem> = {}): TestMarketplaceItem {
    return TestUtils.generateTestData(TEST_CONFIG.TEST_MARKETPLACE_ITEMS.FREE_AGENT, overrides)
  }
}

// Export default configuration
export default TEST_CONFIG
