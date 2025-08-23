# Resource Scaling Runbook

> **📚 Docs ▸ Runbooks ▸ Maintenance**  
> **Last Updated**: $(date)  
> **Status**: Active


## Overview
This runbook provides procedures for scaling the CodexOS platform resources, including auto-scaling, manual scaling, capacity planning, and performance optimization.

## 🔍 Scaling Assessment

### Current Resource Usage
```bash
# 1. Check system resources
free -h
df -h
nproc

# 2. Check Docker resource usage
docker stats --no-stream

# 3. Check container resource limits
docker inspect codexos-backend | grep -A 10 "HostConfig"
docker inspect codexos-frontend | grep -A 10 "HostConfig"

# 4. Check database performance
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT 
  count(*) as active_connections,
  count(*) filter (where state = 'active') as active_queries
FROM pg_stat_activity;"

# 5. Check Redis performance
docker exec codexos-redis redis-cli info memory
docker exec codexos-redis redis-cli info clients
```

### Performance Metrics
```bash
# 1. Check API response times
curl -s http://localhost:8001/metrics | grep http_request_duration_seconds

# 2. Check request rates
curl -s http://localhost:8001/metrics | grep http_requests_total

# 3. Check error rates
curl -s http://localhost:8001/metrics | grep http_requests_total | grep status=5

# 4. Check database query performance
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;"

# 5. Check system load
uptime
top -bn1 | grep "Cpu(s)"
```

### Scaling Triggers
```bash
# 1. Define scaling thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=80
DISK_THRESHOLD=85
RESPONSE_TIME_THRESHOLD=2000
ERROR_RATE_THRESHOLD=5

# 2. Check current thresholds
check_scaling_triggers() {
  # CPU usage
  CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
  if (( $(echo "$CPU_USAGE > $CPU_THRESHOLD" | bc -l) )); then
    echo "CPU threshold exceeded: ${CPU_USAGE}% > ${CPU_THRESHOLD}%"
  fi
  
  # Memory usage
  MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
  if [ "$MEMORY_USAGE" -gt "$MEMORY_THRESHOLD" ]; then
    echo "Memory threshold exceeded: ${MEMORY_USAGE}% > ${MEMORY_THRESHOLD}%"
  fi
  
  # Disk usage
  DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | cut -d'%' -f1)
  if [ "$DISK_USAGE" -gt "$DISK_THRESHOLD" ]; then
    echo "Disk threshold exceeded: ${DISK_USAGE}% > ${DISK_THRESHOLD}%"
  fi
}

# Execute scaling check
check_scaling_triggers
```

## 🔧 Manual Scaling

### Container Resource Scaling

#### Backend Scaling
```bash
# 1. Scale backend CPU and memory
docker update --cpus 2.0 --memory 2g codexos-backend

# 2. Scale backend with multiple instances
docker run -d --name codexos-backend-2 \
  --network codexos_default \
  -p 8002:8000 \
  -e DATABASE_URL="postgresql+asyncpg://codexos:codexos_secure_password@codexos-postgres:5432/codexos_db" \
  -e REDIS_URL="redis://codexos-redis:6379/0" \
  -e WS_MESSAGE_QUEUE="redis://codexos-redis:6379/1" \
  -e SECRET_KEY="your-secret-key-change-in-production" \
  -e ENVIRONMENT="production" \
  --cpus 1.0 \
  --memory 1g \
  codexos-backend:latest

# 3. Verify scaling
docker stats --no-stream codexos-backend codexos-backend-2

# 4. Test load balancing
curl -f http://localhost:8001/health
curl -f http://localhost:8002/health
```

#### Frontend Scaling
```bash
# 1. Scale frontend resources
docker update --cpus 1.0 --memory 1g codexos-frontend

# 2. Scale frontend with multiple instances
docker run -d --name codexos-frontend-2 \
  --network codexos_default \
  -p 3001:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1 \
  -e NEXT_PUBLIC_WS_URL=ws://localhost:8001/ws \
  --cpus 0.5 \
  --memory 512m \
  codexos-frontend:latest

# 3. Verify scaling
docker stats --no-stream codexos-frontend codexos-frontend-2

# 4. Test load balancing
curl -f http://localhost:3000
curl -f http://localhost:3001
```

