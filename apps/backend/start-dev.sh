#!/bin/bash
# SPDX-License-Identifier: LicenseRef-NIA-Proprietary

# CodexOS Backend Development Server

echo "Starting CodexOS Backend..."

# Ensure we have Python 3.11
if command -v python3.11 >/dev/null 2>&1; then
    PYTHON_CMD="python3.11"
elif command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD="python3"
else
    echo "Error: Python 3 not found"
    exit 1
fi

echo "Using Python: $($PYTHON_CMD --version)"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    $PYTHON_CMD -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt 2>/dev/null || pip install \
    fastapi[all] \
    uvicorn[standard] \
    sqlalchemy \
    asyncpg \
    psycopg2-binary \
    redis \
    python-jose[cryptography] \
    passlib[bcrypt] \
    python-multipart \
    httpx \
    openai \
    anthropic \
    langchain \
    chromadb \
    python-dotenv \
    websockets \
    aiofiles

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << 'EOL'
# SPDX-License-Identifier: LicenseRef-NIA-Proprietary

# Application
APP_NAME=CodexOS
APP_VERSION=1.0.0
DEBUG=True
ENVIRONMENT=development

# API Configuration
API_HOST=0.0.0.0
API_PORT=8001
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
fi

# Run the application
echo "Starting FastAPI server on http://localhost:8001"
echo "API Documentation: http://localhost:8001/api/v1/docs"
echo ""
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
