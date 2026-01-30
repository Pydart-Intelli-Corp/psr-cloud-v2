module.exports = {
  apps: [
    {
      name: 'psr-v4',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/psr-v4',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/www/psr-v4/logs/err.log',
      out_file: '/var/www/psr-v4/logs/out.log',
      log_file: '/var/www/psr-v4/logs/combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'pulse-scheduler',
      script: './pulse-scheduler.js',
      cwd: '/var/www/psr-v4',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/var/www/psr-v4/logs/pulse-err.log',
      out_file: '/var/www/psr-v4/logs/pulse-out.log',
      log_file: '/var/www/psr-v4/logs/pulse-combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'payment-scheduler',
      script: 'scripts/payment-scheduler.js',
      cwd: '/var/www/psr-v4',
      instances: 1,
      exec_mode: 'fork',
      autorestart: false,
      cron_restart: '0 2 * * *', // Run daily at 2 AM
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/var/www/psr-v4/logs/scheduler-err.log',
      out_file: '/var/www/psr-v4/logs/scheduler-out.log',
      log_file: '/var/www/psr-v4/logs/scheduler.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    }
  ],

  deploy: {
    production: {
      user: 'root',
      host: '168.231.121.19',
      ref: 'origin/master',
      repo: 'git@github.com:Pydart-Intelli-Corp/psr-cloud-v2.git',
      path: '/var/www/psr-v4',
      'post-deploy': 'npm ci && npm run build && npx sequelize-cli db:migrate --env production && pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};
