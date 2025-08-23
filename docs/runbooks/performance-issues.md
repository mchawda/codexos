# Performance Issues Runbook

> **📚 Docs ▸ Runbooks ▸ Incident Response**  
> **Last Updated**: $(date)  
> **Status**: Active


## Overview
This runbook provides procedures for identifying, diagnosing, and resolving performance issues in the CodexOS platform, including slow response times, high resource usage, and scalability problems.

## 🚨 Performance Issue Classification

### Severity Levels
- **P0 (Critical)**: System unusable, response times >10s, all users affected
- **P1 (High)**: Major performance degradation, response times >5s, significant user impact
- **P2 (Medium)**: Moderate performance issues, response times >2s, limited user impact
- **P3 (Low)**: Minor performance issues, response times >1s, minimal user impact

### Performance Issue Types
- **High Response Time**: Slow API responses, slow page loads
- **High Resource Usage**: Excessive CPU, memory, or disk usage
- **Database Performance**: Slow queries, connection pool exhaustion
- **Cache Performance**: Redis memory issues, cache misses
- **Network Performance**: Bandwidth issues, latency problems
- **Scalability Issues**: System unable to handle load

## 🔍 Performance Investigation

### Initial Assessment
```bash
# 1. Check current performance metrics
curl -s http://localhost:8001/metrics | grep -E "(http_request_duration_seconds|http_requests_total)"

# 2. Check system resources
docker stats --no-stream
free -h
df -h

# 3. Check service health
curl -f http://localhost:8001/health
curl -f http://localhost:3000

# 4. Check response times
time curl -s http://localhost:8001/health > /dev/null
time curl -s http://localhost:3000 > /dev/null
```

### Response Time Analysis
```bash
# 1. Check API response times
curl -s http://localhost:8001/metrics | grep http_request_duration_seconds

# 2. Check specific endpoint performance
for endpoint in health users agents; do
  echo "Testing $endpoint endpoint:"
  time curl -s http://localhost:8001/api/v1/$endpoint > /dev/null
done

# 3. Check frontend performance
curl -s http://localhost:3000 | grep -o 'src="[^"]*"' | head -5

# 4. Check WebSocket performance
# Monitor WebSocket connection latency
```

### Resource Usage Analysis

#### CPU Usage
```bash
# 1. Check container CPU usage
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# 2. Check process CPU usage
docker exec codexos-backend ps aux --sort=-%cpu | head -10
docker exec codexos-frontend ps aux --sort=-%cpu | head -10

# 3. Check system CPU usage
top -bn1 | grep "Cpu(s)"
htop -d 1 -n 1
```

#### Memory Usage
```bash
# 1. Check container memory usage
docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}\t{{.MemPerc}}"

# 2. Check process memory usage
docker exec codexos-backend ps aux --sort=-%mem | head -10
docker exec codexos-frontend ps aux --sort=-%mem | head -10

# 3. Check system memory usage
free -h
cat /proc/meminfo | grep -E "(MemTotal|MemFree|MemAvailable)"

# 4. Check for memory leaks
docker exec codexos-backend python -c "
import psutil
import os
process = psutil.Process(os.getpid())
print(f'Memory usage: {process.memory_info().rss / 1024 / 1024:.2f} MB')"
```

#### Disk Usage
```bash
# 1. Check disk space
df -h
du -sh /*

# 2. Check Docker disk usage
docker system df
docker volume ls -q | xargs -I {} docker run --rm -v {}:/vol busybox du -sh /vol

# 3. Check log file sizes
find /var/log -name "*.log" -exec ls -lh {} \;
find /var/lib/docker/containers -name "*.log" -exec ls -lh {} \;

# 4. Check database disk usage
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;"
```

### Database Performance Analysis
```bash
# 1. Check slow queries
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;"

# 2. Check connection pool usage
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT 
  count(*) as active_connections,
  count(*) filter (where state = 'active') as active_queries,
  count(*) filter (where state = 'idle') as idle_connections
FROM pg_stat_activity;"

# 3. Check table statistics
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT 
  schemaname,
  tablename,
  n_tup_ins,
  n_tup_upd,
  n_tup_del,
  n_live_tup,
  n_dead_tup,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;"

# 4. Check index usage
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;"
```

