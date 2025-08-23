# Database Maintenance Runbook

> **📚 Docs ▸ Runbooks ▸ Operations**  
> **Last Updated**: $(date)  
> **Status**: Active

## Overview
This runbook covers routine database maintenance tasks for the CodexOS PostgreSQL database, including backups, optimization, and health checks.

## 🔍 Pre-Maintenance Checklist

- [ ] Verify system is in maintenance window
- [ ] Check current database load and connections
- [ ] Ensure backup is completed before any maintenance
- [ ] Notify stakeholders of planned maintenance

## 📊 Health Check Commands

### Connection Status
```bash
# Check active connections
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT count(*) as active_connections,
       count(*) filter (where state = 'active') as active_queries
FROM pg_stat_activity;"

# Check connection limits
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SHOW max_connections;"
```

### Performance Metrics
```bash
# Check slow queries
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;"

# Check table sizes
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;"
```

### Index Health
```bash
# Check unused indexes
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY schemaname, tablename;"
```

## 💾 Backup Procedures

### Automated Backup
```bash
# Create backup directory
mkdir -p /backups/postgres/$(date +%Y%m%d)

# Full database backup
docker exec codexos-postgres pg_dump -U codexos -d codexos_db --format=custom --file=/tmp/codexos_backup_$(date +%Y%m%d_%H%M%S).dump

# Copy backup from container
docker cp codexos-postgres:/tmp/codexos_backup_$(date +%Y%m%d_%H%M%S).dump /backups/postgres/$(date +%Y%m%d)/

# Verify backup integrity
docker exec codexos-postgres pg_restore --list /tmp/codexos_backup_$(date +%Y%m%d_%H%M%S).dump
```

### Manual Backup Verification
```bash
# Test restore to temporary database
docker exec codexos-postgres createdb -U codexos test_restore_db
docker exec codexos-postgres pg_restore -U codexos -d test_restore_db /tmp/codexos_backup_$(date +%Y%m%d_%H%M%S).dump

# Verify data integrity
docker exec codexos-postgres psql -U codexos -d test_restore_db -c "SELECT COUNT(*) FROM users;"
docker exec codexos-postgres psql -U codexos -d test_restore_db -c "SELECT COUNT(*) FROM agents;"

# Clean up test database
docker exec codexos-postgres dropdb -U codexos test_restore_db
```

## 🧹 Maintenance Tasks

### Vacuum and Analyze
```bash
# Full vacuum (use during low-traffic periods)
docker exec codexos-postgres psql -U codexos -d codexos_db -c "VACUUM FULL VERBOSE;"

# Analyze tables for query planner
docker exec codexos-postgres psql -U codexos -d codexos_db -c "ANALYZE VERBOSE;"

# Check bloat
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
       pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

### Log Maintenance
```bash
# Check log file size
docker exec codexos-postgres ls -lh /var/log/postgresql/

# Rotate logs if needed
docker exec codexos-postgres psql -U codexos -d codexos_db -c "SELECT pg_rotate_logfile();"
```

## 🔧 Optimization Tasks

### Update Statistics
```bash
# Update table statistics
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT schemaname, tablename, 
       n_tup_ins, n_tup_upd, n_tup_del, n_live_tup, n_dead_tup,
       last_vacuum, last_autovacuum, last_analyze, last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;"
```

### Connection Pool Optimization
```bash
# Check connection pool settings
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SHOW shared_buffers;
SHOW effective_cache_size;
SHOW work_mem;
SHOW maintenance_work_mem;"
```

## 🚨 Emergency Procedures

### Database Lockup Recovery
```bash
# Check for long-running transactions
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';"

# Terminate problematic connections (use with caution)
docker exec codexos-postgres psql -U codexos -d codexos_db -c "SELECT pg_terminate_backend(pid);"
```

### Corrupted Database Recovery
```bash
# Check database corruption
docker exec codexos-postgres psql -U codexos -d codexos_db -c "SELECT pg_check_visible('pg_class');"

# If corruption detected, restore from latest backup
docker exec codexos-postgres pg_restore -U codexos -d codexos_db --clean --if-exists /backups/postgres/latest/codexos_backup.dump
```

## 📋 Maintenance Schedule

### Daily
- [ ] Check connection count
- [ ] Monitor slow queries
- [ ] Verify backup completion

### Weekly
- [ ] Analyze table statistics
- [ ] Check index usage
- [ ] Review log files

### Monthly
- [ ] Full vacuum and analyze
- [ ] Performance review
- [ ] Backup restoration test

### Quarterly
- [ ] Connection pool tuning
- [ ] Index optimization
- [ ] Capacity planning review

## 📞 Escalation

### Level 1: Database Administrator
- Performance issues
- Connection problems
- Backup failures

### Level 2: Senior DBA
- Corruption issues
- Recovery procedures
- Major performance degradation

### Level 3: Engineering Manager
- Extended downtime
- Data loss incidents
- Infrastructure changes

## 📚 References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [CodexOS Database Schema](../architecture.md#database-schema)
- [Backup Policy](../backup-recovery.md)
- [Monitoring Dashboard](http://localhost:3000/dashboard/monitoring)
