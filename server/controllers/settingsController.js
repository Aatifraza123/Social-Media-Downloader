const Settings = require('../models/Settings');
const ActivityLog = require('../models/ActivityLog');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user._id });
    if (!settings) {
      settings = await Settings.create({ userId: req.user._id });
    }
    return ApiResponse.success(res, settings);
  } catch (error) {
    logger.error('Get settings error:', error);
    return ApiResponse.error(res, 'Failed to load settings');
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const allowed = [
      'defaultFormat', 'preferredQuality', 'maxConcurrentDownloads',
      'fileRetentionDays', 'autoCleanup', 'theme', 'animationsEnabled',
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const settings = await Settings.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updates },
      { new: true, upsert: true }
    );

    await ActivityLog.create({
      userId: req.user._id,
      action: 'settings_change',
      details: updates,
      ip: req.ip,
    });

    return ApiResponse.success(res, settings, 'Settings updated successfully');
  } catch (error) {
    logger.error('Update settings error:', error);
    return ApiResponse.error(res, 'Failed to update settings');
  }
};
