# Data Loss Runbook

> **📚 Docs ▸ Runbooks ▸ Incident Response**  
> **Last Updated**: $(date)  
> **Status**: Active


## Overview
This runbook provides procedures for responding to data loss incidents, including database corruption, accidental deletions, and data recovery procedures for the CodexOS platform.

## 🚨 Data Loss Classification

### Severity Levels
- **P0 (Critical)**: Complete data loss, all user data affected
- **P1 (High)**: Major data loss, significant user impact
- **P2 (Medium)**: Partial data loss, limited user impact
- **P3 (Low)**: Minor data loss, minimal user impact

### Data Loss Types
- **Database Corruption**: Data integrity issues, corrupted tables
- **Accidental Deletion**: User or admin error, wrong queries
- **Backup Failure**: Corrupted or missing backups
- **Hardware Failure**: Disk failure, storage corruption
- **Software Bug**: Application error causing data loss
- **Malicious Activity**: Intentional data destruction

## 🚨 Immediate Response (First 15 Minutes)

### P0/P1 Data Loss
```bash
# 1. IMMEDIATELY stop all write operations
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE datname = 'codexos_db' AND pid <> pg_backend_pid();"

# 2. Document incident
echo "DATA LOSS INCIDENT: $(date)" >> /var/log/data-loss.log
echo "Type: $DATA_LOSS_TYPE" >> /var/log/data-loss.log
echo "Severity: $SEVERITY" >> /var/log/data-loss.log
echo "Scope: $SCOPE" >> /var/log/data-loss.log
echo "Affected Tables: $AFFECTED_TABLES" >> /var/log/data-loss.log

# 3. Notify data recovery team
echo "URGENT: Data loss detected" | \
  mail -s "DATA LOSS INCIDENT - IMMEDIATE ACTION REQUIRED" \
  -c "ops@codexos.dev,security@codexos.dev,management@codexos.dev" \
  data-recovery@codexos.dev

# 4. Preserve current state
docker exec codexos-postgres pg_dump -U codexos -d codexos_db \
  --format=custom \
  --file="/tmp/current_state_$(date +%Y%m%d_%H%M%S).dump"
```

### P2/P3 Data Loss
```bash
# 1. Document incident
echo "Data Loss Alert: $(date)" >> /var/log/data-loss.log
echo "Type: $DATA_LOSS_TYPE" >> /var/log/data-loss.log
echo "Severity: $SEVERITY" >> /var/log/data-loss.log

# 2. Assess scope
# Continue monitoring while investigating
```

## 🔍 Data Loss Investigation

### Scope Assessment
```bash
# 1. Check database integrity
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del, n_live_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;"

# 2. Check for missing data
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as agent_count FROM agents;
SELECT COUNT(*) as execution_count FROM agent_execution_history;
SELECT COUNT(*) as marketplace_count FROM marketplace_items;"

# 3. Check table sizes
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"

# 4. Check for corruption
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT pg_check_visible('pg_class');"
```

### Root Cause Analysis
```bash
# 1. Check recent database activity
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

# 2. Check recent queries
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
WHERE query_start > NOW() - INTERVAL '24 hours'
ORDER BY query_start DESC;"

# 3. Check application logs
docker logs codexos-backend --since 24h | grep -i -E "(delete|drop|truncate|corrupt|error)"

# 4. Check backup status
ls -la /backups/postgres/
find /backups/postgres -name "*.dump*" -mtime -1 -exec ls -lh {} \;
```

### Data Recovery Assessment
```bash
# 1. Check available backups
find /backups/postgres -name "*.dump*" -type f | sort -r | head -10

# 2. Verify backup integrity
for backup in $(find /backups/postgres -name "*.dump*" -type f | sort -r | head -5); do
  echo "Checking backup: $backup"
  docker exec codexos-postgres pg_restore --list "$backup" > /dev/null && echo "✓ Valid" || echo "✗ Corrupted"
done

# 3. Check backup timestamps
find /backups/postgres -name "*.dump*" -type f -exec stat --format="%y %n" {} \; | sort -r

# 4. Assess data freshness requirements
echo "Data freshness requirements:"
echo "- Users: $(docker exec codexos-postgres psql -U codexos -d codexos_db -c "SELECT MAX(updated_at) FROM users;" -t)"
echo "- Agents: $(docker exec codexos-postgres psql -U codexos -d codexos_db -c "SELECT MAX(updated_at) FROM agents;" -t)"
echo "- Executions: $(docker exec codexos-postgres psql -U codexos -d codexos_db -c "SELECT MAX(updated_at) FROM agent_execution_history;" -t)"
```

## 🛠️ Data Recovery Procedures

### Database Recovery

