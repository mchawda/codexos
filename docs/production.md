# CodexOS Production Deployment Guide

## Overview

This guide covers deploying CodexOS to a production environment with high availability, monitoring, and security best practices.

## Prerequisites

- Linux server (Ubuntu 22.04 LTS recommended)
- Docker Engine 24.0+
- Docker Compose 2.20+
- Domain name with DNS configured
- SSL certificates
- Minimum 8GB RAM, 4 CPU cores
- 100GB SSD storage

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Nginx     │────▶│  Frontend   │────▶│   Backend   │
│  (Reverse   │     │  (Next.js)  │     │  (FastAPI)  │
│   Proxy)    │     └─────────────┘     └─────────────┘
└─────────────┘                                │
       │                                       │
       │                          ┌────────────┴────────────┐
       │                          │                         │
       ▼                          ▼                         ▼
┌─────────────┐           ┌─────────────┐         ┌─────────────┐
│ Prometheus  │           │ PostgreSQL  │         │    Redis    │
│  Grafana    │           └─────────────┘         └─────────────┘
└─────────────┘                   │
                                  ▼
                          ┌─────────────┐
                          │  ChromaDB   │
                          └─────────────┘
```

## 🆕 Enhanced Security Features

### **Agent Engine Guardrails**
- **Tool Allow-listing**: Only approved tools can be executed
- **Resource Quotas**: CPU, memory, and network limits per execution
- **Execution Sandboxing**: Isolated process execution with seccomp profiles
- **Memory Tier Management**: Ephemeral, session, and semantic memory with retention

### **Runtime Security**
- **Interruption & Rollback**: Hooks for execution control and recovery
- **Network Isolation**: Egress controls and path restrictions
- **File System Controls**: Restricted access to specific directories
- **Process Monitoring**: Real-time resource usage tracking

### **Multi-Tenant Security**
- **Complete Data Isolation**: Row-level security and tenant context
- **Resource Quotas**: Per-tenant limits and monitoring
- **Audit Logging**: Complete activity tracking with cryptographic signatures
- **Access Controls**: Role-based permissions with fine-grained policies

## Deployment Steps

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 2. Clone Repository

```bash
git clone https://github.com/codexos/codexos.git
cd codexos
```

### 3. Configure Environment

```bash
# Copy environment template
cp env.production.example .env.production

# Edit with your values
nano .env.production
```

Required environment variables:
- `SECRET_KEY`: Generate with `openssl rand -base64 32`
- `DB_PASSWORD`: Strong database password
- `REDIS_PASSWORD`: Strong Redis password
- `VAULT_MASTER_KEY`: Generate with `openssl rand -base64 32`
- `STRIPE_API_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: From Stripe dashboard

### 4. SSL Certificates

Place your SSL certificates in `nginx/ssl/`:
- `cert.pem`: Your certificate
- `key.pem`: Your private key

For Let's Encrypt:
```bash
sudo apt install certbot
sudo certbot certonly --standalone -d codexos.dev -d www.codexos.dev
```

### 5. Deploy

```bash
# Run deployment script
./deploy.sh production
```

## Configuration

### Database

PostgreSQL configuration for production:

```sql
-- Optimize for production workload
ALTER SYSTEM SET shared_buffers = '2GB';
ALTER SYSTEM SET effective_cache_size = '6GB';
ALTER SYSTEM SET maintenance_work_mem = '512MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '10MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';
```

### Redis

Redis configuration for production:

```conf
# /etc/redis/redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
```

### Nginx

The provided nginx.conf includes:
- SSL/TLS configuration
- Rate limiting
- Gzip compression
- Security headers
- WebSocket support
- Load balancing

## Monitoring

### Prometheus

Access metrics at `http://localhost:9090`

Available metrics:
- HTTP request rate and latency
- Database connections
- Cache hit/miss rates
- Agent execution metrics
- Payment transaction metrics

### Grafana

Access dashboards at `http://localhost:3000`

Default dashboards:
- System Overview
- API Performance
- Database Metrics
- Business Metrics
- Error Tracking

### Alerts

Configured alerts include:
- High error rate (>10%)
- High response time (>2s)
- Database connection failures
- Low disk space (<10%)
- Payment failures

### Sentry

Error tracking and performance monitoring:
1. Create project at sentry.io
2. Add DSN to environment
3. View errors in real-time

## Security

### Best Practices

1. **Network Security**
   - Use firewall (ufw/iptables)
   - Only expose ports 80, 443
   - Use VPN for internal services

2. **Application Security**
   - Regular security updates
   - Strong passwords
   - Enable MFA for admin accounts
   - Regular security audits

3. **Data Security**
   - Encrypted backups
   - TLS for all connections
   - Encrypted sensitive data at rest

### Firewall Configuration

```bash
# Allow SSH (adjust port as needed)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

## Backup and Recovery

### Automated Backups

The deployment includes automated PostgreSQL backups:
- Daily backups retained for 7 days
- Weekly backups retained for 4 weeks
- Monthly backups retained for 6 months

### Manual Backup

```bash
# Database backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U codexos codexos_db > backup_$(date +%Y%m%d).sql

# Full backup
tar -czf codexos_backup_$(date +%Y%m%d).tar.gz \
  postgres_data/ \
  redis_data/ \
  chroma_data/ \
  backups/
```

### Recovery

```bash
# Restore database
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U codexos codexos_db < backup.sql

# Restore full backup
tar -xzf codexos_backup_20240101.tar.gz
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

## Scaling

### Horizontal Scaling

For high traffic, scale services horizontally:

```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      replicas: 3
```

### Load Balancing

Configure Nginx upstream with multiple backends:

```nginx
upstream backend {
    least_conn;
    server backend1:8000 max_fails=3 fail_timeout=30s;
    server backend2:8000 max_fails=3 fail_timeout=30s;
    server backend3:8000 max_fails=3 fail_timeout=30s;
}
```

## Maintenance

### Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and deploy
./deploy.sh production
```

### Health Checks

```bash
# Check all services
docker-compose -f docker-compose.prod.yml ps

# Check specific service logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Run health check
curl https://codexos.dev/health/detailed
```

### Performance Tuning

Monitor and adjust based on metrics:
- Increase worker processes for high CPU
- Add Redis memory for caching
- Scale PostgreSQL connections
- Optimize database queries

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check PostgreSQL logs
   docker-compose -f docker-compose.prod.yml logs postgres
   
   # Verify connection
   docker-compose -f docker-compose.prod.yml exec postgres psql -U codexos -c "SELECT 1"
   ```

2. **High Memory Usage**
   ```bash
   # Check memory usage
   docker stats
   
   # Limit container memory
   docker-compose -f docker-compose.prod.yml down
   # Edit docker-compose.prod.yml to add memory limits
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **SSL Certificate Issues**
   ```bash
   # Verify certificates
   openssl x509 -in nginx/ssl/cert.pem -text -noout
   
   # Test SSL
   curl -vI https://codexos.dev
   ```

### Logs

Centralized logging locations:
- Application logs: `docker-compose logs [service]`
- Nginx logs: `nginx_logs/` volume
- Database logs: Within PostgreSQL container
- Monitoring: Grafana dashboards

## Support

For production support:
- Documentation: https://docs.codexos.dev
- Issues: https://github.com/codexos/codexos/issues
- Security: security@codexos.dev
- Enterprise: enterprise@codexos.dev
