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

### Running with Docker

1. Clone the repository:
```bash
git clone https://github.com/codexos/codexos.git
cd codexos
```

2. Copy environment files:
```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.example apps/web/.env
```

3. Start the stack:
```bash
docker-compose up -d
```

4. Access the applications:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001/api/v1/docs
- ChromaDB: http://localhost:8000

### Local Development

1. Install dependencies:
```bash
pnpm install
```

2. Start the development servers:
```bash
pnpm dev
```

## 🔧 Configuration

### Backend Configuration

Edit `apps/backend/.env`:

```env
# Database
DATABASE_URL=postgresql+asyncpg://codexos:password@localhost:5432/codexos_db

# LLM Providers
OPENAI_API_KEY=sk-xxxx
ANTHROPIC_API_KEY=claude-xxx

# Security
SECRET_KEY=your-secret-key-here
VAULT_MASTER_KEY=auto-generate-or-paste
```

### Frontend Configuration

Edit `apps/web/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8001/ws
```

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
