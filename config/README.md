# Configuration Documentation

## Overview

This folder contains Sequelize database configuration for all environments (development, test, production).

## Files

- **`database.js`** - Sequelize CLI configuration for migrations and seeders

## Database Configuration

### Structure

```javascript
module.exports = {
  development: { /* ... */ },
  test: { /* ... */ },
  production: { /* ... */ }
};
```

### Environment Variables

All configurations use environment variables from `.env` file:

```env
# Database Connection
DB_HOST=localhost              # MySQL host
DB_PORT=3306                   # MySQL port
DB_USER=psr_admin             # Database user
DB_PASSWORD=PsrAdmin@2025!    # Database password
DB_NAME=psr_v4_main           # Main database name

# SSL Configuration (Azure MySQL)
DB_SSL_CA=                     # Path to CA certificate (optional)
DB_REJECT_UNAUTHORIZED=false   # SSL certificate validation

# Connection Pool
DB_POOL_MAX=30                 # Maximum connections
DB_POOL_MIN=2                  # Minimum connections
DB_CONNECTION_TIMEOUT=30       # Connection timeout (seconds)
DB_CONNECTION_LIFETIME=300     # Connection lifetime (seconds)
DB_COMMAND_TIMEOUT=60          # Query timeout (seconds)
```

### Development Configuration

```javascript
development: {
  username: process.env.DB_USER || 'psr_admin',
  password: process.env.DB_PASSWORD || 'PsrAdmin@20252!',
  database: process.env.DB_NAME || 'psr_v4_main',
  host: process.env.DB_HOST || '168.231.121.19',
  port: parseInt(process.env.DB_PORT || '3306'),
  dialect: 'mysql',
  timezone: '+05:30',  // Indian Standard Time
  logging: console.log,  // SQL query logging enabled
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
}
```

**Features:**
- ✅ SQL query logging enabled
- ✅ Smaller connection pool
- ✅ Fallback default values
- ✅ Optional SSL (only if `DB_SSL_CA` set)

### Test Configuration

```javascript
test: {
  username: process.env.DB_USER || 'psrcloud',
  password: process.env.DB_PASSWORD || 'Access@LRC2404',
  database: process.env.DB_NAME_TEST || 'psr_v4_c_test',
  host: process.env.DB_HOST || 'psrazuredb.mysql.database.azure.com',
  port: parseInt(process.env.DB_PORT || '3306'),
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true
    }
  },
  logging: false  // No SQL logging in tests
}
```

**Features:**
- ✅ SSL required (Azure MySQL)
- ✅ Logging disabled
- ✅ Separate test database

### Production Configuration

```javascript
production: {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  dialect: 'mysql',
  dialectOptions: {
    ssl: (process.env.DB_SSL_CA && process.env.DB_SSL_CA.trim() !== '') ? {
      require: true,
      rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED !== 'false',
      ca: path.join(process.cwd(), process.env.DB_SSL_CA)
    } : false
  },
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '30'),
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    acquire: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10') * 1000,
    idle: parseInt(process.env.DB_CONNECTION_LIFETIME || '180') * 1000
  },
  logging: false  // No SQL logging in production
}
```

**Features:**
- ✅ No default values (must use `.env`)
- ✅ SSL conditional (localhost = no SSL, Azure = SSL)
- ✅ Large connection pool (max 30)
- ✅ Logging disabled for performance
- ✅ Long connection lifetime (3 minutes idle)

## SSL Configuration

### Local MySQL (No SSL)

```env
DB_HOST=localhost
DB_SSL_CA=
DB_REJECT_UNAUTHORIZED=false
```

The config automatically disables SSL when `DB_SSL_CA` is empty.

### Azure MySQL (SSL Required)

```env
DB_HOST=psrazuredb.mysql.database.azure.com
DB_SSL_CA=certs/DigiCertGlobalRootCA.crt.pem
DB_REJECT_UNAUTHORIZED=false
```

The config automatically enables SSL when `DB_SSL_CA` is set.

### Certificate Setup

1. Download Azure MySQL CA certificate:
   ```bash
   wget https://dl.cacerts.digicert.com/DigiCertGlobalRootCA.crt.pem
   mkdir -p certs
   mv DigiCertGlobalRootCA.crt.pem certs/
   ```

2. Update `.env`:
   ```env
   DB_SSL_CA=certs/DigiCertGlobalRootCA.crt.pem
   ```

## Connection Pool

### Development Pool

```javascript
pool: {
  max: 10,            // Up to 10 connections
  min: 0,             // No minimum
  acquire: 30000,     // 30s timeout to get connection
  idle: 10000         // Close after 10s idle
}
```

**Best for:** Local development with few concurrent users

### Production Pool

```javascript
pool: {
  max: 30,            // Up to 30 connections
  min: 2,             // Keep 2 warm connections
  acquire: 10000,     // 10s timeout to get connection  
  idle: 180000        // Close after 3 minutes idle
}
```

**Best for:** Production with many concurrent users

## Timezone

