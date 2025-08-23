# 🚀 CodexOS RAG Engine Production Deployment Guide

## 📋 Overview

This guide covers the complete production deployment of the CodexOS RAG Engine with performance optimizations, monitoring, and scaling capabilities.

## 🎯 What's New in Production

### Performance Optimizations
- **Batch Processing**: 200-item batches for efficient embedding generation
- **Connection Pooling**: 5-20 connections with automatic scaling
- **Semantic Chunking**: Better document splitting for improved retrieval
- **Approximate Search**: Faster queries with HNSW indexing
- **Compression**: Reduced memory usage and faster I/O

### Production Features
- **Health Monitoring**: Automatic health checks every 5 minutes
- **Performance Metrics**: Real-time monitoring and alerting
- **Auto-scaling**: Horizontal scaling with load balancing
- **Security**: Encryption, audit logging, and rate limiting
- **High Availability**: Multi-instance deployment with failover

## 🚀 Quick Start

### 1. Prerequisites
```bash
# Required software
- Node.js 18+
- Docker & Docker Compose
- pnpm package manager
- Git

# Environment variables
export OPENAI_API_KEY="your-openai-key"
export CHROMA_URL="http://localhost:8000"
export NODE_ENV="production"
```

### 2. Deploy with Script
```bash
# Make script executable
chmod +x deploy-production.sh

# Run deployment
./deploy-production.sh
```

### 3. Deploy with Docker Compose
```bash
# Start production stack
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps
```

## 🔧 Manual Deployment

### Step 1: Build and Configure
```bash
# Install dependencies
pnpm install --frozen-lockfile

# Build with production optimizations
pnpm run build

# Create production environment
cp .env.production .env
```

### Step 2: Start Services
```bash
# Start RAG Engine
./start-production.sh

# Monitor performance
./monitor-production.sh
```

### Step 3: Verify Deployment
```bash
# Check health
curl http://localhost:3001/health

# Check metrics
curl http://localhost:3001/metrics

# Check performance
curl http://localhost:3001/performance
```

## 📊 Performance Tuning

### Performance Presets

#### High Throughput (Fast Processing)
```bash
export RAG_CHUNK_SIZE=600
export RAG_BATCH_SIZE=500
export RAG_MAX_CONNECTIONS=50
export RAG_USE_APPROXIMATE_SEARCH=true
export RAG_ENABLE_COMPRESSION=false
```

#### High Accuracy (Best Quality)
```bash
export RAG_CHUNK_SIZE=1000
export RAG_BATCH_SIZE=100
export RAG_MAX_CONNECTIONS=10
export RAG_USE_APPROXIMATE_SEARCH=false
export RAG_ENABLE_COMPRESSION=true
```

#### Balanced (Recommended)
```bash
export RAG_CHUNK_SIZE=800
export RAG_BATCH_SIZE=200
export RAG_MAX_CONNECTIONS=20
export RAG_USE_APPROXIMATE_SEARCH=true
export RAG_ENABLE_COMPRESSION=true
```

### Environment Variables
```bash
# Core Configuration
RAG_CHUNK_SIZE=800              # Document chunk size in characters
RAG_BATCH_SIZE=200              # Batch size for embeddings
RAG_MAX_CONNECTIONS=20          # Maximum database connections
RAG_CACHE_TTL=7200             # Cache TTL in seconds
RAG_HEALTH_CHECK_INTERVAL=300000 # Health check interval in ms

# Performance Settings
RAG_ENABLE_COMPRESSION=true     # Enable document compression
RAG_USE_APPROXIMATE_SEARCH=true # Use approximate search for speed
RAG_ENABLE_METRICS=true         # Enable performance metrics
RAG_ENABLE_PROFILING=true       # Enable detailed profiling

# Security Settings
RAG_ENABLE_ENCRYPTION=true      # Enable data encryption
RAG_ENABLE_AUDIT_LOGGING=true   # Enable audit logging
RAG_MAX_QUERY_LENGTH=10000     # Maximum query length
RAG_MAX_QUERIES_PER_MINUTE=100 # Rate limiting
RAG_MAX_INGESTIONS_PER_HOUR=50 # Ingestion rate limiting
```

