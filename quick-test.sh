#!/bin/bash
# SPDX-License-Identifier: LicenseRef-NIA-Proprietary

# CodexOS Quick Test Script
# Quickly test if all services are running and accessible

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 CodexOS Quick Test${NC}"
echo "Testing service availability..."
echo ""

# Function to test service
test_service() {
    local name=$1
    local url=$2
    local description=$3
    
    echo -n "Testing $name... "
    
    if curl -s "$url" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "  $description"
        return 1
    fi
}

# Function to test database
test_database() {
    local name=$1
    local command=$2
    local description=$3
    
    echo -n "Testing $name... "
    
    if docker-compose exec -T $name $command >/dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "  $description"
        return 1
    fi
}

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo "Please start Docker Desktop or Docker daemon"
    exit 1
fi

# Check if services are running
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${RED}❌ No services are running${NC}"
    echo "Please start services with: docker-compose up -d"
    exit 1
fi

echo -e "${BLUE}Service Status:${NC}"
docker-compose ps
echo ""

# Test services
echo -e "${BLUE}Testing Services:${NC}"
failed=0

# Test frontend
if test_service "Frontend" "http://localhost:3000" "Frontend should be accessible at http://localhost:3000"; then
    :
else
    failed=$((failed + 1))
fi

# Test backend health
if test_service "Backend Health" "http://localhost:8001/health" "Backend health endpoint should respond"; then
    :
else
    failed=$((failed + 1))
fi

# Test backend API docs
if test_service "Backend API Docs" "http://localhost:8001/api/v1/docs" "API documentation should be accessible"; then
    :
else
    failed=$((failed + 1))
fi

# Test ChromaDB
if test_service "ChromaDB" "http://localhost:8000/api/v1/heartbeat" "ChromaDB should be responding"; then
    :
else
    failed=$((failed + 1))
fi

# Test databases
echo ""
echo -e "${BLUE}Testing Databases:${NC}"

# Test PostgreSQL
if test_database "PostgreSQL" "pg_isready -U codexos" "PostgreSQL should be ready to accept connections"; then
    :
else
    failed=$((failed + 1))
fi

# Test Redis
if test_database "Redis" "redis-cli ping" "Redis should respond to ping"; then
    :
else
    failed=$((failed + 1))
fi

# Summary
echo ""
if [ $failed -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! CodexOS is running correctly.${NC}"
    echo ""
    echo -e "${BLUE}Access your applications:${NC}"
    echo "🌐 Frontend: http://localhost:3000"
    echo "📡 Backend API: http://localhost:8001/api/v1/docs"
    echo "🗄️  ChromaDB: http://localhost:8000"
else
    echo -e "${RED}❌ $failed test(s) failed${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting tips:${NC}"
    echo "1. Check service logs: docker-compose logs -f"
    echo "2. Restart services: docker-compose restart"
    echo "3. Rebuild: docker-compose up -d --build"
    echo "4. Check the STARTUP-NEW-LAPTOP.md guide"
fi

echo ""
