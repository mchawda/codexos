# Monitoring & Alerting Runbook

> **📚 Docs ▸ Runbooks ▸ Operations**  
> **Last Updated**: $(date)  
> **Status**: Active


## Overview
This runbook covers monitoring setup, alert management, and incident response procedures for the CodexOS platform using Prometheus, Grafana, and custom monitoring.

## 🔍 Monitoring Architecture

### Components
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **CodexOS Backend**: Custom metrics and health checks
- **Redis**: Cache and WebSocket monitoring
- **PostgreSQL**: Database performance metrics

### Metrics Endpoints
- **Prometheus**: http://localhost:8001/metrics
- **Health Check**: http://localhost:8001/health
- **Detailed Health**: http://localhost:8001/health/detailed

## 📊 Key Metrics to Monitor

### System Health
```bash
# Check overall system health
curl -s http://localhost:8001/health | jq

# Check detailed health status
curl -s http://localhost:8001/health/detailed | jq

# Check Prometheus metrics
curl -s http://localhost:8001/metrics | grep -E "(http_requests_total|http_request_duration_seconds)"
```

### Database Metrics
```bash
# Check PostgreSQL connections
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT count(*) as active_connections,
       count(*) filter (where state = 'active') as active_queries
FROM pg_stat_activity;"

# Check Redis health
docker exec codexos-redis redis-cli ping
docker exec codexos-redis redis-cli info memory
```

### Application Metrics
```bash
# Check backend container status
docker ps | grep codexos-backend

# Check backend logs for errors
docker logs codexos-backend --tail 50 | grep -i error

# Check frontend accessibility
curl -s http://localhost:3000 | head -1
```

## 🚨 Alert Configuration

### Critical Alerts (P0)
- **Service Down**: Backend or frontend unreachable
- **Database Connection Failure**: Cannot connect to PostgreSQL
- **High Error Rate**: >5% error rate on API endpoints
- **Memory Exhaustion**: >90% memory usage

### Warning Alerts (P1)
- **High Response Time**: >2s average response time
- **High CPU Usage**: >80% CPU utilization
- **Disk Space**: >85% disk usage
- **Connection Pool**: >80% connection pool utilization

### Info Alerts (P2)
- **Backup Completion**: Daily backup status
- **Deployment**: New version deployment
- **Maintenance**: Scheduled maintenance windows

## 📈 Dashboard Setup

### System Overview Dashboard
```yaml
# Grafana Dashboard Configuration
title: "CodexOS System Overview"
panels:
  - title: "System Health"
    type: "stat"
    targets:
      - expr: "up{job=\"codexos-backend\"}"
  
  - title: "HTTP Request Rate"
    type: "graph"
    targets:
      - expr: "rate(http_requests_total[5m])"
  
  - title: "Response Time"
    type: "graph"
    targets:
      - expr: "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
```

### Database Dashboard
```yaml
# Database Performance Dashboard
panels:
  - title: "Active Connections"
    type: "stat"
    targets:
      - expr: "pg_stat_activity_count"
  
  - title: "Query Performance"
    type: "graph"
    targets:
      - expr: "rate(pg_stat_statements_total_time[5m])"
```

## 🔧 Alert Management

### Alert Routing
```yaml
# Alertmanager Configuration
route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'web.hook'
  routes:
  - match:
      severity: critical
    receiver: 'pager-duty'
    repeat_interval: 1h
  - match:
      severity: warning
    receiver: 'slack'
```

### Escalation Matrix
1. **Immediate (0-15 min)**: On-call engineer
2. **15-30 min**: Senior engineer
3. **30 min - 1 hour**: Engineering manager
4. **1+ hours**: CTO/VP Engineering

## 🚨 Incident Response

### Service Down Procedure
```bash
# 1. Verify the issue
curl -f http://localhost:8001/health || echo "Backend down"
curl -f http://localhost:3000 || echo "Frontend down"

# 2. Check container status
docker ps | grep -E "(codexos-backend|codexos-frontend)"

# 3. Check logs for errors
docker logs codexos-backend --tail 100
docker logs codexos-frontend --tail 100

# 4. Restart if necessary
docker restart codexos-backend
docker restart codexos-frontend

# 5. Verify recovery
sleep 30
curl -f http://localhost:8001/health
```

### High Error Rate Procedure
```bash
# 1. Check error metrics
curl -s http://localhost:8001/metrics | grep http_requests_total

# 2. Analyze error patterns
docker logs codexos-backend --tail 200 | grep -i error

# 3. Check database connectivity
docker exec codexos-postgres pg_isready -U codexos

# 4. Check Redis connectivity
docker exec codexos-redis redis-cli ping

# 5. Restart services if needed
docker restart codexos-backend
```

### Performance Degradation Procedure
```bash
# 1. Check response times
curl -s http://localhost:8001/metrics | grep http_request_duration_seconds

# 2. Check database performance
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;"

# 3. Check resource usage
docker stats codexos-backend codexos-postgres codexos-redis

# 4. Optimize if necessary
docker exec codexos-postgres psql -U codexos -d codexos_db -c "ANALYZE;"
```

## 📋 Monitoring Checklist

### Daily Checks
- [ ] System health status
- [ ] Error rate monitoring
- [ ] Response time trends
- [ ] Resource utilization
- [ ] Alert acknowledgment

### Weekly Checks
- [ ] Dashboard review
- [ ] Alert rule validation
- [ ] Metric retention policy
- [ ] Performance baseline updates
- [ ] Capacity planning review

### Monthly Checks
- [ ] Alert effectiveness review
- [ ] Dashboard optimization
- [ ] Monitoring coverage gaps
- [ ] Tool updates and patches
- [ ] Documentation updates

## 🛠️ Troubleshooting

### Common Issues

#### Prometheus Not Scraping
```bash
# Check Prometheus configuration
docker exec codexos-backend cat /app/prometheus.yml

# Verify targets are up
curl -s http://localhost:8001/metrics | head -5

# Check firewall rules
netstat -tlnp | grep :8001
```

#### Grafana Dashboard Issues
```bash
# Check Grafana connectivity
curl -f http://localhost:3000/api/health

# Verify data source configuration
# Check Prometheus data source URL and credentials
```

#### High Memory Usage
```bash
# Check container memory usage
docker stats --no-stream

# Check for memory leaks
docker exec codexos-backend ps aux | grep python

# Restart if necessary
docker restart codexos-backend
```

## 📚 References

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [CodexOS Monitoring Service](../architecture.md#monitoring)
- [Alerting Policy](../security.md#incident-response)
- [System Architecture](../architecture.md)
