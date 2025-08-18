#!/bin/bash
# SPDX-License-Identifier: LicenseRef-NIA-Proprietary

# CodexOS.dev Startup Script
# This script ensures all dependencies are installed and starts the application

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ASCII Art Logo
echo -e "${BLUE}"
cat << "EOF"
   ____          _          ___  ____  
  / ___|___   __| | _____  / _ \/ ___| 
 | |   / _ \ / _` |/ _ \ \| | | \___ \ 
 | |__| (_) | (_| |  __/  X| |_| |___) |
  \____\___/ \__,_|\___| /_/ \___/____/ 
                                        
      Autonomous Engineering OS
EOF
echo -e "${NC}"

echo -e "${GREEN}Welcome to CodexOS.dev!${NC}"
echo "Initializing the autonomous engineering operating system..."
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to display error and exit
error_exit() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

# Function to display warning
warning() {
    echo -e "${YELLOW}Warning: $1${NC}"
}

# Function to display success
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to display info
info() {
    echo -e "${BLUE}→ $1${NC}"
}

# Check for required system dependencies
info "Checking system dependencies..."

# Check for Node.js
if ! command_exists node; then
    error_exit "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
else
    NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error_exit "Node.js version 18+ is required. Current version: $(node -v)"
    else
        success "Node.js $(node -v) found"
    fi
fi

# Check for Python
if ! command_exists python3; then
    error_exit "Python 3 is not installed. Please install Python 3.11+"
else
    PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
    PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d '.' -f 1)
    PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d '.' -f 2)
    if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 11 ]); then
        error_exit "Python 3.11+ is required. Current version: $PYTHON_VERSION"
    else
        success "Python $PYTHON_VERSION found"
    fi
fi

# Check for Docker
if ! command_exists docker; then
    error_exit "Docker is not installed. Please install Docker from https://www.docker.com/"
else
    success "Docker found"
fi

# Check for Docker Compose
if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
    error_exit "Docker Compose is not installed. Please install Docker Compose"
else
    success "Docker Compose found"
fi

# Check for pnpm
if ! command_exists pnpm; then
    info "pnpm not found. Installing pnpm..."
    npm install -g pnpm
    success "pnpm installed"
else
    success "pnpm found"
fi

# Check for Poetry
if ! command_exists poetry; then
    info "Poetry not found. Installing Poetry..."
    curl -sSL https://install.python-poetry.org | python3 -
    export PATH="$HOME/.local/bin:$PATH"
    success "Poetry installed"
else
    success "Poetry found"
fi

# Create necessary directories
info "Setting up directories..."
mkdir -p logs
mkdir -p data

# Check if .env files exist, if not copy from examples
info "Checking environment files..."

if [ ! -f "apps/backend/.env" ]; then
    if [ -f "apps/backend/.env.example" ]; then
        cp apps/backend/.env.example apps/backend/.env
        warning "Created apps/backend/.env from example. Please update with your configuration!"
    else
        warning "No .env file found for backend. Creating default..."
        cat > apps/backend/.env << 'EOL'
# SPDX-License-Identifier: LicenseRef-NIA-Proprietary

# Application
APP_NAME=CodexOS
APP_VERSION=1.0.0
DEBUG=True
ENVIRONMENT=development

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_PREFIX=/api/v1
CORS_ORIGINS=["http://localhost:3000","https://codexos.dev"]

# Database
DATABASE_URL=postgresql+asyncpg://codexos:codexos_secure_password@localhost:5432/codexos_db
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=dev-secret-key-change-in-production-$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
VAULT_MASTER_KEY=$(openssl rand -hex 32)

# LLM Providers (add your keys here)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
OLLAMA_MODEL=llama3
OLLAMA_BASE_URL=http://localhost:11434

# Vector Store
CHROMA_HOST=localhost
CHROMA_PORT=8000
CHROMA_COLLECTION=codexos_rag

# Feature Flags
ENABLE_MARKETPLACE=true
ENABLE_MULTIMODAL=true
ENABLE_SELF_HOSTED=true
EOL
        success "Created default backend .env file"
    fi
fi

if [ ! -f "apps/web/.env" ]; then
    cat > apps/web/.env << 'EOL'
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8001/ws
EOL
    success "Created default frontend .env file"
fi

# Install dependencies
info "Installing dependencies..."

# Install root dependencies
pnpm install

# Start services based on user choice
echo ""
echo "How would you like to start CodexOS?"
echo "1) Full stack with Docker (recommended)"
echo "2) Development mode (local services)"
echo "3) Frontend only"
echo "4) Backend only"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        info "Starting CodexOS with Docker..."
        
        # Pull required images
        info "Pulling Docker images..."
        docker-compose pull
        
        # Start all services
        info "Starting all services..."
        docker-compose up -d
        
        # Wait for services to be ready
        info "Waiting for services to be ready..."
        sleep 10
        
        # Check service health
        if docker-compose ps | grep -q "unhealthy\|Exit"; then
            error_exit "Some services failed to start. Check logs with: docker-compose logs"
        fi
        
        success "CodexOS is starting!"
        echo ""
        echo "🌐 Frontend: http://localhost:3000"
        echo "📡 Backend API: http://localhost:8001/api/v1/docs"
        echo "🗄️  ChromaDB: http://localhost:8000"
        echo "📊 PostgreSQL: localhost:5432"
        echo "⚡ Redis: localhost:6379"
        echo ""
        echo "To view logs: docker-compose logs -f"
        echo "To stop: docker-compose down"
        ;;
        
    2)
        info "Starting in development mode..."
        
        # Check if PostgreSQL is running
        if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
            warning "PostgreSQL is not running. Please start it manually or use Docker mode."
        fi
        
        # Check if Redis is running
        if ! redis-cli ping >/dev/null 2>&1; then
            warning "Redis is not running. Please start it manually or use Docker mode."
        fi
        
        # Start development servers
        info "Starting development servers..."
        pnpm dev
        ;;
        
    3)
        info "Starting frontend only..."
        cd apps/web
        pnpm dev
        ;;
        
    4)
        info "Starting backend only..."
        cd apps/backend
        poetry install
        poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
        ;;
        
    *)
        error_exit "Invalid choice. Please run the script again."
        ;;
esac

echo ""
success "CodexOS.dev is ready! 🚀"
echo "Visit the documentation at: https://docs.codexos.dev"