### Cache Performance Analysis
```bash
# 1. Check Redis memory usage
docker exec codexos-redis redis-cli info memory

# 2. Check Redis performance
docker exec codexos-redis redis-cli info stats

# 3. Check Redis keys
docker exec codexos-redis redis-cli dbsize
docker exec codexos-redis redis-cli info keyspace

# 4. Check Redis latency
docker exec codexos-redis redis-cli --latency
docker exec codexos-redis redis-cli --latency-history
```

## 🛠️ Performance Resolution

### Immediate Fixes

#### High Response Time
```bash
# 1. Restart services if needed
docker restart codexos-backend
docker restart codexos-frontend

# 2. Clear Redis cache if necessary
docker exec codexos-redis redis-cli flushall

# 3. Restart database if needed
docker restart codexos-postgres

# 4. Check for stuck processes
docker exec codexos-backend pkill -f "python.*uvicorn"
docker exec codexos-frontend pkill -f "node.*next"
```

#### High Resource Usage
```bash
# 1. Check for memory leaks
docker exec codexos-backend ps aux | grep python
docker exec codexos-frontend ps aux | grep node

# 2. Restart memory-intensive services
docker restart codexos-backend

# 3. Adjust resource limits
docker update --memory 1g --cpus 1.0 codexos-backend
docker update --memory 512m --cpus 0.5 codexos-frontend

# 4. Clean up system resources
docker system prune -f
docker volume prune -f
```

### Database Performance Optimization
```bash
# 1. Analyze tables for query planner
docker exec codexos-postgres psql -U codexos -d codexos_db -c "ANALYZE VERBOSE;"

# 2. Vacuum tables to remove dead tuples
docker exec codexos-postgres psql -U codexos -d codexos_db -c "VACUUM VERBOSE;"

# 3. Check for long-running queries
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND query NOT LIKE '%pg_stat_activity%'
ORDER BY duration DESC;"

# 4. Terminate long-running queries if necessary
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT pg_terminate_backend(pid) FROM pg_stat_activity
WHERE state = 'active' 
AND query NOT LIKE '%pg_stat_activity%'
AND now() - query_start > interval '5 minutes';"
```

### Cache Performance Optimization
```bash
# 1. Check Redis memory policy
docker exec codexos-redis redis-cli config get maxmemory-policy

# 2. Set appropriate memory limits
docker exec codexos-redis redis-cli config set maxmemory 512mb
docker exec codexos-redis redis-cli config set maxmemory-policy allkeys-lru

# 3. Monitor cache hit rate
docker exec codexos-redis redis-cli info stats | grep -E "(keyspace_hits|keyspace_misses)"

# 4. Clear old cache entries
docker exec codexos-redis redis-cli --scan --pattern "*:old:*" | xargs -r redis-cli del
```

### Application Performance Optimization
```bash
# 1. Check for memory leaks in backend
docker exec codexos-backend python -c "
import gc
import sys
print(f'Objects before GC: {len(gc.get_objects())}')
gc.collect()
print(f'Objects after GC: {len(gc.get_objects())}')"

# 2. Check for memory leaks in frontend
docker exec codexos-frontend node -e "
const used = process.memoryUsage();
console.log('Memory usage:', {
  rss: Math.round(used.rss / 1024 / 1024) + ' MB',
  heapTotal: Math.round(used.heapTotal / 1024 / 1024) + ' MB',
  heapUsed: Math.round(used.heapUsed / 1024 / 1024) + ' MB'
});"

# 3. Restart services with optimized settings
docker run -d --name codexos-backend-optimized \
  --network codexos_default \
  -p 8001:8000 \
  -e DATABASE_URL="postgresql+asyncpg://codexos:codexos_secure_password@codexos-postgres:5432/codexos_db" \
  -e REDIS_URL="redis://codexos-redis:6379/0" \
  -e WS_MESSAGE_QUEUE="redis://codexos-redis:6379/1" \
  -e SECRET_KEY="your-secret-key-change-in-production" \
  -e ENVIRONMENT="production" \
  -e WORKERS="2" \
  -e MAX_REQUESTS="1000" \
  -e MAX_REQUESTS_JITTER="100" \
  codexos-backend:latest
```

## 📊 Performance Monitoring

