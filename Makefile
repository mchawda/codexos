.PHONY: help dev build test clean deploy install-deps lint format typecheck security-scan docker-build docker-push

# Default target
help:
	@echo "CodexOS Development Commands"
	@echo "============================"
	@echo ""
	@echo "Development:"
	@echo "  dev          Start development environment (API, UI, DB, vector DB, seeds)"
	@echo "  dev-backend  Start only backend services"
	@echo "  dev-frontend Start only frontend services"
	@echo "  dev-db       Start only database services"
	@echo ""
	@echo "Building:"
	@echo "  build        Build all services"
	@echo "  build-backend Build backend service"
	@echo "  build-frontend Build frontend service"
	@echo ""
	@echo "Testing:"
	@echo "  test         Run all tests"
	@echo "  test-backend Run backend tests"
	@echo "  test-frontend Run frontend tests"
	@echo "  test-e2e     Run E2E tests with Playwright"
	@echo "  test-load    Run load tests with Locust"
	@echo ""
	@echo "Quality:"
	@echo "  lint         Run all linters"
	@echo "  format       Format all code"
	@echo "  typecheck    Run type checking"
	@echo "  security-scan Run security scans"
	@echo ""
	@echo "Docker:"
	@echo "  docker-build Build all Docker images"
	@echo "  docker-push  Push Docker images to registry"
	@echo ""
	@echo "Deployment:"
	@echo "  deploy       Deploy to production"
	@echo "  deploy-staging Deploy to staging"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean        Clean build artifacts and containers"
	@echo "  install-deps Install all dependencies"
	@echo "  update-deps  Update all dependencies"

# Development - One command to start everything
dev: install-deps
	@echo "🚀 Starting CodexOS development environment..."
	@echo "📊 Starting database services..."
	docker compose up -d postgres redis chromadb
	@echo "⏳ Waiting for database to be ready..."
	sleep 10
	@echo "🔧 Starting backend services..."
	docker compose up -d backend
	@echo "⏳ Waiting for backend to be ready..."
	sleep 15
	@echo "🎨 Starting frontend services..."
	docker compose up -d frontend
	@echo "✅ Development environment started!"
	@echo "🌐 Frontend: http://localhost:3000"
	@echo "🔌 Backend: http://localhost:8000"
	@echo "📊 Database: localhost:5432"
	@echo "🔍 Vector DB: localhost:8000"

dev-backend:
	@echo "🔧 Starting backend services..."
	docker compose up -d postgres redis chromadb backend

dev-frontend:
	@echo "🎨 Starting frontend services..."
	docker compose up -d frontend

dev-db:
	@echo "📊 Starting database services..."
	docker compose up -d postgres redis chromadb

# Building
build:
	@echo "🔨 Building all services..."
	docker compose build

build-backend:
	@echo "🔨 Building backend service..."
	docker compose build backend

build-frontend:
	@echo "🔨 Building frontend service..."
	docker compose build frontend

# Testing
test: test-backend test-frontend
	@echo "✅ All tests completed!"

test-backend:
	@echo "🧪 Running backend tests..."
	cd apps/backend && python -m pytest tests/ -v --cov=app --cov-report=term-missing

test-frontend:
	@echo "🧪 Running frontend tests..."
	cd apps/web && pnpm test --coverage

test-e2e:
	@echo "🧪 Running E2E tests..."
	cd apps/web && pnpm test:e2e

test-load:
	@echo "🧪 Running load tests..."
	cd apps/backend && locust -f tests/load/locustfile.py --headless -u 10 -r 1 --run-time 60s

# Quality checks
lint:
	@echo "🔍 Running linters..."
	@echo "Backend linting..."
	cd apps/backend && ruff check . && black --check .
	@echo "Frontend linting..."
	cd apps/web && pnpm lint

format:
	@echo "✨ Formatting code..."
	@echo "Backend formatting..."
	cd apps/backend && black . && ruff format .
	@echo "Frontend formatting..."
	cd apps/web && pnpm format

typecheck:
	@echo "🔍 Running type checks..."
	@echo "Backend type checking..."
	cd apps/backend && mypy .
	@echo "Frontend type checking..."
	cd apps/web && pnpm type-check

security-scan:
	@echo "🔒 Running security scans..."
	@echo "Backend security scan..."
	cd apps/backend && bandit -r app/ -f json -o bandit-report.json
	@echo "Frontend security scan..."
	cd apps/web && pnpm audit --audit-level moderate
	@echo "Docker security scan..."
	trivy image --severity HIGH,CRITICAL codexos:latest

# Docker operations
docker-build:
	@echo "🐳 Building Docker images..."
	docker compose build --no-cache

docker-push:
	@echo "🐳 Pushing Docker images..."
	docker compose push

# Deployment
deploy:
	@echo "🚀 Deploying to production..."
	./deploy.sh production

deploy-staging:
	@echo "🚀 Deploying to staging..."
	./deploy.sh staging

# Maintenance
clean:
	@echo "🧹 Cleaning up..."
	docker compose down -v --remove-orphans
	docker system prune -f
	@echo "Removing build artifacts..."
	rm -rf apps/web/.next apps/web/coverage apps/backend/__pycache__ apps/backend/.pytest_cache
	@echo "✅ Cleanup completed!"

install-deps:
	@echo "📦 Installing dependencies..."
	@echo "Installing Python dependencies..."
	cd apps/backend && pip install -e .
	@echo "Installing Node.js dependencies..."
	cd apps/web && pnpm install
	@echo "✅ Dependencies installed!"

update-deps:
	@echo "📦 Updating dependencies..."
	@echo "Updating Python dependencies..."
	cd apps/backend && pip install --upgrade -e .
	@echo "Updating Node.js dependencies..."
	cd apps/web && pnpm update
	@echo "✅ Dependencies updated!"

# Database operations
db-migrate:
	@echo "🗄️ Running database migrations..."
	cd apps/backend && alembic upgrade head

db-seed:
	@echo "🌱 Seeding database..."
	cd apps/backend && python -m app.db.seed

db-init:
	@echo "🗄️ Initializing database..."
	cd apps/backend && alembic upgrade head
	@echo "🌱 Seeding database..."
	cd apps/backend && python -m app.db.seed

db-reset:
	@echo "🗄️ Resetting database..."
	cd apps/backend && alembic downgrade base
	cd apps/backend && alembic upgrade head
	@echo "🌱 Seeding database..."
	cd apps/backend && python -m app.db.seed

db-status:
	@echo "🗄️ Database migration status..."
	cd apps/backend && alembic current

# Monitoring
monitor:
	@echo "📊 Starting monitoring stack..."
	docker compose -f docker-compose.prod.yml up -d prometheus grafana
	@echo "📊 Monitoring available at:"
	@echo "   Prometheus: http://localhost:9090"
	@echo "   Grafana: http://localhost:3001"

# Health checks
health:
	@echo "🏥 Checking system health..."
	@echo "Backend health:"
	curl -s http://localhost:8000/health | jq .
	@echo "Frontend health:"
	curl -s http://localhost:3000/api/health | jq .
	@echo "Database health:"
	docker compose exec postgres pg_isready -U codexos
