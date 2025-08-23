#!/bin/bash

# Comprehensive E2E Test Runner for CodexOS
# This script sets up the test environment and runs all E2E tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
WEB_APP_DIR="$PROJECT_ROOT/apps/web"
BACKEND_DIR="$PROJECT_ROOT/apps/backend"
TEST_RESULTS_DIR="$WEB_APP_DIR/test-results"
REPORTS_DIR="$WEB_APP_DIR/test-reports"

echo -e "${BLUE}🧪 CodexOS End-to-End Testing Suite${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Create test directories
mkdir -p "$TEST_RESULTS_DIR" "$REPORTS_DIR"

# Function to check if service is running
check_service() {
    local service_name=$1
    local url=$2
    local max_attempts=${3:-30}
    local attempt=1
    
    echo -e "${YELLOW}🔍 Checking $service_name availability...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is running at $url${NC}"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "\n${RED}❌ $service_name is not available after $max_attempts attempts${NC}"
    return 1
}

# Function to start services
start_services() {
    echo -e "${YELLOW}🚀 Starting required services...${NC}"
    
    # Start backend services
    cd "$BACKEND_DIR"
    if [ -f "docker-compose.yml" ]; then
        echo "Starting backend with Docker Compose..."
        docker-compose up -d postgres redis
        sleep 10
        
        # Start backend application
        echo "Starting backend application..."
        python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
        BACKEND_PID=$!
        sleep 15
    else
        echo -e "${RED}❌ Backend docker-compose.yml not found${NC}"
        return 1
    fi
    
    # Start frontend
    cd "$WEB_APP_DIR"
    echo "Starting frontend development server..."
    pnpm dev &
    FRONTEND_PID=$!
    sleep 20
    
    # Check services
    check_service "Backend API" "http://localhost:8000/health" || return 1
    check_service "Frontend" "http://localhost:3000" || return 1
    
    echo -e "${GREEN}✅ All services are running${NC}"
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}🛑 Stopping services...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Stop Docker services
    cd "$BACKEND_DIR"
    docker-compose down 2>/dev/null || true
    
    echo -e "${GREEN}✅ Services stopped${NC}"
}

# Function to run tests
run_tests() {
    local test_type=$1
    local test_name=$2
    
    echo -e "${BLUE}🧪 Running $test_name tests...${NC}"
    
    cd "$WEB_APP_DIR"
    
    case $test_type in
        "e2e")
            echo "Running E2E tests with Playwright..."
            pnpm playwright test --reporter=html,json --output-dir="$TEST_RESULTS_DIR"
            ;;
        "api")
            echo "Running API integration tests..."
            pnpm playwright test api-integration.spec.ts --reporter=html,json --output-dir="$TEST_RESULTS_DIR"
            ;;
        "user-journey")
            echo "Running user journey tests..."
            pnpm playwright test user-journey.spec.ts --reporter=html,json --output-dir="$TEST_RESULTS_DIR"
            ;;
        "all")
            echo "Running all E2E tests..."
            pnpm playwright test --reporter=html,json --output-dir="$TEST_RESULTS_DIR"
            ;;
        *)
            echo -e "${RED}❌ Unknown test type: $test_type${NC}"
            return 1
            ;;
    esac
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ $test_name tests completed successfully${NC}"
    else
        echo -e "${RED}❌ $test_name tests failed with exit code $exit_code${NC}"
    fi
    
    return $exit_code
}

