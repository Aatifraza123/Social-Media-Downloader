const downloadManager = require('../services/downloadManager');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');

exports.getStats = async (req, res) => {
  try {
    const stats = await downloadManager.getStats(req.user._id);
    return ApiResponse.success(res, stats, 'Dashboard statistics');
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    return ApiResponse.error(res, 'Failed to load stats');
  }
};

exports.getCharts = async (req, res) => {
  try {
    const charts = await downloadManager.getChartData(req.user._id);
    return ApiResponse.success(res, charts, 'Dashboard chart metrics');
  } catch (error) {
    logger.error('Dashboard charts error:', error);
    return ApiResponse.error(res, 'Failed to load chart data');
  }
};
