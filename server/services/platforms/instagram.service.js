const logger = require('../../utils/logger');
const PlatformDetector = require('./platformDetector');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

function cookiesArg() {
  if (process.env.INSTAGRAM_COOKIES_FILE) return `--cookies "${process.env.INSTAGRAM_COOKIES_FILE}"`;
  if (process.env.COOKIES_FILE) return `--cookies "${process.env.COOKIES_FILE}"`;
  if (process.env.COOKIES_BROWSER) return `--cookies-from-browser ${process.env.COOKIES_BROWSER}`;
  return '';
}

class InstagramService {
  static async analyze(url) {
    const contentId = PlatformDetector.extractVideoId(url, 'instagram');
    if (!contentId) {
      throw new Error('Could not extract Instagram content ID from URL');
    }

    const isReel = /\/reel\//.test(url);
    const metadata = {
      platform: 'instagram',
      contentId,
      originalUrl: url,
      type: isReel ? 'reel' : 'post',
      title: `Instagram ${isReel ? 'Reel' : 'Post'} (${contentId})`,
      creator: 'Instagram User',
      duration: isReel ? '0:30' : '0:15',
      thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=640&q=80',
      availableFormats: [
        { formatId: 'best-mp4', quality: 'best', format: 'mp4', label: 'Original Quality MP4', mediaType: 'video' },
        { formatId: 'audio-mp3', quality: 'audio', format: 'mp3', label: 'Audio Track MP3', mediaType: 'audio' },
      ],
      notice: 'Private Instagram profiles cannot be accessed. Only authorized public content supported.',
    };

    const ytdlpPath = process.env.YT_DLP_PATH || 'yt-dlp';
    const cleanUrl = url.split('?')[0];
    try {
      const { stdout } = await execAsync(
        `"${ytdlpPath}" ${cookiesArg()} --dump-json --no-download "${cleanUrl}"`,
        { timeout: 15000 }
      );
      const info = JSON.parse(stdout);
      if (info.title) metadata.title = info.title;
      if (info.uploader) metadata.creator = info.uploader;
      if (info.thumbnail) metadata.thumbnail = info.thumbnail;
    } catch {
      // Graceful fallback to default metadata
    }

    return metadata;
  }

  static async download(url, format = 'mp4', quality = 'best', outputPath) {
    const ytdlpPath = process.env.YT_DLP_PATH || 'yt-dlp';
    const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';

    // Instagram provides pre-merged formats — no need for --merge-output-format
    let formatArg = format === 'mp3' || quality === 'audio'
      ? '-x --audio-format mp3'
      : `-f "best"`;

    // Strip tracking params from URL
    const cleanUrl = url.split('?')[0];

    const command = `"${ytdlpPath}" --ffmpeg-location "${ffmpegPath}" ${cookiesArg()} ${formatArg} -o "${outputPath}" --no-playlist "${cleanUrl}"`;
    logger.info(`Instagram download: ${command}`);

    try {
      return await execAsync(command, { timeout: 300000 });
    } catch (err) {
      throw new Error(`Instagram download failed: ${err.stderr || err.message}`);
    }
  }
}

module.exports = InstagramService;
