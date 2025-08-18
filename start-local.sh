#!/bin/bash

# Simple startup script for local development

echo "🚀 Starting CodexOS locally..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please make sure you have created .env.local with your API keys"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

# Start services
echo "📦 Starting services..."
docker compose up -d

# Wait a bit
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo ""
echo "🔍 Checking services..."
docker compose ps

echo ""
echo "✅ CodexOS should now be running!"
echo ""
echo "🌐 Access points:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8001/api/v1"
echo "   API Docs: http://localhost:8001/api/v1/docs"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker compose logs -f [service]"
echo "   Stop all: docker compose down"
echo "   Restart: docker compose restart"
echo ""
