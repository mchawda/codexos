# Security Incidents Runbook

> **📚 Docs ▸ Runbooks ▸ Incident Response**  
> **Last Updated**: $(date)  
> **Status**: Active

## Overview
This runbook provides procedures for responding to security incidents, data breaches, and security-related issues in the CodexOS platform.

## 🚨 Incident Classification

### Severity Levels
- **P0 (Critical)**: Active breach, data exfiltration, service compromise
- **P1 (High)**: Unauthorized access, suspicious activity, potential breach
- **P2 (Medium)**: Failed login attempts, unusual patterns, security warnings
- **P3 (Low)**: Minor security alerts, configuration issues, false positives

### Incident Types
- **Data Breach**: Unauthorized access to sensitive data
- **Account Compromise**: User account takeover
- **API Abuse**: Excessive API calls, rate limit violations
- **Malware**: Suspicious files or processes
- **Network Intrusion**: Unauthorized network access
- **Social Engineering**: Phishing, impersonation attempts

## 🚨 Immediate Response (First 15 Minutes)

### P0/P1 Incidents
```bash
# 1. IMMEDIATELY isolate affected systems
docker stop codexos-backend codexos-frontend
docker stop codexos-postgres codexos-redis

# 2. Document incident details
echo "SECURITY INCIDENT: $(date)" >> /var/log/security-incident.log
echo "Type: $INCIDENT_TYPE" >> /var/log/security-incident.log
echo "Severity: $SEVERITY" >> /var/log/security-incident.log
echo "Description: $DESCRIPTION" >> /var/log/security-incident.log

# 3. Notify security team
echo "URGENT: Security incident detected" | \
  mail -s "SECURITY INCIDENT - IMMEDIATE ACTION REQUIRED" security@codexos.dev

# 4. Preserve evidence
# DO NOT delete logs or files - preserve for investigation
```

### P2/P3 Incidents
```bash
# 1. Document incident
echo "Security Alert: $(date)" >> /var/log/security-alerts.log
echo "Type: $INCIDENT_TYPE" >> /var/log/security-alerts.log
echo "Severity: $SEVERITY" >> /var/log/security-alerts.log

# 2. Assess impact
# Continue monitoring while investigating
```

## 🔍 Investigation Procedures

### Evidence Collection
```bash
# 1. Collect system logs
docker logs codexos-backend --since 24h > /evidence/backend_logs_$(date +%Y%m%d_%H%M%S).log
docker logs codexos-frontend --since 24h > /evidence/frontend_logs_$(date +%Y%m%d_%H%M%S).log
docker logs codexos-postgres --since 24h > /evidence/postgres_logs_$(date +%Y%m%d_%H%M%S).log

# 2. Collect database logs
docker exec codexos-postgres cat /var/log/postgresql/postgresql-*.log > /evidence/postgres_system_logs_$(date +%Y%m%d_%H%M%S).log

# 3. Collect network information
netstat -tlnp > /evidence/network_connections_$(date +%Y%m%d_%H%M%S).txt
docker network inspect codexos_default > /evidence/network_config_$(date +%Y%m%d_%H%M%S).json

# 4. Collect process information
docker exec codexos-backend ps aux > /evidence/backend_processes_$(date +%Y%m%d_%H%M%S).txt
docker exec codexos-frontend ps aux > /evidence/frontend_processes_$(date +%Y%m%d_%H%M%S).txt
```

### Database Investigation
```bash
# 1. Check for suspicious database activity
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT 
  usename,
  application_name,
  client_addr,
  query_start,
  state,
  query
FROM pg_stat_activity
WHERE query_start > NOW() - INTERVAL '24 hours'
ORDER BY query_start DESC;"

# 2. Check for unauthorized user creation
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT 
  id,
  email,
  username,
  created_at,
  last_login_at
FROM users
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;"

# 3. Check for suspicious agent executions
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT 
  id,
  agent_id,
  user_id,
  status,
  started_at,
  completed_at
FROM agent_execution_history
WHERE started_at > NOW() - INTERVAL '24 hours'
ORDER BY started_at DESC;"
```

