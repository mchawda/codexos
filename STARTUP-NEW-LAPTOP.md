# 🚀 CodexOS New Laptop Setup Guide

This guide will help you get CodexOS running on your new laptop quickly and efficiently.

## 📋 Prerequisites

Before starting, ensure your laptop meets these requirements:

- **OS**: macOS 12+ (M1/M2 recommended) or Ubuntu 22.04+
- **RAM**: 8GB minimum (16GB+ recommended)
- **Storage**: 50GB+ available space
- **Internet**: Stable connection for downloading dependencies

## 🎯 Quick Start Options

### Option 1: Automated Setup (Recommended for new laptops)
```bash
# For macOS users
./setup-macos.sh

# For all platforms
./startup-new-laptop.sh
```

### Option 2: Development Build (For existing setups)
```bash
./build-dev.sh
```

### Option 3: Manual Setup
Follow the detailed steps below.

## 🍎 macOS Setup (Automated)

If you're on macOS, use the dedicated setup script:

```bash
./setup-macos.sh
```

This script will:
- Install Xcode Command Line Tools
- Install Homebrew
- Install Node.js 18+
- Install Python 3.11+
- Install Docker Desktop
- Install pnpm and Poetry
- Configure your shell environment

**Note**: You'll need to manually start Docker Desktop after installation.

## 🚀 New Laptop Setup (All Platforms)

For a complete setup on any platform:

```bash
./startup-new-laptop.sh
```

This comprehensive script will:
- Check and install system dependencies
- Set up environment files
- Install all project dependencies
- Start all services with Docker
- Verify the setup
- Provide access information

## 🔧 Development Build

For existing setups or quick rebuilds:

```bash
./build-dev.sh
```

This script will:
- Check prerequisites
- Build Docker images
- Start services
- Wait for services to be ready
- Verify health status

## 📚 Manual Setup Steps

If you prefer to set up manually or troubleshoot issues:

### 1. Install System Dependencies

#### macOS
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install node python@3.11 docker docker-compose

# Install Xcode Command Line Tools
xcode-select --install
```

#### Ubuntu/Debian
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python
sudo apt-get install -y python3.11 python3.11-venv python3-pip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 2. Install Development Tools

```bash
# Install pnpm
npm install -g pnpm

# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -
export PATH="$HOME/.local/bin:$PATH"
```

### 3. Clone and Setup Project

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd CodexOS

# Install dependencies
pnpm install
cd apps/backend && poetry install && cd ../..
cd apps/web && pnpm install && cd ../..
```

### 4. Environment Configuration

```bash
# Create environment files
cp apps/backend/.env.example apps/backend/.env  # if available
# Or create default .env files (the scripts do this automatically)
```

### 5. Start Services

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

## 🐳 Docker Services

The project uses Docker Compose to run these services:

- **PostgreSQL** (port 5432): Main database
- **Redis** (port 6379): Caching and websockets
- **ChromaDB** (port 8000): Vector database
- **Backend** (port 8001): FastAPI application
- **Frontend** (port 3000): Next.js application
- **Ollama** (port 11434): Local LLM (optional)

## 🌐 Access Points

Once running, access your applications at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001/api/v1/docs
- **ChromaDB**: http://localhost:8000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🔍 Troubleshooting

### Common Issues

#### Docker Not Running
```bash
# Check Docker status
docker info

# Start Docker Desktop (macOS)
# Or start Docker daemon (Linux)
sudo systemctl start docker
```

#### Port Conflicts
```bash
# Check what's using a port
lsof -i :3000
lsof -i :8001
lsof -i :5432

# Stop conflicting services or change ports in docker-compose.yml
```

#### Permission Issues
```bash
# Make scripts executable
chmod +x *.sh

# Run with sudo if needed (for system-level installations)
sudo ./setup-macos.sh
```

#### Service Health Issues
```bash
# Check service logs
docker-compose logs -f

# Check specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart services
docker-compose restart
```

### Service-Specific Issues

#### Backend Not Starting
```bash
# Check backend logs
docker-compose logs backend

# Verify database connection
docker-compose exec postgres pg_isready -U codexos

# Check environment variables
docker-compose exec backend env | grep DATABASE
```

#### Frontend Not Starting
```bash
# Check frontend logs
docker-compose logs frontend

# Verify API connection
curl http://localhost:8001/health

# Check environment variables
docker-compose exec frontend env | grep NEXT_PUBLIC
```

## 📖 Useful Commands

```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down

# Restart all services
docker-compose restart

# Rebuild and start
docker-compose up -d --build

# Check service status
docker-compose ps

# Access service shell
docker-compose exec [service-name] bash

# View resource usage
docker stats
```

## 🔄 Development Workflow

### Making Changes
1. Edit code in your IDE
2. Frontend auto-reloads on file changes
3. Backend auto-reloads on file changes
4. Check logs if issues arise

### Database Changes
```bash
# Run migrations
docker-compose exec backend alembic upgrade head

# Create new migration
docker-compose exec backend alembic revision --autogenerate -m "description"
```

### Adding Dependencies
```bash
# Backend (Python)
cd apps/backend
poetry add package-name

# Frontend (Node.js)
cd apps/web
pnpm add package-name
```

## 📚 Additional Resources

- **Documentation**: Check the `docs/` folder
- **Requirements**: See `REQUIREMENTS.md` for detailed dependencies
- **API Reference**: http://localhost:8001/api/v1/docs
- **Project Plan**: See `project-plan.md`

## 🆘 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review service logs with `docker-compose logs -f`
3. Check the documentation in the `docs/` folder
4. Verify your environment meets the requirements in `REQUIREMENTS.md`
5. Ensure all ports are available and Docker is running

## 🎉 Success!

Once everything is running, you should see:

- ✅ All Docker services showing "Up" status
- ✅ Frontend accessible at http://localhost:3000
- ✅ Backend API docs at http://localhost:8001/api/v1/docs
- ✅ Database connections working
- ✅ No error messages in logs

Happy coding with CodexOS! 🚀
