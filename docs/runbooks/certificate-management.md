# Certificate Management Runbook

> **📚 Docs ▸ Runbooks ▸ Maintenance**  
> **Last Updated**: $(date)  
> **Status**: Active


## Overview
This runbook provides procedures for managing SSL/TLS certificates, including issuance, renewal, deployment, and troubleshooting for the CodexOS platform.

## 🔍 Certificate Inventory

### Certificate Types
- **SSL/TLS Certificates**: Domain validation, organization validation, extended validation
- **Code Signing Certificates**: Application and code signing
- **Client Certificates**: Mutual TLS authentication
- **Internal Certificates**: Self-signed for internal services

### Certificate Locations
```bash
# 1. Check current certificates
ls -la /etc/ssl/certs/
ls -la /etc/ssl/private/

# 2. Check Docker container certificates
docker exec codexos-backend ls -la /app/certs/
docker exec codexos-frontend ls -la /app/certs/

# 3. Check Nginx certificates (if using)
ls -la /etc/nginx/ssl/
ls -la /etc/letsencrypt/live/

# 4. Check certificate expiration
for cert in /etc/ssl/certs/*.crt; do
  echo "Certificate: $cert"
  openssl x509 -in "$cert" -noout -dates
done
```

### Certificate Status Check
```bash
# 1. Check certificate expiration dates
openssl x509 -in /etc/ssl/certs/codexos.crt -noout -dates

# 2. Check certificate details
openssl x509 -in /etc/ssl/certs/codexos.crt -noout -text | grep -E "(Subject|Issuer|Not After)"

# 3. Check certificate chain
openssl x509 -in /etc/ssl/certs/codexos.crt -noout -text | grep -A 10 "Certificate Chain"

# 4. Check private key
openssl rsa -in /etc/ssl/private/codexos.key -check -noout
```

## 🔧 Certificate Issuance

### Let's Encrypt Certificate

#### Domain Validation
```bash
# 1. Install certbot
sudo apt-get update
sudo apt-get install certbot

# 2. Stop services temporarily
docker stop codexos-backend codexos-frontend

# 3. Obtain certificate
sudo certbot certonly --standalone \
  -d codexos.dev \
  -d www.codexos.dev \
  -d api.codexos.dev \
  --email admin@codexos.dev \
  --agree-tos \
  --non-interactive

# 4. Verify certificate
sudo certbot certificates

# 5. Restart services
docker start codexos-backend codexos-frontend
```

#### Wildcard Certificate
```bash
# 1. Add DNS challenge record
# Add TXT record: _acme-challenge.codexos.dev

# 2. Obtain wildcard certificate
sudo certbot certonly --manual \
  --preferred-challenges=dns \
  -d *.codexos.dev \
  -d codexos.dev \
  --email admin@codexos.dev \
  --agree-tos

# 3. Verify certificate
sudo certbot certificates
```

### Commercial Certificate

#### Certificate Request (CSR)
```bash
# 1. Generate private key
openssl genrsa -out /etc/ssl/private/codexos.key 2048

# 2. Generate CSR
openssl req -new -key /etc/ssl/private/codexos.key \
  -out /etc/ssl/certs/codexos.csr \
  -subj "/C=US/ST=State/L=City/O=CodexOS/OU=IT/CN=codexos.dev"

# 3. View CSR details
openssl req -in /etc/ssl/certs/codexos.csr -noout -text

# 4. Submit CSR to CA
# Copy CSR content and submit to certificate authority
```

#### Certificate Installation
```bash
# 1. Download certificate from CA
# Save as /etc/ssl/certs/codexos.crt

# 2. Download intermediate certificate
# Save as /etc/ssl/certs/codexos-intermediate.crt

# 3. Create certificate chain
cat /etc/ssl/certs/codexos.crt /etc/ssl/certs/codexos-intermediate.crt > \
  /etc/ssl/certs/codexos-chain.crt

# 4. Verify certificate
openssl x509 -in /etc/ssl/certs/codexos.crt -noout -text
```

## 🔄 Certificate Renewal

### Let's Encrypt Auto-Renewal
```bash
# 1. Test renewal process
sudo certbot renew --dry-run

# 2. Set up automatic renewal
sudo crontab -e

# Add this line for daily renewal attempts:
# 0 12 * * * /usr/bin/certbot renew --quiet

# 3. Verify cron job
sudo crontab -l

# 4. Test renewal manually
sudo certbot renew
```

