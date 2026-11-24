const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const cleanupService = require('../services/cleanup.service');
const cleanupJob = require('../jobs/cleanup.job');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');

// All routes require authentication
router.use(auth);

/**
 * GET /api/admin/storage/stats
 * Get storage statistics
 */
router.get('/storage/stats', async (req, res) => {
  try {
    const stats = await cleanupService.getStorageStats();
    return ApiResponse.success(res, stats, 'Storage stats retrieved');
  } catch (error) {
    logger.error('Storage stats error:', error.message);
    return ApiResponse.error(res, error.message, 500);
  }
});

/**
 * POST /api/admin/cleanup/run
 * Manually trigger cleanup
 */
router.post('/cleanup/run', async (req, res) => {
  try {
    const results = await cleanupJob.runNow();
    return ApiResponse.success(res, results, 'Cleanup completed successfully');
  } catch (error) {
    logger.error('Manual cleanup error:', error.message);
    return ApiResponse.error(res, error.message, 500);
  }
});

/**
 * DELETE /api/admin/storage/clear
 * Clear all downloaded files (emergency cleanup)
 */
router.delete('/storage/clear', async (req, res) => {
  try {
    const results = {
      oldFiles: await cleanupService.cleanupOldFiles(),
      orphanedFiles: await cleanupService.cleanupOrphanedFiles(),
      tempFiles: await cleanupService.cleanupTempFiles()
    };

    const totalDeleted = 
      results.oldFiles.deletedCount + 
      results.orphanedFiles.deletedCount + 
      results.tempFiles.deletedCount;

    const totalFreed = 
      (results.oldFiles.freedSpace || 0) + 
      (results.orphanedFiles.freedSpace || 0) + 
      (results.tempFiles.freedSpace || 0);

    return ApiResponse.success(res, {
      ...results,
      totalDeleted,
      totalFreed: cleanupService.formatBytes(totalFreed)
    }, 'Storage cleared successfully');
  } catch (error) {
    logger.error('Storage clear error:', error.message);
    return ApiResponse.error(res, error.message, 500);
  }
});

module.exports = router;
