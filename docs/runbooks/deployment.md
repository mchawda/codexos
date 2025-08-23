# Deployment Procedures Runbook

> **📚 Docs ▸ Runbooks ▸ Operations**  
> **Last Updated**: $(date)  
> **Status**: Active


## Overview
This runbook covers production deployment procedures, rollback procedures, and deployment verification for the CodexOS platform.

## 🚀 Pre-Deployment Checklist

### Environment Verification
- [ ] Staging environment tests passed
- [ ] Database migrations tested
- [ ] API compatibility verified
- [ ] Frontend build successful
- [ ] Security scan completed
- [ ] Performance benchmarks met

### Infrastructure Readiness
- [ ] Sufficient disk space available
- [ ] Memory and CPU resources adequate
- [ ] Network connectivity verified
- [ ] Backup completed before deployment
- [ ] Monitoring alerts configured
- [ ] Rollback plan prepared

### Team Communication
- [ ] Deployment window scheduled
- [ ] Stakeholders notified
- [ ] On-call team briefed
- [ ] Emergency contacts available
- [ ] Communication channels open

## 🔧 Deployment Procedures

### Blue-Green Deployment

#### Step 1: Prepare New Environment
```bash
# 1. Build new images
cd /Volumes/External\ Drive/dev/projects/CodexOS

# Build backend
cd apps/backend
docker build -t codexos-backend:new .

# Build frontend
cd ../web
pnpm build
docker build -t codexos-frontend:new .
```

#### Step 2: Deploy New Backend
```bash
# 1. Deploy new backend (green)
docker run -d --name codexos-backend-green \
  --network codexos_default \
  -p 8002:8000 \
  -e DATABASE_URL="postgresql+asyncpg://codexos:codexos_secure_password@codexos-postgres:5432/codexos_db" \
  -e REDIS_URL="redis://codexos-redis:6379/0" \
  -e WS_MESSAGE_QUEUE="redis://codexos-redis:6379/1" \
  -e SECRET_KEY="your-secret-key-change-in-production" \
  -e ENVIRONMENT="production" \
  codexos-backend:new

# 2. Wait for health check
sleep 30
curl -f http://localhost:8002/health || exit 1

# 3. Run smoke tests
curl -f http://localhost:8002/api/v1/health || exit 1
```

#### Step 3: Deploy New Frontend
```bash
# 1. Deploy new frontend (green)
docker run -d --name codexos-frontend-green \
  --network codexos_default \
  -p 3001:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8002/api/v1 \
  -e NEXT_PUBLIC_WS_URL=ws://localhost:8002/ws \
  codexos-frontend:new

# 2. Wait for health check
sleep 30
curl -f http://localhost:3001 || exit 1
```

#### Step 4: Switch Traffic
```bash
# 1. Update load balancer to point to green environment
# (This depends on your load balancer configuration)

# 2. Verify traffic is flowing to green
curl -f http://localhost:8002/health
curl -f http://localhost:3001

# 3. Monitor for 5 minutes
for i in {1..30}; do
  curl -s http://localhost:8002/health > /dev/null && echo "Backend OK" || echo "Backend FAIL"
  sleep 10
done
```

#### Step 5: Cleanup Old Environment
```bash
# 1. Stop old services
docker stop codexos-backend codexos-frontend

# 2. Remove old containers
docker rm codexos-backend codexos-frontend

# 3. Rename green to production
docker rename codexos-backend-green codexos-backend
docker rename codexos-frontend-green codexos-frontend

# 4. Update port mappings
docker stop codexos-backend codexos-frontend
docker run -d --name codexos-backend \
  --network codexos_default \
  -p 8001:8000 \
  -e DATABASE_URL="postgresql+asyncpg://codexos:codexos_secure_password@codexos-postgres:5432/codexos_db" \
  -e REDIS_URL="redis://codexos-redis:6379/0" \
  -e WS_MESSAGE_QUEUE="redis://codexos-redis:6379/1" \
  -e SECRET_KEY="your-secret-key-change-in-production" \
  -e ENVIRONMENT="production" \
  codexos-backend:new

docker run -d --name codexos-frontend \
  --network codexos_default \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1 \
  -e NEXT_PUBLIC_WS_URL=ws://localhost:8001/ws \
  codexos-frontend:new
```

### Rolling Update Deployment

