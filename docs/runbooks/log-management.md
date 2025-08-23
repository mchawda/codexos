# Log Management Runbook

> **📚 Docs ▸ Runbooks ▸ Maintenance**  
> **Last Updated**: $(date)  
> **Status**: Active


## Overview
This runbook provides procedures for managing logs across the CodexOS platform, including log collection, rotation, archival, analysis, and troubleshooting.

## 🔍 Log Inventory

### Log Sources
- **Application Logs**: Backend, frontend, and service logs
- **System Logs**: Operating system, Docker, and infrastructure logs
- **Database Logs**: PostgreSQL query logs and system logs
- **Access Logs**: Web server and API access logs
- **Security Logs**: Authentication, authorization, and audit logs

### Log Locations
```bash
# 1. Application logs
docker logs codexos-backend
docker logs codexos-frontend

# 2. System logs
tail -f /var/log/syslog
tail -f /var/log/auth.log
tail -f /var/log/docker.log

# 3. Database logs
docker exec codexos-postgres tail -f /var/log/postgresql/postgresql-*.log

# 4. Container logs
ls -la /var/lib/docker/containers/*/logs/

# 5. Application-specific logs
ls -la /var/log/codexos/
ls -la /app/logs/
```

### Log Formats
```bash
# 1. Check log format
docker logs codexos-backend --tail 5

# 2. Check JSON logs
docker logs codexos-backend --tail 5 | jq .

# 3. Check structured logs
docker logs codexos-backend --tail 5 | grep -o '{"[^}]*}'

# 4. Check timestamp format
docker logs codexos-backend --tail 5 | grep -o '^\d{4}-\d{2}-\d{2}'
```

## 🔧 Log Configuration

### Application Logging

#### Backend Logging
```bash
# 1. Check current logging configuration
docker exec codexos-backend cat /app/.env | grep -i log

# 2. Configure logging levels
docker exec codexos-backend sh -c "
echo 'LOG_LEVEL=INFO' >> /app/.env
echo 'LOG_FORMAT=json' >> /app/.env
echo 'LOG_FILE=/app/logs/app.log' >> /app/.env
echo 'LOG_MAX_SIZE=100MB' >> /app/.env
echo 'LOG_BACKUP_COUNT=5' >> /app/.env"

# 3. Create log directory
docker exec codexos-backend mkdir -p /app/logs

# 4. Restart backend
docker restart codexos-backend

# 5. Verify logging
docker logs codexos-backend --tail 10
```

#### Frontend Logging
```bash
# 1. Configure Next.js logging
docker exec codexos-frontend sh -c "
echo 'NEXT_PUBLIC_LOG_LEVEL=info' >> /app/.env
echo 'NEXT_PUBLIC_LOG_ENABLED=true' >> /app/.env"

# 2. Create log directory
docker exec codexos-frontend mkdir -p /app/logs

# 3. Restart frontend
docker restart codexos-frontend

# 4. Verify logging
docker logs codexos-frontend --tail 10
```

### System Logging

#### Docker Logging
```bash
# 1. Configure Docker daemon logging
sudo tee /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  }
}
EOF

# 2. Restart Docker
sudo systemctl restart docker

# 3. Verify configuration
docker info | grep -i log
```

#### PostgreSQL Logging
```bash
# 1. Configure PostgreSQL logging
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = on;
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_checkpoints = on;
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;
ALTER SYSTEM SET log_lock_waits = on;
ALTER SYSTEM SET log_temp_files = 0;"

# 2. Reload configuration
docker exec codexos-postgres psql -U codexos -d codexos_db -c "SELECT pg_reload_conf();"

# 3. Verify logging
docker exec codexos-postgres tail -f /var/log/postgresql/postgresql-*.log
```

## 📊 Log Collection

### Centralized Logging

#### Log Aggregation Setup
```bash
# 1. Install log aggregation tools
sudo apt-get update
sudo apt-get install -y rsyslog logrotate

# 2. Configure rsyslog for Docker
sudo tee /etc/rsyslog.d/30-docker.conf << EOF
# Docker container logs
:programname, contains, "docker" /var/log/docker.log
& stop

# Application logs
:programname, contains, "codexos" /var/log/codexos.log
& stop
EOF

# 3. Restart rsyslog
sudo systemctl restart rsyslog

# 4. Verify configuration
sudo systemctl status rsyslog
```