## 📈 Monitoring & Observability

### Built-in Metrics
- **Query Performance**: Response times, throughput, slow queries
- **Resource Usage**: Memory, CPU, connection pool utilization
- **Cache Performance**: Hit rates, miss rates, efficiency
- **Ingestion Metrics**: Document processing speed, success rates
- **Error Tracking**: Error rates, types, and patterns

### Monitoring Commands
```bash
# Real-time monitoring
./monitor-production.sh

# Performance summary
curl http://localhost:3001/performance/summary

# Metrics export
curl http://localhost:3001/metrics/export

# Health check
curl http://localhost:3001/health
```

### Grafana Dashboards
Access Grafana at `http://localhost:3000` (admin/admin) for:
- **RAG Engine Overview**: System health and performance
- **Query Analytics**: Response times and throughput
- **Resource Monitoring**: Memory, CPU, and network usage
- **Error Tracking**: Error rates and patterns
- **Ingestion Metrics**: Document processing performance

## 🔒 Security Configuration

### Authentication
```bash
# ChromaDB Authentication
CHROMA_SERVER_AUTH_CREDENTIALS_FILE=/chroma/chroma_auth.json
CHROMA_SERVER_AUTH_PROVIDER=chromadb.auth.providers.HtpasswdFileServerAuthProvider
```

### Rate Limiting
```bash
# Query rate limiting
RAG_MAX_QUERIES_PER_MINUTE=100
RAG_MAX_QUERY_LENGTH=10000

# Ingestion rate limiting
RAG_MAX_INGESTIONS_PER_HOUR=50
```

### Encryption
```bash
# Data encryption
RAG_ENABLE_ENCRYPTION=true
RAG_ENCRYPTION_ALGORITHM=AES-256-GCM
```

## 🚀 Scaling & High Availability

### Horizontal Scaling
```bash
# Enable auto-scaling
RAG_ENABLE_HORIZONTAL_SCALING=true
RAG_AUTO_SCALING_ENABLED=true

# Scaling thresholds
RAG_SCALE_UP_THRESHOLD=0.8     # Scale up at 80% CPU
RAG_SCALE_DOWN_THRESHOLD=0.3   # Scale down at 30% CPU

# Instance limits
RAG_MIN_INSTANCES=2
RAG_MAX_INSTANCES=10
```

### Load Balancing
```bash
# Enable load balancing
RAG_LOAD_BALANCING=true

# Sharding strategy
RAG_SHARDING_STRATEGY=hash

# Replication factor
RAG_REPLICATION_FACTOR=2
```

### Multi-Instance Deployment
```bash
# Scale RAG engine instances
docker-compose -f docker-compose.production.yml up -d --scale rag-engine=3

# Check instance status
docker-compose -f docker-compose.production.yml ps rag-engine
```

## 🐳 Docker Production

### Build Production Image
```bash
# Build with production target
docker build -f Dockerfile.production --target production -t codexos-rag-engine:prod .

# Build all targets
docker build -f Dockerfile.production --target production -t codexos-rag-engine:prod .
docker build -f Dockerfile.production --target development -t codexos-rag-engine:dev .
docker build -f Dockerfile.production --target testing -t codexos-rag-engine:test .
docker build -f Dockerfile.production --target performance -t codexos-rag-engine:perf .
```

### Run Production Container
```bash
# Run with production config
docker run -d \
  --name codexos-rag-engine \
  --restart unless-stopped \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e RAG_PORT=3001 \
  -v rag-data:/app/data \
  -v rag-logs:/app/logs \
  codexos-rag-engine:prod
```

### Production Stack
```bash
# Start complete production stack
docker-compose -f docker-compose.production.yml up -d

# Services included:
# - RAG Engine (port 3001)
# - ChromaDB (port 8000)
# - Redis Cache (port 6379)
# - Performance Monitor (port 3002)
# - Nginx Reverse Proxy (ports 80, 443)
# - Prometheus Metrics (port 9090)
# - Grafana Dashboard (port 3000)
```

