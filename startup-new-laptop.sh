#!/bin/bash
# SPDX-License-Identifier: LicenseRef-NIA-Proprietary

# CodexOS New Laptop Startup Script
# This script is designed to get CodexOS running on a fresh laptop setup

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

echo -e "${GREEN}🚀 Welcome to CodexOS New Laptop Setup!${NC}"
echo "This script will help you get CodexOS running on your new machine."
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to display error and exit
error_exit() {
    echo -e "${RED}❌ Error: $1${NC}" >&2
    echo ""
    echo -e "${YELLOW}Troubleshooting tips:${NC}"
    echo "1. Check the error message above"
    echo "2. Ensure you have the required permissions"
    echo "3. Try running: sudo ./startup-new-laptop.sh"
    echo "4. Check the documentation at: docs/"
    echo ""
    exit 1
}

# Function to display warning
warning() {
    echo -e "${YELLOW}⚠️  Warning: $1${NC}"
}

# Function to display success
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to display info
info() {
    echo -e "${BLUE}→ $1${NC}"
}

# Function to display step
step() {
    echo -e "${PURPLE}📋 $1${NC}"
}

# Function to check and install system dependencies
check_system_deps() {
    step "Checking system dependencies..."
    
    # Check for Homebrew (macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if ! command_exists brew; then
            info "Installing Homebrew for macOS..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            # Add Homebrew to PATH
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
            eval "$(/opt/homebrew/bin/brew shellenv)"
            success "Homebrew installed"
        else
            success "Homebrew found"
        fi
    fi
    
    # Check for Node.js
    if ! command_exists node; then
        info "Installing Node.js..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install node
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
        else
            error_exit "Unsupported OS. Please install Node.js 18+ manually from https://nodejs.org/"
        fi
        success "Node.js installed"
    else
        NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
        if [ "$NODE_VERSION" -lt 18 ]; then
            warning "Node.js version 18+ is required. Current version: $(node -v)"
            info "Updating Node.js..."
            if [[ "$OSTYPE" == "darwin"* ]]; then
                brew upgrade node
            fi
        else
            success "Node.js $(node -v) found"
        fi
    fi

    # Check for Python
    if ! command_exists python3; then
        info "Installing Python 3..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install python@3.11
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo apt-get update
            sudo apt-get install -y python3.11 python3.11-venv python3-pip
        else
            error_exit "Unsupported OS. Please install Python 3.11+ manually"
        fi
        success "Python 3 installed"
    else
        PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
        PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d '.' -f 1)
        PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d '.' -f 2)
        if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 11 ]); then
            warning "Python 3.11+ is required. Current version: $PYTHON_VERSION"
            info "Updating Python..."
            if [[ "$OSTYPE" == "darwin"* ]]; then
                brew upgrade python@3.11
            fi
        else
            success "Python $PYTHON_VERSION found"
        fi
    fi

    # Check for Docker
    if ! command_exists docker; then
        info "Installing Docker..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install --cask docker
            info "Docker Desktop installed. Please start it manually."
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            curl -fsSL https://get.docker.com -o get-docker.sh
            sudo sh get-docker.sh
            sudo usermod -aG docker $USER
            sudo systemctl enable docker
            sudo systemctl start docker
            success "Docker installed and started"
        else
            error_exit "Unsupported OS. Please install Docker manually from https://www.docker.com/"
        fi
    else
        success "Docker found"
    fi

    # Check for Docker Compose
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        info "Installing Docker Compose..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install docker-compose
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            sudo chmod +x /usr/local/bin/docker-compose
        fi
        success "Docker Compose installed"
    else
        success "Docker Compose found"
    fi

    # Check for pnpm
    if ! command_exists pnpm; then
        info "Installing pnpm..."
        npm install -g pnpm
        success "pnpm installed"
    else
        success "pnpm found"
    fi

    # Check for Poetry
    if ! command_exists poetry; then
        info "Installing Poetry..."
        curl -sSL https://install.python-poetry.org | python3 -
        export PATH="$HOME/.local/bin:$PATH"
        success "Poetry installed"
    else
        success "Poetry found"
    fi
}

