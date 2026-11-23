const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const Download = require('../models/Download');
const YouTubeService = require('./platforms/youtube.service');
const InstagramService = require('./platforms/instagram.service');
const TwitterService = require('./platforms/twitter.service');
const PlatformDetector = require('./platforms/platformDetector');
const cloudinaryService = require('./cloudinary.service');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

class DownloadManager {
  constructor() {
    this.storagePath = path.resolve(process.env.STORAGE_PATH || './storage/downloads');
    this.tempPath = path.resolve(process.env.TEMP_PATH || './storage/temp');
    this.maxConcurrent = parseInt(process.env.MAX_CONCURRENT_DOWNLOADS) || 3;
    this.maxFileSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB) || 2048;
    this.listeners = new Map();
  }

  async init() {
    await fs.mkdir(this.storagePath, { recursive: true });
    await fs.mkdir(this.tempPath, { recursive: true });
    logger.info('DownloadManager directories initialized');
  }

  getService(platform) {
    switch (platform) {
      case 'youtube': return YouTubeService;
      case 'instagram': return InstagramService;
      case 'twitter': return TwitterService;
      default: throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  async analyze(url) {
    const detected = PlatformDetector.detect(url);
    if (!detected) {
      throw new Error('Unsupported platform. Supported: YouTube, Instagram, X (Twitter)');
    }
    const service = this.getService(detected.platform);
    const metadata = await service.analyze(url);
    return {
      ...metadata,
      platformInfo: detected,
    };
  }

  async startDownload(userId, { url, platform, format = 'mp4', quality = '720p' }) {
    const activeCount = await Download.countDocuments({
      ...(userId ? { userId } : {}),
      status: { $in: ['pending', 'validating', 'processing', 'downloading'] },
    });

    if (activeCount >= this.maxConcurrent) {
      throw new Error(`Maximum concurrent downloads (${this.maxConcurrent}) reached. Please wait.`);
    }

    const detected = PlatformDetector.detect(url);
    const actualPlatform = platform || (detected ? detected.platform : 'youtube');
    const ext = format === 'mp3' ? 'mp3' : format === 'webm' ? 'webm' : format === 'jpg' ? 'jpg' : 'mp4';
    const fileName = `${uuidv4()}.${ext}`;
    const outputPath = path.join(this.storagePath, fileName);

    const mediaType = ['mp3', 'm4a'].includes(format) || quality === 'audio'
      ? 'audio'
      : format === 'jpg' || quality === 'image'
        ? 'image'
        : 'video';

    const downloadData = {
      platform: actualPlatform,
      originalUrl: url,
      mediaType,
      format: ext,
      quality: quality || 'best',
      fileName,
      storagePath: outputPath,
      status: 'pending',
      progress: 5,
    };
    if (userId) downloadData.userId = userId;

    const download = await Download.create(downloadData);

    this.processDownload(download, url, ext, quality, outputPath).catch(err => {
      logger.error(`Download task failure ${download._id}:`, err.message);
    });

    return download;
  }

  async processDownload(download, url, format, quality, outputPath) {
    try {
      await this.updateStatus(download._id, 'validating', 15);
      const service = this.getService(download.platform);

      try {
        const metadata = await service.analyze(url);
        download.title = metadata.title || download.title;
        download.thumbnail = metadata.thumbnail || download.thumbnail;
        download.creator = metadata.creator || download.creator;
        download.duration = metadata.duration || download.duration;
        
        // Set estimated file size if available
        if (metadata.estimatedSize) {
          download.fileSize = metadata.estimatedSize;
        }
        
        await download.save();

        // Block image-only posts if trying to download as video
        if (metadata.isImagePost && format !== 'jpg' && quality !== 'image') {
          throw new Error('This Instagram post contains only images and cannot be downloaded as video.');
        }
      } catch (err) {
        if (err.message.includes('only images')) throw err;
        logger.warn('Metadata enrichment error in processDownload:', err.message);
      }

      await this.updateStatus(download._id, 'processing', 35);
      await this.updateStatus(download._id, 'downloading', 60);

      await service.download(url, format, quality, outputPath);

      let stat;
      try {
        stat = await fs.stat(outputPath);
      } catch {
        throw new Error('Download file not found after yt-dlp completed. The file may have failed to save.');
      }
      const fileSize = stat.size;
      if (fileSize < 1000) {
        throw new Error(`Downloaded file is too small (${fileSize} bytes). Download likely failed silently.`);
      }

      // Upload to Cloudinary if configured
      let cloudinaryUrl = null;
      let cloudinaryPublicId = null;
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        try {
          await this.updateStatus(download._id, 'processing', 80);
          logger.info(`Uploading to Cloudinary: ${download._id}`);
          const uploaded = await cloudinaryService.uploadFile(outputPath, {
            folder: `social-downloader/${download.platform}`,
            publicId: download._id.toString(),
          });
          cloudinaryUrl = uploaded.url;
          cloudinaryPublicId = uploaded.publicId;
          logger.info(`Cloudinary upload done: ${cloudinaryUrl}`);
          // Delete local file after successful upload
          try { await fs.unlink(outputPath); } catch {}
        } catch (uploadErr) {
          logger.warn(`Cloudinary upload failed, keeping local file: ${uploadErr.message}`);
        }
      }

      download.status = 'completed';
      download.progress = 100;
      download.fileSize = fileSize;
      download.downloadedBytes = fileSize;
      download.completedAt = new Date();
      if (cloudinaryUrl) {
        download.cloudinaryUrl = cloudinaryUrl;
        download.cloudinaryPublicId = cloudinaryPublicId;
        download.storagePath = null; // no longer on disk
      }
      await download.save();

      this.notifyListeners(download._id.toString(), { 
        status: 'completed', 
        progress: 100,
        fileSize: fileSize,
        downloadedBytes: fileSize
      });
      logger.info(`Download completed: ${download._id}`);
    } catch (err) {
      download.status = 'failed';
      download.error = err.message;
      await download.save();
      this.notifyListeners(download._id.toString(), { status: 'failed', error: err.message });
      try { await fs.unlink(outputPath); } catch {}
    }
  }

  async updateStatus(downloadId, status, progress, extraData = {}) {
    const updateFields = { status, progress, ...extraData };
    await Download.findByIdAndUpdate(downloadId, updateFields);
    
    // Get current download data for notification
    const download = await Download.findById(downloadId);
    this.notifyListeners(downloadId.toString(), { 
      status, 
      progress,
      fileSize: download?.fileSize || 0,
      downloadedBytes: download?.downloadedBytes || 0,
      ...extraData
    });
  }

  async cancelDownload(downloadId, userId) {
    const query = { _id: downloadId };
    if (userId) query.userId = userId;
    const download = await Download.findOne(query);
    if (!download) throw new Error('Download not found');
    if (['completed', 'cancelled', 'failed'].includes(download.status)) {
      throw new Error(`Cannot cancel a ${download.status} download`);
    }
    download.status = 'cancelled';
    await download.save();
    this.notifyListeners(downloadId.toString(), { status: 'cancelled' });
    return download;
  }

  async retryDownload(downloadId, userId) {
    const download = await Download.findOne({ _id: downloadId, userId }).select('+storagePath');
    if (!download) throw new Error('Download not found');
    download.status = 'pending';
    download.progress = 0;
    download.error = null;
    await download.save();

    this.processDownload(
      download,
      download.originalUrl,
      download.format,
      download.quality,
      download.storagePath || path.join(this.storagePath, download.fileName)
    ).catch(console.error);

    return download;
  }

  async deleteDownload(downloadId, userId) {
    const download = await Download.findOne({ _id: downloadId, userId }).select('+storagePath +cloudinaryPublicId +format');
    if (!download) throw new Error('Download not found');

    // Delete from Cloudinary if stored there
    if (download.cloudinaryPublicId) {
      const resourceType = download.format === 'jpg' ? 'image' : 'video';
      await cloudinaryService.deleteFile(download.cloudinaryPublicId, resourceType);
    }

    // Delete local file if still exists
    if (download.storagePath) {
      try { await fs.unlink(download.storagePath); } catch {}
    }

    await Download.findByIdAndDelete(downloadId);
    return { success: true };
  }

  async getFilePath(downloadId, userId) {
    const query = { _id: downloadId };
    if (userId) query.userId = userId;
    const download = await Download.findOne(query).select('+storagePath +cloudinaryUrl +cloudinaryPublicId');
    if (!download) throw new Error('Download not found');

    // If stored on Cloudinary, return the URL for redirect
    if (download.cloudinaryUrl) {
      return {
        cloudinaryUrl: download.cloudinaryUrl,
        fileName: `${(download.title || 'media').replace(/[^a-z0-9]/gi, '_')}.${download.format}`,
        mimeType: download.format === 'mp3' ? 'audio/mpeg'
                : download.format === 'jpg' ? 'image/jpeg'
                : 'video/mp4',
      };
    }

    // Fallback: local file
    const resolvedPath = path.resolve(download.storagePath);
    try {
      await fs.access(resolvedPath);
    } catch {
      throw new Error('File not found. It may have been deleted.');
    }
    return {
      filePath: resolvedPath,
      fileName: `${(download.title || 'media').replace(/[^a-z0-9]/gi, '_')}.${download.format}`,
      mimeType: download.format === 'mp3' ? 'audio/mpeg'
              : download.format === 'jpg' ? 'image/jpeg'
              : 'video/mp4',
    };
  }

  addListener(id, res) {
    if (!this.listeners.has(id)) this.listeners.set(id, new Set());
    this.listeners.get(id).add(res);
  }

  removeListener(id, res) {
    const set = this.listeners.get(id);
    if (set) {
      set.delete(res);
      if (set.size === 0) this.listeners.delete(id);
    }
  }

  notifyListeners(id, data) {
    const set = this.listeners.get(id);
    if (set) {
      for (const res of set) {
        try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch {}
      }
    }
  }

  async getStats(userId) {
    const [total, completed, failed, todayCount, monthCount] = await Promise.all([
      Download.countDocuments({ userId }),
      Download.countDocuments({ userId, status: 'completed' }),
      Download.countDocuments({ userId, status: 'failed' }),
      Download.countDocuments({
        userId,
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      Download.countDocuments({
        userId,
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      }),
    ]);

    let storageUsed = 0;
    try {
      const uId = new mongoose.Types.ObjectId(userId.toString());
      const res = await Download.aggregate([
        { $match: { userId: uId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$fileSize' } } },
      ]);
      storageUsed = res[0]?.total || 0;
    } catch {}

    return {
      total,
      completed,
      failed,
      cancelled: Math.max(0, total - completed - failed),
      downloadsToday: todayCount,
      downloadsThisMonth: monthCount,
      storageUsed,
      storageUsedFormatted: this.formatBytes(storageUsed),
    };
  }

  async getChartData(userId) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const uId = new mongoose.Types.ObjectId(userId.toString());

    let downloadsOverTime = [];
    let platformDistribution = [];
    let statusDistribution = [];

    try {
      [downloadsOverTime, platformDistribution, statusDistribution] = await Promise.all([
        Download.aggregate([
          { $match: { userId: uId, createdAt: { $gte: thirtyDaysAgo } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Download.aggregate([
          { $match: { userId: uId } },
          { $group: { _id: '$platform', count: { $sum: 1 } } },
        ]),
        Download.aggregate([
          { $match: { userId: uId } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
      ]);
    } catch {}

    return {
      downloadsOverTime: downloadsOverTime.map(d => ({ date: d._id, count: d.count })),
      platformDistribution: platformDistribution.map(d => ({ platform: d._id, count: d.count })),
      statusDistribution: statusDistribution.map(d => ({ status: d._id, count: d.count })),
    };
  }

  formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = new DownloadManager();
