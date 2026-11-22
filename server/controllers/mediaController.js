const downloadManager = require('../services/downloadManager');
const { validateUrl } = require('../utils/ssrf');
const PlatformDetector = require('../services/platforms/platformDetector');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');

exports.analyze = async (req, res) => {
  try {
    const { url } = req.body;
    await validateUrl(url);

    const detected = PlatformDetector.detect(url);
    if (!detected) {
      return ApiResponse.error(res, 'Unsupported platform. Supported: YouTube, Instagram, X (Twitter)', 400);
    }

    const metadata = await downloadManager.analyze(url);
    return ApiResponse.success(res, metadata, 'Media metadata retrieved');
  } catch (error) {
    logger.error('Analyze error:', error.message);
    return ApiResponse.error(res, error.message, 400);
  }
};

exports.download = async (req, res) => {
  try {
    const { url, platform, format, quality } = req.body;
    await validateUrl(url);

    const download = await downloadManager.startDownload(req.user._id, {
      url, platform, format, quality,
    });

    return ApiResponse.success(res, {
      downloadId: download._id,
      status: download.status,
      progress: download.progress,
    }, 'Download initiated', 201);
  } catch (error) {
    logger.error('Download start error:', error.message);
    return ApiResponse.error(res, error.message, 400);
  }
};

exports.batchDownload = async (req, res) => {
  try {
    const { urls } = req.body;
    const results = [];

    for (const url of urls) {
      try {
        await validateUrl(url);
        const detected = PlatformDetector.detect(url);
        if (!detected) {
          results.push({ url, success: false, error: 'Unsupported URL' });
          continue;
        }

        const download = await downloadManager.startDownload(req.user._id, {
          url, platform: detected.platform,
        });
        results.push({
          url,
          success: true,
          downloadId: download._id,
          status: download.status,
        });
      } catch (err) {
        results.push({ url, success: false, error: err.message });
      }
    }

    return ApiResponse.success(res, { results }, 'Batch processing started');
  } catch (error) {
    logger.error('Batch download error:', error.message);
    return ApiResponse.error(res, error.message, 400);
  }
};
