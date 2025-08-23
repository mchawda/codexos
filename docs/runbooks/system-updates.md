# System Updates Runbook

> **📚 Docs ▸ Runbooks ▸ Maintenance**  
> **Last Updated**: $(date)  
> **Status**: Active


## Overview
This runbook provides procedures for performing system updates, dependency updates, and security patches for the CodexOS platform while maintaining system stability and minimizing downtime.

## 🔍 Pre-Update Assessment

### Update Classification
- **Security Updates**: Critical security patches (apply immediately)
- **Bug Fixes**: Important bug fixes (apply within 24 hours)
- **Feature Updates**: New features and improvements (schedule maintenance window)
- **Dependency Updates**: Third-party library updates (test thoroughly)

### System Health Check
```bash
# 1. Check current system status
docker ps
curl -f http://localhost:8001/health
curl -f http://localhost:3000

# 2. Check resource usage
docker stats --no-stream
df -h
free -h

# 3. Check for active users/sessions
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT count(*) as active_connections
FROM pg_stat_activity
WHERE state = 'active';"

# 4. Verify backup status
ls -la /backups/postgres/$(date +%Y%m%d)/
```

### Update Readiness Checklist
- [ ] System is healthy and stable
- [ ] Recent backup completed successfully
- [ ] Maintenance window scheduled (if required)
- [ ] Team notified of planned updates
- [ ] Rollback plan prepared
- [ ] Update testing completed in staging

## 🔧 Update Procedures

### Security Updates (Immediate)

#### Critical Security Patches
```bash
# 1. Stop affected services
docker stop codexos-backend codexos-frontend

# 2. Update base images
docker pull postgres:16-alpine
docker pull redis:7-alpine

# 3. Rebuild application images with security updates
cd apps/backend
docker build --no-cache -t codexos-backend:latest .

cd ../web
pnpm install --audit --fix
pnpm build
docker build --no-cache -t codexos-frontend:latest .

# 4. Restart services with updated images
docker run -d --name codexos-backend \
  --network codexos_default \
  -p 8001:8000 \
  -e DATABASE_URL="postgresql+asyncpg://codexos:codexos_secure_password@codexos-postgres:5432/codexos_db" \
  -e REDIS_URL="redis://codexos-redis:6379/0" \
  -e WS_MESSAGE_QUEUE="redis://codexos-redis:6379/1" \
  -e SECRET_KEY="your-secret-key-change-in-production" \
  -e ENVIRONMENT="production" \
  codexos-backend:latest

docker run -d --name codexos-frontend \
  --network codexos_default \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1 \
  -e NEXT_PUBLIC_WS_URL=ws://localhost:8001/ws \
  codexos-frontend:latest

# 5. Verify security update
sleep 30
curl -f http://localhost:8001/health
curl -f http://localhost:3000
```

### Dependency Updates

#### Backend Dependencies
```bash
# 1. Check for outdated packages
cd apps/backend
poetry show --outdated

# 2. Update dependencies
poetry update

# 3. Check for security vulnerabilities
poetry audit

# 4. Test updates
poetry run pytest

# 5. Rebuild image
docker build -t codexos-backend:latest .

# 6. Deploy updated backend
docker stop codexos-backend
docker rm codexos-backend

docker run -d --name codexos-backend \
  --network codexos_default \
  -p 8001:8000 \
  -e DATABASE_URL="postgresql+asyncpg://codexos:codexos_secure_password@codexos-postgres:5432/codexos_db" \
  -e REDIS_URL="redis://codexos-redis:6379/0" \
  -e WS_MESSAGE_QUEUE="redis://codexos-redis:6379/1" \
  -e SECRET_KEY="your-secret-key-change-in-production" \
  -e ENVIRONMENT="production" \
  codexos-backend:latest
```

#### Frontend Dependencies
```bash
# 1. Check for outdated packages
cd apps/web
pnpm outdated

# 2. Update dependencies
pnpm update

# 3. Check for security vulnerabilities
pnpm audit --audit-level moderate

# 4. Fix security issues
pnpm audit --fix

# 5. Test updates
pnpm test
pnpm build

# 6. Rebuild image
docker build -t codexos-frontend:latest .

# 7. Deploy updated frontend
docker stop codexos-frontend
docker rm codexos-frontend

docker run -d --name codexos-frontend \
  --network codexos_default \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1 \
  -e NEXT_PUBLIC_WS_URL=ws://localhost:8001/ws \
  codexos-frontend:latest
```

