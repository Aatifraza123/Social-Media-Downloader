const Download = require('../models/Download');
const downloadManager = require('../services/downloadManager');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');
const fs = require('fs');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, platform, status, search } = req.query;
    const query = {};
    if (req.user && req.user._id) query.userId = req.user._id;

    // In single-tenant private installation, admin can see all downloads (including guest/anonymous downloads)
    if (req.user && req.user.role !== 'admin' && req.user._id) {
      query.userId = req.user._id;
    }
    if (platform && platform !== 'all') query.platform = platform;
    if (status && status !== 'all') query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const total = await Download.countDocuments(query);
    const downloads = await Download.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return ApiResponse.paginated(res, downloads, {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    logger.error('Get all downloads error:', error);
    return ApiResponse.error(res, 'Failed to fetch downloads');
  }
};

exports.getOne = async (req, res) => {
  try {
    const download = await Download.findById(req.params.id);
    if (!download) return ApiResponse.error(res, 'Download not found', 404);
    return ApiResponse.success(res, download);
  } catch (error) {
    return ApiResponse.error(res, 'Failed to fetch download');
  }
};

exports.getFile = async (req, res) => {
  try {
    const { filePath, fileName, mimeType, cloudinaryUrl } = await downloadManager.getFilePath(
      req.params.id, null
    );

    if (cloudinaryUrl) {
      const downloadUrl = cloudinaryUrl.replace('/upload/', `/upload/fl_attachment:${fileName.replace(/\./g, '_')}/`);
      return res.redirect(downloadUrl);
    }

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    const stat = fs.statSync(filePath);
    res.setHeader('Content-Length', stat.size);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    logger.error('Get file error:', error.message);
    return ApiResponse.error(res, error.message, 404);
  }
};

exports.getProgress = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const downloadId = req.params.id;
  const download = await Download.findById(downloadId);
  if (download) {
    res.write(`data: ${JSON.stringify({
      status: download.status,
      progress: download.progress,
      fileSize: download.fileSize || 0,
      downloadedBytes: download.downloadedBytes || 0
    })}\n\n`);
  }

  downloadManager.addListener(downloadId, res);
  req.on('close', () => downloadManager.removeListener(downloadId, res));
};

exports.cancel = async (req, res) => {
  try {
    const download = await downloadManager.cancelDownload(req.params.id, null);
    return ApiResponse.success(res, download, 'Download cancelled');
  } catch (error) {
    return ApiResponse.error(res, error.message, 400);
  }
};

exports.delete = async (req, res) => {
  try {
    const download = await Download.findById(req.params.id);
    if (!download) return ApiResponse.error(res, 'Record not found', 404);
    await Download.findByIdAndDelete(req.params.id);
    return ApiResponse.success(res, null, 'Download record deleted');
  } catch (error) {
    return ApiResponse.error(res, 'Failed to delete record');
  }
};