#### Log Forwarding
```bash
# 1. Configure log forwarding to external system
sudo tee /etc/rsyslog.d/40-forward.conf << EOF
# Forward logs to external log server
*.* @logserver.codexos.dev:514
EOF

# 2. Test log forwarding
logger -t test "Test log message from CodexOS"

# 3. Restart rsyslog
sudo systemctl restart rsyslog
```

### Log Parsing and Analysis

#### Log Parsing Scripts
```bash
#!/bin/bash
# /scripts/parse-logs.sh

# Parse application logs
parse_app_logs() {
  echo "=== Application Logs Analysis ===" > /var/log/analysis/app_$(date +%Y%m%d).log
  
  # Parse backend logs
  docker logs codexos-backend --since 24h | \
    grep -E "(ERROR|WARN|CRITICAL)" | \
    awk '{print $1, $2, $3, $4, $5}' | \
    sort | uniq -c | sort -nr >> /var/log/analysis/app_$(date +%Y%m%d).log
  
  # Parse frontend logs
  docker logs codexos-frontend --since 24h | \
    grep -E "(error|warn|critical)" | \
    awk '{print $1, $2, $3, $4, $5}' | \
    sort | uniq -c | sort -nr >> /var/log/analysis/app_$(date +%Y%m%d).log
}

# Parse system logs
parse_system_logs() {
  echo "=== System Logs Analysis ===" > /var/log/analysis/system_$(date +%Y%m%d).log
  
  # Parse system errors
  grep -i error /var/log/syslog | \
    awk '{print $1, $2, $3, $5}' | \
    sort | uniq -c | sort -nr >> /var/log/analysis/system_$(date +%Y%m%d).log
  
  # Parse authentication logs
  grep -E "(failed|invalid|unauthorized)" /var/log/auth.log | \
    awk '{print $1, $2, $3, $5, $6}' | \
    sort | uniq -c | sort -nr >> /var/log/analysis/system_$(date +%Y%m%d).log
}

# Parse database logs
parse_db_logs() {
  echo "=== Database Logs Analysis ===" > /var/log/analysis/db_$(date +%Y%m%d).log
  
  # Parse slow queries
  docker exec codexos-postgres psql -U codexos -d codexos_db -c "
  SELECT query, mean_time, calls, total_time
  FROM pg_stat_statements
  WHERE mean_time > 1000
  ORDER BY mean_time DESC
  LIMIT 20;" >> /var/log/analysis/db_$(date +%Y%m%d).log
}

# Main execution
parse_app_logs
parse_system_logs
parse_db_logs

echo "Log analysis completed at $(date)" >> /var/log/analysis/analysis_$(date +%Y%m%d).log
```

## 🔄 Log Rotation

### Application Log Rotation
```bash
# 1. Configure logrotate for application logs
sudo tee /etc/logrotate.d/codexos << EOF
/var/log/codexos/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 codexos codexos
    postrotate
        docker restart codexos-backend codexos-frontend
    endscript
}
EOF

# 2. Test logrotate configuration
sudo logrotate -d /etc/logrotate.d/codexos

# 3. Force log rotation
sudo logrotate -f /etc/logrotate.d/codexos
```

### System Log Rotation
```bash
# 1. Configure system log rotation
sudo tee /etc/logrotate.d/system << EOF
/var/log/syslog {
    rotate 7
    daily
    missingok
    notifempty
    compress
    delaycompress
    postrotate
        /usr/lib/rsyslog/rsyslog-rotate
    endscript
}

/var/log/auth.log {
    rotate 7
    daily
    missingok
    notifempty
    compress
    delaycompress
    postrotate
        /usr/lib/rsyslog/rsyslog-rotate
    endscript
}
EOF

# 2. Test configuration
sudo logrotate -d /etc/logrotate.d/system

# 3. Apply rotation
sudo logrotate -f /etc/logrotate.d/system
```

### Docker Log Rotation
```bash
# 1. Configure Docker log rotation
sudo tee /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3",
    "compress": "true"
  }
}
EOF

# 2. Restart Docker
sudo systemctl restart docker

# 3. Verify configuration
docker info | grep -i log
```

## 📈 Log Analysis

