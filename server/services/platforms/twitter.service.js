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

function externalVideoError(stderr = '') {
  let message;
  if (/ERROR: \[twitter:amplify\][^\n]*Domain Not Found/i.test(stderr)) {
    message = 'The original video host for this X post is unavailable. Try a repost with the video attached.';
  } else if (/ERROR: Unsupported URL: https?:\/\/(?:www\.)?snpy\.tv(?:\/|\s|$)/i.test(stderr)) {
    message = 'This X post links to an unsupported SnappyTV video. Try a repost with the video attached.';
  }
  if (message) {
    const error = new Error(message);
    error.code = 'X_EXTERNAL_VIDEO_UNAVAILABLE';
    return error;
  }
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
      creator: '',
      duration: null,
      thumbnail: null,
      availableFormats: [],
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
      
      // Extract real available qualities from yt-dlp formats
      if (info.formats && Array.isArray(info.formats)) {
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

        if (sortedHeights.length > 0) {
          const resLabels = { 2160: '4K UHD', 1440: '2K QHD', 1080: 'Full HD', 720: 'HD', 480: 'SD', 360: 'Low' };
          const videoFormats = sortedHeights.map(height => {
            const key = `${height}p`;
            const label = resLabels[height] || `${height}p`;
            return {
              formatId: key,
              quality: key,
              format: 'mp4',
              label: `${key} ${label}`,
              mediaType: 'video',
              fileSize: heightSizeMap.get(height) || undefined
            };
          });

          // Audio
          const audioFmts = info.formats.filter(f => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none'));
          let audioSize = 0;
          if (audioFmts.length > 0) {
            const best = audioFmts.reduce((b, c) => (c.filesize || c.filesize_approx || 0) > (b.filesize || b.filesize_approx || 0) ? c : b);
            audioSize = best.filesize || best.filesize_approx || 0;
          }

          metadata.availableFormats = [
            ...videoFormats,
            { formatId: 'audio-mp3', quality: 'audio', format: 'mp3', label: 'Audio MP3', mediaType: 'audio', fileSize: audioSize || undefined },
          ];
        }
      }
    } catch (err) {
      const unavailable = externalVideoError(err.stderr);
      if (unavailable) throw unavailable;
      // Photo posts are available through the public X embed endpoint.
    }

    if (metadata.availableFormats.length) return metadata;

    const response = await fetch('https://cdn.syndication.twimg.com/tweet-result?id=' + tweetId + '&token=1', {
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('Could not load attachments from this X post.');
    const post = await response.json();
    const photos = this.photoFormats(post);
    if (!photos.length) throw new Error('No downloadable photos or videos were found in this X post.');
    return { ...metadata, type: 'image', title: post.text || metadata.title, creator: post.user?.name,
      thumbnail: photos[0].source, availableFormats: photos };
  }

  static photoFormats(post) {
    return (post.photos || []).flatMap((photo, index) => {
      const match = /^https:\/\/pbs\.twimg\.com\/media\/([\w-]+)\.(jpg|png|webp)(?:\?.*)?$/i.exec(photo.url);
      if (!match) return [];
      const format = match[2].toLowerCase();
      const size = photo.width && photo.height ? ' · ' + photo.width + '×' + photo.height : '';
      return [{ formatId: 'photo-' + match[1], format, quality: 'original', mediaType: 'image',
        label: 'Photo ' + (index + 1) + size,
        source: 'https://pbs.twimg.com/media/' + match[1] + '?format=' + format + '&name=orig' }];
    });
  }

  static async download(url, format = 'mp4', quality = 'best', outputPath, formatId, source) {
    if (source) {
      const response = await fetch(source, { redirect: 'error', signal: AbortSignal.timeout(30000) });
      const mime = 'image/' + (format === 'jpg' ? 'jpeg' : format);
      if (!response.ok || response.headers.get('content-type')?.split(';')[0] !== mime) {
        throw new Error('Could not retrieve the original X photo.');
      }
      await require('fs').promises.writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
      return;
    }
    const ytdlpPath = process.env.YT_DLP_PATH || 'yt-dlp';
    const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
    const normalized = url.replace('x.com', 'twitter.com');

    let formatArg;
    if (format === 'mp3' || quality === 'audio') {
      formatArg = '-x --audio-format mp3 --audio-quality 0';
    } else {
      const heightMatch = quality.match(/(\d+)p?/);
      const height = heightMatch ? parseInt(heightMatch[1]) : null;
      if (height) {
        formatArg = `-f "bestvideo[height<=${height}]+bestaudio/best[height<=${height}]" --merge-output-format ${format}`;
      } else {
        formatArg = `-f "best" --merge-output-format ${format}`;
      }
    }

    const command = `"${ytdlpPath}" --ffmpeg-location "${ffmpegPath}" ${cookiesArg()} ${jsRuntimeArg()} ${formatArg} -o "${outputPath}" --no-playlist "${normalized}"`;
    logger.info(`Twitter download: ${command}`);

    try {
      return await execAsync(command, { timeout: 300000 });
    } catch (err) {
      throw externalVideoError(err.stderr) || new Error(`Twitter media download failed: ${err.stderr || err.message}`);
    }
  }
}

module.exports = TwitterService;
