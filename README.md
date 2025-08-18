# CodexOS - Autonomous Engineering OS

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" />
  <img src="https://img.shields.io/badge/license-proprietary-red.svg" />
  <img src="https://img.shields.io/badge/status-private_beta-yellow.svg" />
</p>

> A next-level autonomous engineering OS. Modular, agentic, real-time, and scalable.

## 🚀 Overview

CodexOS is a revolutionary platform that transforms software development through intelligent agent-based automation. It provides developers with a visual, modular system to create, orchestrate, and deploy AI-powered development workflows.

### Key Features

- **🤖 Autonomous Agents** - Build intelligent agents that complete complex engineering tasks independently
- **🎨 Visual Flow Editor** - Drag-and-drop interface powered by React Flow
- **🧠 Multimodal Intelligence** - Vision, voice, and action capabilities
- **📚 RAG Engine** - Context-aware AI with powerful knowledge retrieval
- **🔐 Enterprise Security** - SOC2 & ISO 27001 compliant with encrypted vault
- **🛍️ Agent Marketplace** - Share and monetize your AI agents
- **☁️ Multi-Tenancy** - Complete tenant isolation with custom domains
- **💳 Stripe Integration** - Built-in payment processing and subscriptions
- **📊 Real-time Monitoring** - Prometheus metrics and Grafana dashboards
- **🔄 Auto-scaling** - Production-ready with load balancing

## 🏗️ Architecture

```
CodexOS/
├── apps/
│   ├── web/              # Next.js frontend with React Flow
│   └── backend/          # FastAPI backend with agent engine
├── packages/
│   ├── agent-engine/     # Core execution engine
│   ├── rag-engine/       # RAG implementation
│   ├── toolkit/          # Shared tools and utilities
│   └── ui/               # Shared UI components
└── docker-compose.yml    # Full stack orchestration
```

## 🚦 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- PNPM 8+ (for monorepo management)

**📋 Full Requirements**: See [REQUIREMENTS.md](REQUIREMENTS.md) for complete system requirements and dependencies.

### Running with Docker

1. Clone the repository:
```bash
git clone https://github.com/mchawda/codexos.git
cd CodexOS
```

2. **Quick Setup** (recommended):
```bash
./setup.sh
```

3. **One-Command Development** (new!):
```bash
make dev
```

4. **Manual Setup** (alternative):
```bash
# Copy environment files
cp env.production.example .env.local
# Edit .env.local with your API keys
```

5. Start the stack:
```bash
docker compose up -d
```

4. Access the applications:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001/api/v1/docs
- ChromaDB: http://localhost:8000

### CLI Usage

CodexOS now includes a powerful CLI for task execution and system management:

```bash
# Install CLI (after setup)
cd apps/backend
pip install -e .

# Run tasks with specific tools
codexos run "Review this Python code" --tools fs,web --plan-only

# Check system status
codexos status

# Monitor system health
codexos health

# View system logs
codexos logs --level error --lines 50
```

### Makefile Commands

Use the Makefile for common development tasks:

```bash
# Development
make dev              # Start full development environment
make dev-backend      # Start only backend services
make dev-frontend     # Start only frontend services

# Testing
make test             # Run all tests
make test-e2e         # Run E2E tests with Playwright
make test-load        # Run load tests with Locust

# Quality
make lint             # Run all linters
make format           # Format all code
make typecheck        # Run type checking
make security-scan    # Run security scans

# Maintenance
make clean            # Clean build artifacts
make install-deps     # Install dependencies
make update-deps      # Update dependencies
```

### Local Development

1. Install dependencies:
```bash
pnpm install
```

2. Start the development servers:
```bash
pnpm dev
```

## 🚀 Setup & Installation

### Automated Setup
```bash
# Run the setup script to install all dependencies
./setup.sh
```

This script will:
- ✅ Check system requirements (Python 3.11+, Node.js 18+, Docker)
- ✅ Install Python dependencies with Poetry
- ✅ Install Node.js dependencies with pnpm
- ✅ Verify port availability
- ✅ Create environment configuration

### Manual Setup
If you prefer manual installation, see [REQUIREMENTS.md](REQUIREMENTS.md) for detailed steps.

## 🔧 Configuration

### Environment Configuration

Edit `.env.local` for local development:

```env
# Database (auto-configured by Docker)
DATABASE_URL=postgresql://codexos:codexos_secure_password@localhost:5432/codexos_db

# LLM Providers (REQUIRED)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Security
SECRET_KEY=your-secret-key-here
VAULT_MASTER_KEY=auto-generate-or-paste

# Payment (optional for marketplace)
STRIPE_API_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Note**: Frontend configuration is automatically handled by the Docker environment variables.

## 📖 API Documentation

### Authentication

```bash
# Register
curl -X POST http://localhost:8001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "username": "user", "password": "password"}'

# Login
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user&password=password"
```

### Agent Flows

```bash
# Create flow
curl -X POST http://localhost:8001/api/v1/agents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @flow.json

# Execute flow
curl -X POST http://localhost:8001/api/v1/agents/{flow_id}/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"input_data": {"query": "Hello, CodexOS!"}}'
```

## 🧩 Creating Custom Nodes

1. Create a new node type in `packages/agent-engine/src/nodes/`:

```typescript
import { BaseNode, NodeContext, NodeResult } from '../core/node';

export class CustomNode extends BaseNode {
  async execute(context: NodeContext): Promise<NodeResult> {
    // Your node logic here
    return {
      output: processedData,
      logs: [],
    };
  }
}
```

2. Register the node in `packages/agent-engine/src/nodes/index.ts`

3. Add the visual component in `apps/web/src/components/dashboard/nodes/`

## 🛡️ Security

- All credentials are encrypted with AES-256 GCM
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC) with 6 system roles
- Multi-factor authentication (MFA) with TOTP
- OAuth2/SSO integration (Auth0, Okta, Azure AD, Google, GitHub)
- Audit logging for SOC2 & ISO 27001 compliance
- Sandboxed action execution
- Encrypted vault with key rotation

## 🚀 Production Deployment

See [Production Guide](docs/production.md) for detailed deployment instructions.

Quick deployment:
```bash
# Configure environment
cp env.production.example .env.production
# Edit .env.production with your values

# Deploy
./deploy.sh production
```

Features:
- Nginx reverse proxy with SSL/TLS
- Horizontal scaling support
- Automated backups
- Prometheus + Grafana monitoring
- Health checks and auto-recovery

## 🤝 Contributing

CodexOS is currently in private beta. For contribution guidelines, please contact the team.

## 📄 License

This project is licensed under a proprietary license. All source files must include:

```
SPDX-License-Identifier: LicenseRef-NIA-Proprietary
```

## 🆘 Support

- Documentation: https://docs.codexos.dev
- Discord: https://discord.gg/codexos
- Email: support@codexos.dev

## 🚀 Roadmap

- [x] Core agent engine
- [x] Visual flow editor
- [x] Authentication system
- [x] Basic multimodal support
- [ ] Production RAG engine
- [ ] Marketplace implementation
- [ ] Team collaboration features
- [ ] Mobile applications

---

Built with ❤️ by the CodexOS Team