### Real-time Log Monitoring
```bash
# 1. Monitor application logs in real-time
docker logs -f codexos-backend | grep -E "(ERROR|WARN|CRITICAL)"

# 2. Monitor system logs in real-time
tail -f /var/log/syslog | grep -i error

# 3. Monitor database logs in real-time
docker exec codexos-postgres tail -f /var/log/postgresql/postgresql-*.log

# 4. Monitor access logs in real-time
tail -f /var/log/nginx/access.log | grep -v health
```

### Log Search and Filtering
```bash
# 1. Search for specific errors
grep -r "ERROR" /var/log/codexos/
grep -r "Exception" /var/log/codexos/

# 2. Search by time range
find /var/log/codexos/ -name "*.log" -newermt "2024-01-15" -exec grep -l "ERROR" {} \;

# 3. Search for specific user activity
grep "user@example.com" /var/log/codexos/*.log

# 4. Search for specific API endpoints
grep "POST /api/v1/auth/login" /var/log/codexos/*.log
```

### Log Statistics and Reporting
```bash
#!/bin/bash
# /scripts/log-report.sh

# Generate daily log report
generate_log_report() {
  REPORT_FILE="/var/log/reports/daily_$(date +%Y%m%d).md"
  
  echo "# CodexOS Daily Log Report - $(date)" > "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  
  # Error summary
  echo "## Error Summary" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  
  ERROR_COUNT=$(grep -r "ERROR" /var/log/codexos/ | wc -l)
  WARN_COUNT=$(grep -r "WARN" /var/log/codexos/ | wc -l)
  CRITICAL_COUNT=$(grep -r "CRITICAL" /var/log/codexos/ | wc -l)
  
  echo "- Errors: $ERROR_COUNT" >> "$REPORT_FILE"
  echo "- Warnings: $WARN_COUNT" >> "$REPORT_FILE"
  echo "- Critical: $CRITICAL_COUNT" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  
  # Top error messages
  echo "## Top Error Messages" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  
  grep -r "ERROR" /var/log/codexos/ | \
    awk '{print $NF}' | \
    sort | uniq -c | sort -nr | head -10 | \
    while read count message; do
      echo "- $count: $message" >> "$REPORT_FILE"
    done
  
  echo "" >> "$REPORT_FILE"
  
  # Performance metrics
  echo "## Performance Metrics" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  
  # Average response time
  AVG_RESPONSE=$(grep "response_time" /var/log/codexos/*.log | \
    awk '{sum+=$NF; count++} END {print sum/count}')
  echo "- Average Response Time: ${AVG_RESPONSE}ms" >> "$REPORT_FILE"
  
  # Request count
  REQUEST_COUNT=$(grep "request" /var/log/codexos/*.log | wc -l)
  echo "- Total Requests: $REQUEST_COUNT" >> "$REPORT_FILE"
  
  echo "" >> "$REPORT_FILE"
  echo "Report generated at $(date)" >> "$REPORT_FILE"
}

# Execute report generation
generate_log_report
echo "Daily log report generated: /var/log/reports/daily_$(date +%Y%m%d).md"
```

## 🚨 Log Troubleshooting

### Common Log Issues

#### Missing Logs
```bash
# 1. Check log file permissions
ls -la /var/log/codexos/
ls -la /app/logs/

# 2. Check disk space
df -h /var/log
df -h /app

# 3. Check log rotation
sudo logrotate -d /etc/logrotate.d/codexos

# 4. Check application logging configuration
docker exec codexos-backend env | grep -i log
docker exec codexos-frontend env | grep -i log
```

#### High Log Volume
```bash
# 1. Check log file sizes
du -sh /var/log/codexos/*
du -sh /app/logs/*

# 2. Identify high-volume log sources
find /var/log/codexos/ -name "*.log" -exec wc -l {} \; | sort -nr

# 3. Adjust log levels
docker exec codexos-backend sh -c "echo 'LOG_LEVEL=WARN' > /app/.env"
docker exec codexos-frontend sh -c "echo 'NEXT_PUBLIC_LOG_LEVEL=warn' > /app/.env"

# 4. Restart services
docker restart codexos-backend codexos-frontend
```

