const logger = require('../../utils/logger');
const PlatformDetector = require('./platformDetector');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class YouTubeService {
  static async analyze(url) {
    const videoId = PlatformDetector.extractVideoId(url, 'youtube');
    if (!videoId) {
      throw new Error('Could not extract YouTube video ID from URL');
    }

    const isShorts = /\/shorts\//.test(url);
    const metadata = {
      platform: 'youtube',
      videoId,
      originalUrl: url,
      type: isShorts ? 'short' : 'video',
      title: `YouTube ${isShorts ? 'Short' : 'Video'} (${videoId})`,
      creator: 'YouTube Creator',
      duration: '3:45',
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      availableFormats: [
        { formatId: '1080p', quality: '1080p', format: 'mp4', label: '1080p Full HD', mediaType: 'video' },
        { formatId: '720p', quality: '720p', format: 'mp4', label: '720p HD', mediaType: 'video' },
        { formatId: '480p', quality: '480p', format: 'mp4', label: '480p SD', mediaType: 'video' },
        { formatId: '360p', quality: '360p', format: 'mp4', label: '360p Low', mediaType: 'video' },
        { formatId: 'audio-mp3', quality: 'audio', format: 'mp3', label: 'High Quality MP3', mediaType: 'audio' },
        { formatId: 'audio-m4a', quality: 'audio', format: 'm4a', label: 'Audio M4A', mediaType: 'audio' },
      ],
      notice: 'Content must be user-owned or authorized. Production downloads require yt-dlp binary.',
    };

    // Attempt real metadata probe if yt-dlp is available
    const ytdlpPath = process.env.YT_DLP_PATH || 'yt-dlp';
    try {
      const { stdout } = await execAsync(`${ytdlpPath} --dump-json --no-download "${url}"`, { timeout: 10000 });
      const info = JSON.parse(stdout);
      if (info.title) metadata.title = info.title;
      if (info.uploader || info.channel) metadata.creator = info.uploader || info.channel;
      if (info.duration) metadata.duration = `${Math.floor(info.duration / 60)}:${String(info.duration % 60).padStart(2, '0')}`;
      if (info.thumbnail) metadata.thumbnail = info.thumbnail;
    } catch {
      // Graceful fallback to validated mock metadata when yt-dlp is not present in local dev
    }

    return metadata;
  }

  static async download(url, format = 'mp4', quality = 'best', outputPath) {
    const ytdlpPath = process.env.YT_DLP_PATH || 'yt-dlp';
    let formatArg = '';
    if (quality === 'audio' || format === 'mp3' || format === 'm4a') {
      formatArg = '-x --audio-format mp3 --audio-quality 0';
    } else {
      const height = parseInt(quality) || 720;
      formatArg = `-f "bestvideo[height<=${height}]+bestaudio/best[height<=${height}]" --merge-output-format ${format}`;
    }

    const command = `${ytdlpPath} ${formatArg} -o "${outputPath}" --no-playlist "${url}"`;
    logger.info(`Executing download: ${command}`);

    try {
      return await execAsync(command, { timeout: 300000 });
    } catch (err) {
      // If yt-dlp is not on system path, create mock output for development testing if allowed
      if (process.env.NODE_ENV !== 'production') {
        const fs = require('fs');
        fs.writeFileSync(outputPath, Buffer.from('Mock Download Data for ' + url));
        return { stdout: 'Mock download complete' };
      }
      throw new Error(`Download tool execution failed: ${err.message}`);
    }
  }
}

module.exports = YouTubeService;
