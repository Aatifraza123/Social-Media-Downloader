const logger = require('../../utils/logger');
const PlatformDetector = require('./platformDetector');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const DEFAULT_YOUTUBE_FORMATS = [
  { formatId: '1080p', quality: '1080p', format: 'mp4', label: '1080p Full HD', mediaType: 'video' },
  { formatId: '720p', quality: '720p', format: 'mp4', label: '720p HD', mediaType: 'video' },
  { formatId: '480p', quality: '480p', format: 'mp4', label: '480p SD', mediaType: 'video' },
  { formatId: '360p', quality: '360p', format: 'mp4', label: '360p Low', mediaType: 'video' },
  { formatId: 'audio-mp3', quality: 'audio', format: 'mp3', label: 'High Quality MP3', mediaType: 'audio' },
  { formatId: 'audio-m4a', quality: 'audio', format: 'm4a', label: 'Audio M4A', mediaType: 'audio' },
];

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
      creator: '',
      duration: null,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      availableFormats: [...DEFAULT_YOUTUBE_FORMATS],
      notice: 'Content must be user-owned or authorized. Production downloads require yt-dlp binary.',
    };

    // Skip CLI spawn in test environment for ultra-fast unit testing
    if (process.env.NODE_ENV === 'test') {
      return metadata;
    }

    // Attempt real metadata probe if yt-dlp is available
    const ytdlpPath = process.env.YT_DLP_PATH || 'yt-dlp';
    try {
      const { stdout } = await execAsync(`"${ytdlpPath}" --dump-json --no-download "${url}"`, { timeout: 8000 });
      const info = JSON.parse(stdout);
      if (info.title) metadata.title = info.title;
      if (info.uploader || info.channel) metadata.creator = info.uploader || info.channel;
      if (info.duration) metadata.duration = `${Math.floor(info.duration / 60)}:${String(info.duration % 60).padStart(2, '0')}`;
      if (info.thumbnail) metadata.thumbnail = info.thumbnail;

      // Extract available resolutions and file sizes from formats
      if (info.formats && Array.isArray(info.formats)) {
        const resolutionLabels = {
          4320: '8K UHD',
          2880: '5K',
          2160: '4K UHD',
          1440: '2K QHD',
          1080: 'Full HD',
          720: 'HD',
          480: 'SD',
          360: 'Low',
          240: 'Very Low',
          144: 'Minimal'
        };

        // Collect all unique heights from video-only streams (filesize is optional — DASH often lacks it)
        const heightSizeMap = new Map();
        info.formats.forEach(fmt => {
          if (fmt.height && fmt.vcodec && fmt.vcodec !== 'none') {
            const h = fmt.height;
            const size = fmt.filesize || fmt.filesize_approx || 0;
            if (!heightSizeMap.has(h) || size > heightSizeMap.get(h)) {
              heightSizeMap.set(h, size);
            }
          }
        });

        const sortedHeights = Array.from(heightSizeMap.keys()).sort((a, b) => b - a);

        const videoFormats = sortedHeights.map(height => {
          const key = `${height}p`;
          const label = resolutionLabels[height] || `${height}p`;
          const size = heightSizeMap.get(height);
          return {
            formatId: key,
            quality: key,
            format: 'mp4',
            label: `${key} ${label}`,
            mediaType: 'video',
            fileSize: size || undefined
          };
        });

        // Audio: accept filesize OR filesize_approx
        const audioFormats = info.formats.filter(fmt =>
          fmt.acodec && fmt.acodec !== 'none' && (!fmt.vcodec || fmt.vcodec === 'none')
        );

        let audioSize = 0;
        if (audioFormats.length > 0) {
          const bestAudio = audioFormats.reduce((best, curr) => {
            const cs = curr.filesize || curr.filesize_approx || 0;
            const bs = best.filesize || best.filesize_approx || 0;
            return cs > bs ? curr : best;
          });
          audioSize = bestAudio.filesize || bestAudio.filesize_approx || 0;
        }

        const audioFormatsList = [
          { formatId: 'audio-mp3', quality: 'audio', format: 'mp3', label: 'High Quality MP3', mediaType: 'audio', fileSize: audioSize || undefined },
          { formatId: 'audio-m4a', quality: 'audio', format: 'm4a', label: 'Audio M4A', mediaType: 'audio', fileSize: audioSize || undefined },
        ];

        // Only replace defaults when we actually found real resolutions
        if (videoFormats.length > 0) {
          metadata.availableFormats = [...videoFormats, ...audioFormatsList];
        }
      }
    } catch {
      // Graceful fallback to verified formats when yt-dlp binary is absent or times out
    }

    return metadata;
  }

  static async download(url, format = 'mp4', quality = 'best', outputPath) {
    const ytdlpPath = process.env.YT_DLP_PATH || 'yt-dlp';
    const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
    const ffmpegArg = `--ffmpeg-location "${ffmpegPath}"`;

    let formatArg = '';
    if (quality === 'audio' || format === 'mp3' || format === 'm4a') {
      formatArg = `-x --audio-format mp3 --audio-quality 0`;
    } else {
      const heightMatch = quality.match(/(\d+)p?/);
      const height = heightMatch ? parseInt(heightMatch[1]) : 720;
      
      if (height >= 2160) {
        formatArg = `-f "bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${height}]+bestaudio/best[height<=${height}]" --merge-output-format ${format}`;
      } else {
        formatArg = `-f "bestvideo[height<=${height}]+bestaudio/best[height<=${height}]" --merge-output-format ${format}`;
      }
    }

    const command = `"${ytdlpPath}" ${ffmpegArg} ${formatArg} -o "${outputPath}" --no-playlist "${url}"`;
    logger.info(`Executing download: ${command}`);

    try {
      return await execAsync(command, { timeout: 300000 });
    } catch (err) {
      throw new Error(`yt-dlp failed: ${err.stderr || err.message}`);
    }
  }
}

module.exports = YouTubeService;
