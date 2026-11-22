const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['login', 'logout', 'download_start', 'download_complete', 'download_fail', 'settings_change', 'password_change'],
  },
  details: mongoose.Schema.Types.Mixed,
  ip: String,
  userAgent: String,
}, {
  timestamps: true,
});

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
