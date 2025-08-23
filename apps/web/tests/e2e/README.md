# 🧪 CodexOS End-to-End Testing Suite

## 📋 Overview

This directory contains comprehensive end-to-end (E2E) tests for CodexOS, designed to validate the complete user journey from registration to advanced agent workflows. The testing suite uses Playwright for cross-browser testing and provides comprehensive coverage of all major application features.

## 🎯 Test Coverage

### **Core User Flows**
- ✅ **User Onboarding**: Registration, login, dashboard access
- ✅ **Agent Management**: Creation, editing, execution, deletion
- ✅ **Marketplace Operations**: Browsing, purchasing, installation
- ✅ **RAG Engine Integration**: Document upload, search, retrieval
- ✅ **Flow Editor**: Workflow creation, node management, execution
- ✅ **User Settings**: Profile management, password changes, preferences

### **API Integration**
- ✅ **Authentication**: Login, registration, token refresh
- ✅ **User Management**: CRUD operations, profile updates
- ✅ **Agent APIs**: Full agent lifecycle management
- ✅ **Marketplace APIs**: Item listing, purchase processing
- ✅ **RAG APIs**: Document management, search functionality
- ✅ **Stripe Integration**: Payment processing, webhook handling

### **Error Handling & Edge Cases**
- ✅ **Invalid Inputs**: Form validation, error messages
- ✅ **Network Issues**: Offline handling, retry mechanisms
- ✅ **Authentication Failures**: Invalid tokens, expired sessions
- ✅ **Resource Not Found**: 404 handling, graceful degradation
- ✅ **Rate Limiting**: API throttling, user feedback

### **Performance & Responsiveness**
- ✅ **Page Load Times**: Performance thresholds, optimization
- ✅ **Mobile Responsiveness**: Cross-device compatibility
- ✅ **Search Performance**: Response time validation
- ✅ **Resource Usage**: Memory, CPU monitoring

## 🚀 Quick Start

### **1. Prerequisites**
```bash
# Required software
- Node.js 18+
- pnpm package manager
- Docker & Docker Compose
- Git

# Environment variables
export TEST_BASE_URL="http://localhost:3000"
export TEST_API_BASE_URL="http://localhost:8000/api/v1"
```

### **2. Install Dependencies**
```bash
cd apps/web
pnpm install
pnpm playwright install
```

### **3. Run Tests**
```bash
# Run all E2E tests
./tests/e2e/run-e2e-tests.sh

# Run specific test types
./tests/e2e/run-e2e-tests.sh user-journey
./tests/e2e/run-e2e-tests.sh api
./tests/e2e/run-e2e-tests.sh e2e

# Run without starting services (if already running)
./tests/e2e/run-e2e-tests.sh all false
```

### **4. View Results**
```bash
# Open HTML report
pnpm playwright show-report test-results/html

# View test summary
cat test-results/test-summary.json
```

## 📁 Test Structure

```
tests/e2e/
├── README.md                 # This documentation
├── run-e2e-tests.sh         # Test runner script
├── test-config.ts           # Test configuration and utilities
├── global-setup.ts          # Global test setup
├── global-teardown.ts       # Global test cleanup
├── user-journey.spec.ts     # Complete user journey tests
├── api-integration.spec.ts  # API integration tests
└── flow-editor.spec.ts      # Flow editor specific tests
```

## 🧪 Test Types

### **1. User Journey Tests (`user-journey.spec.ts`)**
Comprehensive tests covering the complete user experience:

- **User Onboarding Flow**
  - Homepage navigation and signup
  - User registration and verification
  - Dashboard access and initial state
  - Quick actions and navigation

- **Agent Management Flow**
  - Agent creation and configuration
  - Editing and updating agents
  - Agent execution and monitoring
  - Performance validation

- **Marketplace Flow**
  - Browsing marketplace items
  - Free item installation
  - Paid item purchase flow
  - Payment processing validation

- **RAG Engine Flow**
  - Document upload and processing
  - Search functionality testing
  - Document retrieval and display
  - Performance optimization

- **Flow Editor Flow**
  - Workflow creation and design
  - Node management and configuration
  - Flow execution and monitoring
  - Error handling and recovery

### **2. API Integration Tests (`api-integration.spec.ts`)**
Backend API validation and integration testing:

- **Authentication APIs**
  - User registration and login
  - Token refresh and validation
  - Error handling and rate limiting

