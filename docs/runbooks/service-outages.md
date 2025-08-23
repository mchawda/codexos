# Service Outages Runbook

> **📚 Docs ▸ Runbooks ▸ Incident Response**  
> **Last Updated**: $(date)  
> **Status**: Active


## Overview
This runbook provides procedures for responding to service outages, system failures, and availability issues in the CodexOS platform.

## 🚨 Outage Classification

### Severity Levels
- **P0 (Critical)**: Complete service unavailability, all users affected
- **P1 (High)**: Major functionality down, significant user impact
- **P2 (Medium)**: Partial functionality affected, limited user impact
- **P3 (Low)**: Minor issues, minimal user impact

### Outage Types
- **Complete Outage**: All services unavailable
- **Partial Outage**: Some services affected
- **Performance Degradation**: Slow response times
- **Database Outage**: Database connectivity issues
- **Network Outage**: Connectivity problems
- **Infrastructure Outage**: Host system issues

## 🚨 Immediate Response (First 5 Minutes)

### P0/P1 Outages
```bash
# 1. IMMEDIATELY assess scope
curl -f http://localhost:8001/health || echo "Backend down"
curl -f http://localhost:3000 || echo "Frontend down"
docker ps | grep -E "(codexos-backend|codexos-frontend|codexos-postgres|codexos-redis)"

# 2. Document outage
echo "SERVICE OUTAGE: $(date)" >> /var/log/service-outage.log
echo "Type: $OUTAGE_TYPE" >> /var/log/service-outage.log
echo "Severity: $SEVERITY" >> /var/log/service-outage.log
echo "Scope: $SCOPE" >> /var/log/service-outage.log

# 3. Notify on-call team
echo "URGENT: Service outage detected" | \
  mail -s "SERVICE OUTAGE - IMMEDIATE ACTION REQUIRED" ops@codexos.dev

# 4. Update status page
echo "Investigating service issues" > /var/www/status.txt
```

### P2/P3 Outages
```bash
# 1. Document issue
echo "Service Issue: $(date)" >> /var/log/service-issues.log
echo "Type: $ISSUE_TYPE" >> /var/log/service-issues.log
echo "Severity: $SEVERITY" >> /var/log/service-issues.log

# 2. Begin investigation
# Continue monitoring while investigating
```

## 🔍 Outage Investigation

### System Health Check
```bash
# 1. Check all container statuses
docker ps -a

# 2. Check container health
docker exec codexos-backend pg_isready -U codexos || echo "PostgreSQL not ready"
docker exec codexos-redis redis-cli ping || echo "Redis not responding"

# 3. Check resource usage
docker stats --no-stream

# 4. Check disk space
df -h
docker system df
```

### Service-Specific Checks

#### Backend Service
```bash
# 1. Check backend logs
docker logs codexos-backend --tail 100

# 2. Check backend process
docker exec codexos-backend ps aux | grep python

# 3. Check backend connectivity
curl -v http://localhost:8001/health
curl -v http://localhost:8001/api/v1/health

# 4. Check backend metrics
curl -s http://localhost:8001/metrics | head -20
```

#### Frontend Service
```bash
# 1. Check frontend logs
docker logs codexos-frontend --tail 100

# 2. Check frontend process
docker exec codexos-frontend ps aux | grep node

# 3. Check frontend connectivity
curl -v http://localhost:3000
curl -v http://localhost:3000/api/health

# 4. Check frontend build
docker exec codexos-frontend ls -la /app/.next/
```

#### Database Service
```bash
# 1. Check PostgreSQL status
docker exec codexos-postgres pg_isready -U codexos

# 2. Check PostgreSQL logs
docker logs codexos-postgres --tail 100

# 3. Check database connections
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT count(*) as active_connections,
       count(*) filter (where state = 'active') as active_queries
FROM pg_stat_activity;"

# 4. Check database performance
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;"
```

#### Redis Service
```bash
# 1. Check Redis status
docker exec codexos-redis redis-cli ping

# 2. Check Redis logs
docker logs codexos-redis --tail 100

# 3. Check Redis memory
docker exec codexos-redis redis-cli info memory

# 4. Check Redis connections
docker exec codexos-redis redis-cli info clients
```

## 🛠️ Outage Resolution

### Service Restart Procedures

#### Backend Restart
```bash
# 1. Stop backend
docker stop codexos-backend

# 2. Remove container
docker rm codexos-backend

# 3. Start backend
docker run -d --name codexos-backend \
  --network codexos_default \
  -p 8001:8000 \
  -e DATABASE_URL="postgresql+asyncpg://codexos:codexos_secure_password@codexos-postgres:5432/codexos_db" \
  -e REDIS_URL="redis://codexos-redis:6379/0" \
  -e WS_MESSAGE_QUEUE="redis://codexos-redis:6379/1" \
  -e SECRET_KEY="your-secret-key-change-in-production" \
  -e ENVIRONMENT="production" \
  codexos-backend:latest

# 4. Wait for health check
sleep 30
curl -f http://localhost:8001/health || echo "Backend still not healthy"
```

#### Frontend Restart
```bash
# 1. Stop frontend
docker stop codexos-frontend

# 2. Remove container
docker rm codexos-frontend

# 3. Start frontend
docker run -d --name codexos-frontend \
  --network codexos_default \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1 \
  -e NEXT_PUBLIC_WS_URL=ws://localhost:8001/ws \
  codexos-frontend:latest

# 4. Wait for health check
sleep 30
curl -f http://localhost:3000 || echo "Frontend still not healthy"
```

