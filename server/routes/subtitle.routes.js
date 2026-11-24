const express = require('express');
const router = express.Router();
const subtitleService = require('../services/subtitle.service');
const ApiResponse = require('../utils/ApiResponse');
const { validateUrl } = require('../utils/ssrf');
const logger = require('../utils/logger');
const fs = require('fs');

// Get available subtitles for a URL
router.post('/list', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return ApiResponse.error(res, 'URL is required', 400);
    }

    await validateUrl(url);
    const subtitles = await subtitleService.getAvailableSubtitles(url);
    
    return ApiResponse.success(res, { subtitles, count: subtitles.length }, 'Subtitles listed');
  } catch (error) {
    logger.error('List subtitles error:', error.message);
    return ApiResponse.error(res, error.message, 400);
  }
});

// Download subtitle
router.post('/download', async (req, res) => {
  try {
    const { url, language = 'en', format = 'srt' } = req.body;
    
    if (!url) {
      return ApiResponse.error(res, 'URL is required', 400);
    }

    await validateUrl(url);

    const result = await subtitleService.downloadSubtitle(url, language, format);
    
    return ApiResponse.success(res, result, 'Subtitle downloaded', 201);
  } catch (error) {
    logger.error('Download subtitle error:', error.message);
    return ApiResponse.error(res, error.message, 400);
  }
});

// Download all subtitles
router.post('/download-all', async (req, res) => {
  try {
    const { url, format = 'srt' } = req.body;
    
    if (!url) {
      return ApiResponse.error(res, 'URL is required', 400);
    }

    await validateUrl(url);

    const result = await subtitleService.downloadAllSubtitles(url, format);
    
    return ApiResponse.success(res, result, 'All subtitles downloaded', 201);
  } catch (error) {
    logger.error('Download all subtitles error:', error.message);
    return ApiResponse.error(res, error.message, 400);
  }
});

// Get subtitle file
router.get('/file/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = await subtitleService.getSubtitleFile(
      require('path').join(subtitleService.storagePath, fileName)
    );

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    const stat = fs.statSync(filePath);
    res.setHeader('Content-Length', stat.size);
    
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    logger.error('Get subtitle file error:', error.message);
    return ApiResponse.error(res, error.message, 404);
  }
});

module.exports = router;
