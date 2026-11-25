require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');
const corsOptions = require('./config/cors');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const downloadManager = require('./services/downloadManager');
const cleanupJob = require('./jobs/cleanup.job');

const authRoutes = require('./routes/auth.routes');
const mediaRoutes = require('./routes/media.routes');
const downloadRoutes = require('./routes/download.routes');
const subtitleRoutes = require('./routes/subtitle.routes');
const playlistRoutes = require('./routes/playlist.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const settingsRoutes = require('./routes/settings.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Nginx reverse proxy
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie-secret'));

// Better JSON parsing with error handling
app.use((req, res, next) => {
  express.json({ limit: '10mb' })(req, res, (err) => {
    if (err) {
      logger.error('JSON parse error:', err.message);
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON in request body'
      });
    }
    next();
  });
});

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  }));
}

app.use('/api/', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/downloads', downloadRoutes);
app.use('/api/subtitles', subtitleRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(clientBuild, 'index.html'));
    }
  });
}

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    await downloadManager.init();
    
    // Start automatic cleanup job
    cleanupJob.start();
    
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use.`);
      } else {
        logger.error('Server error:', err.message);
      }
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    if (process.env.NODE_ENV !== 'test') process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') startServer();

module.exports = app;
