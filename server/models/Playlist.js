const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
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
  },
  playlistId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: 'Untitled Playlist',
  },
  uploader: String,
  originalUrl: {
    type: String,
    required: true,
  },
  videoCount: {
    type: Number,
    default: 0,
  },
  videos: [{
    id: String,
    title: String,
    url: String,
    duration: Number,
    thumbnail: String,
    downloadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Download',
    },
    status: {
      type: String,
      enum: ['pending', 'downloading', 'completed', 'failed'],
      default: 'pending',
    },
  }],
  format: {
    type: String,
    default: 'mp4',
  },
  quality: {
    type: String,
    default: '720p',
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  completedCount: {
    type: Number,
    default: 0,
  },
  failedCount: {
    type: Number,
    default: 0,
  },
  estimatedSize: Number,
  error: String,
  completedAt: Date,
}, {
  timestamps: true,
});

playlistSchema.index({ createdAt: -1 });
playlistSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Playlist', playlistSchema);
