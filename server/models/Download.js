const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true,
  },
  platform: {
    type: String,
    enum: ['youtube', 'instagram', 'twitter', 'tiktok'],
    required: true,
    index: true,
  },
  originalUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: 'Untitled Media',
  },
  mediaType: {
    type: String,
    enum: ['video', 'audio', 'image'],
    required: true,
    default: 'video',
  },
  format: {
    type: String,
    enum: ['mp4', 'webm', 'mp3', 'm4a', 'jpg', 'png', 'webp'],
    default: 'mp4',
  },
  quality: {
    type: String,
    default: '720p',
  },
  fileName: String,
  fileSize: {
    type: Number,
    default: 0,
  },
  downloadedBytes: {
    type: Number,
    default: 0,
  },
  storagePath: {
    type: String,
    select: false,
  },
  cloudinaryUrl: {
    type: String,
    select: false,
  },
  cloudinaryPublicId: {
    type: String,
    select: false,
  },
  thumbnail: String,
  duration: String,
  creator: String,
  status: {
    type: String,
    enum: ['pending', 'validating', 'processing', 'downloading', 'completed', 'failed', 'cancelled', 'retrying'],
    default: 'pending',
    index: true,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  error: String,
  completedAt: Date,
}, {
  timestamps: true,
});

downloadSchema.index({ createdAt: -1 });
downloadSchema.index({ userId: 1, status: 1 });
downloadSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Download', downloadSchema);