- **User Management APIs**
  - Profile CRUD operations
  - Password changes and security
  - User preferences and settings

- **Agent Management APIs**
  - Agent lifecycle management
  - Configuration and execution
  - Performance monitoring

- **Marketplace APIs**
  - Item listing and details
  - Purchase processing
  - Payment integration

- **RAG Engine APIs**
  - Document management
  - Search and retrieval
  - Performance optimization

### **3. Flow Editor Tests (`flow-editor.spec.ts`)**
Specialized tests for the visual flow editor:

- **Canvas Operations**
  - Node addition and removal
  - Connection management
  - Layout and positioning

- **Node Configuration**
  - Parameter editing
  - Validation and error handling
  - Save and load functionality

- **Flow Execution**
  - Runtime validation
  - Error handling and recovery
  - Performance monitoring

## ⚙️ Configuration

### **Test Configuration (`test-config.ts`)**
Centralized configuration for all tests:

```typescript
export const TEST_CONFIG = {
  // URLs and endpoints
  BASE_URL: 'http://localhost:3000',
  API_BASE_URL: 'http://localhost:8000/api/v1',
  
  // Timeouts and thresholds
  DEFAULT_TIMEOUT: 30000,
  PERFORMANCE_THRESHOLDS: {
    PAGE_LOAD_TIME: 3000,
    API_RESPONSE_TIME: 1000,
    SEARCH_RESPONSE_TIME: 2000
  },
  
  // Test data templates
  TEST_USERS: { /* predefined test users */ },
  TEST_AGENTS: { /* predefined test agents */ },
  TEST_DOCUMENTS: { /* predefined test documents */ }
}
```

### **Environment Variables**
```bash
# Test Configuration
TEST_BASE_URL=http://localhost:3000
TEST_API_BASE_URL=http://localhost:8000/api/v1

# Test Environment
NODE_ENV=test
CI=false
HEADLESS=true
SLOW_MO=0

# Performance Settings
TEST_TIMEOUT=30000
TEST_RETRIES=1
```

## 🎭 Test Execution

### **Manual Execution**
```bash
# Run specific test file
pnpm playwright test user-journey.spec.ts

# Run with specific browser
pnpm playwright test --project=chromium

# Run with headed mode
pnpm playwright test --headed

# Run with debug mode
pnpm playwright test --debug
```

### **Automated Execution**
```bash
# Run all tests with service management
./tests/e2e/run-e2e-tests.sh

# Run tests assuming services are running
./tests/e2e/run-e2e-tests.sh all false

# Run specific test suite
./tests/e2e/run-e2e-tests.sh user-journey
```

### **CI/CD Integration**
```bash
# Run tests in CI environment
CI=true pnpm playwright test --reporter=github

# Generate JUnit report for CI
pnpm playwright test --reporter=junit
```

## 📊 Reporting & Results

### **Test Reports**
- **HTML Report**: Interactive browser-based report
- **JSON Report**: Machine-readable test results
- **JUnit Report**: CI/CD integration compatible
- **Console Output**: Real-time test progress

### **Performance Metrics**
- **Page Load Times**: Response time validation
- **API Performance**: Backend response times
- **Resource Usage**: Memory and CPU monitoring
- **Error Rates**: Failure analysis and trends

### **Test Artifacts**
- **Screenshots**: Failed test captures
- **Videos**: Test execution recordings
- **Traces**: Detailed execution traces
- **Logs**: Comprehensive test logs

## 🔧 Test Utilities

### **TestUtils Class**
```typescript
// Generate unique test data
const email = TestUtils.generateTestEmail('user')
const name = TestUtils.generateTestName('Agent')

// Wait for conditions
await TestUtils.waitForCondition(() => page.isVisible('[data-testid="success"]'))

// Generate performance reports
const report = TestUtils.generatePerformanceReport(metrics)
```

### **TestDataFactory Class**
```typescript
// Create test data with overrides
const user = TestDataFactory.createUser({ role: 'admin' })
const agent = TestDataFactory.createAgent({ agentType: 'decision' })
const document = TestDataFactory.createDocument({ type: 'markdown' })
```

## 🚨 Troubleshooting

### **Common Issues**

#### **1. Service Startup Failures**
```bash
# Check Docker services
docker-compose ps

# Check backend health
curl http://localhost:8000/health

# Check frontend availability
curl http://localhost:3000
```

