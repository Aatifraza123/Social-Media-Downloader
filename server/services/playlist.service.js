const { exec } = require('child_process');
const { promisify } = require('util');
const logger = require('../utils/logger');
const PlatformDetector = require('./platforms/platformDetector');
const execAsync = promisify(exec);

class PlaylistService {
  /**
   * Detect if URL is a playlist
   */
  static isPlaylistUrl(url) {
    // YouTube playlist patterns
    const youtubePlaylist = /[?&]list=([^&]+)/i;
    return youtubePlaylist.test(url);
  }

  /**
   * Extract playlist ID from URL
   */
  static extractPlaylistId(url) {
    const match = url.match(/[?&]list=([^&]+)/i);
    return match ? match[1] : null;
  }

  /**
   * Get playlist metadata and video list
   */
  static async analyzePlaylist(url) {
    const ytdlpPath = process.env.YT_DLP_PATH || 'yt-dlp';
    
    try {
      // Get playlist info
      const { stdout } = await execAsync(
        `"${ytdlpPath}" --flat-playlist --dump-json "${url}"`,
        { timeout: 30000, maxBuffer: 10 * 1024 * 1024 } // 10MB buffer for large playlists
      );

      // Parse JSON lines
      const lines = stdout.trim().split('\n').filter(line => line.trim());
      const videos = [];
      let playlistTitle = '';
      let playlistUploader = '';

      for (const line of lines) {
        try {
          const info = JSON.parse(line);
          
          if (info.playlist_title && !playlistTitle) {
            playlistTitle = info.playlist_title;
          }
          if (info.playlist_uploader && !playlistUploader) {
            playlistUploader = info.playlist_uploader;
          }

          if (info.id && info.title) {
            videos.push({
              id: info.id,
              title: info.title,
              url: info.url || `https://www.youtube.com/watch?v=${info.id}`,
              duration: info.duration,
              thumbnail: info.thumbnail || `https://i.ytimg.com/vi/${info.id}/hqdefault.jpg`,
            });
          }
        } catch (err) {
          logger.warn('Failed to parse playlist item:', err.message);
        }
      }

      return {
        platform: 'youtube',
        type: 'playlist',
        playlistId: this.extractPlaylistId(url),
        title: playlistTitle || 'YouTube Playlist',
        uploader: playlistUploader || '',
        videoCount: videos.length,
        videos: videos,
        originalUrl: url,
      };
    } catch (err) {
      logger.error('Playlist analysis error:', err.message);
      throw new Error(`Failed to analyze playlist: ${err.message}`);
    }
  }

  /**
   * Get estimated total size for playlist
   */
  static async estimatePlaylistSize(videos, quality = '720p') {
    // Rough estimates based on typical video sizes
    const avgSizes = {
      '2160p': 350 * 1024 * 1024, // 350 MB per video
      '1440p': 150 * 1024 * 1024, // 150 MB
      '1080p': 80 * 1024 * 1024,  // 80 MB
      '720p': 25 * 1024 * 1024,   // 25 MB
      '480p': 15 * 1024 * 1024,   // 15 MB
      '360p': 8 * 1024 * 1024,    // 8 MB
      'audio': 3 * 1024 * 1024,   // 3 MB
    };

    const sizePerVideo = avgSizes[quality] || avgSizes['720p'];
    const totalSize = videos.length * sizePerVideo;

    return {
      estimatedSize: totalSize,
      sizePerVideo: sizePerVideo,
      videoCount: videos.length,
    };
  }

  /**
   * Format bytes to human readable
   */
  static formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = PlaylistService;
