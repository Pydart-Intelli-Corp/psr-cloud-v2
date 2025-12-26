# Performance Optimization Deployment Checklist

## Pre-Deployment Verification ✅

### Local Testing Complete
- [x] Database migrations tested and working
- [x] React Query caching verified
- [x] Lightweight endpoints tested
- [x] Dashboard performance improved
- [x] Analytics page optimized
- [x] Auth/profile caching working
- [x] Database indexes added successfully

### Files to Deploy
```
# New Files
src/lib/queryClient.ts
src/contexts/QueryProvider.tsx
src/hooks/useEntityData.ts
src/app/api/user/dairy/list/route.ts
src/app/api/user/bmc/list/route.ts
src/app/api/user/society/list/route.ts
src/app/api/user/analytics/summary/route.ts
database/migrations/20251226000001-add-performance-indexes.js
database/migrations/20251226000002-add-auth-performance-indexes.js
scripts/add-admin-schema-indexes.js
PERFORMANCE_OPTIMIZATION.md

# Modified Files
config/database.js
src/lib/database.ts
src/app/layout.tsx
src/app/admin/dashboard/page.tsx
src/contexts/UserContext.tsx
src/components/analytics/AnalyticsComponent.tsx (if modified)
package.json (for @tanstack/react-query)
```

## Deployment Steps

### 1. Backup Current Production
```bash
# SSH to VPS
ssh root@168.231.121.19

# Backup database
mysqldump -h 168.231.121.19 -u psr_admin -p psr_v4_main > ~/backup_$(date +%Y%m%d_%H%M%S).sql

# Backup application
cd /var/www
tar -czf psr-v4-backup-$(date +%Y%m%d_%H%M%S).tar.gz psr-v4/
```

### 2. Upload Files to VPS
```bash
# Option A: Using Git (recommended)
cd /var/www/psr-v4
git pull origin main

# Option B: Using FTP/SFTP
# Upload all new and modified files via FileZilla or WinSCP
```

### 3. Install Dependencies
```bash
cd /var/www/psr-v4
npm install
# This will install @tanstack/react-query
```

### 4. Run Database Migrations
```bash
cd /var/www/psr-v4
npx sequelize-cli db:migrate

# Expected output:
# == 20251226000001-add-performance-indexes: migrated (0.7s)
# == 20251226000002-add-auth-performance-indexes: migrated (12.9s)
```

### 5. Add Admin Schema Indexes (only if admins exist before this update)
```bash
cd /var/www/psr-v4
node scripts/add-admin-schema-indexes.js

# This will add indexes to existing admin schemas created before December 26, 2024
# New admin schemas automatically include all performance indexes
# Safe to run - checks for existing indexes before adding
```

**Note**: Admin schemas created after this deployment will automatically include all performance indexes. This step is only needed for existing admins.

### 6. Rebuild Application
```bash
cd /var/www/psr-v4
npm run build

# Wait for build to complete (may take 2-5 minutes)
```

### 7. Restart PM2
```bash
pm2 restart psr-v4 --update-env
pm2 save
```

### 8. Verify Deployment
```bash
# Check PM2 status
pm2 status

# Check logs for errors
pm2 logs psr-v4 --lines 50

# Check application is running
curl -I http://localhost:3000
```

## Post-Deployment Testing

### 1. Test Application Access
- [ ] Open https://v4.poornasreecloud.com
- [ ] Verify homepage loads without errors
- [ ] Check browser console for errors (F12)

### 2. Test Login & Authentication
- [ ] Login as Super Admin (admin / psr@2025)
- [ ] Verify profile loads quickly (<200ms after cache)
- [ ] Check Network tab - should see cached requests after first load

### 3. Test Dashboard Performance
- [ ] Navigate to Admin Dashboard
- [ ] Initial load should be <1 second
- [ ] Subsequent loads should be <200ms (from cache)
- [ ] Check dairy/bmc/society data displays correctly

### 4. Test Sidebar Navigation
- [ ] Click between different sidebar menus
- [ ] Navigation should be <500ms
- [ ] After first load, should be instant from cache