### Infrastructure Updates

#### Docker Updates
```bash
# 1. Check Docker version
docker --version
docker-compose --version

# 2. Update Docker (if needed)
# This depends on your system package manager
# For Ubuntu/Debian:
# sudo apt-get update && sudo apt-get upgrade docker-ce docker-ce-cli containerd.io

# For CentOS/RHEL:
# sudo yum update docker-ce docker-ce-cli containerd.io

# 3. Restart Docker service
sudo systemctl restart docker

# 4. Verify Docker is working
docker ps
docker run hello-world
```

#### System Package Updates
```bash
# 1. Update system packages
sudo apt-get update
sudo apt-get upgrade -y

# 2. Check for kernel updates
uname -r
sudo apt-get install linux-image-generic

# 3. Check for security updates
sudo apt-get upgrade -y --only-upgrade

# 4. Clean up old packages
sudo apt-get autoremove -y
sudo apt-get autoclean

# 5. Reboot if kernel was updated
if [ "$(uname -r)" != "$(uname -r | cut -d'-' -f1)" ]; then
  echo "Kernel updated, reboot required"
  sudo reboot
fi
```

### Database Updates

#### PostgreSQL Updates
```bash
# 1. Check current PostgreSQL version
docker exec codexos-postgres psql -U codexos -d codexos_db -c "SELECT version();"

# 2. Backup current database
docker exec codexos-postgres pg_dump -U codexos -d codexos_db \
  --format=custom \
  --file="/tmp/pre_update_backup_$(date +%Y%m%d_%H%M%S).dump"

# 3. Update PostgreSQL image
docker stop codexos-postgres
docker rm codexos-postgres

docker run -d --name codexos-postgres \
  -e POSTGRES_USER=codexos \
  -e POSTGRES_PASSWORD=codexos_secure_password \
  -e POSTGRES_DB=codexos_db \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:16-alpine

# 4. Wait for database to be ready
sleep 30
docker exec codexos-postgres pg_isready -U codexos

# 5. Verify database functionality
docker exec codexos-postgres psql -U codexos -d codexos_db -c "SELECT version();"
docker exec codexos-postgres psql -U codexos -d codexos_db -c "SELECT COUNT(*) FROM users;"
```

## 🔄 Update Verification

### Service Health Verification
```bash
# 1. Check all services are running
docker ps

# 2. Verify health endpoints
curl -f http://localhost:8001/health
curl -f http://localhost:3000

# 3. Test API functionality
curl -f http://localhost:8001/api/v1/health
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'

# 4. Test database operations
docker exec codexos-postgres psql -U codexos -d codexos_db -c "SELECT COUNT(*) FROM users;"

# 5. Test Redis operations
docker exec codexos-redis redis-cli ping
```

### Performance Verification
```bash
# 1. Check response times
time curl -s http://localhost:8001/health > /dev/null
time curl -s http://localhost:3000 > /dev/null

# 2. Check resource usage
docker stats --no-stream

# 3. Check database performance
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 5;"

# 4. Check for errors in logs
docker logs codexos-backend --tail 50 | grep -i error
docker logs codexos-frontend --tail 50 | grep -i error
```

### Security Verification
```bash
# 1. Check for security vulnerabilities
cd apps/backend
poetry audit

cd ../web
pnpm audit

# 2. Verify SSL/TLS configuration (if applicable)
# openssl s_client -connect localhost:8001 -servername localhost

# 3. Check for exposed sensitive information
docker exec codexos-backend env | grep -i -E "(password|secret|key|token)"

# 4. Verify file permissions
ls -la .env*
ls -la docker-compose*.yml
ls -la startup.sh
```

## 🚨 Rollback Procedures

