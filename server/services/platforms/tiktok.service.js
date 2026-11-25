const logger = require('../../utils/logger');
const PlatformDetector = require('./platformDetector');
const { execFile } = require('child_process');
const { promisify } = require('util');
const run = promisify(execFile);

function cookieArgs() {
  const file = process.env.TIKTOK_COOKIES_FILE || process.env.COOKIES_FILE;
  if (file) return ['--cookies', file];
  if (process.env.COOKIES_BROWSER) return ['--cookies-from-browser', process.env.COOKIES_BROWSER];
  return [];
}

class TikTokService {
  static async analyze(url) {
    const videoId = PlatformDetector.extractVideoId(url, 'tiktok');
    if (!videoId) {
      throw new Error('Could not extract TikTok video ID from URL');
    }

    const metadata = {
      platform: 'tiktok',
      videoId,
      originalUrl: url,
      type: 'video',
      title: `TikTok Video (${videoId})`,
      creator: '',
      duration: null,
      thumbnail: null,
      availableFormats: [
        { formatId: 'best-mp4', quality: 'best', format: 'mp4', label: 'Best Quality MP4', mediaType: 'video' },
        { formatId: 'audio-mp3', quality: 'audio', format: 'mp3', label: 'Audio MP3', mediaType: 'audio' },
      ],
      notice: 'TikTok downloads require yt-dlp. Only public videos are supported.',
    };

    const ytdlpPath = process.env.YT_DLP_PATH || 'yt-dlp';
    try {
      const { stdout } = await run(ytdlpPath, [
        ...cookieArgs(), '--dump-json', '--no-download', '--', url,
      ], { timeout: 15000, windowsHide: true });
      const info = JSON.parse(stdout);
      
      if (info.title) metadata.title = info.title;
      if (info.uploader || info.creator) metadata.creator = info.uploader || info.creator;
      if (info.thumbnail) metadata.thumbnail = info.thumbnail;
      if (info.duration) {
        const d = info.duration;
        metadata.duration = `${Math.floor(d / 60)}:${String(Math.floor(d % 60)).padStart(2, '0')}`;
      }

      // Extract file sizes from formats
      if (info.formats && Array.isArray(info.formats)) {
        const videoFormats = info.formats.filter(fmt => fmt.vcodec !== 'none' && fmt.filesize);
        const audioFormats = info.formats.filter(fmt => fmt.acodec !== 'none' && fmt.vcodec === 'none' && fmt.filesize);

        let videoSize = 0;
        let audioSize = 0;

        if (videoFormats.length > 0) {
          const bestVideo = videoFormats.reduce((best, curr) => 
            (curr.filesize || 0) > (best.filesize || 0) ? curr : best
          );
          videoSize = bestVideo.filesize;
        }

        if (audioFormats.length > 0) {
          const bestAudio = audioFormats.reduce((best, curr) => 
            (curr.filesize || 0) > (best.filesize || 0) ? curr : best
          );
          audioSize = bestAudio.filesize;
        }

        metadata.availableFormats = [
          { formatId: 'best-mp4', quality: 'best', format: 'mp4', label: 'Best Quality MP4', mediaType: 'video', fileSize: videoSize },
          { formatId: 'audio-mp3', quality: 'audio', format: 'mp3', label: 'Audio MP3', mediaType: 'audio', fileSize: audioSize },
        ];
      }
    } catch (err) {
      logger.warn('TikTok metadata fetch failed:', err.message);
      // Graceful fallback to default metadata
    }

    return metadata;
  }

  static async download(url, format = 'mp4', quality = 'best', outputPath) {
    const ytdlpPath = process.env.YT_DLP_PATH || 'yt-dlp';
    const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';

    const formatArgs = quality === 'audio' || format === 'mp3'
      ? ['-x', '--audio-format', 'mp3', '--audio-quality', '0']
      : ['-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]', '--merge-output-format', 'mp4'];

    try {
      return await run(ytdlpPath, [
        '--ffmpeg-location', ffmpegPath, ...cookieArgs(), ...formatArgs,
        '-o', outputPath, '--no-playlist', '--', url,
      ], { timeout: 300000, windowsHide: true });
    } catch (err) {
      throw new Error(`TikTok download failed: ${err.stderr || err.message}`);
    }
  }
}

module.exports = TikTokService;