#### Step 1: Update Backend
```bash
# 1. Update one backend instance at a time
docker stop codexos-backend
docker rm codexos-backend

# 2. Deploy new version
docker run -d --name codexos-backend \
  --network codexos_default \
  -p 8001:8000 \
  -e DATABASE_URL="postgresql+asyncpg://codexos:codexos_secure_password@codexos-postgres:5432/codexos_db" \
  -e REDIS_URL="redis://codexos-redis:6379/0" \
  -e WS_MESSAGE_QUEUE="redis://codexos-redis:6379/1" \
  -e SECRET_KEY="your-secret-key-change-in-production" \
  -e ENVIRONMENT="production" \
  codexos-backend:new

# 3. Verify health
sleep 30
curl -f http://localhost:8001/health || exit 1
```

#### Step 2: Update Frontend
```bash
# 1. Update frontend
docker stop codexos-frontend
docker rm codexos-frontend

# 2. Deploy new version
docker run -d --name codexos-frontend \
  --network codexos_default \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1 \
  -e NEXT_PUBLIC_WS_URL=ws://localhost:8001/ws \
  codexos-frontend:new

# 3. Verify health
sleep 30
curl -f http://localhost:3000 || exit 1
```

## 🔄 Rollback Procedures

### Immediate Rollback (Service Down)
```bash
# 1. Stop new services
docker stop codexos-backend codexos-frontend

# 2. Restart old services
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
# 1. Check if database migration is reversible
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT version, name FROM alembic_version ORDER BY version DESC LIMIT 5;"

# 2. Rollback to previous version
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
-- Execute rollback SQL based on migration
-- This depends on your specific migration
"

# 3. Verify data integrity
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM agents;"
```

## ✅ Post-Deployment Verification

### Health Checks
```bash
# 1. Basic health
curl -f http://localhost:8001/health
curl -f http://localhost:3000

# 2. API endpoints
curl -f http://localhost:8001/api/v1/health
curl -f http://localhost:8001/api/v1/users/me

# 3. Database connectivity
docker exec codexos-postgres pg_isready -U codexos

# 4. Redis connectivity
docker exec codexos-redis redis-cli ping
```

### Performance Verification
```bash
# 1. Response time check
time curl -s http://localhost:8001/health > /dev/null

# 2. Load test (if available)
# ab -n 100 -c 10 http://localhost:8001/health

# 3. Memory usage check
docker stats --no-stream codexos-backend codexos-frontend
```

### Functional Testing
```bash
# 1. User authentication
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'

# 2. Agent creation (if applicable)
curl -X POST http://localhost:8001/api/v1/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"test-agent","description":"test"}'

# 3. Frontend functionality
# Open browser and test key user flows
```

## 📊 Monitoring During Deployment

### Key Metrics to Watch
- **Error Rate**: Should remain <1%
- **Response Time**: Should remain <2s
- **Memory Usage**: Should remain stable
- **Database Connections**: Should remain within limits
- **User Sessions**: Should remain active

### Alert Thresholds
```yaml
# Prometheus Alert Rules
groups:
- name: deployment_alerts
  rules:
  - alert: HighErrorRateDuringDeployment
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected during deployment"
  
  - alert: HighResponseTimeDuringDeployment
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected during deployment"
```

## 🚨 Emergency Procedures

### Service Unavailable
```bash
# 1. Immediate rollback
./rollback.sh

# 2. Notify stakeholders
echo "EMERGENCY: Service unavailable, rolling back to previous version" | \
  mail -s "CodexOS Deployment Emergency" ops@codexos.dev

# 3. Investigate root cause
docker logs codexos-backend --tail 200
docker logs codexos-frontend --tail 200
```

### Data Corruption
```bash
# 1. Stop all services
docker stop codexos-backend codexos-frontend

# 2. Restore from backup
docker exec codexos-postgres pg_restore -U codexos -d codexos_db --clean --if-exists /backups/postgres/latest/codexos_backup.dump

# 3. Restart services
docker start codexos-backend codexos-frontend

# 4. Verify data integrity
docker exec codexos-postgres psql -U codexos -d codexos_db -c "SELECT COUNT(*) FROM users;"
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Code review completed
- [ ] Tests passing in staging
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Rollback plan prepared
- [ ] Team notified

### During Deployment
- [ ] Health checks passing
- [ ] Performance metrics stable
- [ ] Error rate acceptable
- [ ] User sessions maintained
- [ ] Database connectivity stable

### Post-Deployment
- [ ] All health checks passing
- [ ] Performance benchmarks met
- [ ] Functional tests passing
- [ ] Monitoring alerts configured
- [ ] Team debrief completed
- [ ] Documentation updated

## 📚 References

- [CodexOS Architecture](../architecture.md)
- [Database Maintenance](database-maintenance.md)
- [Monitoring & Alerting](monitoring-alerting.md)
- [Backup & Recovery](backup-recovery.md)
- [CI/CD Pipeline](../ci-cd.md)
