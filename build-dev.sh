#!/bin/bash
# SPDX-License-Identifier: LicenseRef-NIA-Proprietary

# CodexOS Development Build Script
# Quick script to build and run the project for development

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}🚀 CodexOS Development Build${NC}"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to display error and exit
error_exit() {
    echo -e "${RED}❌ Error: $1${NC}" >&2
    exit 1
}

# Function to display success
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to display info
info() {
    echo -e "${BLUE}→ $1${NC}"
}

# Function to display warning
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    info "Checking prerequisites..."
    
    if ! command_exists docker; then
        error_exit "Docker is required but not installed"
    fi
    
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        error_exit "Docker Compose is required but not installed"
    fi
    
    if ! command_exists pnpm; then
        error_exit "pnpm is required but not installed"
    fi
    
    if ! command_exists poetry; then
        error_exit "Poetry is required but not installed"
    fi
    
    success "All prerequisites are met"
}

# Build and start services
build_and_start() {
    info "Building and starting services..."
    
    # Stop any existing services
    if docker-compose ps | grep -q "Up"; then
        info "Stopping existing services..."
        docker-compose down
    fi
    
    # Build images
    info "Building Docker images..."
    docker-compose build --no-cache
    
    # Start services
    info "Starting services..."
    docker-compose up -d
    
    success "Services started successfully"
}

# Wait for services to be ready
wait_for_services() {
    info "Waiting for services to be ready..."
    
    # Wait for PostgreSQL
    info "Waiting for PostgreSQL..."
    timeout=60
    counter=0
    while ! docker-compose exec -T postgres pg_isready -U codexos >/dev/null 2>&1; do
        if [ $counter -ge $timeout ]; then
            warning "PostgreSQL is taking longer than expected to start"
            break
        fi
        sleep 2
        counter=$((counter + 2))
        echo -n "."
    done
    echo ""
    success "PostgreSQL is ready"
    
    # Wait for Redis
    info "Waiting for Redis..."
    timeout=30
    counter=0
    while ! docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; do
        if [ $counter -ge $timeout ]; then
            warning "Redis is taking longer than expected to start"
            break
        fi
        sleep 2
        counter=$((counter + 2))
        echo -n "."
    done
    echo ""
    success "Redis is ready"
    
    # Wait for ChromaDB
    info "Waiting for ChromaDB..."
    timeout=30
    counter=0
    while ! curl -s http://localhost:8000/api/v1/heartbeat >/dev/null 2>&1; do
        if [ $counter -ge $timeout ]; then
            warning "ChromaDB is taking longer than expected to start"
            break
        fi
        sleep 2
        counter=$((counter + 2))
        echo -n "."
    done
    echo ""
    success "ChromaDB is ready"
}

# Check service health
check_health() {
    info "Checking service health..."
    
    # Check backend
    if curl -s http://localhost:8001/health >/dev/null 2>&1; then
        success "Backend is healthy"
    else
        warning "Backend health check failed - it may still be starting"
    fi
    
    # Check frontend
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        success "Frontend is responding"
    else
        warning "Frontend may still be starting"
    fi
    
    # Show service status
    echo ""
    info "Service status:"
    docker-compose ps
}

# Show access information
show_access_info() {
    echo ""
    echo -e "${GREEN}🎉 CodexOS is ready!${NC}"
    echo ""
    echo -e "${BLUE}📱 Access your applications:${NC}"
    echo "🌐 Frontend: http://localhost:3000"
    echo "📡 Backend API: http://localhost:8001/api/v1/docs"
    echo "🗄️  ChromaDB: http://localhost:8000"
    echo "📊 PostgreSQL: localhost:5432"
    echo "⚡ Redis: localhost:6379"
    echo ""
    echo -e "${BLUE}🔧 Useful commands:${NC}"
    echo "View logs: docker-compose logs -f"
    echo "Stop services: docker-compose down"
    echo "Restart services: docker-compose restart"
    echo "Rebuild: docker-compose up -d --build"
    echo ""
    echo -e "${YELLOW}💡 Development tips:${NC}"
    echo "- Frontend auto-reloads on file changes"
    echo "- Backend auto-reloads on file changes"
    echo "- Check logs if services aren't responding"
    echo "- Use 'docker-compose logs -f [service]' for specific service logs"
}

# Main execution
main() {
    echo -e "${BLUE}Starting CodexOS development build...${NC}"
    echo ""
    
    check_prerequisites
    build_and_start
    wait_for_services
    check_health
    show_access_info
}

# Run main function
main "$@"