# Function to generate test report
generate_report() {
    echo -e "${YELLOW}📊 Generating test report...${NC}"
    
    cd "$WEB_APP_DIR"
    
    # Generate HTML report
    if [ -d "$TEST_RESULTS_DIR" ]; then
        echo "Generating HTML report..."
        pnpm playwright show-report "$TEST_RESULTS_DIR" &
        
        # Copy results to reports directory
        cp -r "$TEST_RESULTS_DIR"/* "$REPORTS_DIR/" 2>/dev/null || true
        
        echo -e "${GREEN}✅ Test report generated${NC}"
        echo -e "${BLUE}📁 Test results: $TEST_RESULTS_DIR${NC}"
        echo -e "${BLUE}📊 HTML report: $REPORTS_DIR${NC}"
    else
        echo -e "${RED}❌ No test results found${NC}"
    fi
}

# Function to check test prerequisites
check_prerequisites() {
    echo -e "${YELLOW}🔍 Checking test prerequisites...${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        return 1
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        echo -e "${RED}❌ pnpm is not installed${NC}"
        return 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        return 1
    fi
    
    # Check Playwright
    if [ ! -d "$WEB_APP_DIR/node_modules/@playwright" ]; then
        echo -e "${YELLOW}⚠️  Playwright not installed, installing...${NC}"
        cd "$WEB_APP_DIR"
        pnpm install
        pnpm playwright install
    fi
    
    echo -e "${GREEN}✅ All prerequisites are met${NC}"
    return 0
}

# Function to show test summary
show_summary() {
    echo ""
    echo -e "${BLUE}📋 Test Summary${NC}"
    echo -e "${BLUE}===============${NC}"
    
    if [ -f "$TEST_RESULTS_DIR/results.json" ]; then
        local total_tests=$(jq '.stats.total' "$TEST_RESULTS_DIR/results.json" 2>/dev/null || echo "0")
        local passed_tests=$(jq '.stats.passed' "$TEST_RESULTS_DIR/results.json" 2>/dev/null || echo "0")
        local failed_tests=$(jq '.stats.failed' "$TEST_RESULTS_DIR/results.json" 2>/dev/null || echo "0")
        
        echo "Total Tests: $total_tests"
        echo "Passed: $passed_tests"
        echo "Failed: $failed_tests"
        
        if [ "$failed_tests" -gt 0 ]; then
            echo -e "${RED}❌ Some tests failed${NC}"
        else
            echo -e "${GREEN}✅ All tests passed${NC}"
        fi
    else
        echo "No test results available"
    fi
}

# Main execution
main() {
    local test_type=${1:-"all"}
    local should_start_services=${2:-"true"}
    
    echo -e "${BLUE}🎯 Test Configuration:${NC}"
    echo "Test Type: $test_type"
    echo "Start Services: $should_start_services"
    echo ""
    
    # Check prerequisites
    if ! check_prerequisites; then
        echo -e "${RED}❌ Prerequisites check failed${NC}"
        exit 1
    fi
    
    # Start services if requested
    if [ "$should_start_services" = "true" ]; then
        if ! start_services; then
            echo -e "${RED}❌ Failed to start services${NC}"
            exit 1
        fi
    fi
    
    # Run tests
    if ! run_tests "$test_type" "$test_type"; then
        echo -e "${RED}❌ Tests failed${NC}"
        show_summary
        if [ "$should_start_services" = "true" ]; then
            stop_services
        fi
        exit 1
    fi
    
    # Generate report
    generate_report
    
    # Show summary
    show_summary
    
    # Stop services if we started them
    if [ "$should_start_services" = "true" ]; then
        stop_services
    fi
    
    echo -e "${GREEN}🎉 E2E testing completed successfully!${NC}"
}

# Trap to ensure services are stopped on exit
trap stop_services EXIT

# Parse command line arguments
case "${1:-}" in
    "e2e"|"api"|"user-journey"|"all")
        main "$1" "${2:-true}"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [test_type] [start_services]"
        echo ""
        echo "Test Types:"
        echo "  e2e           - Run all E2E tests"
        echo "  api           - Run API integration tests only"
        echo "  user-journey  - Run user journey tests only"
        echo "  all           - Run all tests (default)"
        echo ""
        echo "Start Services:"
        echo "  true          - Start required services (default)"
        echo "  false         - Assume services are already running"
        echo ""
        echo "Examples:"
        echo "  $0                    # Run all tests, start services"
        echo "  $0 api false          # Run API tests only, don't start services"
        echo "  $0 user-journey      # Run user journey tests, start services"
        ;;
    *)
        echo -e "${RED}❌ Invalid test type: ${1:-}${NC}"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