#### Database Scaling
```bash
# 1. Scale PostgreSQL resources
docker update --cpus 2.0 --memory 4g codexos-postgres

# 2. Optimize PostgreSQL settings
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
ALTER SYSTEM SET shared_buffers = '1GB';
ALTER SYSTEM SET effective_cache_size = '3GB';
ALTER SYSTEM SET work_mem = '16MB';
ALTER SYSTEM SET maintenance_work_mem = '256MB';
ALTER SYSTEM SET max_connections = 200;"

# 3. Reload configuration
docker exec codexos-postgres psql -U codexos -d codexos_db -c "SELECT pg_reload_conf();"

# 4. Verify optimization
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
SHOW shared_buffers;
SHOW effective_cache_size;
SHOW work_mem;
SHOW max_connections;"
```

#### Redis Scaling
```bash
# 1. Scale Redis resources
docker update --cpus 1.0 --memory 2g codexos-redis

# 2. Optimize Redis configuration
docker exec codexos-redis redis-cli config set maxmemory 1gb
docker exec codexos-redis redis-cli config set maxmemory-policy allkeys-lru
docker exec codexos-redis redis-cli config set save "900 1 300 10 60 10000"

# 3. Verify optimization
docker exec codexos-redis redis-cli config get maxmemory
docker exec codexos-redis redis-cli config get maxmemory-policy

# 4. Check Redis performance
docker exec codexos-redis redis-cli info memory
docker exec codexos-redis redis-cli info stats
```

### Load Balancer Configuration

#### Nginx Load Balancer
```bash
# 1. Install Nginx
sudo apt-get update
sudo apt-get install -y nginx

# 2. Configure load balancer
sudo tee /etc/nginx/sites-available/codexos << EOF
upstream backend_servers {
    server localhost:8001 weight=1 max_fails=3 fail_timeout=30s;
    server localhost:8002 weight=1 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

upstream frontend_servers {
    server localhost:3000 weight=1 max_fails=3 fail_timeout=30s;
    server localhost:3001 weight=1 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    listen 80;
    server_name codexos.dev www.codexos.dev;

    location / {
        proxy_pass http://frontend_servers;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/ {
        proxy_pass http://backend_servers;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /health {
        proxy_pass http://backend_servers;
        access_log off;
    }
}
EOF

# 3. Enable site
sudo ln -s /etc/nginx/sites-available/codexos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 4. Verify load balancing
curl -f http://localhost/health
curl -f http://localhost/api/v1/health
```

## 🤖 Auto-Scaling

### Docker Swarm Auto-Scaling
```bash
# 1. Initialize Docker Swarm
docker swarm init

# 2. Create stack configuration
cat > docker-stack.yml << EOF
version: '3.8'
services:
  backend:
    image: codexos-backend:latest
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    environment:
      - DATABASE_URL=postgresql+asyncpg://codexos:codexos_secure_password@codexos-postgres:5432/codexos_db
      - REDIS_URL=redis://codexos-redis:6379/0
      - WS_MESSAGE_QUEUE=redis://codexos-redis:6379/1
      - SECRET_KEY=your-secret-key-change-in-production
      - ENVIRONMENT=production
    networks:
      - codexos_network

  frontend:
    image: codexos-frontend:latest
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost/api/v1
      - NEXT_PUBLIC_WS_URL=ws://localhost/ws
    networks:
      - codexos_network

networks:
  codexos_network:
    external: true
EOF

# 3. Deploy stack
docker stack deploy -c docker-stack.yml codexos

# 4. Check service status
docker service ls
docker service ps codexos_backend
docker service ps codexos_frontend
```

### Kubernetes Auto-Scaling
```bash
# 1. Create deployment with auto-scaling
cat > k8s-deployment.yml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: codexos-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: codexos-backend
  template:
    metadata:
      labels:
        app: codexos-backend
    spec:
      containers:
      - name: backend
        image: codexos-backend:latest
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        env:
        - name: DATABASE_URL
          value: "postgresql+asyncpg://codexos:codexos_secure_password@codexos-postgres:5432/codexos_db"
        - name: REDIS_URL
          value: "redis://codexos-redis:6379/0"
        - name: ENVIRONMENT
          value: "production"
        ports:
        - containerPort: 8000
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: codexos-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: codexos-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
EOF

# 2. Apply configuration
kubectl apply -f k8s-deployment.yml

# 3. Check HPA status
kubectl get hpa
kubectl describe hpa codexos-backend-hpa
```

