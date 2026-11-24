const express = require('express');
const router = express.Router();
const PlaylistService = require('../services/playlist.service');
const downloadManager = require('../services/downloadManager');
const Playlist = require('../models/Playlist');
const ApiResponse = require('../utils/ApiResponse');
const { validateUrl } = require('../utils/ssrf');
const logger = require('../utils/logger');

// Analyze playlist
router.post('/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return ApiResponse.error(res, 'URL is required', 400);
    }

    await validateUrl(url);

    // Check if it's a playlist
    if (!PlaylistService.isPlaylistUrl(url)) {
      return ApiResponse.error(res, 'URL is not a playlist', 400);
    }

    const playlistData = await PlaylistService.analyzePlaylist(url);
    
    // Estimate size
    const sizeEstimate = await PlaylistService.estimatePlaylistSize(
      playlistData.videos,
      '720p'
    );

    return ApiResponse.success(res, {
      ...playlistData,
      estimatedSize: sizeEstimate.estimatedSize,
      estimatedSizeFormatted: PlaylistService.formatBytes(sizeEstimate.estimatedSize),
    }, 'Playlist analyzed');
  } catch (error) {
    logger.error('Playlist analyze error:', error.message);
    return ApiResponse.error(res, error.message, 400);
  }
});

// Start playlist download
router.post('/download', async (req, res) => {
  try {
    const { url, format = 'mp4', quality = '720p', userId } = req.body;

    if (!url) {
      return ApiResponse.error(res, 'URL is required', 400);
    }

    await validateUrl(url);

    if (!PlaylistService.isPlaylistUrl(url)) {
      return ApiResponse.error(res, 'URL is not a playlist', 400);
    }

    // Analyze playlist first
    const playlistData = await PlaylistService.analyzePlaylist(url);
    
    // Create playlist record
    const playlist = await Playlist.create({
      userId: userId || null,
      platform: playlistData.platform,
      playlistId: playlistData.playlistId,
      title: playlistData.title,
      uploader: playlistData.uploader,
      originalUrl: url,
      videoCount: playlistData.videoCount,
      videos: playlistData.videos.map(v => ({
        id: v.id,
        title: v.title,
        url: v.url,
        duration: v.duration,
        thumbnail: v.thumbnail,
        status: 'pending',
      })),
      format,
      quality,
      status: 'pending',
      estimatedSize: (await PlaylistService.estimatePlaylistSize(playlistData.videos, quality)).estimatedSize,
    });

    // Start downloading videos in background
    processPlaylistDownloads(playlist._id).catch(err => {
      logger.error('Playlist download error:', err.message);
    });

    return ApiResponse.success(res, {
      playlistId: playlist._id,
      status: playlist.status,
      videoCount: playlist.videoCount,
    }, 'Playlist download started', 201);
  } catch (error) {
    logger.error('Playlist download start error:', error.message);
    return ApiResponse.error(res, error.message, 400);
  }
});

// Get playlist status
router.get('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return ApiResponse.error(res, 'Playlist not found', 404);
    }

    return ApiResponse.success(res, playlist);
  } catch (error) {
    return ApiResponse.error(res, 'Failed to fetch playlist');
  }
});

// Get playlist progress (SSE)
router.get('/:id/progress', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const playlistId = req.params.id;
  
  try {
    const playlist = await Playlist.findById(playlistId);
    if (playlist) {
      res.write(`data: ${JSON.stringify({
        status: playlist.status,
        progress: playlist.progress,
        completedCount: playlist.completedCount,
        failedCount: playlist.failedCount,
        videoCount: playlist.videoCount,
      })}\n\n`);
    }
  } catch (err) {
    logger.error('Playlist progress error:', err.message);
  }

  // Poll for updates every 2 seconds
  const interval = setInterval(async () => {
    try {
      const playlist = await Playlist.findById(playlistId);
      if (playlist) {
        res.write(`data: ${JSON.stringify({
          status: playlist.status,
          progress: playlist.progress,
          completedCount: playlist.completedCount,
          failedCount: playlist.failedCount,
          videoCount: playlist.videoCount,
        })}\n\n`);

        if (playlist.status === 'completed' || playlist.status === 'failed') {
          clearInterval(interval);
        }
      }
    } catch (err) {
      clearInterval(interval);
    }
  }, 2000);

  req.on('close', () => clearInterval(interval));
});

// Cancel playlist download
router.post('/:id/cancel', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return ApiResponse.error(res, 'Playlist not found', 404);
    }

    playlist.status = 'cancelled';
    await playlist.save();

    return ApiResponse.success(res, playlist, 'Playlist cancelled');
  } catch (error) {
    return ApiResponse.error(res, error.message, 400);
  }
});

// Process playlist downloads
async function processPlaylistDownloads(playlistId) {
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) return;

  playlist.status = 'processing';
  await playlist.save();

  let completed = 0;
  let failed = 0;

  for (let i = 0; i < playlist.videos.length; i++) {
    const video = playlist.videos[i];
    
    // Check if cancelled
    const current = await Playlist.findById(playlistId);
    if (current.status === 'cancelled') {
      break;
    }

    try {
      video.status = 'downloading';
      await playlist.save();

      // Start individual download
      const download = await downloadManager.startDownload(playlist.userId, {
        url: video.url,
        platform: playlist.platform,
        format: playlist.format,
        quality: playlist.quality,
      });

      video.downloadId = download._id;
      video.status = 'completed';
      completed++;
    } catch (err) {
      logger.error(`Failed to download video ${video.id}:`, err.message);
      video.status = 'failed';
      failed++;
    }

    // Update progress
    playlist.completedCount = completed;
    playlist.failedCount = failed;
    playlist.progress = Math.round(((completed + failed) / playlist.videos.length) * 100);
    await playlist.save();
  }

  // Final status
  playlist.status = failed === playlist.videos.length ? 'failed' : 'completed';
  playlist.completedAt = new Date();
  await playlist.save();
}

module.exports = router;
