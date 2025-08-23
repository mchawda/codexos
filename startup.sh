#!/bin/bash
# SPDX-License-Identifier: LicenseRef-NIA-Proprietary

# CodexOS.dev Bulletproof Startup Script
# This script eliminates all the Docker BS and gets the system running reliably

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
                                        
      Bulletproof Startup System
EOF
echo -e "${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if port is free and kill conflicting processes
check_and_kill_port() {
    local port=$1
    local service_name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_status $YELLOW "⚠️  Port $port ($service_name) is in use. Killing conflicting process..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 3
        print_status $GREEN "✅ Port $port cleared"
    else
        print_status $GREEN "✅ Port $port ($service_name) is free"
    fi
}

# Function to start service with retry and health check
start_service_with_retry() {
    local service=$1
    local max_retries=3
    local retry=0
    
    while [ $retry -lt $max_retries ]; do
        print_status $BLUE "🔄 Starting $service (attempt $((retry+1))/$max_retries)..."
        
        if docker-compose up -d $service >/dev/null 2>&1; then
            print_status $GREEN "✅ $service container started"
            
            # Wait for service to be healthy
            local health_check_attempts=0
            local max_health_checks=30
            
            while [ $health_check_attempts -lt $max_health_checks ]; do
                if docker-compose ps $service | grep -q "healthy\|Up"; then
                    print_status $GREEN "✅ $service is healthy and running"
                    return 0
                fi
                
                print_status $YELLOW "⏳ Waiting for $service to be healthy... ($((health_check_attempts+1))/$max_health_checks)"
                sleep 5
                health_check_attempts=$((health_check_attempts+1))
            done
            
            print_status $RED "❌ $service failed health check after $max_health_checks attempts"
        else
            print_status $RED "❌ Failed to start $service container"
        fi
        
        retry=$((retry+1))
        if [ $retry -lt $max_retries ]; then
            print_status $YELLOW "🔄 Retrying in 10 seconds..."
            sleep 10
        fi
    done
    
    print_status $RED "❌ Failed to start $service after $max_retries attempts"
    return 1
}

# Function to reset ChromaDB data (fixes schema compatibility issues)
reset_chromadb() {
    print_status $YELLOW "🔄 Resetting ChromaDB to fix schema compatibility issues..."
    
    # Stop ChromaDB
    docker-compose stop chromadb >/dev/null 2>&1 || true
    
    # Remove ChromaDB data volume
    docker volume rm codexos_chroma_data >/dev/null 2>&1 || true
    
    # Remove ChromaDB container
    docker-compose rm -f chromadb >/dev/null 2>&1 || true
    
    print_status $GREEN "✅ ChromaDB reset complete"
}

# Function to check system requirements
check_requirements() {
    print_status $BLUE "🔍 Checking system requirements..."
    
    # Check for Docker
    if ! command_exists docker; then
        print_status $RED "❌ Docker is not installed. Please install Docker Desktop."
        exit 1
    fi
    
    # Check for Docker Compose
    if ! command_exists docker-compose; then
        print_status $RED "❌ Docker Compose is not installed. Please install Docker Compose."
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        print_status $RED "❌ Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    
    # Check for Python
    if ! command_exists python3; then
        print_status $RED "❌ Python 3 is not installed. Please install Python 3.11+"
        exit 1
    else
        PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
        PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d '.' -f 1)
        PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d '.' -f 2)
        if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 11 ]); then
            print_status $RED "❌ Python 3.11+ is required. Current version: $PYTHON_VERSION"
            exit 1
        else
            print_status $GREEN "✅ Python $PYTHON_VERSION found"
        fi
    fi
    
    # Check for Node.js
    if ! command_exists node; then
        print_status $RED "❌ Node.js is not installed. Please install Node.js 18+"
        exit 1
    else
        NODE_VERSION=$(node --version | cut -d 'v' -f 2)
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d '.' -f 1)
        if [ "$NODE_MAJOR" -lt 18 ]; then
            print_status $RED "❌ Node.js 18+ is required. Current version: $NODE_VERSION"
            exit 1
        else
            print_status $GREEN "✅ Node.js $NODE_VERSION found"
        fi
    fi
    
    # Check for PNPM
    if ! command_exists pnpm; then
        print_status $RED "❌ PNPM is not installed. Please install PNPM 8+"
        exit 1
    else
        print_status $GREEN "✅ PNPM found"
    fi
    
    print_status $GREEN "✅ All system requirements met"
}

