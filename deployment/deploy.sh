#!/bin/bash
set -e

# ==============================================================================
# Hostinger Ubuntu VPS Non-Destructive Deployment Script
# Social Media Downloader Pro
# ==============================================================================

echo ">>> [1/7] Performing pre-flight system inspections..."

# Check free disk space
FREE_DISK=$(df -h / | awk 'NR==2 {print $4}')
echo "Available Disk Space: $FREE_DISK"

# Check available memory
free -m

# Check Node.js and PM2
node -v || { echo "Node.js not found. Please install Node.js v18+"; exit 1; }
pm2 -v || { echo "PM2 not found. Install with: sudo npm install -g pm2"; exit 1; }

APP_DIR="/var/www/social-media-downloader-pro"
echo ">>> [2/7] Ensuring target directory exists ($APP_DIR)..."
sudo mkdir -p "$APP_DIR"
sudo chown -R $USER:$USER "$APP_DIR"

echo ">>> [3/7] Installing production backend dependencies..."
cd "$APP_DIR/server"
npm ci --omit=dev

echo ">>> [4/7] Building frontend production bundle..."
cd "$APP_DIR/client"
npm ci
npm run build

echo ">>> [5/7] Ensuring storage directories and permissions..."
mkdir -p "$APP_DIR/server/storage/downloads"
mkdir -p "$APP_DIR/server/storage/temp"
mkdir -p "$APP_DIR/server/logs"

echo ">>> [6/7] Managing PM2 process in isolated namespace..."
pm2 startOrReload "$APP_DIR/deployment/ecosystem.config.cjs" --update-env

echo ">>> [7/7] Testing health endpoint..."
sleep 3
curl -f http://127.0.0.1:5000/api/health || {
  echo "Health check failed! Checking logs:";
  pm2 logs sm-downloader-api --lines 20;
  exit 1;
}

echo ">>> Deployment completed successfully!"
