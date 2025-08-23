# Backup & Recovery Runbook

> **📚 Docs ▸ Runbooks ▸ Operations**  
> **Last Updated**: $(date)  
> **Status**: Active


## Overview
This runbook covers backup procedures, disaster recovery, and data restoration for the CodexOS platform, including database, application data, and configuration files.

## 🔒 Backup Strategy

### Backup Types
- **Full Database Backup**: Daily PostgreSQL dumps
- **Incremental Backups**: Transaction logs and WAL files
- **Configuration Backup**: Environment files and settings
- **Application Backup**: Source code and build artifacts
- **User Data Backup**: Uploaded files and documents

### Retention Policy
- **Daily Backups**: Retain for 30 days
- **Weekly Backups**: Retain for 12 weeks
- **Monthly Backups**: Retain for 12 months
- **Yearly Backups**: Retain for 7 years

## 💾 Backup Procedures

### Database Backup

#### Automated Daily Backup
```bash
#!/bin/bash
# /scripts/daily-backup.sh

# Set variables
BACKUP_DIR="/backups/postgres/$(date +%Y%m%d)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="codexos_db"
DB_USER="codexos"
CONTAINER_NAME="codexos-postgres"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create full database backup
docker exec $CONTAINER_NAME pg_dump -U $DB_USER -d $DB_NAME \
  --format=custom \
  --verbose \
  --file="/tmp/codexos_backup_${TIMESTAMP}.dump"

# Copy backup from container
docker cp $CONTAINER_NAME:/tmp/codexos_backup_${TIMESTAMP}.dump "$BACKUP_DIR/"

# Verify backup integrity
docker exec $CONTAINER_NAME pg_restore --list "/tmp/codexom_backup_${TIMESTAMP}.dump" > "$BACKUP_DIR/backup_${TIMESTAMP}.list"

# Clean up container temp file
docker exec $CONTAINER_NAME rm -f "/tmp/codexos_backup_${TIMESTAMP}.dump"

# Compress backup
gzip "$BACKUP_DIR/codexos_backup_${TIMESTAMP}.dump"

# Create checksum
sha256sum "$BACKUP_DIR/codexos_backup_${TIMESTAMP}.dump.gz" > "$BACKUP_DIR/backup_${TIMESTAMP}.sha256"

# Clean up old backups (keep 30 days)
find /backups/postgres -type d -mtime +30 -exec rm -rf {} \;

echo "Backup completed: $BACKUP_DIR/codexos_backup_${TIMESTAMP}.dump.gz"
```

#### Manual Backup
```bash
# 1. Create backup directory
mkdir -p /backups/postgres/manual/$(date +%Y%m%d_%H%M%S)

# 2. Create database backup
docker exec codexos-postgres pg_dump -U codexos -d codexos_db \
  --format=custom \
  --verbose \
  --file="/tmp/codexos_manual_backup.dump"

# 3. Copy backup from container
docker cp codexos-postgres:/tmp/codexos_manual_backup.dump /backups/postgres/manual/$(date +%Y%m%d_%H%M%S)/

# 4. Verify backup
docker exec codexos-postgres pg_restore --list /tmp/codexos_manual_backup.dump

# 5. Clean up
docker exec codexos-postgres rm -f /tmp/codexos_manual_backup.dump
```

### Application Configuration Backup

#### Environment Files
```bash
# 1. Backup environment files
cp .env* /backups/config/$(date +%Y%m%d)/

# 2. Backup docker-compose files
cp docker-compose*.yml /backups/config/$(date +%Y%m%d)/

# 3. Backup startup scripts
cp startup.sh /backups/config/$(date +%Y%m%d)/

# 4. Create configuration archive
tar -czf /backups/config/config_$(date +%Y%m%d).tar.gz /backups/config/$(date +%Y%m%d)/

# 5. Clean up temporary files
rm -rf /backups/config/$(date +%Y%m%d)/
```

#### Source Code Backup
```bash
# 1. Create source code backup
tar -czf /backups/source/codexos_source_$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=venv \
  --exclude=.git \
  --exclude=dist \
  --exclude=build \
  .

# 2. Create checksum
sha256sum /backups/source/codexos_source_$(date +%Y%m%d).tar.gz > \
  /backups/source/codexos_source_$(date +%Y%m%d).sha256
```

### User Data Backup

#### File Storage Backup
```bash
# 1. Backup user uploads (if using local storage)
if [ -d "/uploads" ]; then
  tar -czf /backups/userdata/uploads_$(date +%Y%m%d).tar.gz /uploads/
fi

# 2. Backup RAG documents
if [ -d "/rag_documents" ]; then
  tar -czf /backups/userdata/rag_documents_$(date +%Y%m%d).tar.gz /rag_documents/
fi

# 3. Create checksums
find /backups/userdata/ -name "*.tar.gz" -exec sha256sum {} \; > \
  /backups/userdata/checksums_$(date +%Y%m%d).txt
```

## 🔄 Recovery Procedures

### Database Recovery

#### Full Database Restore
```bash
#!/bin/bash
# /scripts/database-restore.sh

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

# Create backup of current database (if exists)
echo "Creating backup of current database..."
docker exec $CONTAINER_NAME pg_dump -U $DB_USER -d $DB_NAME \
  --format=custom \
  --file="/tmp/pre_recovery_backup.dump"

# Copy pre-recovery backup
docker cp $CONTAINER_NAME:/tmp/pre_recovery_backup.dump /backups/postgres/pre_recovery_$(date +%Y%m%d_%H%M%S).dump

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
SELECT COUNT(*) as execution_count FROM agent_execution_history;"

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

#### Point-in-Time Recovery
```bash
# 1. Check available WAL files
docker exec codexos-postgres ls -la /var/lib/postgresql/data/pg_wal/