### API Investigation
```bash
# 1. Check API access logs
curl -s http://localhost:8001/metrics | grep http_requests_total

# 2. Check for rate limit violations
docker logs codexos-backend --since 24h | grep -i "rate limit\|throttle\|429"

# 3. Check for suspicious API calls
docker logs codexos-backend --since 24h | grep -E "(GET|POST|PUT|DELETE) /api/v1" | grep -v health
```

## 🛡️ Containment Procedures

### System Isolation
```bash
# 1. Stop affected services
docker stop codexos-backend codexos-frontend

# 2. Block external access (if using firewall)
iptables -A INPUT -p tcp --dport 8001 -j DROP
iptables -A INPUT -p tcp --dport 3000 -j DROP

# 3. Disable user authentication
# Comment out auth endpoints in backend configuration
```

### Database Lockdown
```bash
# 1. Restrict database access
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;"

# 2. Change database passwords
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
ALTER USER codexos PASSWORD 'new_secure_password_$(date +%s)';"

# 3. Audit active connections
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE datname = 'codexos_db' AND pid <> pg_backend_pid();"
```

### User Account Security
```bash
# 1. Disable suspicious accounts
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
UPDATE users SET is_active = false 
WHERE last_login_at > NOW() - INTERVAL '1 hour' 
AND client_addr NOT IN ('127.0.0.1', '::1');"

# 2. Force password reset for affected users
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
UPDATE users SET password_reset_required = true 
WHERE last_login_at > NOW() - INTERVAL '24 hours';"

# 3. Check for unauthorized API keys
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT id, user_id, name, created_at, last_used_at 
FROM api_keys 
WHERE created_at > NOW() - INTERVAL '24 hours';"
```

## 🔄 Recovery Procedures

### System Restoration
```bash
# 1. Verify system integrity
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT pg_check_visible('pg_class');"

# 2. Restore from clean backup if necessary
./scripts/database-restore.sh /backups/postgres/clean_backup.dump

# 3. Restart services with enhanced security
docker run -d --name codexos-backend \
  --network codexos_default \
  -p 8001:8000 \
  -e DATABASE_URL="postgresql+asyncpg://codexos:new_secure_password@codexos-postgres:5432/codexos_db" \
  -e REDIS_URL="redis://codexos-redis:6379/0" \
  -e WS_MESSAGE_QUEUE="redis://codexos-redis:6379/1" \
  -e SECRET_KEY="new_secret_key_$(date +%s)" \
  -e ENVIRONMENT="production" \
  -e SECURITY_ENHANCED="true" \
  codexos-backend:latest
```

### Security Hardening
```bash
# 1. Update firewall rules
iptables -A INPUT -p tcp --dport 8001 -s 10.0.0.0/8 -j ACCEPT
iptables -A INPUT -p tcp --dport 8001 -s 172.16.0.0/12 -j ACCEPT
iptables -A INPUT -p tcp --dport 8001 -s 192.168.0.0/16 -j ACCEPT
iptables -A INPUT -p tcp --dport 8001 -j DROP

# 2. Enable enhanced logging
docker exec codexos-backend sh -c "
echo 'SECURITY_LOGGING_ENABLED=true' >> /app/.env
echo 'AUDIT_LOG_LEVEL=DEBUG' >> /app/.env"

# 3. Restrict file permissions
chmod 600 .env*
chmod 600 docker-compose*.yml
chmod 700 startup.sh
```

## 📊 Post-Incident Analysis

