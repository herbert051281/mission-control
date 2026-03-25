# Deployment Guide

Complete guide for deploying Mission Control to production environments.

## Pre-Deployment Checklist

### Security
- [ ] Generate strong JWT secret (32+ random characters)
- [ ] Set secure PostgreSQL password (16+ characters, mixed case/numbers/symbols)
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure CORS origin to your domain only
- [ ] Review and harden database firewall rules
- [ ] Disable debug mode in production (NODE_ENV=production)
- [ ] Audit middleware permissions (auth, CORS, rate limiting)
- [ ] Enable database encryption at rest

### Configuration
- [ ] Create `.env.production` file with all required variables
- [ ] Verify database connection string is correct
- [ ] Set appropriate rate limits for your scale
- [ ] Configure email alerts for health check failures
- [ ] Set up log aggregation endpoint (optional)
- [ ] Configure backup retention policy

### Infrastructure
- [ ] Reserve sufficient disk space for database growth
- [ ] Plan for at least 2GB RAM per backend instance
- [ ] Allocate separate volumes for database and backups
- [ ] Ensure network bandwidth supports WebSocket traffic
- [ ] Configure auto-scaling policies (if using cloud provider)

### Testing
- [ ] Run full test suite locally
- [ ] Test deployment script in staging environment
- [ ] Verify backup and restore procedures
- [ ] Load test with expected concurrent users
- [ ] Test database failover (if applicable)

## Environment Variables

### Backend (.env.production)

```bash
# Environment
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://mission_user:STRONG_PASSWORD@db.example.com:5432/mission_control
DATABASE_POOL_SIZE=20
DATABASE_POOL_IDLE_TIMEOUT=10000

# Authentication
JWT_SECRET=YOUR_32_CHARACTER_RANDOM_SECRET_HERE
JWT_EXPIRY=24h

# Security
CORS_ORIGIN=https://mission-control.example.com
RATE_LIMIT_WINDOW=3600000
RATE_LIMIT_MAX_REQUESTS=1000

# WebSocket
WEBSOCKET_PING_INTERVAL=30000
WEBSOCKET_PING_TIMEOUT=5000

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Health Check
HEALTH_CHECK_INTERVAL=60000
HEALTH_CHECK_TIMEOUT=5000

# Optional: Log Aggregation
LOG_AGGREGATION_ENDPOINT=https://logs.example.com/api/logs
LOG_AGGREGATION_KEY=your-api-key

# Optional: Email Alerts
ALERT_EMAIL_FROM=alerts@example.com
ALERT_EMAIL_TO=devops@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=alerts@example.com
SMTP_PASS=smtp-password
```

### Frontend (frontend/.env.production)

```bash
VITE_API_BASE_URL=https://api.mission-control.example.com
VITE_WEBSOCKET_URL=wss://api.mission-control.example.com
VITE_LOG_LEVEL=warn
```

## Docker Deployment

### Quick Start (Single Command)

```bash
# From project root
./scripts/deploy.sh production
```

This script:
1. Validates configuration
2. Builds Docker images
3. Starts all services
4. Runs database migrations
5. Verifies health checks

### Manual Docker Deployment

#### 1. Build Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

#### 2. Start Services

```bash
# Start in background
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f postgres
```

#### 3. Initialize Database

```bash
# Run migrations
docker-compose exec backend npm run migrate

# Seed demo data (optional)
docker-compose exec backend npm run seed

# Verify database connection
docker-compose exec postgres psql -U mission_user -d mission_control -c "SELECT COUNT(*) FROM missions;"
```

#### 4. Verify Health

```bash
# Check backend health
curl http://localhost:3000/health

# Check frontend access
curl http://localhost/

# Check database connectivity
docker-compose exec postgres pg_isready
```

#### 5. Stop Services

```bash
# Graceful stop
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v
```

## Nginx Configuration

Use Nginx as reverse proxy and to serve static assets:

```nginx
# /etc/nginx/sites-available/mission-control

upstream backend {
    least_conn;
    server backend:3000;
    server backend2:3000 backup;
}

server {
    listen 80;
    server_name mission-control.example.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mission-control.example.com;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/mission-control.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mission-control.example.com/privkey.pem;
    
    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;
    
    # API proxy
    location /api/ {
        proxy_pass http://backend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # WebSocket proxy
    location /socket.io/ {
        proxy_pass http://backend/socket.io/;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # Frontend static files
    location / {
        root /var/www/mission-control;
        try_files $uri $uri/ /index.html;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }
    
    # Static assets (JS, CSS, images)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        root /var/www/mission-control;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

## Cloud Provider Deployment

### AWS ECS (Elastic Container Service)

```bash
# Create ECR repositories
aws ecr create-repository --repository-name mission-control/backend
aws ecr create-repository --repository-name mission-control/frontend

# Build and push images
docker build -t mission-control/backend:latest ./backend
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com
docker tag mission-control/backend:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/mission-control/backend:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/mission-control/backend:latest

# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier mission-control-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username mission_user \
  --master-user-password STRONG_PASSWORD \
  --allocated-storage 100

# Create ECS cluster, task definition, and service (via console or CLI)
```

### Heroku Deployment

```bash
# Create Heroku app
heroku create mission-control

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-here
heroku config:set CORS_ORIGIN=https://mission-control.herokuapp.com

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate

# View logs
heroku logs -t
```

### DigitalOcean App Platform

```bash
# Configure app.yaml
cat > app.yaml << EOF
name: mission-control
services:
  - name: backend
    github:
      repo: your-username/mission-control
      branch: main
    build_command: cd backend && npm install && npm run build
    run_command: npm start
    envs:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        value: ${JWT_SECRET}
  - name: frontend
    github:
      repo: your-username/mission-control
      branch: main
    build_command: cd frontend && npm install && npm run build
    run_command: npm start
    source_dir: frontend/dist
