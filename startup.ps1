# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
# CodexOS.dev Startup Script for Windows
# This script ensures all dependencies are installed and starts the application

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# ASCII Art Logo
Write-Host -ForegroundColor Blue @"
   ____          _          ___  ____  
  / ___|___   __| | _____  / _ \/ ___| 
 | |   / _ \ / _` |/ _ \ \| | | \___ \ 
 | |__| (_) | (_| |  __/  X| |_| |___) |
  \____\___/ \__,_|\___| /_/ \___/____/ 
                                        
      Autonomous Engineering OS
"@

Write-Host -ForegroundColor Green "Welcome to CodexOS.dev!"
Write-Host "Initializing the autonomous engineering operating system..."
Write-Host ""

# Function to check if a command exists
function Test-CommandExists {
    param($Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
}

# Function to display error and exit
function Error-Exit {
    param($Message)
    Write-Host -ForegroundColor Red "Error: $Message"
    Exit 1
}

# Function to display warning
function Warning {
    param($Message)
    Write-Host -ForegroundColor Yellow "Warning: $Message"
}

# Function to display success
function Success {
    param($Message)
    Write-Host -ForegroundColor Green "✓ $Message"
}

# Function to display info
function Info {
    param($Message)
    Write-Host -ForegroundColor Blue "→ $Message"
}

# Check for required system dependencies
Info "Checking system dependencies..."

# Check for Node.js
if (!(Test-CommandExists "node")) {
    Error-Exit "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
} else {
    $nodeVersion = node -v
    $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($versionNumber -lt 18) {
        Error-Exit "Node.js version 18+ is required. Current version: $nodeVersion"
    } else {
        Success "Node.js $nodeVersion found"
    }
}

# Check for Python
if (!(Test-CommandExists "python")) {
    Error-Exit "Python is not installed. Please install Python 3.11+ from https://www.python.org/"
} else {
    $pythonVersion = python --version 2>&1
    $versionMatch = $pythonVersion -match 'Python (\d+)\.(\d+)'
    if ($matches) {
        $majorVersion = [int]$matches[1]
        $minorVersion = [int]$matches[2]
        if ($majorVersion -lt 3 -or ($majorVersion -eq 3 -and $minorVersion -lt 11)) {
            Error-Exit "Python 3.11+ is required. Current version: $pythonVersion"
        } else {
            Success "$pythonVersion found"
        }
    }
}

# Check for Docker
if (!(Test-CommandExists "docker")) {
    Error-Exit "Docker is not installed. Please install Docker Desktop from https://www.docker.com/"
} else {
    Success "Docker found"
}

# Check for Docker Compose
try {
    docker compose version | Out-Null
    Success "Docker Compose found"
} catch {
    if (!(Test-CommandExists "docker-compose")) {
        Error-Exit "Docker Compose is not installed. Please install Docker Desktop"
    } else {
        Success "Docker Compose found"
    }
}

# Check for pnpm
if (!(Test-CommandExists "pnpm")) {
    Info "pnpm not found. Installing pnpm..."
    npm install -g pnpm
    Success "pnpm installed"
} else {
    Success "pnpm found"
}

# Check for Poetry
if (!(Test-CommandExists "poetry")) {
    Info "Poetry not found. Installing Poetry..."
    (Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
    $env:Path += ";$env:USERPROFILE\.local\bin"
    Success "Poetry installed"
} else {
    Success "Poetry found"
}

# Create necessary directories
Info "Setting up directories..."
New-Item -ItemType Directory -Force -Path "logs" | Out-Null
New-Item -ItemType Directory -Force -Path "data" | Out-Null

# Check if .env files exist, if not create them
Info "Checking environment files..."

$backendEnvPath = "apps\backend\.env"
$webEnvPath = "apps\web\.env"

if (!(Test-Path $backendEnvPath)) {
    $secretKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
    $vaultKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
    
    @"
# SPDX-License-Identifier: LicenseRef-NIA-Proprietary

# Application
APP_NAME=CodexOS
APP_VERSION=1.0.0
DEBUG=True
ENVIRONMENT=development

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_PREFIX=/api/v1
CORS_ORIGINS=["http://localhost:3000","https://codexos.dev"]

# Database
DATABASE_URL=postgresql+asyncpg://codexos:codexos_secure_password@localhost:5432/codexos_db
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=dev-secret-key-change-in-production-$secretKey
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
VAULT_MASTER_KEY=$vaultKey

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
"@ | Out-File -FilePath $backendEnvPath -Encoding UTF8
    Success "Created default backend .env file"
}

if (!(Test-Path $webEnvPath)) {
    @"
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8001/ws
"@ | Out-File -FilePath $webEnvPath -Encoding UTF8
    Success "Created default frontend .env file"
}

# Install dependencies
Info "Installing dependencies..."
& pnpm install

# Start services based on user choice
Write-Host ""
Write-Host "How would you like to start CodexOS?"
Write-Host "1) Full stack with Docker (recommended)"
Write-Host "2) Development mode (local services)"
Write-Host "3) Frontend only"
Write-Host "4) Backend only"
Write-Host ""
$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Info "Starting CodexOS with Docker..."
        
        # Pull required images
        Info "Pulling Docker images..."
        docker-compose pull
        
        # Start all services
        Info "Starting all services..."
        docker-compose up -d
        
        # Wait for services to be ready
        Info "Waiting for services to be ready..."
        Start-Sleep -Seconds 10
        
        # Check service health
        $psOutput = docker-compose ps
        if ($psOutput -match "unhealthy|Exit") {
            Error-Exit "Some services failed to start. Check logs with: docker-compose logs"
        }
        
        Success "CodexOS is starting!"
        Write-Host ""
        Write-Host "🌐 Frontend: http://localhost:3000"
        Write-Host "📡 Backend API: http://localhost:8001/api/v1/docs"
        Write-Host "🗄️  ChromaDB: http://localhost:8000"
        Write-Host "📊 PostgreSQL: localhost:5432"
        Write-Host "⚡ Redis: localhost:6379"
        Write-Host ""
        Write-Host "To view logs: docker-compose logs -f"
        Write-Host "To stop: docker-compose down"
    }
    
    "2" {
        Info "Starting in development mode..."
        Warning "Make sure PostgreSQL and Redis are running!"
        & pnpm dev
    }
    
    "3" {
        Info "Starting frontend only..."
        Set-Location -Path "apps\web"
        & pnpm dev
    }
    
    "4" {
        Info "Starting backend only..."
        Set-Location -Path "apps\backend"
        & poetry install
        & poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
    }
    
    default {
        Error-Exit "Invalid choice. Please run the script again."
    }
}

Write-Host ""
Success "CodexOS.dev is ready! 🚀"
Write-Host "Visit the documentation at: https://docs.codexos.dev"
