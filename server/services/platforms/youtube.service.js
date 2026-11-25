const { execFile } = require('child_process');
const { promisify } = require('util');
const PlatformDetector = require('./platformDetector');
const run = promisify(execFile);
const previews = new Map();
const previewTTL = 5 * 60 * 1000;
const cooldown = 15 * 60 * 1000;
let pausedUntil = 0;

function checkCooldown() {
  if (Date.now() >= pausedUntil) return;
  const minutes = Math.ceil((pausedUntil - Date.now()) / 60000);
  const error = new Error(`YouTube is limiting requests from this server. Try again in ${minutes} min.`);
  error.statusCode = 429;
  throw error;
}

function handleYouTubeError(error, fallback) {
  if (/HTTP Error 429|confirm you.re not a bot/i.test(error.stderr || '')) {
    pausedUntil = Date.now() + cooldown;
    checkCooldown();
  }
  throw new Error(fallback);
}

function commonArgs() {
  const args = ['--no-playlist'];
  const cookies = process.env.YOUTUBE_COOKIES_FILE || process.env.COOKIES_FILE;
  if (cookies) args.push('--cookies', cookies);
  if (process.env.DENO_PATH) args.push('--js-runtimes', 'deno:' + process.env.DENO_PATH);
  if (process.env.FFMPEG_PATH) args.push('--ffmpeg-location', process.env.FFMPEG_PATH);
  return args;
}

class YouTubeService {
  static formats(streams) {
    const usable = streams.filter(f => !f.has_drm && /^[\w.-]+$/.test(f.format_id) && f.format_id);
    const audio = usable.filter(f => f.vcodec === 'none' && f.acodec && f.acodec !== 'none');
    const options = new Map();
    // yt-dlp orders formats from least to most preferred.
    for (const f of usable) {
      if (!f.height || !f.vcodec || f.vcodec === 'none' || !['mp4', 'webm'].includes(f.ext)) continue;
      const separate = f.acodec === 'none' || !f.acodec;
      const track = separate && audio.filter(a => a.ext === (f.ext === 'mp4' ? 'm4a' : 'webm')).pop();
      if (separate && audio.length && !track) continue;
      const resolution = Math.min(f.width || f.height, f.height);
      const quality = resolution + 'p';
      const fps = f.fps || 0;
      const label = quality + (fps > 30 ? ' ' + fps + ' fps' : '') + (separate && !track ? ' (video only)' : '');
      const formatId = f.format_id + (track ? '+' + track.format_id : '');
      options.set([quality, fps, f.ext, separate && !track].join('/'), {
        formatId, quality, format: f.ext, label, mediaType: 'video', resolution, fps,
      });
    }
    const formats = [...options.values()].sort((a, b) => b.resolution - a.resolution || b.fps - a.fps);
    if (audio.length || usable.some(f => f.acodec && f.acodec !== 'none')) {
      for (const format of ['mp3', 'm4a']) {
        formats.push({ formatId: 'audio-' + format, quality: 'audio', format, label: 'Audio ' + format.toUpperCase(), mediaType: 'audio' });
      }
    }
    return formats;
  }

  static async analyze(url) {
    checkCooldown();
    const videoId = PlatformDetector.extractVideoId(url, 'youtube');
    if (!videoId) throw new Error('Could not extract YouTube video ID');
    const cached = previews.get(url);
    if (cached && cached.expires > Date.now()) return cached.result;
    if (previews.size >= 128) previews.delete(previews.keys().next().value);
    const result = this.readFormats(url, videoId);
    previews.set(url, { result, expires: Date.now() + previewTTL });
    try {
      return await result;
    } catch (error) {
      if (previews.get(url)?.result === result) previews.delete(url);
      throw error;
    }
  }

  static async readFormats(url, videoId) {
    let info;
    try {
      const { stdout } = await run(process.env.YT_DLP_PATH || 'yt-dlp', [
        ...commonArgs(), '--dump-single-json', '--skip-download', '--', url,
      ], { timeout: 25000, maxBuffer: 32 * 1024 * 1024, windowsHide: true });
      info = JSON.parse(stdout);
    } catch (error) {
      handleYouTubeError(error, 'Could not read the available formats from YouTube. Try again or check that the video is accessible.');
    }
    const availableFormats = this.formats(info.formats || []);
    if (!availableFormats.length) throw new Error('YouTube returned no downloadable formats for this video.');
    return { platform: 'youtube', videoId, originalUrl: url, type: url.includes('/shorts/') ? 'short' : 'video',
      title: info.title, creator: info.uploader || info.channel, thumbnail: info.thumbnail,
      duration: info.duration_string, availableFormats };
  }

  static async download(url, format, quality, outputPath, formatId) {
    checkCooldown();
    const args = commonArgs();
    if (formatId === 'audio-' + format && ['mp3', 'm4a'].includes(format)) {
      args.push('-f', 'bestaudio/best', '-x', '--audio-format', format, '--audio-quality', '0');
    } else {
      if (!formatId || !/^[\w.-]+(?:\+[\w.-]+)?$/.test(formatId)) throw new Error('Invalid YouTube stream selection');
      args.push('-f', formatId, '--merge-output-format', format);
    }
    try {
      await run(process.env.YT_DLP_PATH || 'yt-dlp', [...args, '--no-progress', '-o', outputPath, '--', url],
        { timeout: 300000, windowsHide: true });
    } catch (error) {
      previews.delete(url);
      handleYouTubeError(error, 'Could not download the selected YouTube format. Analyze the video again to refresh its formats.');
    }
  }
}

module.exports = YouTubeService;