# Function to setup environment
setup_environment() {
    step "Setting up environment..."
    
    # Create necessary directories
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
}

# Function to install dependencies
install_dependencies() {
    step "Installing dependencies..."
    
    # Install root dependencies
    info "Installing root dependencies..."
    pnpm install
    
    # Install backend dependencies
    info "Installing backend dependencies..."
    cd apps/backend
    poetry install
    cd ../..
    
    # Install frontend dependencies
    info "Installing frontend dependencies..."
    cd apps/web
    pnpm install
    cd ../..
    
    success "All dependencies installed"
}

# Function to start services
start_services() {
    step "Starting services..."
    
    # Ensure Docker is running
    if ! docker info >/dev/null 2>&1; then
        error_exit "Docker is not running. Please start Docker Desktop or Docker daemon."
    fi
    
    # Pull required images
    info "Pulling Docker images..."
    docker-compose pull
    
    # Start all services
    info "Starting all services..."
    docker-compose up -d
    
    # Wait for services to be ready
    info "Waiting for services to be ready..."
    sleep 15
    
    # Check service health
    if docker-compose ps | grep -q "unhealthy\|Exit"; then
        warning "Some services may have failed to start. Checking logs..."
        docker-compose logs --tail=20
        warning "If services are unhealthy, you can check logs with: docker-compose logs -f"
    fi
    
    success "Services started!"
}

# Function to verify setup
verify_setup() {
    step "Verifying setup..."
    
    # Check if services are responding
    info "Checking service health..."
    
    # Wait a bit more for services to fully initialize
    sleep 10
    
    # Check backend health
    if curl -s http://localhost:8001/health >/dev/null 2>&1; then
        success "Backend is healthy"
    else
        warning "Backend health check failed. It may still be starting up."
    fi
    
    # Check frontend
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        success "Frontend is responding"
    else
        warning "Frontend may still be starting up."
    fi
    
    # Check database
    if docker-compose exec -T postgres pg_isready -U codexos >/dev/null 2>&1; then
        success "PostgreSQL is ready"
    else
        warning "PostgreSQL may still be starting up."
    fi
    
    # Check Redis
    if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
        success "Redis is ready"
    else
        warning "Redis may still be starting up."
    fi
}

# Function to display next steps
show_next_steps() {
    echo ""
    echo -e "${GREEN}🎉 CodexOS setup completed!${NC}"
    echo ""
    echo -e "${CYAN}📱 Access your applications:${NC}"
    echo "🌐 Frontend: http://localhost:3000"
    echo "📡 Backend API: http://localhost:8001/api/v1/docs"
    echo "🗄️  ChromaDB: http://localhost:8000"
    echo "📊 PostgreSQL: localhost:5432"
    echo "⚡ Redis: localhost:6379"
    echo ""
    echo -e "${CYAN}🔧 Useful commands:${NC}"
    echo "View logs: docker-compose logs -f"
    echo "Stop services: docker-compose down"
    echo "Restart services: docker-compose restart"
    echo "Rebuild: docker-compose up -d --build"
    echo ""
    echo -e "${CYAN}📚 Next steps:${NC}"
    echo "1. Visit http://localhost:3000 to access the frontend"
    echo "2. Check the API docs at http://localhost:8001/api/v1/docs"
    echo "3. Update your .env files with API keys if needed"
    echo "4. Check the documentation in the docs/ folder"
    echo ""
    echo -e "${YELLOW}⚠️  Important notes:${NC}"
    echo "- Services may take a few minutes to fully initialize"
    echo "- Check logs if you encounter any issues"
    echo "- Update environment variables for production use"
    echo ""
    echo -e "${GREEN}Happy coding with CodexOS! 🚀${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}Starting CodexOS setup on your new laptop...${NC}"
    echo ""
    
    # Check system dependencies
    check_system_deps
    
    # Setup environment
    setup_environment
    
    # Install dependencies
    install_dependencies
    
    # Start services
    start_services
    
    # Verify setup
    verify_setup
    
    # Show next steps
    show_next_steps
}

# Run main function
main "$@"