### Key Performance Indicators
- **Response Time**: Target <2s for 95th percentile
- **Throughput**: Target >1000 requests/second
- **Error Rate**: Target <1%
- **Resource Usage**: CPU <80%, Memory <80%, Disk <85%
- **Database Performance**: Query time <100ms average
- **Cache Hit Rate**: Target >90%

### Performance Alerts
```yaml
# Prometheus Alert Rules
groups:
- name: performance_alerts
  rules:
  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected"
  
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High error rate detected"
  
  - alert: HighCPUUsage
    expr: container_cpu_usage_seconds_total{container="codexos-backend"} > 0.8
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High CPU usage detected"
  
  - alert: HighMemoryUsage
    expr: container_memory_usage_bytes{container="codexos-backend"} / container_spec_memory_limit_bytes{container="codexos-backend"} > 0.8
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage detected"
```

## 🔄 Performance Testing

### Load Testing
```bash
# 1. Install Apache Bench (if available)
# apt-get install apache2-utils

# 2. Test backend performance
ab -n 1000 -c 10 http://localhost:8001/health

# 3. Test frontend performance
ab -n 1000 -c 10 http://localhost:3000

# 4. Test API endpoints
ab -n 500 -c 5 -H "Content-Type: application/json" \
  -p test_data.json http://localhost:8001/api/v1/users

# 5. Monitor system resources during test
docker stats --no-stream &
ab -n 1000 -c 20 http://localhost:8001/health
kill %1
```

### Stress Testing
```bash
# 1. Test database performance
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT pg_sleep(1);"

# 2. Test Redis performance
docker exec codexos-redis redis-cli --eval - << EOF
for i=1,1000 do
  redis.call('SET', 'test:' .. i, 'value:' .. i)
end
EOF

# 3. Test concurrent connections
for i in {1..100}; do
  curl -s http://localhost:8001/health > /dev/null &
done
wait
```

## 📋 Performance Checklist

### Investigation
- [ ] Performance issue identified and classified
- [ ] Initial metrics collected
- [ ] Root cause analysis initiated
- [ ] Impact assessment completed
- [ ] Resolution plan developed

### Resolution
- [ ] Immediate fixes applied
- [ ] Performance optimizations implemented
- [ ] Resource limits adjusted
- [ ] Monitoring enhanced
- [ ] Performance testing completed

### Verification
- [ ] Performance benchmarks met
- [ ] Response times improved
- [ ] Resource usage optimized
- [ ] User experience verified
- [ ] Monitoring alerts configured

### Post-Resolution
- [ ] Performance analysis completed
- [ ] Optimization recommendations documented
- [ ] Team debrief completed
- [ ] Documentation updated
- [ ] Follow-up monitoring scheduled

## 🚨 Communication Procedures

### Internal Communication
```bash
# 1. Performance issue notification
echo "PERFORMANCE ISSUE DETECTED" | \
  mail -s "Performance Issue Alert" \
  -c "ops@codexos.dev,dev@codexos.dev" \
  performance@codexos.dev

# 2. Status updates
echo "Performance Update: $(date)" | \
  mail -s "Performance Issue Status Update" \
  -c "ops@codexos.dev" \
  performance@codexos.dev

# 3. Resolution notification
echo "Performance Issue Resolved: $(date)" | \
  mail -s "Performance Issue Resolved" \
  -c "ops@codexos.dev,dev@codexos.dev" \
  performance@codexos.dev
```

### External Communication
```bash
# 1. Status page update (if major issue)
cat > /var/www/status.txt << EOF
Service Status: PERFORMANCE ISSUES
Issue: We are experiencing performance issues
Impact: Some users may experience slower response times
Updates: We are actively working to improve performance
EOF

# 2. Customer notification (if significant impact)
cat > customer_notification.txt << EOF
Dear CodexOS Customer,

We are currently experiencing performance issues that may affect your experience.
Our team is actively working to resolve these issues and improve system performance.

We apologize for any inconvenience and will provide updates as the situation progresses.

CodexOS Operations Team
EOF
```

## 📚 References

- [CodexOS Architecture](../architecture.md)
- [Monitoring & Alerting](monitoring-alerting.md)
- [Database Maintenance](database-maintenance.md)
- [Service Outages](service-outages.md)
- [Performance Best Practices](../performance.md)
- [System Monitoring](../monitoring.md)
