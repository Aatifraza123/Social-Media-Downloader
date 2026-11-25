const mongoose = require('mongoose');
const logger = require('../utils/logger');

let mongod = null;

const seedAdminUser = async () => {
  try {
    const User = require('../models/User');
    const Settings = require('../models/Settings');
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, password, role: 'admin' });
      await Settings.create({ userId: user._id });
      logger.info(`Initial admin created for local session: ${email}`);
    }
  } catch (err) {
    logger.warn('Admin seed skipped or completed:', err.message);
  }
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    if (uri && !uri.includes('example.com')) {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000,
        maxPoolSize: 10,
      });
      logger.info(`MongoDB connected to external database: ${conn.connection.host}`);
      await seedAdminUser();
      return;
    }
  } catch (error) {
    logger.warn(`External MongoDB connection failed (${error.message}).`);
  }

  // Development Fallback: In-Memory MongoDB Server
  if (process.env.NODE_ENV !== 'production') {
    try {
      logger.info('Starting In-Memory MongoDB engine for local development...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri);
      logger.info(`MongoDB Connected (In-Memory Engine): ${conn.connection.host}`);
      await seedAdminUser();
      return;
    } catch (memErr) {
      logger.error('Failed to start in-memory MongoDB:', memErr.message);
    }
  }

  if (process.env.NODE_ENV === 'production') {
    logger.error('MongoDB connection is required in production environment.');
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error:', err.message);
});

module.exports = connectDB;