### 5. Test Analytics Page
- [ ] Navigate to Analytics
- [ ] Initial load should be <2 seconds (from ~8-12s)
- [ ] Charts and data should display correctly
- [ ] Filters should work properly

### 6. Test Data Operations
- [ ] Create a test dairy
- [ ] Create a test BMC
- [ ] Create a test society
- [ ] Verify data appears immediately
- [ ] Check refetch works after mutations

## Rollback Plan (if needed)

### If Errors Occur
```bash
# 1. Restore database backup
mysql -h 168.231.121.19 -u psr_admin -p psr_v4_main < ~/backup_YYYYMMDD_HHMMSS.sql

# 2. Restore application files
cd /var/www
rm -rf psr-v4
tar -xzf psr-v4-backup-YYYYMMDD_HHMMSS.tar.gz

# 3. Restart PM2
cd /var/www/psr-v4
pm2 restart psr-v4 --update-env
```

### If Migrations Fail
```bash
# Rollback last migration
npx sequelize-cli db:migrate:undo

# Rollback all recent migrations
npx sequelize-cli db:migrate:undo:all --to 20251121000009-create-milk-sales-table.js
```

## Performance Monitoring

### Key Metrics to Watch
1. **Response Times**
   - Login: <200ms
   - Dashboard: <1s initial, <200ms cached
   - Analytics: <2s initial, <500ms cached
   - API endpoints: <100ms for list endpoints

2. **Database Connections**
   - Pool utilization: Should stay <80%
   - Active connections: Should not exceed 25/30
   - Query times: Should be <50ms for indexed queries

3. **Memory Usage**
   - Node.js process: Monitor with `pm2 monit`
   - Should stay stable (no memory leaks)

4. **Error Rates**
   - Check PM2 logs for errors
   - Monitor 500 errors in browser console

### Monitoring Commands
```bash
# Watch PM2 metrics
pm2 monit

# Check logs in real-time
pm2 logs psr-v4

# Check database connections
mysql -h 168.231.121.19 -u psr_admin -p -e "SHOW PROCESSLIST;"

# Check database indexes
mysql -h 168.231.121.19 -u psr_admin -p psr_v4_main -e "SHOW INDEX FROM users;"
```

## Expected Results

### Before Optimization
- Dashboard load: 3-5 seconds
- Sidebar navigation: 2-4 seconds
- Analytics page: 8-12 seconds
- Profile fetch: Every page load
- Database queries: 200-500ms

### After Optimization
- Dashboard load: <1 second (80% faster)
- Sidebar navigation: <500ms (75% faster)
- Analytics page: <2 seconds (83% faster)
- Profile fetch: Cached for 5 minutes
- Database queries: <50ms (90% faster with indexes)

## Support & Troubleshooting

### Common Issues

**Issue 1: Migration fails with "duplicate key name"**
- Solution: Migration script checks for existing indexes, should skip safely
- If persists: Check which indexes exist and manually update migration

**Issue 2: React Query not caching**
- Solution: Check browser console for QueryProvider errors
- Verify layout.tsx has <QueryProvider> wrapper

**Issue 3: Dashboard still slow**
- Solution: Clear browser cache (Ctrl+Shift+Delete)
- Check Network tab - should see 304 (cached) after first load
- Verify migrations ran successfully

**Issue 4: Build fails**
- Solution: Check Node.js version (should be 18+)
- Run `npm install` again
- Check for TypeScript errors: `npm run type-check`

### Getting Help
- Check PM2 logs: `pm2 logs psr-v4`
- Check application logs: `tail -f /var/www/psr-v4/logs/error.log`
- Review PERFORMANCE_OPTIMIZATION.md for implementation details

## Completion Checklist

- [ ] Backup created
- [ ] Files uploaded
- [ ] Dependencies installed
- [ ] Migrations successful
- [ ] Admin schema indexes added (if applicable)
- [ ] Build completed
- [ ] PM2 restarted
- [ ] Application accessible
- [ ] Login working
- [ ] Dashboard performance verified
- [ ] Analytics performance verified
- [ ] No console errors
- [ ] Performance metrics acceptable

---

**Deployment Date**: _____________  
**Deployed By**: _____________  
**Notes**: _____________