### Commercial Certificate Renewal
```bash
# 1. Check expiration date
openssl x509 -in /etc/ssl/certs/codexos.crt -noout -dates

# 2. Generate new CSR if needed
openssl req -new -key /etc/ssl/private/codexos.key \
  -out /etc/ssl/certs/codexos-renewal.csr \
  -subj "/C=US/ST=State/L=City/O=CodexOS/OU=IT/CN=codexos.dev"

# 3. Submit renewal request to CA
# Follow CA's renewal process

# 4. Install renewed certificate
# Replace old certificate with new one
```

### Certificate Deployment
```bash
# 1. Backup current certificates
sudo cp /etc/ssl/certs/codexos.crt /etc/ssl/certs/codexos.crt.backup
sudo cp /etc/ssl/private/codexos.key /etc/ssl/private/codexos.key.backup

# 2. Install new certificates
sudo cp new_certificate.crt /etc/ssl/certs/codexos.crt
sudo cp new_private_key.key /etc/ssl/private/codexos.key

# 3. Set proper permissions
sudo chmod 644 /etc/ssl/certs/codexos.crt
sudo chmod 600 /etc/ssl/private/codexos.key

# 4. Restart services
docker restart codexos-backend codexos-frontend

# 5. Verify deployment
curl -I https://codexos.dev
```

