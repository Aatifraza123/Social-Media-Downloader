const logger = require('../../utils/logger');
const PlatformDetector = require('./platformDetector');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

function cookiesArg() {
  if (process.env.X_COOKIES_FILE) return `--cookies "${process.env.X_COOKIES_FILE}"`;
  if (process.env.COOKIES_FILE) return `--cookies "${process.env.COOKIES_FILE}"`;
  if (process.env.COOKIES_BROWSER) return `--cookies-from-browser ${process.env.COOKIES_BROWSER}`;
  return '';
}

function jsRuntimeArg() {
  if (process.env.DENO_PATH) return `--js-runtimes "deno:${process.env.DENO_PATH}"`;
  return '';
}

class TwitterService {
  static async analyze(url) {
    const tweetId = PlatformDetector.extractVideoId(url, 'twitter');
    if (!tweetId) {
      throw new Error('Could not extract tweet ID from URL');
    }

    const metadata = {
      platform: 'twitter',
      tweetId,
      originalUrl: url,
      type: 'tweet',
      title: `X Post (${tweetId})`,
      creator: 'X Creator',
      duration: '0:45',
      thumbnail: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=640&q=80',
      availableFormats: [
        { formatId: 'best-mp4', quality: 'best', format: 'mp4', label: 'Best Quality MP4', mediaType: 'video' },
        { formatId: '720p', quality: '720p', format: 'mp4', label: '720p MP4', mediaType: 'video' },
        { formatId: 'audio-mp3', quality: 'audio', format: 'mp3', label: 'Audio MP3', mediaType: 'audio' },
      ],
      notice: 'Only posts with publicly accessible media attachments can be downloaded.',
    };

    const ytdlpPath = process.env.YT_DLP_PATH || 'yt-dlp';
    try {
      const normalized = url.replace('x.com', 'twitter.com');
      const { stdout } = await execAsync(
        `"${ytdlpPath}" ${cookiesArg()} ${jsRuntimeArg()} --dump-json --no-download "${normalized}"`,
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
    const normalized = url.replace('x.com', 'twitter.com');

    let formatArg = format === 'mp3' || quality === 'audio'
      ? '-x --audio-format mp3'
      : `-f "best" --merge-output-format ${format}`;

    const command = `"${ytdlpPath}" --ffmpeg-location "${ffmpegPath}" ${cookiesArg()} ${jsRuntimeArg()} ${formatArg} -o "${outputPath}" --no-playlist "${normalized}"`;
    logger.info(`Twitter download: ${command}`);

    try {
      return await execAsync(command, { timeout: 300000 });
    } catch (err) {
      throw new Error(`Twitter media download failed: ${err.stderr || err.message}`);
    }
  }
}

module.exports = TwitterService;