## 🔍 Troubleshooting

### Common Issues

#### 1. High Memory Usage
```bash
# Symptoms: Memory usage > 1GB, slow performance
# Solutions:
export RAG_CHUNK_SIZE=600        # Reduce chunk size
export RAG_BATCH_SIZE=100        # Reduce batch size
export RAG_ENABLE_COMPRESSION=true # Enable compression
export RAG_MAX_MEMORY=512        # Reduce memory limit
```

#### 2. Slow Query Performance
```bash
# Symptoms: Query times > 1 second
# Solutions:
export RAG_USE_APPROXIMATE_SEARCH=true # Enable fast search
export RAG_CHUNK_SIZE=800        # Optimize chunk size
export RAG_CACHE_TTL=14400       # Increase cache TTL
export RAG_MAX_CONNECTIONS=30    # Increase connections
```

#### 3. Connection Errors
```bash
# Symptoms: Database connection failures
# Solutions:
export RAG_MAX_CONNECTIONS=50    # Increase connection pool
export RAG_CONNECTION_TIMEOUT=60000 # Increase timeout
# Check ChromaDB and Redis connectivity
```

#### 4. High Error Rates
```bash
# Symptoms: Error rate > 5%
# Solutions:
# Check external service connections (OpenAI API)
# Verify environment variables
# Check logs for specific error messages
# Monitor rate limits
```

### Debug Commands
```bash
# Check logs
docker logs codexos-rag-engine

# Check performance
./monitor-production.sh

# Check health
curl -v http://localhost:3001/health

# Check metrics
curl http://localhost:3001/metrics

# Check configuration
curl http://localhost:3001/config
```

### Performance Diagnostics
```bash
# Run performance test
node dist/performance-test.js

# Check system resources
htop
iotop
free -h

# Check network connectivity
curl -v http://localhost:8000/api/v1/heartbeat  # ChromaDB
redis-cli ping                                   # Redis
```

## 📚 Best Practices

### 1. Performance Optimization
- Use appropriate chunk sizes (600-1000 characters)
- Enable batch processing for large document sets
- Monitor and adjust batch sizes based on memory usage
- Use semantic chunking for better quality
- Enable compression for large documents

### 2. Resource Management
- Set appropriate memory limits (1-2GB per instance)
- Monitor connection pool utilization
- Use connection pooling effectively
- Implement proper caching strategies
- Monitor disk I/O for vector operations

### 3. Security
- Use strong authentication for ChromaDB
- Enable encryption for sensitive data
- Implement proper rate limiting
- Monitor access logs and audit trails
- Regular security updates

### 4. Monitoring
- Set up comprehensive metrics collection
- Configure performance alerts
- Monitor resource usage trends
- Track query performance patterns
- Set up automated health checks

### 5. Scaling
- Start with balanced performance preset
- Monitor resource utilization
- Scale horizontally when needed
- Use load balancing for multiple instances
- Implement proper failover mechanisms

## 🎯 Next Steps

### Immediate Actions
1. **Deploy to Production**: Use the deployment script or Docker Compose
2. **Configure Monitoring**: Set up Grafana dashboards and alerts
3. **Performance Tuning**: Adjust settings based on your workload
4. **Security Hardening**: Configure authentication and encryption

### Future Enhancements
1. **Advanced Scaling**: Implement Kubernetes deployment
2. **Multi-Region**: Deploy across multiple geographic locations
3. **Advanced Analytics**: Add ML-based performance optimization
4. **Custom Models**: Integrate with custom embedding models

## 📞 Support

For production deployment support:
- Check the troubleshooting section above
- Review performance tuning guide
- Monitor system logs and metrics
- Use the built-in health checks
- Refer to the performance monitoring tools

---

**🎉 Congratulations!** Your RAG Engine is now production-ready with enterprise-grade performance, monitoring, and scaling capabilities.
