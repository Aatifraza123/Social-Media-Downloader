const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
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
