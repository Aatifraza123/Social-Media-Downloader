#!/bin/bash

##############################################
# Social Media Downloader - Deployment Script
# Run this on your Hostinger VPS
##############################################

set -e  # Exit on any error

echo "🚀 Starting deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/Social-Media-Downloader"
DOMAIN="yourdomain.com"  # CHANGE THIS!

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "   App Directory: $APP_DIR"
echo "   Domain: $DOMAIN"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (use sudo)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Running as root${NC}"

# Step 1: Update system
echo -e "${YELLOW}📦 Step 1: Updating system packages...${NC}"
apt update && apt upgrade -y
echo -e "${GREEN}✅ System updated${NC}"
echo ""

# Step 2: Install Node.js
echo -e "${YELLOW}📦 Step 2: Installing Node.js 20.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
echo "   Node version: $(node -v)"
echo "   NPM version: $(npm -v)"
echo -e "${GREEN}✅ Node.js installed${NC}"
echo ""

# Step 3: Install MongoDB
echo -e "${YELLOW}📦 Step 3: Installing MongoDB...${NC}"
if ! command -v mongod &> /dev/null; then
    curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt update
    apt install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
fi
echo "   MongoDB status: $(systemctl is-active mongod)"
echo -e "${GREEN}✅ MongoDB installed and running${NC}"
echo ""

# Step 4: Install FFmpeg
echo -e "${YELLOW}📦 Step 4: Installing FFmpeg...${NC}"
if ! command -v ffmpeg &> /dev/null; then
    apt install -y ffmpeg
fi
echo "   FFmpeg version: $(ffmpeg -version | head -n 1)"
echo -e "${GREEN}✅ FFmpeg installed${NC}"
echo ""

# Step 5: Install Python and yt-dlp
echo -e "${YELLOW}📦 Step 5: Installing Python and yt-dlp...${NC}"
apt install -y python3 python3-pip
pip3 install -U yt-dlp
echo "   yt-dlp version: $(yt-dlp --version)"
echo -e "${GREEN}✅ Python and yt-dlp installed${NC}"
echo ""

# Step 6: Install PM2
echo -e "${YELLOW}📦 Step 6: Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
echo "   PM2 version: $(pm2 -v)"
echo -e "${GREEN}✅ PM2 installed${NC}"
echo ""

# Step 7: Install Nginx
echo -e "${YELLOW}📦 Step 7: Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
fi
echo "   Nginx status: $(systemctl is-active nginx)"
echo -e "${GREEN}✅ Nginx installed and running${NC}"
echo ""

# Step 8: Clone repository
echo -e "${YELLOW}📥 Step 8: Cloning repository...${NC}"
if [ -d "$APP_DIR" ]; then
    echo "   Directory exists, pulling latest changes..."
    cd $APP_DIR
    git pull origin master
else
    mkdir -p /var/www
    cd /var/www
    git clone https://github.com/Aatifraza123/Social-Media-Downloader.git
fi
echo -e "${GREEN}✅ Repository ready${NC}"
echo ""

# Step 9: Setup Backend
echo -e "${YELLOW}🔧 Step 9: Setting up backend...${NC}"
cd $APP_DIR/server
npm install --production

# Create directories
mkdir -p storage/downloads storage/temp logs
chmod -R 755 storage

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    cat > .env << EOF
NODE_ENV=production
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/social-media-downloader

# JWT - CHANGE THIS!
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRE=7d

# Admin - CHANGE THESE!
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme123

# File Storage
STORAGE_PATH=./storage
MAX_FILE_SIZE=524288000
FILE_RETENTION_HOURS=24
CLEANUP_SCHEDULE=0 */6 * * *

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# CORS
FRONTEND_URL=https://$DOMAIN
EOF
    echo -e "${RED}⚠️  IMPORTANT: Edit $APP_DIR/server/.env and change:${NC}"
    echo "   - ADMIN_PASSWORD"
    echo "   - FRONTEND_URL (your domain)"
fi

echo -e "${GREEN}✅ Backend configured${NC}"
echo ""

# Step 10: Build Frontend
echo -e "${YELLOW}🔧 Step 10: Building frontend...${NC}"
cd $APP_DIR/client
npm install

echo -e "${YELLOW}⚠️  IMPORTANT: Update API URL in src/services/api.js${NC}"
echo "   Change baseURL to: https://$DOMAIN/api"
echo ""
read -p "Press Enter after updating the API URL..."

npm run build
echo -e "${GREEN}✅ Frontend built${NC}"
echo ""

# Step 11: Configure Nginx
echo -e "${YELLOW}🌐 Step 11: Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/social-media-downloader << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Frontend
    location / {
        root $APP_DIR/client/dist;
        try_files \$uri \$uri/ /index.html;
        
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }

    # Downloads
    location /downloads {
        alias $APP_DIR/server/storage/downloads;
        autoindex off;
        client_max_body_size 500M;
    }

    access_log /var/log/nginx/social-media-downloader-access.log;
    error_log /var/log/nginx/social-media-downloader-error.log;
}
EOF

ln -sf /etc/nginx/sites-available/social-media-downloader /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
echo -e "${GREEN}✅ Nginx configured${NC}"
echo ""

# Step 12: Setup SSL
echo -e "${YELLOW}🔒 Step 12: Setting up SSL...${NC}"
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx
fi

echo -e "${YELLOW}Running Certbot for SSL certificate...${NC}"
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || true
echo -e "${GREEN}✅ SSL configured${NC}"
echo ""

# Step 13: Start application
echo -e "${YELLOW}🚀 Step 13: Starting application with PM2...${NC}"
cd $APP_DIR/server
pm2 delete social-media-downloader-api 2>/dev/null || true
pm2 start server.js --name social-media-downloader-api
pm2 save
pm2 startup | tail -n 1 | bash || true
echo -e "${GREEN}✅ Application started${NC}"
echo ""

# Step 14: Setup Firewall
echo -e "${YELLOW}🛡️  Step 14: Configuring firewall...${NC}"
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx Full'
echo -e "${GREEN}✅ Firewall configured${NC}"
echo ""

# Final status
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  🎉 Deployment Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "📊 Service Status:"
echo "   MongoDB:  $(systemctl is-active mongod)"
echo "   Nginx:    $(systemctl is-active nginx)"
echo "   Backend:  $(pm2 status | grep social-media-downloader-api | awk '{print $10}')"
echo ""
echo "🌐 Your site: https://$DOMAIN"
echo ""
echo "📝 Next Steps:"
echo "   1. Update .env file: nano $APP_DIR/server/.env"
echo "   2. Create admin: cd $APP_DIR/server && npm run create-admin"
echo "   3. Test website: https://$DOMAIN"
echo ""
echo "📋 Useful Commands:"
echo "   View logs:    pm2 logs social-media-downloader-api"
echo "   Restart app:  pm2 restart social-media-downloader-api"
echo "   Check status: pm2 status"
echo "   Monitor:      pm2 monit"
echo ""
echo -e "${YELLOW}⚠️  Don't forget to:${NC}"
echo "   - Change admin password in .env"
echo "   - Update API URL in frontend"
echo "   - Create admin user"
echo ""
