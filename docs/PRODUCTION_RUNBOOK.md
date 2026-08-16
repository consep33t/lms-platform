# LMS Production Runbook

This document outlines the standard operating procedures for the LMS production environment.

## 1. Zero-Downtime Deployment

We use Docker Compose to manage deployments. To achieve zero-downtime deployments, follow these steps:

1. **Pull the latest code:**
   ```bash
   git pull origin main
   ```
2. **Build the new images:**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```
3. **Run database migrations:**
   ```bash
   docker-compose -f docker-compose.prod.yml run --rm lms_backend python manage.py migrate
   ```
4. **Collect static files:**
   ```bash
   docker-compose -f docker-compose.prod.yml run --rm lms_backend python manage.py collectstatic --noinput
   ```
5. **Restart services gracefully:**
   Use the `--scale` and `--no-deps` features or `docker-compose up -d --build` for rolling updates if supported, or restart containers one by one to minimize downtime.
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --no-deps --build lms_backend lms_celery_worker
   ```

## 2. Incident Response

### Service Unavailability
- **Check container status:** `docker-compose -f docker-compose.prod.yml ps`
- **Check application logs:** `docker-compose -f docker-compose.prod.yml logs --tail=100 lms_backend`
- **Check proxy logs:** `docker-compose -f docker-compose.prod.yml logs --tail=100 lms_nginx`

### High CPU/Memory Usage
- **Identify offending container:** `docker stats`
- **Action:** If a specific worker is stuck, restart the service: `docker-compose -f docker-compose.prod.yml restart <service_name>`

## 3. Database Backup and Restore

### Backup
Automated backups should be scheduled via cron. To trigger a manual backup:
```bash
./scripts/backup_database.sh
```
The backup will be saved in `/var/backups/lms/` by default as a gzip compressed SQL file.

### Restore
To restore from a specific backup file (Note: This will overwrite current data!):
```bash
./scripts/restore_database.sh /path/to/backup_file.sql.gz
```

## 4. Secrets Rotation Procedures

If production secrets (e.g., `SECRET_KEY`, `DB_PASSWORD`, `REDIS_PASSWORD`) are compromised, they must be rotated immediately.

1. **Generate new secrets.**
2. **Update `.env.prod` file** on the production server with the new values.
3. **Restart the database (if DB password changed):**
   ```bash
   docker-compose -f docker-compose.prod.yml down
   # Warning: You may need to manually update the postgres user password inside the volume
   # or clear the volume if acceptable, otherwise connect and run ALTER USER.
   docker-compose -f docker-compose.prod.yml up -d
   ```
4. **Restart application services:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --force-recreate
   ```
5. **Verify application functionality.**
