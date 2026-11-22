const Download = require('../models/Download');
const downloadManager = require('../services/downloadManager');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');
const fs = require('fs');

exports.getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      platform,
      status,
      sort = '-createdAt',
      search,
    } = req.query;

    const query = { userId: req.user._id };
    if (platform && platform !== 'all') query.platform = platform;
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { originalUrl: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [downloads, total] = await Promise.all([
      Download.find(query).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
      Download.countDocuments(query),
    ]);

    return ApiResponse.paginated(res, downloads, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    logger.error('Get all downloads error:', error);
    return ApiResponse.error(res, 'Failed to fetch downloads');
  }
};

exports.getOne = async (req, res) => {
  try {
    const download = await Download.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!download) return ApiResponse.error(res, 'Download not found', 404);
    return ApiResponse.success(res, download);
  } catch (error) {
    return ApiResponse.error(res, 'Failed to fetch download');
  }
};

exports.getFile = async (req, res) => {
  try {
    const { filePath, fileName, mimeType } = await downloadManager.getFilePath(
      req.params.id,
      req.user._id
    );

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
  const download = await Download.findOne({ _id: downloadId, userId: req.user._id });
  if (download) {
    res.write(`data: ${JSON.stringify({ status: download.status, progress: download.progress })}\n\n`);
  }

  downloadManager.addListener(downloadId, res);
  req.on('close', () => downloadManager.removeListener(downloadId, res));
};

exports.cancel = async (req, res) => {
  try {
    const download = await downloadManager.cancelDownload(req.params.id, req.user._id);
    return ApiResponse.success(res, download, 'Download cancelled');
  } catch (error) {
    return ApiResponse.error(res, error.message, 400);
  }
};

exports.retry = async (req, res) => {
  try {
    const download = await downloadManager.retryDownload(req.params.id, req.user._id);
    return ApiResponse.success(res, download, 'Retry scheduled');
  } catch (error) {
    return ApiResponse.error(res, error.message, 400);
  }
};

exports.remove = async (req, res) => {
  try {
    await downloadManager.deleteDownload(req.params.id, req.user._id);
    return ApiResponse.success(res, null, 'Download deleted');
  } catch (error) {
    return ApiResponse.error(res, error.message, 400);
  }
};