#### Database Restart
```bash
# 1. Stop PostgreSQL
docker stop codexos-postgres

# 2. Start PostgreSQL
docker run -d --name codexos-postgres \
  -e POSTGRES_USER=codexos \
  -e POSTGRES_PASSWORD=codexos_secure_password \
  -e POSTGRES_DB=codexos_db \
  -p 5432:5432 \
  postgres:16-alpine

# 3. Wait for database to be ready
sleep 30
docker exec codexos-postgres pg_isready -U codexos

# 4. Verify database connectivity
docker exec codexos-postgres psql -U codexos -d codexos_db -c "SELECT 1;"
```

#### Redis Restart
```bash
# 1. Stop Redis
docker stop codexos-redis

# 2. Start Redis
docker run -d --name codexos-redis -p 6379:6379 redis:7-alpine

# 3. Wait for Redis to be ready
sleep 10
docker exec codexos-redis redis-cli ping

# 4. Verify Redis connectivity
docker exec codexos-redis redis-cli set test "value"
docker exec codexos-redis redis-cli get test
```

### Infrastructure Issues

#### Disk Space Issues
```bash
# 1. Check disk usage
df -h
du -sh /*

# 2. Clean up Docker
docker system prune -f
docker volume prune -f

# 3. Clean up logs
find /var/log -name "*.log" -size +100M -exec truncate -s 0 {} \;

# 4. Clean up backups
find /backups -type f -mtime +7 -delete
```

#### Memory Issues
```bash
# 1. Check memory usage
free -h
docker stats --no-stream

# 2. Restart memory-intensive services
docker restart codexos-backend

# 3. Check for memory leaks
docker exec codexos-backend ps aux | grep python
docker exec codexos-frontend ps aux | grep node

# 4. Adjust memory limits if needed
docker update --memory 1g codexos-backend
docker update --memory 512m codexos-frontend
```

#### Network Issues
```bash
# 1. Check network connectivity
ping -c 3 8.8.8.8
nslookup google.com

# 2. Check Docker network
docker network ls
docker network inspect codexos_default

# 3. Check port availability
netstat -tlnp | grep -E "(3000|8001|5432|6379)"

# 4. Restart network if needed
docker network disconnect codexos_default codexos-backend
docker network connect codexos_default codexos-backend
```

## 📊 Outage Monitoring

### Key Metrics to Watch
- **Service Availability**: Should be >99.9%
- **Response Time**: Should be <2s
- **Error Rate**: Should be <1%
- **Database Connections**: Should be within limits
- **Memory Usage**: Should be <80%

### Alert Thresholds
```yaml
# Prometheus Alert Rules
groups:
- name: outage_alerts
  rules:
  - alert: ServiceDown
    expr: up{job="codexos-backend"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Backend service is down"
  
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High error rate detected"
  
  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected"
```

## 🔄 Recovery Verification

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
docker exec codexos-redis redis-cli set test_key "test_value"
docker exec codexos-redis redis-cli get test_key
```

### Performance Verification
```bash
# 1. Check response times
time curl -s http://localhost:8001/health > /dev/null

# 2. Check resource usage
docker stats --no-stream

# 3. Check database performance
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 5;"

# 4. Check API metrics
curl -s http://localhost:8001/metrics | grep -E "(http_requests_total|http_request_duration_seconds)"
```

## 📋 Outage Checklist

### Detection & Assessment
- [ ] Outage detected and classified
- [ ] Initial scope assessment completed
- [ ] On-call team notified
- [ ] Status page updated
- [ ] Stakeholders informed

### Investigation
- [ ] System health check completed
- [ ] Root cause identified
- [ ] Impact assessment completed
- [ ] Resolution plan developed
- [ ] Team briefed on plan

### Resolution
- [ ] Immediate fixes applied
- [ ] Services restarted if needed
- [ ] Infrastructure issues resolved
- [ ] Configuration updated if needed
- [ ] Monitoring enhanced

### Recovery
- [ ] All services verified healthy
- [ ] Performance benchmarks met
- [ ] User functionality tested
- [ ] Monitoring alerts configured
- [ ] Status page updated

### Post-Outage
- [ ] Incident report prepared
- [ ] Root cause analysis completed
- [ ] Prevention measures implemented
- [ ] Team debrief completed
- [ ] Documentation updated

## 🚨 Communication Procedures

### Internal Communication
```bash
# 1. Immediate notification
echo "SERVICE OUTAGE DETECTED" | \
  mail -s "URGENT: Service Outage" \
  -c "ops@codexos.dev,management@codexos.dev" \
  incident-response@codexos.dev

# 2. Status updates
echo "Status Update: $(date)" | \
  mail -s "Service Outage Status Update" \
  -c "ops@codexos.dev" \
  incident-response@codexos.dev

# 3. Resolution notification
echo "Service Restored: $(date)" | \
  mail -s "Service Outage Resolved" \
  -c "ops@codexos.dev,management@codexos.dev" \
  incident-response@codexos.dev
```

### External Communication
```bash
# 1. Status page update
cat > /var/www/status.txt << EOF
Service Status: INVESTIGATING
Issue: We are currently experiencing service issues
Impact: Some users may experience delays or errors
Updates: We will provide updates as more information becomes available
EOF

# 2. Customer notification (if major outage)
cat > customer_notification.txt << EOF
Dear CodexOS Customer,

We are currently experiencing service issues that may affect your experience.
Our team is actively working to resolve this issue.

We apologize for any inconvenience and will provide updates as the situation progresses.

CodexOS Operations Team
EOF
```

## 📚 References

- [CodexOS Architecture](../architecture.md)
- [Monitoring & Alerting](monitoring-alerting.md)
- [Database Maintenance](database-maintenance.md)
- [Backup & Recovery](backup-recovery.md)
- [Deployment Procedures](deployment.md)
- [System Health Monitoring](../monitoring.md)