#### Full Database Recovery
```bash
#!/bin/bash
# /scripts/database-recovery.sh

# Set variables
BACKUP_FILE="$1"
DB_NAME="codexos_db"
DB_USER="codexos"
CONTAINER_NAME="codexos-postgres"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file_path>"
  exit 1
fi

# Verify backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "Starting database recovery from: $BACKUP_FILE"

# Stop application services
echo "Stopping application services..."
docker stop codexos-backend codexos-frontend

# Wait for services to stop
sleep 10

# Verify services are stopped
if docker ps | grep -q "codexos-backend\|codexos-frontend"; then
  echo "Failed to stop services. Aborting recovery."
  exit 1
fi

# Create backup of current state
echo "Creating backup of current database state..."
docker exec $CONTAINER_NAME pg_dump -U $DB_USER -d $DB_NAME \
  --format=custom \
  --file="/tmp/pre_recovery_backup_$(date +%Y%m%d_%H%M%S).dump"

# Copy pre-recovery backup
docker cp $CONTAINER_NAME:/tmp/pre_recovery_backup_*.dump /backups/postgres/pre_recovery/

# Drop and recreate database
echo "Dropping and recreating database..."
docker exec $CONTAINER_NAME dropdb -U $DB_USER --if-exists $DB_NAME
docker exec $CONTAINER_NAME createdb -U $DB_USER $DB_NAME

# Restore from backup
echo "Restoring database from backup..."
docker cp "$BACKUP_FILE" $CONTAINER_NAME:/tmp/recovery_backup.dump

# Check if backup is compressed
if [[ "$BACKUP_FILE" == *.gz ]]; then
  docker exec $CONTAINER_NAME gunzip /tmp/recovery_backup.dump.gz
fi

# Restore database
docker exec $CONTAINER_NAME pg_restore -U $DB_USER -d $DB_NAME \
  --verbose \
  --clean \
  --if-exists \
  /tmp/recovery_backup.dump

# Verify restoration
echo "Verifying database restoration..."
docker exec $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c "
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as agent_count FROM agents;
SELECT COUNT(*) as execution_count FROM agent_execution_history;
SELECT COUNT(*) as marketplace_count FROM marketplace_items;"

# Clean up
docker exec $CONTAINER_NAME rm -f /tmp/recovery_backup.dump

# Restart application services
echo "Restarting application services..."
docker start codexos-backend codexos-frontend

# Wait for services to start
sleep 30

# Verify services are running
if ! docker ps | grep -q "codexos-backend"; then
  echo "Warning: Backend service failed to start"
fi

if ! docker ps | grep -q "codexos-frontend"; then
  echo "Warning: Frontend service failed to start"
fi

echo "Database recovery completed."
echo "Please verify application functionality."
```

#### Partial Data Recovery
```bash
# 1. Identify affected tables
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT tablename, n_live_tup, n_dead_tup
FROM pg_stat_user_tables
WHERE n_live_tup = 0 OR n_dead_tup > n_live_tup;"

# 2. Restore specific tables from backup
docker exec codexos-postgres pg_restore -U codexos -d codexos_db \
  --verbose \
  --clean \
  --if-exists \
  --table=users \
  /backups/postgres/latest/codexos_backup.dump

# 3. Verify table restoration
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as agent_count FROM agents;"
```

#### Point-in-Time Recovery
```bash
# 1. Check available WAL files
docker exec codexos-postgres ls -la /var/lib/postgresql/data/pg_wal/

# 2. Restore base backup
docker exec codexos-postgres pg_restore -U codexos -d codexos_db \
  --clean \
  --if-exists \
  /backups/postgres/base_backup.dump

# 3. Apply WAL files to specific point in time
docker exec codexos-postgres pg_wal_restore -U codexos -d codexos_db \
  --target-time="2024-01-15 14:30:00" \
  /backups/postgres/wal_files/
```

### Application Data Recovery

#### Configuration Recovery
```bash
# 1. Restore environment files
tar -xzf /backups/config/config_$(date +%Y%m%d).tar.gz -C /tmp/

# 2. Copy configuration files
cp /tmp/backups/config/$(date +%Y%m%d)/.env* ./
cp /tmp/backups/config/$(date +%Y%m%d)/docker-compose*.yml ./
cp /tmp/backups/config/$(date +%Y%m%d)/startup.sh ./

# 3. Clean up
rm -rf /tmp/backups/
```

#### User Data Recovery
```bash
# 1. Restore user uploads
if [ -f "/backups/userdata/uploads_$(date +%Y%m%d).tar.gz" ]; then
  tar -xzf /backups/userdata/uploads_$(date +%Y%m%d).tar.gz -C /
fi

# 2. Restore RAG documents
if [ -f "/backups/userdata/rag_documents_$(date +%Y%m%d).tar.gz" ]; then
  tar -xzf /backups/userdata/rag_documents_$(date +%Y%m%d).tar.gz -C /
fi

# 3. Verify data integrity
find /uploads -type f | wc -l
find /rag_documents -type f | wc -l
```

