// PM2 Ecosystem Configuration
// This file configures how PM2 manages your application

module.exports = {
  apps: [{
    name: 'social-media-downloader-api',
    script: './server/server.js',
    cwd: '/var/www/Social-Media-Downloader',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './server/logs/pm2-error.log',
    out_file: './server/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Restart policy
    min_uptime: '10s',
    max_restarts: 10,
    
    // Process management
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
