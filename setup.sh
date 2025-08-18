#!/bin/bash

# CodexOS Setup Script
# This script installs all required dependencies

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 CodexOS Setup Script${NC}"
echo ""

# Check OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
else
    OS="unknown"
fi

echo -e "${YELLOW}Detected OS: $OS${NC}"

# Check Python
echo -e "${YELLOW}Checking Python...${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1 | grep -o '[0-9]\+\.[0-9]\+' | head -1)
    echo -e "${GREEN}✓ Python $PYTHON_VERSION found${NC}"
    
    if [[ $(echo "$PYTHON_VERSION >= 3.11" | bc -l) -eq 1 ]]; then
        echo -e "${GREEN}✓ Python version is compatible${NC}"
    else
        echo -e "${RED}❌ Python 3.11+ required, found $PYTHON_VERSION${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Python 3 not found${NC}"
    echo "Please install Python 3.11+ from https://python.org"
    exit 1
fi

# Check Node.js
echo -e "${YELLOW}Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | grep -o '[0-9]\+\.[0-9]\+' | head -1)
    echo -e "${GREEN}✓ Node.js $NODE_VERSION found${NC}"
    
    if [[ $(echo "$NODE_VERSION >= 18.17" | bc -l) -eq 1 ]]; then
        echo -e "${GREEN}✓ Node.js version is compatible${NC}"
    else
        echo -e "${RED}❌ Node.js 18.17+ required, found $NODE_VERSION${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Node.js not found${NC}"
    echo "Please install Node.js 18.17+ from https://nodejs.org"
    exit 1
fi

# Check Docker
echo -e "${YELLOW}Checking Docker...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker found${NC}"
    
    if docker info &> /dev/null; then
        echo -e "${GREEN}✓ Docker daemon is running${NC}"
    else
        echo -e "${YELLOW}⚠️  Docker daemon is not running${NC}"
        echo "Please start Docker Desktop or Docker daemon"
    fi
else
    echo -e "${RED}❌ Docker not found${NC}"
    echo "Please install Docker from https://docker.com"
    exit 1
fi

# Check Docker Compose
echo -e "${YELLOW}Checking Docker Compose...${NC}"
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    echo -e "${GREEN}✓ Docker Compose found${NC}"
else
    echo -e "${RED}❌ Docker Compose not found${NC}"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

# Install Python dependencies
echo ""
echo -e "${YELLOW}Installing Python dependencies...${NC}"

# Check if Poetry is available
if command -v poetry &> /dev/null; then
    echo -e "${GREEN}✓ Poetry found, using it to install dependencies${NC}"
    cd apps/backend
    poetry install
    cd ../..
else
    echo -e "${YELLOW}⚠️  Poetry not found, using pip${NC}"
    echo "Installing Poetry..."
    curl -sSL https://install.python-poetry.org | python3 -
    
    # Add Poetry to PATH
    export PATH="$HOME/.local/bin:$PATH"
    
    cd apps/backend
    poetry install
    cd ../..
fi

# Install Node.js dependencies
echo ""
echo -e "${YELLOW}Installing Node.js dependencies...${NC}"

# Check if pnpm is available
if command -v pnpm &> /dev/null; then
    echo -e "${GREEN}✓ pnpm found, using it to install dependencies${NC}"
    cd apps/web
    pnpm install
    cd ../..
else
    echo -e "${YELLOW}⚠️  pnpm not found, installing it${NC}"
    npm install -g pnpm
    
    cd apps/web
    pnpm install
    cd ../..
fi

# Create environment file
echo ""
echo -e "${YELLOW}Setting up environment...${NC}"

if [ ! -f ".env.local" ]; then
    if [ -f "env.local" ]; then
        echo -e "${GREEN}✓ env.local found${NC}"
    else
        echo -e "${YELLOW}⚠️  No environment file found${NC}"
        echo "Please create .env.local with your API keys"
        echo "See env.production.example for reference"
    fi
else
    echo -e "${GREEN}✓ .env.local found${NC}"
fi

# Check ports
echo ""
echo -e "${YELLOW}Checking port availability...${NC}"

check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $port is in use by $service${NC}"
        return 1
    else
        echo -e "${GREEN}✓ Port $port is available${NC}"
        return 0
    fi
}

check_port 3000 "Frontend"
check_port 8001 "Backend"
check_port 5432 "PostgreSQL"
check_port 6379 "Redis"

echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Add your API keys to .env.local"
echo "2. Run: ./start-local.sh"
echo "3. Access: http://localhost:3000"
echo ""
echo "For production deployment:"
echo "1. Edit .env.production"
echo "2. Run: ./deploy.sh production"
echo ""
echo "Documentation: docs/"
echo "Requirements: REQUIREMENTS.md"
