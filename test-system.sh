#!/bin/bash

# CodexOS System Test Script
# This script tests all major components of the system

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🧪 CodexOS System Test${NC}"
echo ""

# Check environment file
if [ ! -f ".env.local" ]; then
    echo -e "${RED}Error: .env.local file not found!${NC}"
    echo "Please create .env.local and add your API keys"
    exit 1
fi

# Load environment
export $(cat .env.local | grep -v '^#' | xargs)

# Check required API keys
echo -e "${YELLOW}Checking API keys...${NC}"

if [[ -z "$OPENAI_API_KEY" ]] || [[ "$OPENAI_API_KEY" == "sk-..." ]]; then
    echo -e "${RED}❌ OpenAI API key not set${NC}"
    echo "Please add your OpenAI API key to env.local"
    exit 1
else
    echo -e "${GREEN}✓ OpenAI API key found${NC}"
fi

if [[ "$STRIPE_API_KEY" == "sk_test_..." ]]; then
    echo -e "${YELLOW}⚠️  Stripe API key not set (marketplace features will be limited)${NC}"
else
    echo -e "${GREEN}✓ Stripe API key found${NC}"
fi

echo ""
echo -e "${YELLOW}Starting services...${NC}"

# Use development docker-compose with env override
docker-compose --env-file .env.local up -d

echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 15

# Test API health
echo ""
echo -e "${YELLOW}Testing API health...${NC}"
if curl -f -s http://localhost:8001/health > /dev/null; then
    echo -e "${GREEN}✓ API is healthy${NC}"
else
    echo -e "${RED}✗ API health check failed${NC}"
    docker-compose logs backend
    exit 1
fi

# Test frontend
echo -e "${YELLOW}Testing frontend...${NC}"
if curl -f -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${RED}✗ Frontend check failed${NC}"
    docker-compose logs frontend
    exit 1
fi

# Test database
echo -e "${YELLOW}Testing database connection...${NC}"
if docker-compose exec -T postgres psql -U codexos -d codexos_db -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database is accessible${NC}"
else
    echo -e "${RED}✗ Database connection failed${NC}"
    exit 1
fi

# Test Redis
echo -e "${YELLOW}Testing Redis...${NC}"
if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
    echo -e "${GREEN}✓ Redis is running${NC}"
else
    echo -e "${RED}✗ Redis check failed${NC}"
    exit 1
fi

# Run API tests
echo ""
echo -e "${YELLOW}Running API tests...${NC}"

# Create test user
echo "Creating test user..."
USER_RESPONSE=$(curl -s -X POST http://localhost:8001/api/v1/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPassword123!",
    "full_name": "Test User"
  }')

if echo "$USER_RESPONSE" | grep -q "id"; then
    echo -e "${GREEN}✓ User creation successful${NC}"
else
    echo -e "${YELLOW}User might already exist${NC}"
fi

# Login
echo "Testing authentication..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "TestPassword123!"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✓ Authentication successful${NC}"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
else
    echo -e "${RED}✗ Authentication failed${NC}"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

# Test agent execution (if OpenAI key is set)
if [[ "$OPENAI_API_KEY" != "sk-..." ]]; then
    echo "Testing agent execution..."
    AGENT_RESPONSE=$(curl -s -X POST http://localhost:8001/api/v1/agents/execute \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "nodes": [
          {
            "id": "1",
            "type": "entry",
            "data": {"label": "Start"},
            "position": {"x": 0, "y": 0}
          },
          {
            "id": "2",
            "type": "llm",
            "data": {
              "model": "gpt-3.5-turbo",
              "prompt": "Say hello"
            },
            "position": {"x": 200, "y": 0}
          }
        ],
        "edges": [
          {"source": "1", "target": "2"}
        ]
      }')
    
    if echo "$AGENT_RESPONSE" | grep -q "execution_id"; then
        echo -e "${GREEN}✓ Agent execution initiated${NC}"
    else
        echo -e "${RED}✗ Agent execution failed${NC}"
        echo "$AGENT_RESPONSE"
    fi
fi

echo ""
echo -e "${GREEN}🎉 System test completed!${NC}"
echo ""
echo "Services are running at:"
echo -e "  Frontend: ${YELLOW}http://localhost:3000${NC}"
echo -e "  API: ${YELLOW}http://localhost:8001/api/v1${NC}"
echo -e "  API Docs: ${YELLOW}http://localhost:8001/api/v1/docs${NC}"
echo ""
echo "To view logs:"
echo -e "  ${YELLOW}docker-compose logs -f [service]${NC}"
echo ""
echo "To stop services:"
echo -e "  ${YELLOW}docker-compose down${NC}"
