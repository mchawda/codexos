#!/bin/bash

# Production Deployment Script for CodexOS RAG Engine
# This script deploys the RAG engine with production optimizations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RAG_ENGINE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$RAG_ENGINE_DIR")"
ENVIRONMENT="${ENVIRONMENT:-production}"
NODE_ENV="production"

echo -e "${BLUE}🚀 CodexOS RAG Engine Production Deployment${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ is required (current: $(node --version))${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm not found, installing...${NC}"
    npm install -g pnpm
fi

echo -e "${GREEN}✅ pnpm $(pnpm --version)${NC}"

# Check environment variables
echo -e "${YELLOW}🔍 Checking environment configuration...${NC}"

REQUIRED_ENV_VARS=(
    "OPENAI_API_KEY"
    "CHROMA_URL"
    "NODE_ENV"
)

MISSING_VARS=()
for var in "${REQUIRED_ENV_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo -e "${RED}   - $var${NC}"
    done
    echo ""
    echo -e "${YELLOW}Please set these variables and run the script again${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables configured${NC}"

# Build the RAG engine
echo -e "${YELLOW}🔨 Building RAG Engine...${NC}"

cd "$RAG_ENGINE_DIR"

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf dist/ node_modules/.cache

# Install dependencies
echo "Installing dependencies..."
pnpm install --frozen-lockfile

# Build with production optimizations
echo "Building with production optimizations..."
pnpm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Run production tests
echo -e "${YELLOW}🧪 Running production tests...${NC}"

# Check if tests exist
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    echo "Running tests..."
    pnpm test --silent
    echo -e "${GREEN}✅ Tests passed${NC}"
else
    echo -e "${YELLOW}⚠️  No tests configured, skipping${NC}"
fi

# Performance validation
echo -e "${YELLOW}⚡ Running performance validation...${NC}"

# Check bundle size
BUNDLE_SIZE=$(du -sh dist/ | cut -f1)
echo "Bundle size: $BUNDLE_SIZE"

# Check for performance issues
if [ -f "dist/rag-engine.js" ]; then
    JS_SIZE=$(du -h dist/rag-engine.js | cut -f1)
    echo "JavaScript bundle: $JS_SIZE"
    
    # Warn if bundle is too large
    if [[ "$JS_SIZE" =~ ([0-9]+)M ]] && [ "${BASH_REMATCH[1]}" -gt 5 ]; then
        echo -e "${YELLOW}⚠️  Large bundle size detected. Consider code splitting.${NC}"
    fi
fi

# Health check
echo -e "${YELLOW}🏥 Running health check...${NC}"

# Check if the built engine can be imported
if node -e "
try {
    const { RAGEngine } = require('./dist');
    console.log('✅ RAG Engine import successful');
} catch (error) {
    console.error('❌ RAG Engine import failed:', error.message);
    process.exit(1);
}
"; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    exit 1
fi

# Create production configuration
echo -e "${YELLOW}⚙️  Creating production configuration...${NC}"

cat > .env.production << EOF
# Production Environment Configuration
NODE_ENV=production
ENVIRONMENT=production

# RAG Engine Configuration
RAG_CHUNK_SIZE=800
RAG_BATCH_SIZE=200
RAG_MAX_CONNECTIONS=20
RAG_CACHE_TTL=7200
RAG_HEALTH_CHECK_INTERVAL=300000

# Performance Settings
RAG_ENABLE_COMPRESSION=true
RAG_USE_APPROXIMATE_SEARCH=true
RAG_ENABLE_METRICS=true
RAG_ENABLE_PROFILING=true

# Security Settings
RAG_ENABLE_ENCRYPTION=true
RAG_ENABLE_AUDIT_LOGGING=true
RAG_MAX_QUERY_LENGTH=10000
RAG_MAX_QUERIES_PER_MINUTE=100
RAG_MAX_INGESTIONS_PER_HOUR=50
EOF