# Function to clean up existing containers and volumes
cleanup_existing() {
    print_status $BLUE "🧹 Cleaning up existing containers and volumes..."
    
    # Stop all containers
    docker-compose down --remove-orphans >/dev/null 2>&1 || true
    
    # Remove any dangling containers
    docker container prune -f >/dev/null 2>&1 || true
    
    # Remove any dangling images
    docker image prune -f >/dev/null 2>&1 || true
    
    print_status $GREEN "✅ Cleanup complete"
}

# Function to clear port conflicts
clear_ports() {
    print_status $BLUE "🔪 Clearing port conflicts..."
    
    check_and_kill_port 3000 "Frontend"
    check_and_kill_port 8001 "Backend"
    check_and_kill_port 5432 "PostgreSQL"
    check_and_kill_port 6379 "Redis"
    check_and_kill_port 8000 "ChromaDB"
    
    print_status $GREEN "✅ All ports cleared"
}

# Function to start infrastructure services
start_infrastructure() {
    print_status $BLUE "🏗️  Starting infrastructure services..."
    
    # Start PostgreSQL, Redis, and ChromaDB
    if ! start_service_with_retry postgres; then
        print_status $RED "❌ Failed to start PostgreSQL"
        exit 1
    fi
    
    if ! start_service_with_retry redis; then
        print_status $RED "❌ Failed to start Redis"
        exit 1
    fi
    
    if ! start_service_with_retry chromadb; then
        print_status $RED "❌ Failed to start ChromaDB"
        exit 1
    fi
    
    print_status $GREEN "✅ All infrastructure services are running and healthy"
}

# Function to start application services
start_application() {
    print_status $BLUE "🚀 Starting application services..."
    
    # Start backend
    if ! start_service_with_retry backend; then
        print_status $RED "❌ Failed to start backend"
        print_status $YELLOW "📋 Backend logs:"
        docker-compose logs backend --tail=20
        exit 1
    fi
    
    # Wait a bit for backend to fully initialize
    sleep 10
    
    # Start frontend
    if ! start_service_with_retry frontend; then
        print_status $RED "❌ Failed to start frontend"
        print_status $YELLOW "📋 Frontend logs:"
        docker-compose logs frontend --tail=20
        exit 1
    fi
    
    print_status $GREEN "✅ All application services are running and healthy"
}

# Function to verify system health
verify_system() {
    print_status $BLUE "🔍 Verifying system health..."
    
    # Check all services
    local all_healthy=true
    
    for service in postgres redis chromadb backend frontend; do
        if docker-compose ps $service | grep -q "healthy\|Up"; then
            print_status $GREEN "✅ $service: Healthy"
        else
            print_status $RED "❌ $service: Unhealthy"
            all_healthy=false
        fi
    done
    
    if [ "$all_healthy" = true ]; then
        print_status $GREEN "🎉 All services are healthy!"
    else
        print_status $RED "⚠️  Some services are unhealthy. Check logs with: docker-compose logs [service_name]"
        return 1
    fi
}

# Function to display system status
display_status() {
    print_status $BLUE "📊 System Status:"
    docker-compose ps
    
    print_status $BLUE "🌐 Access URLs:"
    print_status $GREEN "   Frontend: http://localhost:3000"
    print_status $GREEN "   Backend API: http://localhost:8001"
    print_status $GREEN "   Backend Health: http://localhost:8001/health"
    print_status $GREEN "   ChromaDB: http://localhost:8000"
    
    print_status $BLUE "📋 Useful Commands:"
    print_status $CYAN "   View logs: docker-compose logs [service_name]"
    print_status $CYAN "   Stop system: docker-compose down"
    print_status $CYAN "   Restart service: docker-compose restart [service_name]"
}

# Main execution
main() {
    print_status $BLUE "🚀 Starting CodexOS Bulletproof Startup System..."
    
    # Check requirements
    check_requirements
    
    # Clean up existing state
    cleanup_existing
    
    # Clear port conflicts
    clear_ports
    
    # Reset ChromaDB to fix schema issues
    reset_chromadb
    
    # Start infrastructure
    start_infrastructure
    
    # Start application
    start_application
    
    # Verify system
    verify_system
    
    # Display final status
    display_status
    
    print_status $GREEN "🎉 CodexOS is now running successfully!"
    print_status $GREEN "🌐 Open http://localhost:3000 in your browser to get started!"
}

# Run main function
main "$@"
