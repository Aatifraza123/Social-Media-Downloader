const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  // App branding
  appName: {
    type: String,
    default: 'Downloader Pro',
    maxlength: 50,
  },
  appDescription: {
    type: String,
    default: 'Private Media Ingestion Console',
    maxlength: 100,
  },
  dashboardSubtitle: {
    type: String,
    default: 'Real-time analytics and download management.',
    maxlength: 120,
  },
  loginFooter: {
    type: String,
    default: 'Protected by JWT • Private Instance',
    maxlength: 80,
  },
  defaultFormat: {
    type: String,
    enum: ['mp4', 'webm', 'mp3', 'm4a'],
    default: 'mp4',
  },
  preferredQuality: {
    type: String,
    default: '720p',
  },
  maxConcurrentDownloads: {
    type: Number,
    default: 3,
    min: 1,
    max: 5,
  },
  fileRetentionDays: {
    type: Number,
    default: 30,
    min: 1,
    max: 365,
  },
  autoCleanup: {
    type: Boolean,
    default: true,
  },
  theme: {
    type: String,
    enum: ['dark', 'light'],
    default: 'dark',
  },
  animationsEnabled: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Settings', settingsSchema);
