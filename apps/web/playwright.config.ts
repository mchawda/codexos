// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  
  // Enhanced reporting
  reporter: [
    ['html', { outputFolder: 'test-results/html' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
    process.env.CI ? ['github'] : null
  ].filter(Boolean),
  
  // Global test settings
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 15000,
    expect: {
      timeout: 10000
    }
  },

  // Test projects for different environments
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    
    // Mobile devices
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        viewport: { width: 375, height: 667 }
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 }
      },
    },
    
    // Tablet devices
    {
      name: 'Tablet',
      use: { 
        ...devices['iPad Pro 11 landscape'],
        viewport: { width: 1194, height: 834 }
      },
    },
    
    // CI-specific configuration
    {
      name: 'CI',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
      testMatch: /.*\.spec\.ts/,
      retries: 2,
      workers: 1
    }
  ],

  // Web server configuration
  webServer: [
    {
      command: 'cd ../backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload',
      url: 'http://localhost:8000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: {
        ENVIRONMENT: 'test',
        DATABASE_URL: 'postgresql://test:test@localhost:5432/codexos_test',
        REDIS_URL: 'redis://localhost:6379/1'
      }
    },
    {
      command: 'pnpm dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: {
        NODE_ENV: 'test',
        NEXT_PUBLIC_API_URL: 'http://localhost:8000/api/v1'
      }
    }
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./tests/e2e/global-setup.ts'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown.ts'),

  // Test output directory
  outputDir: 'test-results/',

  // Timeout configuration
  timeout: 60000,
  expect: {
    timeout: 10000
  },

  // Environment-specific overrides
  ...(process.env.CI && {
    workers: 1,
    retries: 2,
    use: {
      ...devices['Desktop Chrome'],
      viewport: { width: 1280, height: 720 },
      trace: 'on',
      screenshot: 'on',
      video: 'on'
    }
  }),

  // Test matching patterns
  testMatch: [
    '**/*.spec.ts',
    '**/*.test.ts'
  ],

  // Test ignore patterns
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**'
  ],

  // Global test timeout
  globalTimeout: 600000, // 10 minutes

  // Metadata for test reports
  metadata: {
    project: 'CodexOS',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    ci: process.env.CI === 'true'
  }
})
