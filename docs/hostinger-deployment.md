# Deploying CodexOS to Hostinger KVM8 VPS

## VPS Requirements Check

Your Hostinger KVM8 VPS specifications:
- **CPU**: 8 vCPU cores ✅ (Excellent for CodexOS)
- **RAM**: 32GB ✅ (More than sufficient)
- **Storage**: 400GB NVMe ✅ (Fast storage, plenty of space)
- **Bandwidth**: 8TB/month ✅ (More than enough)
- **OS**: Ubuntu 22.04 LTS (recommended)

Your VPS exceeds all requirements for running CodexOS!

## Step-by-Step Deployment

### 1. Connect to Your VPS

```bash
ssh root@your-vps-ip
```

### 2. Initial Server Setup

```bash
# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y curl git nginx certbot python3-certbot-nginx

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create deployment user
adduser codexos
usermod -aG docker codexos
usermod -aG sudo codexos
```

### 3. Setup Domain (if you have one)

Point your domain to your VPS IP:
- A record: `@` → `your-vps-ip`
- A record: `www` → `your-vps-ip`
- A record: `api` → `your-vps-ip`

### 4. Clone and Configure CodexOS

```bash
# Switch to codexos user
su - codexos

# Clone repository
git clone https://github.com/yourusername/CodexOS.git
cd CodexOS

# Create production environment file
cp env.production.example .env.production
nano .env.production
```

### 5. Configure Production Environment

Edit `.env.production` with your actual values:

```bash
# Generate secure keys
openssl rand -base64 32  # For SECRET_KEY
openssl rand -base64 32  # For VAULT_MASTER_KEY

# Database password
openssl rand -base64 24  # For DB_PASSWORD

# Redis password
openssl rand -base64 24  # For REDIS_PASSWORD
```

### 6. SSL Certificates

Option A: Using Let's Encrypt (if you have a domain):
```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
```

Option B: Self-signed (for testing without domain):
```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

### 7. Deploy CodexOS

```bash
# Run deployment
./deploy.sh production
```

### 8. Configure Firewall

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw --force enable
```

### 9. Setup Monitoring (Optional)

Access Grafana at `http://your-vps-ip:3000` (internal only)
- Username: admin
- Password: (from your .env.production)

### 10. Configure Backups

The system includes automated backups. For additional safety:

```bash
# Setup offsite backup (to another server or S3)
crontab -e

# Add daily backup to S3 (requires aws cli configured)
0 2 * * * /home/codexos/CodexOS/backup-to-s3.sh
```

## Performance Optimization for KVM8

With your powerful VPS, you can optimize for performance:

### 1. Increase Worker Processes

Edit `docker-compose.prod.yml`:
```yaml
backend:
  command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 8
```

### 2. Increase Database Connections

```yaml
environment:
  MAX_POOL_SIZE: 50
```

### 3. Redis Memory

```yaml
redis:
  command: redis-server --maxmemory 4gb --maxmemory-policy allkeys-lru
```

## Testing Without Domain

If you don't have a domain yet, you can test using IP:

1. Edit `/etc/hosts` on your local machine:
```
your-vps-ip codexos.local api.codexos.local
```

2. Update `.env.production`:
```
FRONTEND_URL=http://codexos.local
PUBLIC_API_URL=http://api.codexos.local/api/v1
```

3. Access at `http://codexos.local`

## Monitoring & Maintenance

### Check Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### View Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Update CodexOS
```bash
git pull origin main
./deploy.sh production
```

### Backup Database
```bash
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U codexos codexos_db > backup_$(date +%Y%m%d).sql
```

## Troubleshooting

### If services fail to start:
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check disk space
df -h

# Check memory
free -m

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

### If you get permission errors:
```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
newgrp docker
```

## Security Checklist

- [ ] Changed all default passwords
- [ ] Configured firewall
- [ ] SSL certificates installed
- [ ] Disabled root SSH login
- [ ] Setup fail2ban
- [ ] Regular security updates
- [ ] Backup strategy in place

## Support

If you need help with deployment:
1. Check logs: `docker-compose logs`
2. Review this guide
3. Contact support with error details

Your KVM8 VPS is perfect for CodexOS - it can easily handle hundreds of concurrent users!