## 🔄 Recovery Verification

### Data Integrity Verification
```bash
# 1. Check database integrity
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT pg_check_visible('pg_class');"

# 2. Verify table counts
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'agents', COUNT(*) FROM agents
UNION ALL
SELECT 'agent_execution_history', COUNT(*) FROM agent_execution_history
UNION ALL
SELECT 'marketplace_items', COUNT(*) FROM marketplace_items;"

# 3. Check data consistency
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT 
  u.id,
  u.email,
  COUNT(a.id) as agent_count
FROM users u
LEFT JOIN agents a ON u.id = a.user_id
GROUP BY u.id, u.email
HAVING COUNT(a.id) > 0
ORDER BY agent_count DESC
LIMIT 10;"
```

### Application Functionality Verification
```bash
# 1. Test basic functionality
curl -f http://localhost:8001/health
curl -f http://localhost:3000

# 2. Test API endpoints
curl -f http://localhost:8001/api/v1/health
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'

# 3. Test database operations
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT id, email, username FROM users LIMIT 5;"

# 4. Test Redis operations
docker exec codexos-redis redis-cli set test_key "test_value"
docker exec codexos-redis redis-cli get test_key
```

### Performance Verification
```bash
# 1. Check response times
time curl -s http://localhost:8001/health > /dev/null

# 2. Check database performance
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 5;"

# 3. Check resource usage
docker stats --no-stream
```

## 📊 Data Loss Monitoring

### Prevention Alerts
```yaml
# Prometheus Alert Rules
groups:
- name: data_loss_prevention
  rules:
  - alert: BackupFailed
    expr: backup_last_success_timestamp < (time() - 86400)
    for: 1h
    labels:
      severity: critical
    annotations:
      summary: "Backup has not completed in 24 hours"
  
  - alert: DatabaseCorruption
    expr: pg_check_visible_status != 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Database corruption detected"
  
  - alert: HighDataDeletion
    expr: rate(pg_stat_user_tables_n_dead_tup[5m]) > 100
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High rate of data deletion detected"
```

### Recovery Time Objectives
- **RTO (Recovery Time Objective)**: 4 hours for critical data
- **RPO (Recovery Point Objective)**: 24 hours for critical data
- **Data Validation Time**: 2 hours after recovery
- **Full System Recovery**: 8 hours

## 📋 Data Loss Checklist

### Detection & Assessment
- [ ] Data loss incident detected and classified
- [ ] Initial scope assessment completed
- [ ] Data recovery team notified
- [ ] Current state preserved
- [ ] Stakeholders informed

### Investigation
- [ ] Root cause analysis completed
- [ ] Data loss scope determined
- [ ] Backup availability verified
- [ ] Recovery plan developed
- [ ] Team briefed on plan

### Recovery
- [ ] Appropriate recovery method selected
- [ ] Data restoration completed
- [ ] Data integrity verified
- [ ] Application functionality tested
- [ ] Performance verified

### Post-Recovery
- [ ] Incident report prepared
- [ ] Root cause analysis completed
- [ ] Prevention measures implemented
- [ ] Team debrief completed
- [ ] Documentation updated

## 🚨 Communication Procedures

### Internal Communication
```bash
# 1. Immediate notification
echo "DATA LOSS INCIDENT DETECTED" | \
  mail -s "URGENT: Data Loss Incident" \
  -c "ops@codexos.dev,security@codexos.dev,management@codexos.dev" \
  incident-response@codexos.dev

# 2. Status updates
echo "Recovery Status Update: $(date)" | \
  mail -s "Data Loss Recovery Status Update" \
  -c "ops@codexos.dev,security@codexos.dev" \
  incident-response@codexos.dev

# 3. Resolution notification
echo "Data Recovery Completed: $(date)" | \
  mail -s "Data Loss Incident Resolved" \
  -c "ops@codexos.dev,security@codexos.dev,management@codexos.dev" \
  incident-response@codexos.dev
```

### External Communication
```bash
# 1. Customer notification (if user data affected)
cat > customer_notification.txt << EOF
Dear CodexOS Customer,

We have detected a data incident that may have affected your information.
Our team is actively working to restore any affected data and implement additional safeguards.

We will provide updates as more information becomes available.

For immediate assistance, please contact: support@codexos.dev

CodexOS Data Recovery Team
EOF

# 2. Regulatory notification (if required)
# Contact legal team for compliance requirements
```

## 📚 References

- [CodexOS Security Policy](../security.md)
- [Backup & Recovery](backup-recovery.md)
- [Database Maintenance](database-maintenance.md)
- [Security Incidents](security-incidents.md)
- [Data Protection Policy](../security.md#data-protection)
- [Backup Best Practices](../backup-recovery.md#best-practices)