databases:
  - name: postgres
    engine: PG
    version: "16"
    production: true
EOF

# Deploy
doctl apps create --spec app.yaml
```

## Database Management

### Backup Strategy

```bash
# Automated daily backups
0 2 * * * pg_dump -U mission_user -h localhost mission_control > /backups/mission-control-$(date +\%Y\%m\%d).sql

# Backup with compression
pg_dump -U mission_user -h localhost mission_control | gzip > backup-$(date +%Y%m%d-%H%M%S).sql.gz

# Full backup with data and schema
pg_dump -U mission_user -h localhost --format=custom mission_control > /backups/mission-control-$(date +%Y%m%d).dump
```

### Restore from Backup

```bash
# From SQL backup
psql -U mission_user -h localhost mission_control < backup.sql

# From compressed backup
gunzip < backup.sql.gz | psql -U mission_user -h localhost mission_control

# From custom format backup
pg_restore -U mission_user -h localhost -d mission_control backup.dump
```

### Database Maintenance

```bash
# Run maintenance (analyze, vacuum, reindex)
docker-compose exec postgres psql -U mission_user -d mission_control << EOF
VACUUM ANALYZE;
REINDEX DATABASE mission_control;
EOF

# Monitor table sizes
docker-compose exec postgres psql -U mission_user -d mission_control << EOF
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
EOF
```

## Monitoring & Health Checks

### Health Check Endpoint

```bash
# Check health every 30 seconds
watch -n 30 'curl -s http://localhost:3000/health | jq'

# Continuous monitoring with alerts
curl -s http://localhost:3000/health | jq '.status'
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-25T21:55:00Z",
  "backend": {
    "status": "healthy",
    "uptime_seconds": 86400
  },
  "database": {
    "status": "healthy",
    "connection_time_ms": 5
  },
  "agents_online": 7,
  "missions_active": 12,
  "approvals_pending": 2
}
```

### Prometheus Metrics (Optional)

```bash
# Add prometheus integration
npm install prom-client

# Metrics endpoint
curl http://localhost:3000/metrics
```

### Log Aggregation

Configure Docker to send logs to ELK, Splunk, or CloudWatch:

```yaml
# docker-compose.yml
services:
  backend:
    logging:
      driver: awslogs
      options:
        awslogs-group: /ecs/mission-control
        awslogs-region: us-east-1
        awslogs-stream-prefix: ecs
```

## Scaling & Performance

### Horizontal Scaling

```yaml
# docker-compose.yml - scale backend to 3 instances
services:
  backend:
    # ... configuration
  
# Start multiple instances
docker-compose up -d --scale backend=3
```

### Load Balancing

With multiple backend instances, use HAProxy or Nginx upstream:

```nginx
upstream backend {
    least_conn;
    server backend1:3000 weight=1;
    server backend2:3000 weight=1;
    server backend3:3000 weight=1;
}
```

### Caching Layer

Add Redis for session caching and WebSocket subscriptions:

```docker-compose
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
```

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# - PORT already in use: lsof -i :3000
# - Database connection: docker-compose exec backend npm run test:db
# - Missing environment variables: cat .env.production
```

### WebSocket Connection Issues

```bash
# Check WebSocket connectivity
wscat -c ws://localhost:3000/socket.io/

# Debug Socket.io
export DEBUG=socket.io:*
npm run dev
```

### Database Performance

```bash
# Check slow queries
docker-compose exec postgres psql -U mission_user -d mission_control << EOF
SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
EOF

# Analyze query plan
EXPLAIN ANALYZE SELECT * FROM missions WHERE status = 'in_progress';
```

### Memory Leaks

```bash
# Monitor memory usage
docker stats mission-control-backend-1

# Heap dump
kill -USR2 <PID> # Creates heapdump
```

## Updates & Rollbacks

### Safe Deployment Process

```bash
# 1. Test in staging
docker-compose -f docker-compose.staging.yml up -d

# 2. Run smoke tests
npm run test:e2e

# 3. Create backup
pg_dump -U mission_user mission_control > pre-deploy-backup.sql

# 4. Deploy to production
docker-compose pull
docker-compose up -d

# 5. Run migrations
docker-compose exec backend npm run migrate

# 6. Verify health
curl http://localhost:3000/health
```

### Rollback Procedure

```bash
# 1. Identify problematic version
docker-compose logs backend | tail -20

# 2. Restore from backup
psql -U mission_user mission_control < pre-deploy-backup.sql

# 3. Revert image version
docker-compose down
sed -i 's/backend:latest/backend:v1.0.0/g' docker-compose.yml
docker-compose up -d

# 4. Verify
curl http://localhost:3000/health
```

## Disaster Recovery

### RTO & RPO Goals
- **RTO** (Recovery Time Objective): 1 hour
- **RPO** (Recovery Point Objective): 15 minutes

### Recovery Steps

1. **Database Corruption**: Restore from backup
2. **Service Failure**: Restart containers or failover to standby
3. **Data Center Failure**: Failover to secondary region
4. **Total System Failure**: Full rebuild from infrastructure-as-code

### Backup Retention

- Daily backups: 7 days
- Weekly backups: 4 weeks
- Monthly backups: 1 year
- Test restore monthly

## Support & Resources

- **Issues**: [GitHub Issues](https://github.com/herbert051281/mission-control/issues)
- **Documentation**: [Read docs](../docs/)
- **Community**: [Discussions](https://github.com/herbert051281/mission-control/discussions)
- **Security**: [Security Policy](../SECURITY.md)

---

**Last Updated**: 2026-03-25