### Immediate Rollback
```bash
# 1. Stop updated services
docker stop codexos-backend codexos-frontend

# 2. Restart previous versions
docker run -d --name codexos-backend \
  --network codexos_default \
  -p 8001:8000 \
  -e DATABASE_URL="postgresql+asyncpg://codexos:codexos_secure_password@codexos-postgres:5432/codexos_db" \
  -e REDIS_URL="redis://codexos-redis:6379/0" \
  -e WS_MESSAGE_QUEUE="redis://codexos-redis:6379/1" \
  -e SECRET_KEY="your-secret-key-change-in-production" \
  -e ENVIRONMENT="production" \
  codexos-backend:previous

docker run -d --name codexos-frontend \
  --network codexos_default \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1 \
  -e NEXT_PUBLIC_WS_URL=ws://localhost:8001/ws \
  codexos-frontend:previous

# 3. Verify rollback
sleep 30
curl -f http://localhost:8001/health
curl -f http://localhost:3000
```

### Database Rollback
```bash
# 1. Restore from pre-update backup
docker exec codexos-postgres pg_restore -U codexos -d codexos_db \
  --clean \
  --if-exists \
  /tmp/pre_update_backup_*.dump

# 2. Verify database restoration
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM agents;"
```

## 📊 Update Monitoring

### Update Alerts
```yaml
# Prometheus Alert Rules
groups:
- name: update_alerts
  rules:
  - alert: UpdateInProgress
    expr: update_status == "in_progress"
    for: 1m
    labels:
      severity: info
    annotations:
      summary: "System update in progress"
  
  - alert: UpdateFailed
    expr: update_status == "failed"
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "System update failed"
  
  - alert: UpdateCompleted
    expr: update_status == "completed"
    for: 1m
    labels:
      severity: info
    annotations:
      summary: "System update completed successfully"
```

### Update Metrics
```bash
# 1. Track update duration
echo "Update started: $(date)" >> /var/log/system-updates.log

# 2. Monitor system performance during update
docker stats --no-stream > /tmp/update_performance_$(date +%Y%m%d_%H%M%S).log

# 3. Track update success rate
echo "Update completed: $(date)" >> /var/log/system-updates.log
echo "Duration: $(( $(date +%s) - $(date -d "$UPDATE_START" +%s) )) seconds" >> /var/log/system-updates.log
```

## 📋 Update Checklist

### Pre-Update
- [ ] Update type classified and prioritized
- [ ] System health verified
- [ ] Backup completed successfully
- [ ] Maintenance window scheduled (if required)
- [ ] Team notified
- [ ] Rollback plan prepared
- [ ] Update testing completed

### During Update
- [ ] Services stopped gracefully
- [ ] Updates applied systematically
- [ ] Services restarted with updates
- [ ] Health checks performed
- [ ] Performance verified
- [ ] Security verified

### Post-Update
- [ ] All services verified healthy
- [ ] Performance benchmarks met
- [ ] Security vulnerabilities addressed
- [ ] Monitoring alerts configured
- [ ] Team debrief completed
- [ ] Documentation updated

## 🚨 Emergency Procedures

### Update Failure
```bash
# 1. Immediate rollback
./scripts/rollback.sh

# 2. Notify team
echo "UPDATE FAILED - Rolling back" | \
  mail -s "System Update Failed" \
  -c "ops@codexos.dev,management@codexos.dev" \
  updates@codexos.dev

# 3. Investigate failure
docker logs codexos-backend --tail 200
docker logs codexos-frontend --tail 200

# 4. Document failure
echo "Update failed at $(date)" >> /var/log/update-failures.log
echo "Reason: $FAILURE_REASON" >> /var/log/update-failures.log
```

### Service Unavailable After Update
```bash
# 1. Check service status
docker ps -a
docker logs codexos-backend --tail 100
docker logs codexos-frontend --tail 100

# 2. Check configuration
docker exec codexos-backend cat /app/.env
docker exec codexos-frontend env | grep NEXT_PUBLIC

# 3. Restart services if needed
docker restart codexos-backend codexos-frontend

# 4. Verify recovery
sleep 30
curl -f http://localhost:8001/health
curl -f http://localhost:3000
```

## 📚 References

- [CodexOS Architecture](../architecture.md)
- [Deployment Procedures](deployment.md)
- [Backup & Recovery](backup-recovery.md)
- [Monitoring & Alerting](monitoring-alerting.md)
- [Security Best Practices](../security.md#best-practices)
- [Update Policy](../updates.md)