echo -e "${GREEN}✅ Production configuration created${NC}"

# Create deployment manifest
echo -e "${YELLOW}📋 Creating deployment manifest...${NC}"

cat > deployment-manifest.json << EOF
{
  "deployment": {
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "environment": "$ENVIRONMENT",
    "version": "$(node -p "require('./package.json').version")",
    "commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "buildId": "$(date +%s)"
  },
  "ragEngine": {
    "config": "production",
    "chunkSize": 800,
    "batchSize": 200,
    "maxConnections": 20,
    "cacheTTL": 7200,
    "healthCheckInterval": 300000
  },
  "performance": {
    "enableMetrics": true,
    "enableProfiling": true,
    "slowQueryThreshold": 1000,
    "enableCompression": true,
    "useApproximateSearch": true
  },
  "security": {
    "enableEncryption": true,
    "enableAuditLogging": true,
    "rateLimiting": true
  },
  "scaling": {
    "enableHorizontalScaling": true,
    "autoScaling": true,
    "minInstances": 2,
    "maxInstances": 10
  }
}
EOF

echo -e "${GREEN}✅ Deployment manifest created${NC}"

# Create startup script
echo -e "${YELLOW}🚀 Creating startup script...${NC}"

cat > start-production.sh << 'EOF'
#!/bin/bash

# Production startup script for RAG Engine

set -e

# Load environment
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Set production environment
export NODE_ENV=production
export ENVIRONMENT=production

echo "🚀 Starting CodexOS RAG Engine in production mode..."

# Check if already running
if pgrep -f "rag-engine" > /dev/null; then
    echo "⚠️  RAG Engine already running, stopping..."
    pkill -f "rag-engine"
    sleep 2
fi

# Start with production optimizations
node dist/rag-engine.js \
    --config production \
    --port ${RAG_PORT:-3001} \
    --workers ${RAG_WORKERS:-4} \
    --max-memory ${RAG_MAX_MEMORY:-1024} \
    --enable-metrics \
    --enable-profiling \
    --log-level info \
    --health-check-interval 300000 \
    --performance-mode balanced \
    --security-mode strict \
    --scaling-mode auto

echo "✅ RAG Engine started successfully"
EOF

chmod +x start-production.sh

echo -e "${GREEN}✅ Startup script created${NC}"

# Create monitoring script
echo -e "${YELLOW}📊 Creating monitoring script...${NC}"

cat > monitor-production.sh << 'EOF'
#!/bin/bash

# Production monitoring script for RAG Engine

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "📊 CodexOS RAG Engine Production Monitoring"
echo "==========================================="

# Check if RAG Engine is running
if pgrep -f "rag-engine" > /dev/null; then
    echo -e "${GREEN}✅ RAG Engine is running${NC}"
    
    # Get process info
    PID=$(pgrep -f "rag-engine")
    echo "Process ID: $PID"
    
    # Memory usage
    MEMORY=$(ps -o rss= -p $PID | awk '{print $1/1024}')
    echo "Memory usage: ${MEMORY}MB"
    
    # CPU usage
    CPU=$(ps -o %cpu= -p $PID)
    echo "CPU usage: ${CPU}%"
    
    # Uptime
    UPTIME=$(ps -o etime= -p $PID)
    echo "Uptime: $UPTIME"
    
else
    echo -e "${RED}❌ RAG Engine is not running${NC}"
    exit 1
fi

# Check health endpoint (if available)
if [ -n "$RAG_PORT" ]; then
    echo ""
    echo "🏥 Health Check:"
    if curl -s "http://localhost:${RAG_PORT}/health" > /dev/null; then
        echo -e "${GREEN}✅ Health endpoint responding${NC}"
    else
        echo -e "${RED}❌ Health endpoint not responding${NC}"
    fi
fi

# Check logs
echo ""
echo "📝 Recent Logs:"
if [ -f "logs/rag-engine.log" ]; then
    tail -n 10 logs/rag-engine.log
