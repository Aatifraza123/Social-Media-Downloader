const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const Download = require('../models/Download');
const YouTubeService = require('./platforms/youtube.service');
const InstagramService = require('./platforms/instagram.service');
const TikTokService = require('./platforms/tiktok.service');
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
      case 'tiktok': return TikTokService;
      case 'twitter': return TwitterService;
      default: throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  async analyze(url) {
    const detected = PlatformDetector.detect(url);
    if (!detected) {
      throw new Error('Unsupported platform. Supported: YouTube, Instagram, X (Twitter), TikTok');
    }
    const service = this.getService(detected.platform);
    const metadata = await service.analyze(url);
    return {
      ...metadata,
      platformInfo: detected,
    };
  }

  async startDownload(userId, { url, platform, format = 'mp4', quality = platform === 'youtube' ? 'best' : '720p', formatId }) {
    const service = this.getService(platform);
    let metadata = {};
    try {
      metadata = await service.analyze(url);
    } catch (err) {
      if (platform === 'youtube' || platform === 'twitter' || platform === 'instagram') throw err;
      if (err.code === 'X_EXTERNAL_VIDEO_UNAVAILABLE') throw err;
      logger.warn(`Metadata pre-fetch failed: ${err.message}`);
    }

    if (platform === 'youtube') {
      const selected = metadata.availableFormats.find(option =>
        option.format === format && (quality === 'best' || option.quality === quality || option.mediaType === 'audio') &&
        (!formatId || option.formatId === formatId));
      if (!selected) throw new Error('Selected YouTube format is unavailable. Analyze the video again.');
      formatId = selected.formatId;
      quality = selected.quality;
    }
    let photo;
    if (platform === 'twitter' && metadata.type === 'image') {
      photo = formatId ? metadata.availableFormats.find(f => f.formatId === formatId) : metadata.availableFormats[0];
      if (!photo) throw new Error('Selected X photo is unavailable.');
      format = photo.format;
      quality = photo.quality;
    }
    const download = await Download.create({
      userId: userId || null,
      originalUrl: url,
      platform,
      format,
      quality,
      mediaType: photo ? 'image' : undefined,
      status: 'pending',
      title: metadata.title || `${platform} media`,
      thumbnail: metadata.thumbnail || null,
      duration: metadata.duration || null,
      creator: metadata.creator || null,
    });

    this.processDownload(download._id, { url, platform, format, quality, formatId, photoSource: photo?.source, videoSource: metadata.videoSource });
    return download;
  }

  async processDownload(downloadId, { url, platform, format, quality, formatId, photoSource, videoSource }) {
    const download = await Download.findById(downloadId);
    if (!download) return;

    try {
      download.status = 'downloading';
      download.progress = 10;
      await download.save();
      this.notifyListeners(downloadId, { status: 'downloading', progress: 10 });

      const service = this.getService(platform);
      const fileId = uuidv4();
      
      // Determine output extension based on format and media type
      let outputExt = (platform === 'youtube' || photoSource) ? format : 'mp4';
      if (format === 'mp3') {
        outputExt = 'mp3';
      } else if (format === 'jpg' || format === 'jpeg' || quality === 'image') {
        outputExt = 'jpg';
      } else if (format === 'zip') {
        outputExt = 'zip';
      }
      
      const outputFileName = `${fileId}.${outputExt}`;
      const outputPath = path.join(this.storagePath, outputFileName);

      await service.download(url, format, quality, outputPath, formatId, photoSource || videoSource);
      const output = await fs.stat(outputPath);
      if (!output.isFile() || output.size === 0) {
        throw new Error('Downloader produced no media file');
      }
      const fileSize = output.size;
      download.status = 'completed';
      download.progress = 100;
      download.filePath = outputPath;
      download.fileName = outputFileName;
      download.fileSize = fileSize;
      download.completedAt = new Date();
      await download.save();
      this.notifyListeners(downloadId, { status: 'completed', progress: 100, fileSize });
    } catch (error) {
      logger.error(`Download process error: ${error.message}`);
      download.status = 'failed';
      download.error = error.message;
      await download.save();
      this.notifyListeners(downloadId, { status: 'failed', error: error.message });
    }
  }

  async getFilePath(downloadId, userId) {
    const download = await Download.findById(downloadId);
    if (!download) throw new Error('Download not found');
    if (download.status !== 'completed') throw new Error('File not ready');

    const resolvedPath = download.filePath || (download.fileName ? path.join(this.storagePath, download.fileName) : null);

    // Build a user-friendly filename from the original title
    const safeTitle = (download.title || 'media')
      .replace(/[/\\?%*:|"<>]/g, '')  // Remove OS-restricted characters
      .replace(/\s+/g, ' ')            // Collapse whitespace
      .trim()
      .substring(0, 150) || 'media';
    
    // Determine file extension and MIME type
    let ext = 'mp4';
    let mimeType = 'video/mp4';
    
    if (download.mediaType === 'image' && ['png', 'webp'].includes(download.format)) {
      ext = download.format;
      mimeType = 'image/' + ext;
    } else if (download.platform === 'youtube' && download.fileName?.endsWith('.webm')) {
      ext = 'webm';
      mimeType = 'video/webm';
    } else if (download.platform === 'youtube' && download.fileName?.endsWith('.m4a')) {
      ext = 'm4a';
      mimeType = 'audio/mp4';
    } else if (download.format === 'mp3') {
      ext = 'mp3';
      mimeType = 'audio/mpeg';
    } else if (download.format === 'jpg' || download.format === 'jpeg') {
      ext = 'jpg';
      mimeType = 'image/jpeg';
    } else if (download.format === 'zip') {
      ext = 'zip';
      mimeType = 'application/zip';
    }
    
    const userFileName = `${safeTitle}.${ext}`;

    return {
      filePath: resolvedPath,
      fileName: userFileName,
      mimeType: mimeType,
      cloudinaryUrl: download.cloudinaryUrl,
    };
  }

  async cancelDownload(downloadId, userId) {
    const download = await Download.findById(downloadId);
    if (!download) throw new Error('Download not found');
    download.status = 'cancelled';
    await download.save();
    this.notifyListeners(downloadId, { status: 'cancelled' });
    return download;
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
        try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch { }
      }
    }
  }

  async getStats(userId) {
    // Single-tenant system overview: aggregates all downloads across instance
    const [total, completed, failed, todayCount, monthCount] = await Promise.all([
      Download.countDocuments({}),
      Download.countDocuments({ status: 'completed' }),
      Download.countDocuments({ status: 'failed' }),
      Download.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      Download.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      }),
    ]);

    let storageUsed = 0;
    try {
      const res = await Download.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$fileSize' } } },
      ]);
      storageUsed = res[0]?.total || 0;
    } catch { }

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

    let downloadsOverTime = [];
    let platformDistribution = [];
    let statusDistribution = [];

    try {
      [downloadsOverTime, platformDistribution, statusDistribution] = await Promise.all([
        Download.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Download.aggregate([
          { $group: { _id: '$platform', count: { $sum: 1 } } },
        ]),
        Download.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
      ]);
    } catch { }

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