## 🛠️ Certificate Configuration

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/codexos
server {
    listen 80;
    server_name codexos.dev www.codexos.dev;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name codexos.dev www.codexos.dev;

    ssl_certificate /etc/letsencrypt/live/codexos.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/codexos.dev/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Docker Configuration
```bash
# 1. Update docker-compose.yml for SSL
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    container_name: codexos-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - ./nginx/sites-available:/etc/nginx/sites-available
    depends_on:
      - backend
      - frontend

  backend:
    # ... existing backend configuration
    environment:
      - SSL_ENABLED=true
      - SSL_CERT_PATH=/app/certs/codexos.crt
      - SSL_KEY_PATH=/app/certs/codexos.key

  frontend:
    # ... existing frontend configuration
    environment:
      - NEXT_PUBLIC_SSL_ENABLED=true
```

### Application Configuration
```bash
# 1. Backend SSL configuration
docker exec codexos-backend sh -c "
echo 'SSL_ENABLED=true' >> /app/.env
echo 'SSL_CERT_PATH=/app/certs/codexos.crt' >> /app/.env
echo 'SSL_KEY_PATH=/app/certs/codexos.key' >> /app/.env
echo 'SSL_CA_PATH=/app/certs/codexos-chain.crt' >> /app/.env"

# 2. Frontend SSL configuration
docker exec codexos-frontend sh -c "
echo 'NEXT_PUBLIC_SSL_ENABLED=true' >> /app/.env
echo 'NEXT_PUBLIC_API_URL=https://api.codexos.dev/api/v1' >> /app/.env"

# 3. Restart services
docker restart codexos-backend codexos-frontend
```

## 🔍 Certificate Troubleshooting

### Common Issues

#### Certificate Expired
```bash
# 1. Check expiration
openssl x509 -in /etc/ssl/certs/codexos.crt -noout -dates

# 2. Renew certificate
sudo certbot renew

# 3. Verify renewal
sudo certbot certificates

# 4. Restart services
docker restart codexos-backend codexos-frontend
```

#### Certificate Not Trusted
```bash
# 1. Check certificate chain
openssl x509 -in /etc/ssl/certs/codexos.crt -noout -text | grep -A 10 "Certificate Chain"

# 2. Verify intermediate certificate
openssl x509 -in /etc/ssl/certs/codexos-intermediate.crt -noout -text

# 3. Check certificate order
cat /etc/ssl/certs/codexos.crt /etc/ssl/certs/codexos-intermediate.crt > \
  /etc/ssl/certs/codexos-chain.crt

# 4. Update configuration to use chain
```

#### Private Key Mismatch
```bash
# 1. Check private key
openssl rsa -in /etc/ssl/private/codexos.key -check -noout

# 2. Verify key matches certificate
openssl x509 -in /etc/ssl/certs/codexos.crt -noout -modulus | \
  openssl md5
openssl rsa -in /etc/ssl/private/codexos.key -noout -modulus | \
  openssl md5

# 3. If mismatch, regenerate CSR and certificate
```

### SSL/TLS Testing
```bash
# 1. Test SSL connection
openssl s_client -connect codexos.dev:443 -servername codexos.dev

# 2. Test certificate chain
openssl s_client -connect codexos.dev:443 -servername codexos.dev -showcerts

# 3. Test specific protocols
openssl s_client -connect codexos.dev:443 -servername codexos.dev -tls1_2
openssl s_client -connect codexos.dev:443 -servername codexos.dev -tls1_3

# 4. Test cipher suites
nmap --script ssl-enum-ciphers -p 443 codexos.dev
```

## 📊 Certificate Monitoring

### Expiration Monitoring
```yaml
# Prometheus Alert Rules
groups:
- name: certificate_alerts
  rules:
  - alert: CertificateExpiringSoon
    expr: certificate_expiry_timestamp - time() < 86400 * 30  # 30 days
    for: 1h
    labels:
      severity: warning
    annotations:
      summary: "SSL certificate expiring soon"
  
  - alert: CertificateExpired
    expr: certificate_expiry_timestamp - time() < 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "SSL certificate has expired"
  
  - alert: CertificateInvalid
    expr: certificate_validity_status != 1
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "SSL certificate is invalid"
```

### Certificate Metrics
```bash
# 1. Check certificate expiration
echo "Certificate expiration check: $(date)" >> /var/log/certificate-monitoring.log

# 2. Monitor certificate status
for cert in /etc/ssl/certs/*.crt; do
  echo "Certificate: $cert" >> /var/log/certificate-monitoring.log
  openssl x509 -in "$cert" -noout -dates >> /var/log/certificate-monitoring.log
done

# 3. Check Let's Encrypt status
sudo certbot certificates >> /var/log/certificate-monitoring.log

# 4. Monitor SSL/TLS connections
netstat -an | grep :443 | wc -l >> /var/log/certificate-monitoring.log
```

## 📋 Certificate Checklist

### Pre-Issuance
- [ ] Domain ownership verified
- [ ] DNS records configured
- [ ] Server accessible from internet
- [ ] Port 80/443 open
- [ ] Certificate authority selected

### Issuance
- [ ] Private key generated
- [ ] CSR created and submitted
- [ ] Certificate received from CA
- [ ] Certificate chain verified
- [ ] Files properly installed

### Configuration
- [ ] Web server configured for SSL
- [ ] Application configured for SSL
- [ ] HTTP to HTTPS redirect configured
- [ ] Security headers configured
- [ ] SSL/TLS protocols configured

### Deployment
- [ ] Services restarted
- [ ] SSL configuration verified
- [ ] Certificate chain working
- [ ] HTTPS accessible
- [ ] Security scan passed

### Monitoring
- [ ] Expiration monitoring configured
- [ ] Renewal automation set up
- [ ] Alerts configured
- [ ] Regular testing scheduled
- [ ] Documentation updated

## 🚨 Emergency Procedures

### Certificate Expiration
```bash
# 1. Immediate renewal
sudo certbot renew --force-renewal

# 2. Verify renewal
sudo certbot certificates

# 3. Restart services
docker restart codexos-backend codexos-frontend

# 4. Test HTTPS
curl -I https://codexos.dev
```

### Certificate Compromise
```bash
# 1. Revoke compromised certificate
sudo certbot revoke --cert-path /etc/letsencrypt/live/codexos.dev/cert.pem

# 2. Generate new private key
openssl genrsa -out /etc/ssl/private/codexos-new.key 2048

# 3. Generate new CSR
openssl req -new -key /etc/ssl/private/codexos-new.key \
  -out /etc/ssl/certs/codexos-new.csr \
  -subj "/C=US/ST=State/L=City/O=CodexOS/OU=IT/CN=codexos.dev"

# 4. Obtain new certificate
sudo certbot certonly --standalone \
  -d codexos.dev \
  -d www.codexos.dev \
  --email admin@codexos.dev

# 5. Deploy new certificate
sudo cp /etc/letsencrypt/live/codexos.dev/fullchain.pem /etc/ssl/certs/codexos.crt
sudo cp /etc/letsencrypt/live/codexos.dev/privkey.pem /etc/ssl/private/codexos.key

# 6. Restart services
docker restart codexos-backend codexos-frontend
```

## 📚 References

- [CodexOS Security Policy](../security.md)
- [SSL/TLS Best Practices](../security.md#ssl-tls)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [OpenSSL Documentation](https://www.openssl.org/docs/)
- [Nginx SSL Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [Certificate Authority Guidelines](../security.md#certificates)
