# CodexOS Requirements & Dependencies

## 🖥️ System Requirements

### Minimum Requirements
- **OS**: Ubuntu 22.04 LTS, macOS 12+, Windows 11 (WSL2)
- **CPU**: 4 cores (8 cores recommended)
- **RAM**: 8GB (16GB recommended)
- **Storage**: 50GB available space
- **Network**: Internet connection for API calls

### Recommended Requirements
- **OS**: Ubuntu 22.04 LTS
- **CPU**: 8+ cores
- **RAM**: 32GB+
- **Storage**: 100GB+ SSD
- **Network**: Stable internet with 100Mbps+

## 🐳 Docker Requirements

### Docker Engine
- **Version**: 24.0+ (recommended: latest)
- **Install**: [Docker Installation Guide](https://docs.docker.com/get-docker/)

### Docker Compose
- **Version**: 2.20+ (recommended: latest)
- **Install**: [Docker Compose Installation](https://docs.docker.com/compose/install/)

## 🐍 Python Requirements

### Python Version
- **Required**: Python 3.11+
- **Recommended**: Python 3.11.8

### Package Manager
- **Poetry**: 1.7.0+ (recommended)
- **Alternative**: pip 23.0+

### Core Dependencies

#### Web Framework & API
```
fastapi>=0.109.0          # Modern web framework
uvicorn[standard]>=0.27.0 # ASGI server
pydantic>=2.5.0           # Data validation
pydantic-settings>=2.1.0  # Settings management
```

#### Database & ORM
```
sqlalchemy>=2.0.25        # Database ORM
alembic>=1.13.1           # Database migrations
asyncpg>=0.29.0           # PostgreSQL async driver
psycopg2-binary>=2.9.9    # PostgreSQL driver
redis>=5.0.1              # Redis client
```

#### Authentication & Security
```
python-jose[cryptography]>=3.3.0  # JWT handling
passlib[bcrypt]>=1.7.4            # Password hashing
cryptography>=42.0.0              # Cryptographic operations
python-multipart>=0.0.6           # File uploads
```

#### AI & LLM Integration
```
openai>=1.10.0            # OpenAI API client
anthropic>=0.16.0         # Anthropic Claude API
langchain>=0.1.4          # LLM orchestration
langchain-openai>=0.0.5   # LangChain OpenAI integration
```

#### Vector Database
```
chromadb>=0.4.22          # Vector database
pypdf>=3.17.4             # PDF processing
beautifulsoup4>=4.12.3    # HTML parsing
```

#### Payment Processing
```
stripe>=7.12.0            # Stripe payment integration
```

#### Monitoring & Observability
```
sentry-sdk[fastapi]>=1.40.0  # Error tracking
prometheus-client>=0.19.0     # Metrics collection
```

#### Background Tasks
```
celery[redis]>=5.3.4      # Task queue
```

#### Utilities
```
httpx>=0.26.0             # HTTP client
aiofiles>=23.2.1          # Async file operations
websockets>=12.0           # WebSocket support
python-dotenv>=1.0.0      # Environment management
boto3>=1.34.25            # AWS SDK
```

### Development Dependencies
```
pytest>=7.4.4             # Testing framework
pytest-asyncio>=0.23.3    # Async testing support
black>=23.12.1             # Code formatting
ruff>=0.1.14               # Linting
mypy>=1.8.0                # Type checking
locust>=2.17.0             # Load testing
```

## 🟢 Node.js Requirements

### Node.js Version
- **Required**: Node.js 18.17+
- **Recommended**: Node.js 20.10+ (LTS)

### Package Manager
- **npm**: 9.0+ (comes with Node.js)
- **pnpm**: 8.0+ (recommended for monorepo)
- **yarn**: 1.22+ (alternative)

### Core Dependencies

#### React & Next.js
```
next>=14.1.0              # React framework
react>=18.2.0              # UI library
react-dom>=18.2.0          # React DOM
```

#### UI Components & Styling
```
@radix-ui/*                # Headless UI components
tailwindcss>=3.4.1         # CSS framework
class-variance-authority>=0.7.0  # Component variants
clsx>=2.1.0                # Conditional classes
tailwind-merge>=2.2.0      # Tailwind class merging
```

#### State Management
```
zustand>=4.5.0             # State management
@tanstack/react-query>=5.17.9  # Server state
```

#### Forms & Validation
```
react-hook-form>=7.49.3    # Form handling
@hookform/resolvers>=3.3.4 # Form validation
zod>=3.22.4                # Schema validation
```

#### UI Interactions
```
framer-motion>=10.18.0     # Animations
react-hot-toast>=2.4.1     # Toast notifications
sonner>=1.3.1              # Toast notifications
```

#### Flow Editor
```
reactflow>=11.10.2         # Flow chart editor
```

#### Icons & Utilities
```
lucide-react>=0.312.0      # Icon library
cmdk>=0.2.0                # Command palette
```

### Development Dependencies
```
typescript>=5.3.3          # Type checking
@types/node>=20.11.5       # Node.js types
@types/react>=18.2.48      # React types
@types/react-dom>=18.2.18  # React DOM types
eslint>=8.56.0             # Linting
autoprefixer>=10.4.17      # CSS autoprefixer
postcss>=8.4.33            # CSS processing
```

## 🗄️ Database Requirements

### PostgreSQL
- **Version**: 15+ (16+ recommended)
- **Extensions**: 
  - `uuid-ossp` (UUID generation)
  - `pg_trgm` (text search)
  - `pg_stat_statements` (performance monitoring)

### Redis
- **Version**: 7.0+ (7.2+ recommended)
- **Memory**: 2GB+ recommended
- **Persistence**: RDB + AOF enabled

### ChromaDB
- **Version**: Latest stable
- **Memory**: 4GB+ recommended
- **Storage**: Fast SSD recommended

## ☁️ External Service Requirements

### AI Providers
- **OpenAI**: API key with GPT-4 access
- **Anthropic**: API key with Claude access
- **Ollama**: Local LLM (optional)

### Payment Processing
- **Stripe**: Account with API keys
- **Webhook endpoint**: HTTPS required

### Monitoring
- **Sentry**: Account for error tracking
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization

### Storage (Optional)
- **AWS S3**: Object storage
- **MinIO**: Self-hosted alternative

## 🚀 Installation Commands

### Backend (Python)
```bash
# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Install dependencies
cd apps/backend
poetry install

# Or with pip (alternative)
pip install -r requirements.txt
```

### Frontend (Node.js)
```bash
# Install pnpm (recommended)
npm install -g pnpm

# Install dependencies
cd apps/web
pnpm install

# Or with npm
npm install
```

### Docker (All-in-one)
```bash
# Start all services
docker compose up -d

# Build and start
docker compose up -d --build
```

## 🔧 Environment Variables

### Required Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost/db
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-secret-key
VAULT_MASTER_KEY=your-vault-key

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Payment
STRIPE_API_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Optional Variables
```bash
# Monitoring
SENTRY_DSN=https://...
SENTRY_ENVIRONMENT=production

# Email
SMTP_HOST=smtp.example.com
SMTP_USERNAME=user
SMTP_PASSWORD=pass

# Storage
S3_ENDPOINT_URL=https://...
S3_ACCESS_KEY_ID=key
S3_SECRET_ACCESS_KEY=secret
```

## 📋 Pre-flight Checklist

Before running CodexOS, ensure:

- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] Docker & Docker Compose installed
- [ ] PostgreSQL 15+ running
- [ ] Redis 7+ running
- [ ] Environment variables configured
- [ ] API keys obtained
- [ ] Ports available (3000, 8001, 5432, 6379)
- [ ] Sufficient disk space (50GB+)
- [ ] Sufficient RAM (8GB+)

## 🆘 Troubleshooting

### Common Issues
1. **Port conflicts**: Check if ports are already in use
2. **Memory issues**: Increase Docker memory allocation
3. **Permission errors**: Ensure user is in docker group
4. **Build failures**: Check Python/Node.js versions
5. **Database connection**: Verify PostgreSQL is running

### Support
- Documentation: https://docs.codexos.dev
- Issues: https://github.com/mchawda/codexos/issues
- Discord: https://discord.gg/codexos