### Custom Auto-Scaling Script
```bash
#!/bin/bash
# /scripts/auto-scale.sh

# Auto-scaling configuration
MIN_BACKEND_INSTANCES=2
MAX_BACKEND_INSTANCES=10
MIN_FRONTEND_INSTANCES=2
MAX_FRONTEND_INSTANCES=8
CPU_THRESHOLD=70
MEMORY_THRESHOLD=80
SCALE_UP_COOLDOWN=300
SCALE_DOWN_COOLDOWN=600

# Check current resource usage
check_resources() {
  CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
  MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
  
  echo "CPU Usage: ${CPU_USAGE}%"
  echo "Memory Usage: ${MEMORY_USAGE}%"
}

# Scale backend services
scale_backend() {
  CURRENT_INSTANCES=$(docker ps --filter "name=codexos-backend" --format "{{.Names}}" | wc -l)
  
  if (( $(echo "$CPU_USAGE > $CPU_THRESHOLD" | bc -l) )) || [ "$MEMORY_USAGE" -gt "$MEMORY_THRESHOLD" ]; then
    if [ "$CURRENT_INSTANCES" -lt "$MAX_BACKEND_INSTANCES" ]; then
      echo "Scaling up backend services..."
      NEW_INSTANCE_NUM=$((CURRENT_INSTANCES + 1))
      
      docker run -d --name "codexos-backend-${NEW_INSTANCE_NUM}" \
        --network codexos_default \
        -p "800${NEW_INSTANCE_NUM}:8000" \
        -e DATABASE_URL="postgresql+asyncpg://codexos:codexos_secure_password@codexos-postgres:5432/codexos_db" \
        -e REDIS_URL="redis://codexos-redis:6379/0" \
        -e WS_MESSAGE_QUEUE="redis://codexos-redis:6379/1" \
        -e SECRET_KEY="your-secret-key-change-in-production" \
        -e ENVIRONMENT="production" \
        codexos-backend:latest
      
      echo "Backend instance ${NEW_INSTANCE_NUM} started"
    fi
  elif (( $(echo "$CPU_USAGE < $((CPU_THRESHOLD - 20))" | bc -l) )) && [ "$MEMORY_USAGE" -lt "$((MEMORY_THRESHOLD - 20))" ]; then
    if [ "$CURRENT_INSTANCES" -gt "$MIN_BACKEND_INSTANCES" ]; then
      echo "Scaling down backend services..."
      LAST_INSTANCE_NUM=$CURRENT_INSTANCES
      
      docker stop "codexos-backend-${LAST_INSTANCE_NUM}"
      docker rm "codexos-backend-${LAST_INSTANCE_NUM}"
      
      echo "Backend instance ${LAST_INSTANCE_NUM} stopped"
    fi
  fi
}

# Scale frontend services
scale_frontend() {
  CURRENT_INSTANCES=$(docker ps --filter "name=codexos-frontend" --format "{{.Names}}" | wc -l)
  
  if (( $(echo "$CPU_USAGE > $CPU_THRESHOLD" | bc -l) )) || [ "$MEMORY_USAGE" -gt "$MEMORY_THRESHOLD" ]; then
    if [ "$CURRENT_INSTANCES" -lt "$MAX_FRONTEND_INSTANCES" ]; then
      echo "Scaling up frontend services..."
      NEW_INSTANCE_NUM=$((CURRENT_INSTANCES + 1))
      
      docker run -d --name "codexos-frontend-${NEW_INSTANCE_NUM}" \
        --network codexos_default \
        -p "300${NEW_INSTANCE_NUM}:3000" \
        -e NEXT_PUBLIC_API_URL=http://localhost/api/v1 \
        -e NEXT_PUBLIC_WS_URL=ws://localhost/ws \
        codexos-frontend:latest
      
      echo "Frontend instance ${NEW_INSTANCE_NUM} started"
    fi
  elif (( $(echo "$CPU_USAGE < $((CPU_THRESHOLD - 20))" | bc -l) )) && [ "$MEMORY_USAGE" -lt "$((MEMORY_THRESHOLD - 20))" ]; then
    if [ "$CURRENT_INSTANCES" -gt "$MIN_FRONTEND_INSTANCES" ]; then
      echo "Scaling down frontend services..."
      LAST_INSTANCE_NUM=$CURRENT_INSTANCES
      
      docker stop "codexos-frontend-${LAST_INSTANCE_NUM}"
      docker rm "codexos-frontend-${LAST_INSTANCE_NUM}"
      
      echo "Frontend instance ${LAST_INSTANCE_NUM} stopped"
    fi
  fi
}

# Main scaling logic
main() {
  echo "Auto-scaling check at $(date)"
  
  check_resources
  scale_backend
  scale_frontend
  
  echo "Current instances:"
  echo "Backend: $(docker ps --filter 'name=codexos-backend' --format '{{.Names}}' | wc -l)"
  echo "Frontend: $(docker ps --filter 'name=codexos-frontend' --format '{{.Names}}' | wc -l)"
  
  echo "Auto-scaling check completed"
}

# Execute scaling
main
```

