const fs = require('fs').promises;
const path = require('path');
const Download = require('../models/Download');
const logger = require('../utils/logger');

class CleanupService {
  constructor() {
    this.storagePath = path.resolve(process.env.STORAGE_PATH || './storage/downloads');
    this.tempPath = path.resolve(process.env.TEMP_PATH || './storage/temp');
    // Default: Keep files for 24 hours after download
    this.fileRetentionHours = parseInt(process.env.FILE_RETENTION_HOURS) || 24;
  }

  /**
   * Clean up old downloaded files
   * Deletes files older than retention period
   */
  async cleanupOldFiles() {
    try {
      const cutoffTime = new Date(Date.now() - this.fileRetentionHours * 60 * 60 * 1000);
      
      // Find completed downloads older than retention period
      const oldDownloads = await Download.find({
        status: 'completed',
        completedAt: { $lt: cutoffTime },
        filePath: { $exists: true, $ne: null }
      });

      let deletedCount = 0;
      let freedSpace = 0;

      for (const download of oldDownloads) {
        try {
          // Delete physical file
          const filePath = download.filePath;
          if (filePath) {
            const stats = await fs.stat(filePath);
            await fs.unlink(filePath);
            freedSpace += stats.size;
            deletedCount++;
            
            // Update database record
            download.filePath = null;
            download.fileName = null;
            await download.save();
            
            logger.info(`Cleaned up old file: ${path.basename(filePath)}`);
          }
        } catch (err) {
          logger.warn(`Failed to delete file: ${err.message}`);
        }
      }

      if (deletedCount > 0) {
        logger.info(`Cleanup complete: ${deletedCount} files deleted, ${this.formatBytes(freedSpace)} freed`);
      }

      return { deletedCount, freedSpace };
    } catch (error) {
      logger.error(`Cleanup error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clean up orphaned files
   * Files that exist on disk but not in database
   */
  async cleanupOrphanedFiles() {
    try {
      const files = await fs.readdir(this.storagePath);
      let deletedCount = 0;
      let freedSpace = 0;

      for (const file of files) {
        // Skip .gitkeep and hidden files
        if (file.startsWith('.')) continue;

        const filePath = path.join(this.storagePath, file);
        
        // Check if file exists in database
        const existsInDb = await Download.exists({ fileName: file });
        
        if (!existsInDb) {
          try {
            const stats = await fs.stat(filePath);
            await fs.unlink(filePath);
            freedSpace += stats.size;
            deletedCount++;
            logger.info(`Deleted orphaned file: ${file}`);
          } catch (err) {
            logger.warn(`Failed to delete orphaned file: ${err.message}`);
          }
        }
      }

      if (deletedCount > 0) {
        logger.info(`Orphaned cleanup: ${deletedCount} files deleted, ${this.formatBytes(freedSpace)} freed`);
      }

      return { deletedCount, freedSpace };
    } catch (error) {
      logger.error(`Orphaned cleanup error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clean up temp directory
   * Delete all files in temp folder
   */
  async cleanupTempFiles() {
    try {
      const files = await fs.readdir(this.tempPath);
      let deletedCount = 0;
      let freedSpace = 0;

      for (const file of files) {
        if (file.startsWith('.')) continue;

        const filePath = path.join(this.tempPath, file);
        try {
          const stats = await fs.stat(filePath);
          await fs.unlink(filePath);
          freedSpace += stats.size;
          deletedCount++;
        } catch (err) {
          logger.warn(`Failed to delete temp file: ${err.message}`);
        }
      }

      if (deletedCount > 0) {
        logger.info(`Temp cleanup: ${deletedCount} files deleted, ${this.formatBytes(freedSpace)} freed`);
      }

      return { deletedCount, freedSpace };
    } catch (error) {
      logger.error(`Temp cleanup error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clean up failed downloads
   * Delete database records and files for failed downloads older than 7 days
   */
  async cleanupFailedDownloads() {
    try {
      const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
      
      const failedDownloads = await Download.find({
        status: 'failed',
        createdAt: { $lt: cutoffTime }
      });

      let deletedCount = 0;

      for (const download of failedDownloads) {
        try {
          // Delete file if exists
          if (download.filePath) {
            await fs.unlink(download.filePath).catch(() => {});
          }
          
          // Delete database record
          await Download.deleteOne({ _id: download._id });
          deletedCount++;
        } catch (err) {
          logger.warn(`Failed to cleanup failed download: ${err.message}`);
        }
      }

      if (deletedCount > 0) {
        logger.info(`Failed downloads cleanup: ${deletedCount} records deleted`);
      }

      return { deletedCount };
    } catch (error) {
      logger.error(`Failed downloads cleanup error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Run all cleanup tasks
   */
  async runFullCleanup() {
    logger.info('Starting full cleanup...');
    
    const results = {
      oldFiles: await this.cleanupOldFiles(),
      orphanedFiles: await this.cleanupOrphanedFiles(),
      tempFiles: await this.cleanupTempFiles(),
      failedDownloads: await this.cleanupFailedDownloads()
    };

    const totalDeleted = 
      results.oldFiles.deletedCount + 
      results.orphanedFiles.deletedCount + 
      results.tempFiles.deletedCount +
      results.failedDownloads.deletedCount;

    const totalFreed = 
      (results.oldFiles.freedSpace || 0) + 
      (results.orphanedFiles.freedSpace || 0) + 
      (results.tempFiles.freedSpace || 0);

    logger.info(`Full cleanup complete: ${totalDeleted} items deleted, ${this.formatBytes(totalFreed)} freed`);

    return {
      ...results,
      totalDeleted,
      totalFreed: this.formatBytes(totalFreed)
    };
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    try {
      const files = await fs.readdir(this.storagePath);
      let totalSize = 0;
      let fileCount = 0;

      for (const file of files) {
        if (file.startsWith('.')) continue;
        
        const filePath = path.join(this.storagePath, file);
        try {
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
          fileCount++;
        } catch {}
      }

      return {
        fileCount,
        totalSize,
        totalSizeFormatted: this.formatBytes(totalSize)
      };
    } catch (error) {
      logger.error(`Storage stats error: ${error.message}`);
      return { fileCount: 0, totalSize: 0, totalSizeFormatted: '0 Bytes' };
    }
  }

  formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = new CleanupService();
