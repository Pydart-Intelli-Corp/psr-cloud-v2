
ssh root@168.231.121.19

Password - ,8n1IlYWf?-hz@Ti9LtN

 /root/deploy.sh

## Performance Optimization Notes (Dec 26, 2024)
## ============================================
## React Query cache configured for instant sidebar navigation:
## - Data cached for 10 minutes (no refetch on navigation)
## - Sidebar navigation is INSTANT after first load
## - Cache persists for 30 minutes
## - Only refetches after mutations (add/edit/delete)
## 
## Converted pages to use React Query:
## - Dashboard: useDashboardData() hook
## - Dairy: useEntityData('dairy') hook  
## - BMC: useEntityData('bmc') hook (recommended)
## - Society: useEntityData('society') hook (recommended)
## - UserContext: useUserProfile() hook
## 
## Result: Sidebar switching is <100ms from cache vs 500-2000ms API calls


cat > /var/www/psr-v4/.env.production << 'EOF'
DB_HOST=168.231.121.19
DB_PORT=3306
DB_USER=psr_admin
DB_PASSWORD=PsrAdmin@20252!
DB_NAME=psr_v4_main
DB_SSL_CA=
DB_REJECT_UNAUTHORIZED=false
NODE_ENV=production
PORT=3000
NEXT_TELEMETRY_DISABLED=1
JWT_SECRET=eM7pYNcpO7vuX3ce85MAStpZHMgz9v5Wmq0GbPLcohOuWw9GC0dQghaxQ1MZFd3/LLtS+2XjlKHMPa3xOMOdNQ==
JWT_REFRESH_SECRET=zY3vqKlaDtgrdly5UguYiDw2R5h+OxuH4tPredZExLpHTpJgsSpYACDmBuSsZCLwLfcwBBtoEtsurvf0CT+WVg==
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
SUPER_ADMIN_USERNAME=superadmin
SUPER_ADMIN_PASSWORD=psr$20252
SUPER_ADMIN_EMAIL=rndpoornasree@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=online.poornasree@gmail.com
SMTP_PASSWORD=ktbc iqnm jozi jdaq
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=online.poornasree@gmail.com
EMAIL_PASSWORD=ktbc iqnm jozi jdaq
EMAIL_FROM=noreply@poornasreeequipments.com
NEXT_PUBLIC_API_URL=https://v4.poornasreecloud.com
NEXT_PUBLIC_APP_URL=https://v4.poornasreecloud.com
CLIENT_URL=https://v4.poornasreecloud.com
EOF

chmod 600 /var/www/psr-v4/.env.production
ls -la /var/www/psr-v4/.env.production
pm2 restart psr-v4



pm2 logs psr-v4 --lines 50