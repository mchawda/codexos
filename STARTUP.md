# 🚀 Starting CodexOS.dev

This guide will help you get CodexOS.dev up and running on your system.

## Quick Start

### Cross-Platform (Recommended)

```bash
node start.js
```

This will automatically detect your operating system and run the appropriate startup script.

### Platform-Specific

**macOS/Linux:**
```bash
./startup.sh
```

**Windows (PowerShell):**
```powershell
.\startup.ps1
```

## What the Startup Script Does

1. **Checks System Requirements**
   - Node.js 18+
   - Python 3.11+
   - Docker & Docker Compose
   - pnpm (installs if missing)
   - Poetry (installs if missing)

2. **Sets Up Environment**
   - Creates necessary directories
   - Generates `.env` files if missing
   - Installs all dependencies

3. **Offers Start Options**
   - **Full Stack with Docker** (Recommended)
   - Development mode
   - Frontend only
   - Backend only

## Start Options Explained

### 1. Full Stack with Docker (Recommended)

Starts all services in containers:
- Frontend (Next.js) - http://localhost:3000
- Backend API (FastAPI) - http://localhost:8001
- PostgreSQL Database - localhost:5432
- Redis Cache - localhost:6379
- ChromaDB Vector Store - http://localhost:8000

```bash
# To view logs after starting
docker-compose logs -f

# To stop all services
docker-compose down
```

### 2. Development Mode

Runs services locally (requires PostgreSQL and Redis to be installed):
```bash
pnpm dev
```

### 3. Frontend Only

Starts just the Next.js frontend:
```bash
cd apps/web
pnpm dev
```

### 4. Backend Only

Starts just the FastAPI backend:
```bash
cd apps/backend
poetry run uvicorn app.main:app --reload
```

## Environment Configuration

The startup script creates default `.env` files if they don't exist:

- `apps/backend/.env` - Backend configuration
- `apps/web/.env` - Frontend configuration

**Important**: Update these files with your actual API keys:
- OpenAI API key
- Anthropic API key
- Other service credentials

## Troubleshooting

### Permission Denied (macOS/Linux)
```bash
chmod +x startup.sh start.js
```

### PowerShell Execution Policy (Windows)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Docker Not Starting
- Ensure Docker Desktop is running
- Check Docker daemon: `docker ps`
- Restart Docker Desktop if needed

### Port Already in Use
- Frontend (3000): `lsof -ti:3000 | xargs kill -9`
- Backend (8001): `lsof -ti:8001 | xargs kill -9`
- PostgreSQL (5432): Check if another instance is running
- Redis (6379): Check if another instance is running

### Dependencies Not Installing
```bash
# Clear package manager caches
pnpm store prune
npm cache clean --force

# Reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Manual Setup (Advanced)

If you prefer to set up manually:

1. **Install Dependencies**
   ```bash
   pnpm install
   cd apps/backend && poetry install
   ```

2. **Start Services**
   ```bash
   docker-compose up -d postgres redis chromadb
   ```

3. **Run Migrations**
   ```bash
   cd apps/backend
   poetry run alembic upgrade head
   ```

4. **Start Applications**
   ```bash
   # Terminal 1 - Backend
   cd apps/backend
   poetry run uvicorn app.main:app --reload

   # Terminal 2 - Frontend
   cd apps/web
   pnpm dev
   ```

## Next Steps

Once CodexOS is running:

1. **Access the Platform**
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8001/api/v1/docs

2. **Create an Account**
   - Register through the UI
   - Or use the API endpoint

3. **Configure LLM Providers**
   - Add your OpenAI/Anthropic API keys
   - Configure Ollama for local models

4. **Start Building Agents**
   - Use the visual flow editor
   - Create your first autonomous workflow

---

Need help? Check out:
- Documentation: https://docs.codexos.dev
- GitHub Issues: https://github.com/codexos/codexos/issues
- Discord Community: https://discord.gg/codexos