#### Corrupted Log Files
```bash
# 1. Check for corrupted log files
for logfile in /var/log/codexos/*.log; do
  if ! tail -1 "$logfile" > /dev/null 2>&1; then
    echo "Corrupted log file: $logfile"
  fi
done

# 2. Repair corrupted files
for logfile in /var/log/codexos/*.log; do
  if ! tail -1 "$logfile" > /dev/null 2>&1; then
    echo "Repairing: $logfile"
    tail -n +1 "$logfile" | head -n $(($(wc -l < "$logfile") - 1)) > "${logfile}.tmp"
    mv "${logfile}.tmp" "$logfile"
  fi
done

# 3. Verify repair
for logfile in /var/log/codexos/*.log; do
  if tail -1 "$logfile" > /dev/null 2>&1; then
    echo "✓ $logfile is valid"
  else
    echo "✗ $logfile is still corrupted"
  fi
done
```

## 📊 Log Monitoring

### Log Health Monitoring
```yaml
# Prometheus Alert Rules
groups:
- name: log_monitoring
  rules:
  - alert: HighErrorRate
    expr: rate(log_errors_total[5m]) > 10
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High error rate in logs"
  
  - alert: LogFileFull
    expr: log_file_size_bytes / log_file_max_size_bytes > 0.9
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Log file nearly full"
  
  - alert: LogRotationFailed
    expr: log_rotation_last_success < (time() - 86400)
    for: 1h
    labels:
      severity: critical
    annotations:
      summary: "Log rotation failed"
```

### Log Metrics Collection
```bash
# 1. Collect log metrics
collect_log_metrics() {
  echo "log_errors_total $(grep -r "ERROR" /var/log/codexos/ | wc -l)"
  echo "log_warnings_total $(grep -r "WARN" /var/log/codexos/ | wc -l)"
  echo "log_file_size_bytes $(du -b /var/log/codexos/ | awk '{print $1}')"
  echo "log_rotation_last_success $(stat -c %Y /var/log/codexos/ 2>/dev/null || echo 0)"
}

# 2. Export metrics for Prometheus
collect_log_metrics > /tmp/log_metrics.prom

# 3. Move to metrics directory
mv /tmp/log_metrics.prom /var/log/metrics/log_metrics.prom
```

## 📋 Log Management Checklist

### Daily Tasks
- [ ] Review error logs
- [ ] Check log file sizes
- [ ] Verify log rotation
- [ ] Monitor log volume
- [ ] Check for anomalies

### Weekly Tasks
- [ ] Generate log reports
- [ ] Analyze log patterns
- [ ] Review log retention
- [ ] Check log aggregation
- [ ] Update log configuration

### Monthly Tasks
- [ ] Archive old logs
- [ ] Review log policies
- [ ] Update log monitoring
- [ ] Performance analysis
- [ ] Documentation updates

## 🚨 Emergency Procedures

### Log System Failure
```bash
# 1. Check log system status
sudo systemctl status rsyslog
sudo systemctl status logrotate

# 2. Restart log services
sudo systemctl restart rsyslog
sudo systemctl restart logrotate

# 3. Check disk space
df -h /var/log
df -h /app

# 4. Emergency log cleanup
sudo find /var/log -name "*.log" -size +100M -exec truncate -s 0 {} \;

# 5. Verify log system recovery
sudo systemctl status rsyslog
tail -f /var/log/syslog
```

### Critical Log Analysis
```bash
# 1. Search for critical errors
grep -r "CRITICAL\|FATAL\|EMERGENCY" /var/log/codexos/

# 2. Check system logs for issues
grep -i "error\|fail\|critical" /var/log/syslog | tail -50

# 3. Check authentication failures
grep -i "failed\|invalid\|unauthorized" /var/log/auth.log | tail -50

# 4. Check database errors
docker exec codexos-postgres tail -100 /var/log/postgresql/postgresql-*.log | grep -i error

# 5. Generate emergency report
echo "EMERGENCY LOG ANALYSIS - $(date)" > /tmp/emergency_log_report.txt
grep -r "CRITICAL\|FATAL\|EMERGENCY" /var/log/codexos/ >> /tmp/emergency_log_report.txt
```

## 📚 References

- [CodexOS Monitoring Policy](../monitoring.md)
- [Log Retention Policy](../security.md#log-retention)
- [System Monitoring](monitoring-alerting.md)
- [Security Incidents](security-incidents.md)
- [Log Analysis Tools](../tools.md#log-analysis)
- [Logging Best Practices](../best-practices.md#logging)
