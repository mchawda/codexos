# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
#!/bin/bash

# CodexOS Production Deployment Script
# This script handles the deployment of CodexOS to production

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

echo -e "${GREEN}🚀 CodexOS Deployment Script${NC}"
echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}This script should not be run as root!${NC}"
   exit 1
fi

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed!${NC}"
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed!${NC}"
    exit 1
fi

# Check environment file
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Environment file $ENV_FILE not found!${NC}"
    echo "Please create it from .env.example"
    exit 1
fi

# Load environment variables
export $(cat $ENV_FILE | grep -v '^#' | xargs)

# Validate required environment variables
REQUIRED_VARS=(
    "DB_PASSWORD"
    "REDIS_PASSWORD"
    "SECRET_KEY"
    "STRIPE_API_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "VAULT_MASTER_KEY"
    "CHROMA_AUTH_TOKEN"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}Required environment variable $var is not set!${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

# Create necessary directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p nginx/ssl
mkdir -p backups
mkdir -p monitoring/grafana/dashboards
mkdir -p monitoring/grafana/datasources
echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# Pull latest changes
echo -e "${YELLOW}Pulling latest changes...${NC}"
git pull origin main
echo -e "${GREEN}✓ Code updated${NC}"
echo ""

# Build images
echo -e "${YELLOW}Building Docker images...${NC}"
docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache
echo -e "${GREEN}✓ Images built${NC}"
echo ""

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
docker-compose -f $DOCKER_COMPOSE_FILE run --rm backend alembic upgrade head
echo -e "${GREEN}✓ Migrations completed${NC}"
echo ""

# Stop existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose -f $DOCKER_COMPOSE_FILE down
echo -e "${GREEN}✓ Containers stopped${NC}"
echo ""

# Start services
echo -e "${YELLOW}Starting services...${NC}"
docker-compose -f $DOCKER_COMPOSE_FILE up -d

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
sleep 10

# Check health
SERVICES=("postgres" "redis" "backend" "frontend")
ALL_HEALTHY=true

for service in "${SERVICES[@]}"; do
    if docker-compose -f $DOCKER_COMPOSE_FILE ps | grep $service | grep -q "healthy"; then
        echo -e "${GREEN}✓ $service is healthy${NC}"
    else
        echo -e "${RED}✗ $service is not healthy${NC}"
        ALL_HEALTHY=false
    fi
done

if [ "$ALL_HEALTHY" = false ]; then
    echo -e "${RED}Some services are not healthy. Check logs with:${NC}"
    echo "docker-compose -f $DOCKER_COMPOSE_FILE logs"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ All services are healthy${NC}"
echo ""

# Run smoke tests
echo -e "${YELLOW}Running smoke tests...${NC}"

# Test API health
if curl -f -s http://localhost/api/v1/health > /dev/null; then
    echo -e "${GREEN}✓ API is responding${NC}"
else
    echo -e "${RED}✗ API health check failed${NC}"
    exit 1
fi

# Test frontend
if curl -f -s http://localhost > /dev/null; then
    echo -e "${GREEN}✓ Frontend is responding${NC}"
else
    echo -e "${RED}✗ Frontend health check failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "Services are running at:"
echo -e "  Frontend: ${YELLOW}https://codexos.dev${NC}"
echo -e "  API: ${YELLOW}https://codexos.dev/api/v1${NC}"
echo -e "  Grafana: ${YELLOW}http://localhost:3000${NC} (internal only)"
echo ""
echo "To view logs:"
echo -e "  ${YELLOW}docker-compose -f $DOCKER_COMPOSE_FILE logs -f [service]${NC}"
echo ""
echo "To stop services:"
echo -e "  ${YELLOW}docker-compose -f $DOCKER_COMPOSE_FILE down${NC}"