else
    echo "No log file found"
fi

echo ""
echo "🔍 Performance Metrics:"
echo "Use the following commands for detailed monitoring:"
echo "  - Real-time logs: tail -f logs/rag-engine.log"
echo "  - Process details: ps aux | grep rag-engine"
echo "  - Memory usage: pmap $PID"
echo "  - Performance: node dist/performance-monitor.js"
EOF

chmod +x monitor-production.sh

echo -e "${GREEN}✅ Monitoring script created${NC}"

# Final deployment summary
echo ""
echo -e "${GREEN}🎉 RAG Engine Production Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo "  ✅ Build completed successfully"
echo "  ✅ Production configuration created"
echo "  ✅ Deployment manifest generated"
echo "  ✅ Startup script created"
echo "  ✅ Monitoring script created"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "  1. Review .env.production configuration"
echo "  2. Start the engine: ./start-production.sh"
echo "  3. Monitor performance: ./monitor-production.sh"
echo "  4. Check logs in logs/ directory"
echo ""
echo -e "${BLUE}📊 Performance Features:${NC}"
echo "  • Batch processing with 200-item batches"
echo "  • Connection pooling (5-20 connections)"
echo "  • Health monitoring every 5 minutes"
echo "  • Performance metrics and profiling"
echo "  • Auto-scaling support"
echo "  • Security and rate limiting"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "  • Ensure ChromaDB is running and accessible"
echo "  • Monitor memory usage and adjust limits"
echo "  • Set up proper logging and monitoring"
echo "  • Configure backup and recovery procedures"
echo ""

# Create performance tuning guide
echo -e "${YELLOW}📚 Creating performance tuning guide...${NC}"

cat > PERFORMANCE_TUNING.md << 'EOF'
# RAG Engine Performance Tuning Guide

## Quick Performance Presets

### High Throughput (Fast Processing)
```bash
export RAG_CHUNK_SIZE=600
export RAG_BATCH_SIZE=500
export RAG_MAX_CONNECTIONS=50
export RAG_USE_APPROXIMATE_SEARCH=true
```

### High Accuracy (Best Quality)
```bash
export RAG_CHUNK_SIZE=1000
export RAG_BATCH_SIZE=100
export RAG_MAX_CONNECTIONS=10
export RAG_USE_APPROXIMATE_SEARCH=false
```

### Balanced (Recommended)
```bash
export RAG_CHUNK_SIZE=800
export RAG_BATCH_SIZE=200
export RAG_MAX_CONNECTIONS=20
export RAG_USE_APPROXIMATE_SEARCH=true
```

## Performance Monitoring

### Key Metrics to Watch
- **Query Response Time**: Target < 500ms
- **Ingestion Throughput**: Documents per minute
- **Memory Usage**: Keep under 1GB
- **CPU Usage**: Target < 80%
- **Connection Pool**: Utilization rate

### Performance Commands
```bash
# Monitor real-time performance
./monitor-production.sh

# Check detailed metrics
node dist/performance-monitor.js

# View performance logs
tail -f logs/performance.log
```

## Troubleshooting

### Common Performance Issues
1. **Slow Queries**: Increase chunk size, enable approximate search
2. **High Memory**: Reduce batch size, enable compression
3. **Connection Errors**: Increase max connections, check network
4. **Slow Ingestion**: Increase batch size, optimize chunking

### Performance Optimization Tips
- Use semantic chunking for better quality
- Enable compression for large documents
- Monitor and adjust batch sizes
- Use connection pooling effectively
- Implement proper caching strategies
EOF

echo -e "${GREEN}✅ Performance tuning guide created${NC}"

echo ""
echo -e "${GREEN}🎯 Your RAG Engine is now production-ready!${NC}"
echo -e "${GREEN}Run './start-production.sh' to launch with production optimizations.${NC}"