# 2. Restore base backup
docker exec codexos-postgres pg_restore -U codexos -d codexos_db --clean --if-exists /backups/postgres/base_backup.dump

# 3. Apply WAL files to specific point in time
docker exec codexos-postgres pg_wal_restore -U codexos -d codexos_db \
  --target-time="2024-01-15 14:30:00" \
  /backups/postgres/wal_files/
```

### Application Recovery

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

#### Source Code Recovery
```bash
# 1. Verify backup integrity
sha256sum -c /backups/source/codexos_source_$(date +%Y%m%d).sha256

# 2. Extract source code
tar -xzf /backups/source/codexos_source_$(date +%Y%m%d).tar.gz -C /tmp/

# 3. Copy to project directory
cp -r /tmp/Volumes/External\ Drive/dev/projects/CodexOS/* ./

# 4. Clean up
rm -rf /tmp/Volumes/
```

## 🚨 Disaster Recovery

### Complete System Recovery

#### Step 1: Infrastructure Recovery
```bash
# 1. Restore base system
# This depends on your infrastructure provider (AWS, GCP, Azure, etc.)

# 2. Install Docker and dependencies
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. Install required tools
apt-get update && apt-get install -y postgresql-client redis-tools curl jq
```

#### Step 2: Database Recovery
```bash
# 1. Start PostgreSQL container
docker run -d --name codexos-postgres \
  -e POSTGRES_USER=codexos \
  -e POSTGRES_PASSWORD=codexos_secure_password \
  -e POSTGRES_DB=codexos_db \
  -p 5432:5432 \
  postgres:16-alpine

# 2. Wait for database to be ready
sleep 30
docker exec codexos-postgres pg_isready -U codexos

# 3. Restore from latest backup
./scripts/database-restore.sh /backups/postgres/latest/codexos_backup.dump
```

#### Step 3: Application Recovery
```bash
# 1. Start Redis
docker run -d --name codexos-redis -p 6379:6379 redis:7-alpine

# 2. Start backend
docker run -d --name codexos-backend \
  --network codexos_default \
  -p 8001:8000 \
  -e DATABASE_URL="postgresql+asyncpg://codexos:codexos_secure_password@codexos-postgres:5432/codexos_db" \
  -e REDIS_URL="redis://codexos-redis:6379/0" \
  -e WS_MESSAGE_QUEUE="redis://codexos-redis:6379/1" \
  -e SECRET_KEY="your-secret-key-change-in-production" \
  -e ENVIRONMENT="production" \
  codexos-backend:latest

# 3. Start frontend
docker run -d --name codexos-frontend \
  --network codexos_default \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1 \
  -e NEXT_PUBLIC_WS_URL=ws://localhost:8001/ws \
  codexos-frontend:latest
```

#### Step 4: Verification
```bash
# 1. Check all services
docker ps

# 2. Verify health endpoints
curl -f http://localhost:8001/health
curl -f http://localhost:3000

# 3. Test database connectivity
docker exec codexos-postgres psql -U codexos -d codexos_db -c "SELECT COUNT(*) FROM users;"

# 4. Test Redis connectivity
docker exec codexos-redis redis-cli ping
```

## 📋 Recovery Testing

### Backup Verification
```bash
# 1. Test backup restoration
./scripts/database-restore.sh /backups/postgres/test_backup.dump

# 2. Verify data integrity
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as agent_count FROM agents;
SELECT COUNT(*) as execution_count FROM agent_execution_history;"

# 3. Test application functionality
curl -f http://localhost:8001/health
curl -f http://localhost:3000

# 4. Clean up test environment
docker stop codexos-backend codexos-frontend
docker rm codexos-backend codexos-frontend
```

### Disaster Recovery Drill
```bash
# 1. Simulate disaster scenario
docker stop codexos-postgres codexos-redis codexos-backend codexos-frontend
docker rm codexos-postgres codexos-redis codexos-backend codexos-frontend

# 2. Execute recovery procedures
./scripts/disaster-recovery.sh

# 3. Verify system functionality
./scripts/verification.sh

# 4. Document recovery time and issues
echo "Recovery completed at $(date)" >> /var/log/disaster-recovery.log
```

## 📊 Monitoring and Alerts

### Backup Monitoring
```yaml
# Prometheus Alert Rules
groups:
- name: backup_alerts
  rules:
  - alert: BackupFailed
    expr: backup_last_success_timestamp < (time() - 86400)
    for: 1h
    labels:
      severity: critical
    annotations:
      summary: "Backup has not completed in 24 hours"
  
  - alert: BackupTooLarge
    expr: backup_size_bytes > 1073741824  # 1GB
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Backup size is unusually large"
```

### Recovery Time Objectives
- **RTO (Recovery Time Objective)**: 4 hours
- **RPO (Recovery Point Objective)**: 24 hours
- **Critical Services**: 2 hours
- **Non-Critical Services**: 8 hours

## 📚 References

- [Database Maintenance](database-maintenance.md)
- [Deployment Procedures](deployment.md)
- [Monitoring & Alerting](monitoring-alerting.md)
- [PostgreSQL Backup Documentation](https://www.postgresql.org/docs/current/backup.html)
- [Docker Backup Best Practices](https://docs.docker.com/storage/volumes/#backup-restore-or-migrate-data-volumes)