### Impact Assessment
```bash
# 1. Data exposure analysis
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE is_active = true) as active_users,
  COUNT(*) FILTER (WHERE last_login_at > NOW() - INTERVAL '24 hours') as recent_logins
FROM users;"

# 2. System access analysis
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT 
  client_addr,
  COUNT(*) as connection_count,
  MAX(query_start) as last_activity
FROM pg_stat_activity
WHERE query_start > NOW() - INTERVAL '24 hours'
GROUP BY client_addr
ORDER BY connection_count DESC;"

# 3. API usage analysis
curl -s http://localhost:8001/metrics | grep -E "(http_requests_total|http_request_duration_seconds)"
```

### Lessons Learned
```bash
# 1. Document incident timeline
echo "=== INCIDENT TIMELINE ===" > /var/log/incident-analysis.log
echo "Detection: $(grep 'SECURITY INCIDENT' /var/log/security-incident.log | head -1)" >> /var/log/incident-analysis.log
echo "Containment: $(grep 'Containment started' /var/log/security-incident.log | head -1)" >> /var/log/incident-analysis.log
echo "Recovery: $(grep 'Recovery completed' /var/log/security-incident.log | head -1)" >> /var/log/incident-analysis.log

# 2. Identify root causes
echo "=== ROOT CAUSES ===" >> /var/log/incident-analysis.log
# Add identified root causes

# 3. Document improvements needed
echo "=== IMPROVEMENTS NEEDED ===" >> /var/log/incident-analysis.log
# Add required improvements
```

## 🚨 Communication Procedures

### Internal Communication
```bash
# 1. Immediate notification
echo "SECURITY INCIDENT DETECTED" | \
  mail -s "URGENT: Security Incident" \
  -c "security@codexos.dev,ops@codexos.dev,management@codexos.dev" \
  incident-response@codexos.dev

# 2. Status updates
echo "Status Update: $(date)" | \
  mail -s "Security Incident Status Update" \
  -c "security@codexos.dev,ops@codexos.dev" \
  incident-response@codexos.dev

# 3. Resolution notification
echo "Incident Resolved: $(date)" | \
  mail -s "Security Incident Resolved" \
  -c "security@codexos.dev,ops@codexos.dev,management@codexos.dev" \
  incident-response@codexos.dev
```

### External Communication
```bash
# 1. Customer notification (if data breach)
cat > customer_notification.txt << EOF
Dear CodexOS Customer,

We have detected a security incident that may have affected your data.
We are actively investigating and have implemented additional security measures.

We will provide updates as more information becomes available.

For immediate assistance, please contact: security@codexos.dev

CodexOS Security Team
EOF

# 2. Regulatory notification (if required)
# Contact legal team for compliance requirements
```

## 📋 Incident Response Checklist

### Detection & Assessment
- [ ] Incident detected and classified
- [ ] Initial impact assessment completed
- [ ] Evidence preservation initiated
- [ ] Security team notified
- [ ] Incident response team activated

### Containment
- [ ] Affected systems isolated
- [ ] Unauthorized access blocked
- [ ] Evidence collection completed
- [ ] Containment effectiveness verified
- [ ] Stakeholders updated

### Investigation
- [ ] Root cause analysis initiated
- [ ] Evidence analysis completed
- [ ] Attack vector identified
- [ ] Scope of compromise determined
- [ ] Investigation report prepared

### Recovery
- [ ] Systems restored from clean state
- [ ] Security patches applied
- [ ] Monitoring enhanced
- [ ] Access controls tightened
- [ ] System functionality verified

### Post-Incident
- [ ] Lessons learned documented
- [ ] Security improvements implemented
- [ ] Team debrief completed
- [ ] Documentation updated
- [ ] Follow-up actions assigned

## 📚 References

- [CodexOS Security Policy](../security.md)
- [Incident Response Policy](../security.md#incident-response)
- [Data Protection Policy](../security.md#data-protection)
- [Monitoring & Alerting](monitoring-alerting.md)
- [Backup & Recovery](backup-recovery.md)
- [Security Best Practices](../security.md#best-practices)