## 📊 Performance Optimization

### Database Optimization
```bash
# 1. Analyze table performance
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

# 2. Create missing indexes
docker exec codexos-postgres psql -U codexos -d codexos_db -c "
-- Example: Create index on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_execution_history_agent_id ON agent_execution_history(agent_id);"

# 3. Optimize table statistics
docker exec codexos-postgres psql -U codexos -d codexos_db -c "ANALYZE VERBOSE;"

# 4. Vacuum tables
docker exec codexos-postgres psql -U codexos -d codexos_db -c "VACUUM VERBOSE;"
```

### Application Optimization
```bash
# 1. Optimize backend workers
docker exec codexos-backend sh -c "
echo 'WORKERS=4' >> /app/.env
echo 'MAX_REQUESTS=1000' >> /app/.env
echo 'MAX_REQUESTS_JITTER=100' >> /app/.env
echo 'TIMEOUT=30' >> /app/.env"

# 2. Optimize frontend build
docker exec codexos-frontend sh -c "
echo 'NEXT_TELEMETRY_DISABLED=1' >> /app/.env
echo 'NODE_ENV=production' >> /app/.env"

# 3. Restart services
docker restart codexos-backend codexos-frontend

# 4. Verify optimization
docker exec codexos-backend env | grep -E "(WORKERS|MAX_REQUESTS|TIMEOUT)"
docker exec codexos-frontend env | grep -E "(NEXT_TELEMETRY|NODE_ENV)"
```

### Cache Optimization
```bash
# 1. Configure Redis for performance
docker exec codexos-redis redis-cli config set maxmemory 2gb
docker exec codexos-redis redis-cli config set maxmemory-policy allkeys-lru
docker exec codexos-redis redis-cli config set save "900 1 300 10 60 10000"
docker exec codexos-redis redis-cli config set tcp-keepalive 300
docker exec codexos-redis redis-cli config set timeout 0

# 2. Verify Redis configuration
docker exec codexos-redis redis-cli config get maxmemory
docker exec codexos-redis redis-cli config get maxmemory-policy
docker exec codexos-redis redis-cli config get save

# 3. Monitor Redis performance
docker exec codexos-redis redis-cli info memory
docker exec codexos-redis redis-cli info stats
docker exec codexos-redis redis-cli info clients
```

## 📈 Capacity Planning

### Resource Forecasting
```bash
# 1. Analyze current usage patterns
analyze_usage_patterns() {
  echo "=== Resource Usage Analysis ===" > /var/log/capacity-planning/usage_analysis_$(date +%Y%m%d).log
  
  # CPU usage over time
  echo "CPU Usage Pattern:" >> /var/log/capacity-planning/usage_analysis_$(date +%Y%m%d).log
  for i in {1..24}; do
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    echo "Hour $i: ${CPU_USAGE}%" >> /var/log/capacity-planning/usage_analysis_$(date +%Y%m%d).log
    sleep 3600
  done
  
  # Memory usage over time
  echo "Memory Usage Pattern:" >> /var/log/capacity-planning/usage_analysis_$(date +%Y%m%d).log
  for i in {1..24}; do
    MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    echo "Hour $i: ${MEMORY_USAGE}%" >> /var/log/capacity-planning/usage_analysis_$(date +%Y%m%d).log
    sleep 3600
  done
}

# 2. Predict future requirements
predict_capacity() {
  CURRENT_USERS=$(docker exec codexos-postgres psql -U codexos -d codexos_db -c "SELECT COUNT(*) FROM users;" -t)
  GROWTH_RATE=0.1  # 10% monthly growth
  
  echo "=== Capacity Prediction ===" > /var/log/capacity-planning/capacity_prediction_$(date +%Y%m%d).log
  echo "Current users: $CURRENT_USERS" >> /var/log/capacity-planning/capacity_prediction_$(date +%Y%m%d).log
  
  for month in {1..12}; do
    PREDICTED_USERS=$(echo "$CURRENT_USERS * (1 + $GROWTH_RATE)^$month" | bc -l)
    PREDICTED_CPU=$(echo "$PREDICTED_USERS * 0.001" | bc -l)
    PREDICTED_MEMORY=$(echo "$PREDICTED_USERS * 0.002" | bc -l)
    
    echo "Month $month:" >> /var/log/capacity-planning/capacity_prediction_$(date +%Y%m%d).log
    echo "  Users: $PREDICTED_USERS" >> /var/log/capacity-planning/capacity_prediction_$(date +%Y%m%d).log
    echo "  CPU: ${PREDICTED_CPU} cores" >> /var/log/capacity-planning/capacity_prediction_$(date +%Y%m%d).log
    echo "  Memory: ${PREDICTED_MEMORY} GB" >> /var/log/capacity-planning/capacity_prediction_$(date +%Y%m%d).log
  done
}

# Execute capacity planning
analyze_usage_patterns &
predict_capacity
```

