# Production Deployment Checklist

## Pre-Deployment (24h before)

- [ ] Review all outstanding PRs/issues
- [ ] Run full test suite (unit + E2E)
- [ ] Generate coverage report
- [ ] Create release notes document
- [ ] Backup production database
- [ ] Review environment variables (.env.production)
- [ ] Verify SSL certificates
- [ ] Test rollback procedure
- [ ] Notify team of deployment window
- [ ] Schedule on-call support

## Security Checklist

- [ ] JWT_SECRET is strong (32+ chars, random)
- [ ] Database password changed from default
- [ ] CORS_ORIGIN set to correct domain(s)
- [ ] No secrets in source code
- [ ] SSL/TLS enabled (HTTPS only)
- [ ] Security headers configured (Nginx)
- [ ] Rate limiting enabled on API
- [ ] CSRF protection active
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled

## Infrastructure Checklist

- [ ] PostgreSQL database created and accessible
- [ ] Docker daemon running
- [ ] Sufficient disk space (min 10GB)
- [ ] Sufficient memory (min 2GB)
- [ ] Port 80, 443, 5432 available
- [ ] Reverse proxy (Nginx) configured
- [ ] SSL certificates installed
- [ ] Domain DNS records correct
- [ ] Email service configured (if needed)
- [ ] Log aggregation configured

## Deployment Steps

### 1. Pre-deployment
```bash
# Verify git status
git status
git log --oneline -5

# Run all tests
npm test
npm run test:e2e

# Build production images
docker-compose build --no-cache
```

### 2. Database Migration
```bash
# Backup current database
pg_dump -h localhost -U mission_user -d mission_control > backup.sql

# Apply migrations
docker-compose exec backend npm run migrate

# Verify migration
docker-compose exec backend npm run migrate:verify
```

### 3. Deploy Services
```bash
# Pull latest code
git pull origin main

# Start services
docker-compose up -d

# Wait for health checks
sleep 30

# Verify all services
docker-compose ps
```

### 4. Post-deployment Verification
```bash
# Check backend health
curl http://localhost:3000/health

# Check frontend
curl http://localhost/

# Verify database connection
docker-compose exec backend npm run db:verify

# View logs
docker-compose logs -f backend frontend
```

### 5. Rollback (if needed)
```bash
# Stop current deployment
docker-compose down

# Restore database
psql -h localhost -U mission_user -d mission_control < backup.sql

# Restart with previous version
git checkout previous_tag
docker-compose up -d
```

## Post-Deployment (1h after)

- [ ] Verify all pages load correctly
- [ ] Test login flow
- [ ] Create a test mission
- [ ] Verify agent status updates
- [ ] Check approval workflow
- [ ] Monitor error logs
- [ ] Verify WebSocket connections
- [ ] Test real-time updates
- [ ] Load testing (optional)
- [ ] Notify stakeholders

## Monitoring Setup

See `/docs/MONITORING.md` for health checks, alerts, and dashboards.

## Rollback Decision Criteria

Rollback if any of:
- Core API endpoints returning 5xx errors
- Database connection failures
- WebSocket connections failing
- Authentication not working
- Critical security issue discovered
- Performance degradation >50%
