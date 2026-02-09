#!/bin/bash

# PSR Cloud V2 - Domain Configuration Script
# Configures v4.poornasreecloud.com with SSL certificate

set -e

DOMAIN="v4.poornasreecloud.com"
APP_DIR="/var/www/psr-v4"
IP_ADDRESS="168.231.121.19"

echo "=========================================="
echo "PSR Cloud V2 - Domain Configuration"
echo "=========================================="
echo "Domain: $DOMAIN"
echo "Server IP: $IP_ADDRESS"
echo "=========================================="
echo ""

# Check if DNS is configured
echo "Step 1: Checking DNS configuration..."
if host $DOMAIN > /dev/null 2>&1; then
    RESOLVED_IP=$(host $DOMAIN | grep "has address" | awk '{print $4}')
    if [ "$RESOLVED_IP" == "$IP_ADDRESS" ]; then
        echo "✅ DNS correctly configured: $DOMAIN → $IP_ADDRESS"
    else
        echo "⚠️  WARNING: DNS points to $RESOLVED_IP, expected $IP_ADDRESS"
        echo "Please update your DNS A record before continuing."
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
else
    echo "⚠️  WARNING: Cannot resolve $DOMAIN"
    echo "Please configure DNS A record first:"
    echo "  Type: A"
    echo "  Name: v4"
    echo "  Value: $IP_ADDRESS"
    echo "  TTL: 3600"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
echo ""

# Update Nginx configuration
echo "Step 2: Updating Nginx configuration..."
cat > /etc/nginx/sites-available/psr-v4 <<'NGINX_CONFIG'
server {
    listen 80;
    server_name v4.poornasreecloud.com 168.231.121.19;

    # Increase upload size
    client_max_body_size 100M;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeouts
        proxy_connect_timeout 75s;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
}
NGINX_CONFIG

# Test and reload Nginx
nginx -t
if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo "✅ Nginx configuration updated"
else
    echo "❌ Nginx configuration test failed"
    exit 1
fi
echo ""

# Update .env file
echo "Step 3: Updating environment variables..."
cd $APP_DIR

# Backup current .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Update URLs in .env
sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=http://$DOMAIN|g" .env
sed -i "s|CLIENT_URL=.*|CLIENT_URL=http://$DOMAIN|g" .env

echo "✅ Environment variables updated"
echo ""

# Install Certbot for SSL
echo "Step 4: Installing Certbot for SSL certificate..."
if ! command -v certbot &> /dev/null; then
    apt update -y
    apt install -y certbot python3-certbot-nginx
    echo "✅ Certbot installed"
else
    echo "✅ Certbot already installed"
fi
echo ""

# Obtain SSL certificate
echo "Step 5: Obtaining SSL certificate..."
echo "⚠️  You will be prompted for your email address"
echo ""
read -p "Enter your email for SSL certificate notifications: " SSL_EMAIL

certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $SSL_EMAIL --redirect

if [ $? -eq 0 ]; then
    echo "✅ SSL certificate obtained and configured"
    
    # Update .env to use HTTPS
    sed -i "s|NEXT_PUBLIC_APP_URL=http://|NEXT_PUBLIC_APP_URL=https://|g" .env
    sed -i "s|CLIENT_URL=http://|CLIENT_URL=https://|g" .env
    echo "✅ Updated URLs to use HTTPS"
else
    echo "⚠️  SSL certificate installation failed or skipped"
    echo "Application will be available via HTTP only"
fi
echo ""

# Rebuild application
echo "Step 6: Rebuilding application..."
cd $APP_DIR
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Application rebuilt successfully"
else
    echo "❌ Build failed"
    exit 1
fi
echo ""

# Restart PM2
echo "Step 7: Restarting application..."
pm2 restart psr-v4
pm2 save

echo "✅ Application restarted"
echo ""

# Setup SSL certificate auto-renewal
echo "Step 8: Setting up SSL certificate auto-renewal..."
if command -v certbot &> /dev/null; then
    systemctl enable certbot.timer
    systemctl start certbot.timer
    echo "✅ SSL auto-renewal configured"
fi
echo ""

# Final checks
echo "=========================================="
echo "Configuration Complete!"
echo "=========================================="
echo ""
echo "Application URLs:"
if [ -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
    echo "  🔒 https://$DOMAIN (HTTPS)"
    echo "  🔒 https://www.poornasreecloud.com/v4 (if configured)"
else
    echo "  🔓 http://$DOMAIN (HTTP only)"
fi
echo "  🔓 http://$IP_ADDRESS (Direct IP)"
echo ""
echo "Test the application:"
echo "  curl -I https://$DOMAIN"
echo "  curl -I http://$DOMAIN"
echo ""
echo "SSL Certificate Status:"
certbot certificates 2>/dev/null || echo "No SSL certificates installed"
echo ""
echo "PM2 Status:"
pm2 status
echo ""
echo "=========================================="