All configurations use Indian Standard Time (IST):

```javascript
timezone: '+05:30'
```

This ensures:
- All dates stored in IST
- Consistent timestamps across admin schemas
- No conversion issues

## Sequelize CLI Usage

### Run Migrations

```bash
# Development
npx sequelize-cli db:migrate

# Production
npx sequelize-cli db:migrate --env production

# Test
npx sequelize-cli db:migrate --env test
```

### Run Seeders

```bash
# All seeders
npx sequelize-cli db:seed:all --env production

# Specific seeder
npx sequelize-cli db:seed --seed 20241022000001-super-admin-user.js --env production
```

### Undo Migrations

```bash
# Undo last migration
npx sequelize-cli db:migrate:undo --env production

# Undo all migrations
npx sequelize-cli db:migrate:undo:all --env production
```

### Undo Seeders

```bash
# Undo all seeders
npx sequelize-cli db:seed:undo:all --env production

# Undo specific seeder
npx sequelize-cli db:seed:undo --seed 20241022000001-super-admin-user.js --env production
```

## Testing Configuration

### Test Database Connection

```javascript
const config = require('./config/database.js');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  config.production.database,
  config.production.username,
  config.production.password,
  config.production
);

await sequelize.authenticate();
console.log('Connection successful!');
```

### Validate Environment Variables

```bash
node -e "
require('dotenv').config();
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ SET' : '❌ NOT SET');
"
```

## Troubleshooting

### Error: Access denied for user ''@'localhost'

**Cause:** `.env` file not loaded or `DB_USER`/`DB_PASSWORD` not set

**Solution:**
```bash
# Check .env exists
ls -la .env

# Verify contents
cat .env | grep DB_

# Load dotenv explicitly
node -r dotenv/config scripts/init-database.js
```

### Error: Cannot connect to MySQL server

**Cause:** MySQL not running or wrong host/port

**Solution:**
```bash
# Check MySQL status
systemctl status mysql

# Test connection
mysql -u psr_admin -p -h localhost -P 3306

# Check firewall
sudo ufw status
```

### Error: SSL connection error

**Cause:** Certificate file not found or invalid

**Solution:**
```bash
# Check certificate exists
ls -la certs/DigiCertGlobalRootCA.crt.pem

# Try without SSL validation
DB_REJECT_UNAUTHORIZED=false

# Or disable SSL completely
DB_SSL_CA=
```

### Error: Too many connections

**Cause:** Connection pool exhausted

**Solution:**
```bash
# Increase pool size in .env
DB_POOL_MAX=50

# Check active connections
mysql -u root -p -e "SHOW PROCESSLIST;"

# Kill stuck connections
mysql -u root -p -e "KILL <connection_id>;"
```

## Performance Tuning

### Optimize Pool Settings

For high-traffic production:

```env
DB_POOL_MAX=50              # More max connections
DB_POOL_MIN=5               # More warm connections
DB_CONNECTION_TIMEOUT=60    # Longer timeout
DB_CONNECTION_LIFETIME=600  # Longer lifetime (10 min)
```

For low-traffic staging:

```env
DB_POOL_MAX=10              # Fewer connections
DB_POOL_MIN=1               # Minimal warm connections
DB_CONNECTION_TIMEOUT=30    # Normal timeout
DB_CONNECTION_LIFETIME=300  # Normal lifetime (5 min)
```

### Monitor Connection Pool

```javascript
const sequelize = require('./src/lib/database');

setInterval(() => {
  console.log('Pool stats:', {
    size: sequelize.connectionManager.pool.size,
    available: sequelize.connectionManager.pool.available,
    using: sequelize.connectionManager.pool.using,
    waiting: sequelize.connectionManager.pool.pending
  });
}, 10000);  // Every 10 seconds
```

## Security Best Practices

1. **Never commit `.env` file**
   ```bash
   # .gitignore already includes:
   .env
   .env.local
   .env.production
   ```

2. **Use strong passwords**
   ```bash
   # Generate secure password
   openssl rand -base64 32
   ```

3. **Limit user privileges**
   ```sql
   -- Only grant necessary privileges
   GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, CREATE TEMPORARY TABLES 
   ON psr_v4_main.* TO 'psr_admin'@'localhost';
   ```

4. **Enable SSL in production**
   ```env
   DB_SSL_CA=certs/ca-cert.pem
   DB_REJECT_UNAUTHORIZED=true
   ```

5. **Rotate credentials regularly**
   ```bash
   # Update password every 90 days
   mysql -u root -p -e "ALTER USER 'psr_admin'@'localhost' IDENTIFIED BY 'NewPassword123!';"
   ```

## References

- [Sequelize Configuration](https://sequelize.org/docs/v6/other-topics/migrations/)
- [MySQL Connection Pooling](https://dev.mysql.com/doc/connector-nodejs/en/connector-nodejs-connection-pooling.html)
- [Azure MySQL SSL](https://docs.microsoft.com/en-us/azure/mysql/howto-configure-ssl)