## 📋 Scaling Checklist

### Pre-Scaling
- [ ] Current resource usage analyzed
- [ ] Scaling triggers identified
- [ ] Scaling strategy selected
- [ ] Resource requirements calculated
- [ ] Scaling plan documented

### During Scaling
- [ ] Resources allocated
- [ ] Services scaled gradually
- [ ] Health checks performed
- [ ] Load balancing configured
- [ ] Performance monitored

### Post-Scaling
- [ ] All services healthy
- [ ] Performance benchmarks met
- [ ] Resource usage optimized
- [ ] Monitoring configured
- [ ] Documentation updated

## 🚨 Emergency Scaling

### Rapid Scale-Up
```bash
# 1. Emergency scale-up for high load
emergency_scale_up() {
  echo "EMERGENCY SCALE-UP INITIATED" >> /var/log/scaling/emergency_$(date +%Y%m%d).log
  
  # Scale backend rapidly
  for i in {3..6}; do
    docker run -d --name "codexos-backend-emergency-${i}" \
      --network codexos_default \
      -p "80${i}:8000" \
      -e DATABASE_URL="postgresql+asyncpg://codexos:codexos_secure_password@codexos-postgres:5432/codexos_db" \
      -e REDIS_URL="redis://codexos-redis:6379/0" \
      -e WS_MESSAGE_QUEUE="redis://codexos-redis:6379/1" \
      -e SECRET_KEY="your-secret-key-change-in-production" \
      -e ENVIRONMENT="production" \
      codexos-backend:latest
    
    echo "Emergency backend instance ${i} started" >> /var/log/scaling/emergency_$(date +%Y%m%d).log
  done
  
  # Scale frontend rapidly
  for i in {2..5}; do
    docker run -d --name "codexos-frontend-emergency-${i}" \
      --network codexos_default \
      -p "30${i}:3000" \
      -e NEXT_PUBLIC_API_URL=http://localhost/api/v1 \
      -e NEXT_PUBLIC_WS_URL=ws://localhost/ws \
      codexos-frontend:latest
    
    echo "Emergency frontend instance ${i} started" >> /var/log/scaling/emergency_$(date +%Y%m%d).log
  done
  
  echo "Emergency scale-up completed" >> /var/log/scaling/emergency_$(date +%Y%m%d).log
}

# Execute emergency scaling
emergency_scale_up
```

### Load Shedding
```bash
# 1. Implement load shedding for critical situations
load_shedding() {
  echo "LOAD SHEDDING INITIATED" >> /var/log/scaling/load_shedding_$(date +%Y%m%d).log
  
  # Disable non-critical features
  docker exec codexos-backend sh -c "
  echo 'FEATURE_FLAGS_ANALYTICS=false' >> /app/.env
  echo 'FEATURE_FLAGS_REPORTING=false' >> /app/.env
  echo 'FEATURE_FLAGS_EXPERIMENTAL=false' >> /app/.env"
  
  # Reduce logging verbosity
  docker exec codexos-backend sh -c "echo 'LOG_LEVEL=ERROR' > /app/.env"
  docker exec codexos-frontend sh -c "echo 'NEXT_PUBLIC_LOG_LEVEL=error' > /app/.env"
  
  # Restart services with reduced features
  docker restart codexos-backend codexos-frontend
  
  echo "Load shedding completed" >> /var/log/scaling/load_shedding_$(date +%Y%m%d).log
}

# Execute load shedding if needed
if [ "$CPU_USAGE" -gt 95 ] || [ "$MEMORY_USAGE" -gt 95 ]; then
  load_shedding
fi
```

## 📚 References

- [CodexOS Architecture](../architecture.md)
- [Performance Issues](performance-issues.md)
- [Monitoring & Alerting](monitoring-alerting.md)
- [System Updates](system-updates.md)
- [Capacity Planning Guide](../capacity-planning.md)
- [Scaling Best Practices](../best-practices.md#scaling)