#### **2. Test Timeout Issues**
```bash
# Increase timeout in test-config.ts
DEFAULT_TIMEOUT: 60000

# Check service performance
docker stats

# Monitor resource usage
htop
```

#### **3. Authentication Failures**
```bash
# Verify test user credentials
# Check backend authentication service
# Validate JWT token configuration
```

#### **4. Database Connection Issues**
```bash
# Check PostgreSQL connection
docker-compose logs postgres

# Verify database credentials
# Check network connectivity
```

### **Debug Commands**
```bash
# Run tests with debug output
DEBUG=pw:api pnpm playwright test

# Run specific test with debug
pnpm playwright test --debug user-journey.spec.ts

# Generate trace for failed test
pnpm playwright test --trace=on
```

## 📈 Performance Testing

### **Performance Thresholds**
```typescript
PERFORMANCE_THRESHOLDS: {
  PAGE_LOAD_TIME: 3000,        // 3 seconds
  API_RESPONSE_TIME: 1000,     // 1 second
  SEARCH_RESPONSE_TIME: 2000,  // 2 seconds
  AGENT_EXECUTION_TIME: 10000, // 10 seconds
  FLOW_EXECUTION_TIME: 15000   // 15 seconds
}
```

### **Performance Monitoring**
- **Real-time Metrics**: Live performance tracking
- **Threshold Validation**: Automatic performance checks
- **Performance Reports**: Detailed analysis and trends
- **Optimization Recommendations**: Performance improvement suggestions

## 🔒 Security Testing

### **Security Validations**
- **Authentication**: Token validation and expiration
- **Authorization**: Role-based access control
- **Input Validation**: SQL injection prevention
- **Rate Limiting**: API abuse prevention
- **CORS Configuration**: Cross-origin security

### **Security Headers**
- **Content Security Policy**: XSS prevention
- **HTTPS Enforcement**: Secure communication
- **Frame Options**: Clickjacking protection
- **Content Type Options**: MIME type sniffing prevention

## 🧹 Test Data Management

### **Data Cleanup**
- **Automatic Cleanup**: Post-test data removal
- **Isolated Test Data**: Unique identifiers for tests
- **Database Reset**: Clean state between test runs
- **Resource Cleanup**: Memory and connection cleanup

### **Test Data Isolation**
- **Unique Identifiers**: Timestamp-based naming
- **Separate Databases**: Test-specific data stores
- **Mock Services**: Isolated external dependencies
- **Cleanup Functions**: Automatic resource management

## 📚 Best Practices

### **Test Design**
1. **Single Responsibility**: Each test focuses on one feature
2. **Independent Execution**: Tests don't depend on each other
3. **Clear Assertions**: Explicit validation of expected outcomes
4. **Meaningful Names**: Descriptive test and variable names
5. **Proper Setup/Teardown**: Clean test environment management

### **Performance Considerations**
1. **Efficient Selectors**: Use stable, fast selectors
2. **Minimal Waits**: Avoid unnecessary delays
3. **Resource Management**: Clean up after tests
4. **Parallel Execution**: Run tests concurrently when possible
5. **Caching**: Reuse expensive operations

### **Maintenance**
1. **Regular Updates**: Keep tests current with application changes
2. **Documentation**: Maintain clear test documentation
3. **Code Review**: Review test code for quality
4. **Refactoring**: Improve test structure and readability
5. **Monitoring**: Track test performance and reliability

## 🎯 Future Enhancements

### **Planned Features**
- **Visual Regression Testing**: UI consistency validation
- **Load Testing**: Performance under stress
- **Accessibility Testing**: WCAG compliance validation
- **Cross-browser Testing**: Extended browser support
- **Mobile Testing**: Native mobile app testing

### **Integration Improvements**
- **CI/CD Pipeline**: Automated test execution
- **Test Reporting**: Enhanced analytics and dashboards
- **Performance Monitoring**: Real-time performance tracking
- **Alert System**: Automated failure notifications
- **Test Analytics**: Test coverage and quality metrics

---

## 📞 Support

For E2E testing support:
- Check the troubleshooting section above
- Review test logs and error messages
- Consult the Playwright documentation
- Check service health and connectivity
- Review test configuration and environment variables

---

**🎉 Your CodexOS E2E testing suite is now ready for comprehensive validation of the complete user journey!**
