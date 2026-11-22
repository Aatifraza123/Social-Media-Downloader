module.exports = {
  apps: [
    {
      name: 'sm-downloader-api',
      script: 'server/server.js',
      cwd: '/var/www/social-media-downloader-pro',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: '/var/log/pm2/sm-downloader-error.log',
      out_file: '/var/log/pm2/sm-downloader-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
