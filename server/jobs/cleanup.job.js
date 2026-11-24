const cron = require('node-cron');
const cleanupService = require('../services/cleanup.service');
const logger = require('../utils/logger');

class CleanupJob {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Start automatic cleanup job
   * Runs every 6 hours by default
   */
  start() {
    // Run cleanup every 6 hours: At minute 0 past every 6th hour
    const schedule = process.env.CLEANUP_SCHEDULE || '0 */6 * * *';
    
    logger.info(`Cleanup job scheduled: ${schedule}`);

    cron.schedule(schedule, async () => {
      if (this.isRunning) {
        logger.warn('Cleanup job already running, skipping...');
        return;
      }

      this.isRunning = true;
      logger.info('Running scheduled cleanup...');

      try {
        const results = await cleanupService.runFullCleanup();
        logger.info('Scheduled cleanup completed successfully', results);
      } catch (error) {
        logger.error('Scheduled cleanup failed:', error.message);
      } finally {
        this.isRunning = false;
      }
    });

    // Run cleanup on startup (after 1 minute delay)
    setTimeout(async () => {
      logger.info('Running initial cleanup...');
      try {
        await cleanupService.runFullCleanup();
      } catch (error) {
        logger.error('Initial cleanup failed:', error.message);
      }
    }, 60000); // 1 minute delay
  }

  /**
   * Run cleanup manually
   */
  async runNow() {
    if (this.isRunning) {
      throw new Error('Cleanup job is already running');
    }

    this.isRunning = true;
    try {
      const results = await cleanupService.runFullCleanup();
      return results;
    } finally {
      this.isRunning = false;
    }
  }
}

module.exports = new CleanupJob();
