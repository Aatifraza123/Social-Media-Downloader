const logger = require('../../utils/logger');
const PlatformDetector = require('./platformDetector');
const { exec } = require('child_process');
const { promisify } = require('util');
const https = require('https');
const fs = require('fs');
const execAsync = promisify(exec);

function cookiesArg() {
  if (process.env.INSTAGRAM_COOKIES_FILE) return `--cookies "${process.env.INSTAGRAM_COOKIES_FILE}"`;
  if (process.env.COOKIES_FILE) return `--cookies "${process.env.COOKIES_FILE}"`;
  if (process.env.COOKIES_BROWSER) return `--cookies-from-browser ${process.env.COOKIES_BROWSER}`;
  return '';
}

function detectType(url) {
  if (/\/reel\//.test(url)) return 'reel';
  if (/\/tv\//.test(url)) return 'tv';
  return 'post';
}

function shortcodeToMediaId(shortcode) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let id = BigInt(0);
  for (const char of shortcode) {
    id = id * BigInt(64) + BigInt(alphabet.indexOf(char));
  }
  return id.toString();
}

function getInstagramCookieStr() {
  const cookieFile = process.env.INSTAGRAM_COOKIES_FILE || process.env.COOKIES_FILE;
  if (!cookieFile) return null;
  try {
    const raw = fs.readFileSync(cookieFile, 'utf8');
    const session = raw.match(/sessionid\s+([^\s]+)/)?.[1];
    const csrf = raw.match(/csrftoken\s+([^\s]+)/)?.[1];
    const ds = raw.match(/ds_user_id\s+([^\s]+)/)?.[1];
    if (!session || !csrf) return null;
    return `sessionid=${session}; csrftoken=${csrf}${ds ? `; ds_user_id=${ds}` : ''}`;
  } catch {
    return null;
  }
}

async function fetchInstagramMediaInfo(mediaId) {
  const cookieStr = getInstagramCookieStr();
  if (!cookieStr) throw new Error('No Instagram cookies available');

  return new Promise((resolve, reject) => {
    const req = https.get(`https://www.instagram.com/api/v1/media/${mediaId}/info/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
        'X-Ig-App-Id': '936619743392459',
        'Cookie': cookieStr,
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { reject(new Error('Invalid JSON from Instagram API')); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Instagram API timeout')); });
  });
}

async function getFileSizeFromUrl(url) {
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD', headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://www.instagram.com/',
    }}, (res) => {
      const contentLength = res.headers['content-length'];
      resolve(contentLength ? parseInt(contentLength) : 0);
    }).on('error', () => resolve(0)).end();
  });
}

async function downloadImageFromUrl(imageUrl, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
      }
    }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Image download failed: HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

class InstagramService {
  static async analyze(url) {
    const contentId = PlatformDetector.extractVideoId(url, 'instagram');
    if (!contentId) throw new Error('Could not extract Instagram content ID from URL');

    const urlType = detectType(url);
    const cleanUrl = url.split('?')[0];

    const metadata = {
      platform: 'instagram',
      contentId,
      originalUrl: url,
      type: urlType,
      title: `Instagram ${urlType === 'reel' ? 'Reel' : urlType === 'tv' ? 'IGTV' : 'Post'} (${contentId})`,
      creator: '',
      duration: null,
      thumbnail: null,
      availableFormats: [
        { formatId: 'best-mp4', quality: 'best', format: 'mp4', label: 'Original Quality MP4', mediaType: 'video' },
        { formatId: 'audio-mp3', quality: 'audio', format: 'mp3', label: 'Audio Track MP3', mediaType: 'audio' },
      ],
      notice: 'Private Instagram profiles cannot be accessed. Only authorized public content supported.',
      isImagePost: false,
    };

    const ytdlpPath = process.env.YT_DLP_PATH || 'yt-dlp';

    // First try yt-dlp (works for reels, videos, some posts)
    let ytdlpFailed = false;
    try {
      const { stdout } = await execAsync(
        `"${ytdlpPath}" ${cookiesArg()} --dump-json --no-download "${cleanUrl}"`,
        { timeout: 15000 }
      );
      const info = JSON.parse(stdout);
      if (info.title) metadata.title = info.title;
      if (info.uploader) metadata.creator = info.uploader;
      if (info.thumbnail) metadata.thumbnail = info.thumbnail;
      if (info.duration) {
        const d = info.duration;
        metadata.duration = `${Math.floor(d / 60)}:${String(Math.floor(d % 60)).padStart(2, '0')}`;
      }

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

          // Audio track
          const audioFmts = info.formats.filter(f => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none'));
          let audioSize = 0;
          if (audioFmts.length > 0) {
            const best = audioFmts.reduce((b, c) => (c.filesize || c.filesize_approx || 0) > (b.filesize || b.filesize_approx || 0) ? c : b);
            audioSize = best.filesize || best.filesize_approx || 0;
          }

          metadata.availableFormats = [
            ...videoFormats,
            { formatId: 'audio-mp3', quality: 'audio', format: 'mp3', label: 'Audio Track MP3', mediaType: 'audio', fileSize: audioSize || undefined },
          ];
        }
      }
    } catch (err) {
      ytdlpFailed = true;
      const errMsg = err.stderr || err.message || '';
      if (errMsg.includes('No video formats found')) {
        metadata.isImagePost = true;
        metadata.type = 'image';
      }
    }

    // Always try Instagram API for richer info + image support
    try {
      const mediaId = shortcodeToMediaId(contentId);
      const apiData = await fetchInstagramMediaInfo(mediaId);
      const item = apiData.items?.[0];

      if (item) {
        if (item.user?.username) metadata.creator = item.user.username;
        if (item.caption?.text) {
          metadata.title = item.caption.text.split('\n')[0].substring(0, 100) || metadata.title;
        }

        // Best quality thumbnail
        const thumb = item.image_versions2?.candidates?.[0]?.url;
        if (thumb) metadata.thumbnail = thumb;

        // media_type: 1=image, 2=video, 8=carousel
        const mediaType = item.media_type;

        if (mediaType === 1) {
          // Single image
          metadata.isImagePost = true;
          metadata.type = 'image';
          metadata.imageUrls = [item.image_versions2?.candidates?.[0]?.url].filter(Boolean);
          
          // Get estimated file size
          let imageSize = 0;
          if (metadata.imageUrls[0]) {
            try {
              imageSize = await getFileSizeFromUrl(metadata.imageUrls[0]);
              metadata.estimatedSize = imageSize;
            } catch {}
          }
          
          metadata.availableFormats = [
            { 
              formatId: 'image-jpg', 
              quality: 'image', 
              format: 'jpg', 
              label: 'Download Image (JPG)', 
              mediaType: 'image',
              fileSize: imageSize || 0
            },
          ];
        } else if (mediaType === 8) {
          // Carousel — mix of images and videos
          const carouselItems = item.carousel_media || [];
          const hasVideos = carouselItems.some(m => m.media_type === 2);
          const imageUrls = carouselItems
            .filter(m => m.media_type === 1)
            .map(m => m.image_versions2?.candidates?.[0]?.url)
            .filter(Boolean);
          const videoCount = carouselItems.filter(m => m.media_type === 2).length;
          const imageCount = imageUrls.length;

          metadata.isImagePost = !hasVideos;
          metadata.type = 'carousel';
          metadata.imageUrls = imageUrls;
          metadata.carouselCount = carouselItems.length;

          metadata.availableFormats = [];
          
          if (hasVideos) {
            // Get total video size estimate
            let totalVideoSize = 0;
            const videoItems = carouselItems.filter(m => m.media_type === 2);
            for (const vItem of videoItems.slice(0, 1)) { // Check first video only for speed
              const vUrl = vItem.video_versions?.[0]?.url;
              if (vUrl) {
                try {
                  const size = await getFileSizeFromUrl(vUrl);
                  totalVideoSize = size * videoCount; // Estimate total
                  break;
                } catch {}
              }
            }
            
            metadata.availableFormats.push(
              { 
                formatId: 'best-mp4', 
                quality: 'best', 
                format: 'mp4', 
                label: `Download Videos (${videoCount})`, 
                mediaType: 'video',
                fileSize: totalVideoSize || 0
              }
            );
          }
          
          if (imageCount > 0) {
            // Get total image size estimate
            let totalImageSize = 0;
            if (imageUrls[0]) {
              try {
                const size = await getFileSizeFromUrl(imageUrls[0]);
                totalImageSize = size * imageCount; // Estimate total
              } catch {}
            }
            
            metadata.availableFormats.push(
              { 
                formatId: 'image-jpg', 
                quality: 'image', 
                format: imageCount > 1 ? 'zip' : 'jpg', 
                label: imageCount > 1 ? `Download Images as ZIP (${imageCount} images)` : 'Download Image (JPG)', 
                mediaType: 'image',
                fileSize: totalImageSize || 0
              }
            );
          }
          metadata.notice = `Carousel post with ${carouselItems.length} items (${imageCount} image${imageCount !== 1 ? 's' : ''}${hasVideos ? `, ${videoCount} video${videoCount !== 1 ? 's' : ''}` : ''}).`;
        } else if (mediaType === 2) {
          // Confirmed video
          metadata.isImagePost = false;
          metadata.type = urlType;
          if (item.video_duration) {
            const d = item.video_duration;
            metadata.duration = `${Math.floor(d / 60)}:${String(Math.floor(d % 60)).padStart(2, '0')}`;
          }
          
          // Get video file size
          const videoUrl = item.video_versions?.[0]?.url;
          let videoSize = 0;
          if (videoUrl) {
            try {
              videoSize = await getFileSizeFromUrl(videoUrl);
            } catch {}
          }
          
          metadata.availableFormats = [
            { 
              formatId: 'best-mp4', 
              quality: 'best', 
              format: 'mp4', 
              label: 'Original Quality MP4', 
              mediaType: 'video',
              fileSize: videoSize || 0
            },
            { 
              formatId: 'audio-mp3', 
              quality: 'audio', 
              format: 'mp3', 
              label: 'Audio Track MP3', 
              mediaType: 'audio',
              fileSize: Math.floor(videoSize * 0.1) || 0  // Estimate audio as ~10% of video
            },
          ];
        }
      }
    } catch (err) {
      logger.warn('Instagram API fallback failed:', err.message);
      // If yt-dlp also failed and we have no image info, keep isImagePost state from yt-dlp error
    }

    return metadata;
  }

  static async download(url, format = 'mp4', quality = 'best', outputPath) {
    const cleanUrl = url.split('?')[0];

    // Image download — use Instagram API directly
    if (format === 'jpg' || quality === 'image') {
      const contentId = PlatformDetector.extractVideoId(url, 'instagram');
      const mediaId = shortcodeToMediaId(contentId);
      const apiData = await fetchInstagramMediaInfo(mediaId);
      const item = apiData.items?.[0];
      if (!item) throw new Error('Could not fetch Instagram media info for image download');

      const path = require('path');
      const archiver = require('archiver');
      
      if (item.media_type === 1) {
        // Single image
        const imageUrl = item.image_versions2?.candidates?.[0]?.url;
        if (!imageUrl) throw new Error('No image URL found in this Instagram post');
        logger.info(`Instagram single image download from API: ${mediaId}`);
        await downloadImageFromUrl(imageUrl, outputPath);
        return { stdout: 'Image download complete' };
        
      } else if (item.media_type === 8) {
        // Carousel with multiple images/videos
        const carouselItems = item.carousel_media || [];
        const imageItems = carouselItems.filter(m => m.media_type === 1);
        
        if (imageItems.length === 0) {
          throw new Error('No images found in this carousel post');
        }
        
        if (imageItems.length === 1) {
          // Single image in carousel
          const imageUrl = imageItems[0].image_versions2?.candidates?.[0]?.url;
          if (!imageUrl) throw new Error('No image URL found');
          logger.info(`Instagram carousel single image download: ${mediaId}`);
          await downloadImageFromUrl(imageUrl, outputPath);
          return { stdout: 'Image download complete' };
        }
        
        // Multiple images - create ZIP
        logger.info(`Instagram carousel multi-image download (${imageItems.length} images): ${mediaId}`);
        
        // Download all images to temp location
        const tempDir = path.join(path.dirname(outputPath), `temp_${Date.now()}`);
        fs.mkdirSync(tempDir, { recursive: true });
        
        try {
          const downloadPromises = imageItems.map(async (imgItem, index) => {
            const imageUrl = imgItem.image_versions2?.candidates?.[0]?.url;
            if (!imageUrl) return null;
            const tempImagePath = path.join(tempDir, `image_${index + 1}.jpg`);
            await downloadImageFromUrl(imageUrl, tempImagePath);
            return tempImagePath;
          });
          
          const downloadedPaths = (await Promise.all(downloadPromises)).filter(Boolean);
          
          if (downloadedPaths.length === 0) {
            throw new Error('Failed to download any images from carousel');
          }
          
          // Create ZIP file
          return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(outputPath);
            const archive = archiver('zip', { zlib: { level: 9 } });
            
            output.on('close', () => {
              // Cleanup temp files
              downloadedPaths.forEach(p => fs.unlinkSync(p));
              fs.rmdirSync(tempDir);
              resolve({ stdout: `Downloaded ${downloadedPaths.length} images as ZIP` });
            });
            
            archive.on('error', (err) => {
              // Cleanup on error
              downloadedPaths.forEach(p => {
                try { fs.unlinkSync(p); } catch {}
              });
              try { fs.rmdirSync(tempDir); } catch {}
              reject(err);
            });
            
            archive.pipe(output);
            downloadedPaths.forEach((imgPath, index) => {
              archive.file(imgPath, { name: `image_${index + 1}.jpg` });
            });
            archive.finalize();
          });
          
        } catch (err) {
          // Cleanup temp directory on error
          try {
            const files = fs.readdirSync(tempDir);
            files.forEach(file => fs.unlinkSync(path.join(tempDir, file)));
            fs.rmdirSync(tempDir);
          } catch {}
          throw err;
        }
      }
      
      throw new Error('No image URL found in this Instagram post');
    }

    // Video download — use yt-dlp
    const ytdlpPath = process.env.YT_DLP_PATH || 'yt-dlp';
    const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';

    let formatArg;
    if (format === 'mp3' || quality === 'audio') {
      formatArg = '-x --audio-format mp3 --audio-quality 0';
    } else {
      const heightMatch = quality.match(/(\d+)p?/);
      const height = heightMatch ? parseInt(heightMatch[1]) : null;
      if (height) {
        formatArg = `-f "bestvideo[height<=${height}]+bestaudio/best[height<=${height}]" --merge-output-format mp4`;
      } else {
        formatArg = `-f "best"`;
      }
    }

    const command = `"${ytdlpPath}" --ffmpeg-location "${ffmpegPath}" ${cookiesArg()} ${formatArg} -o "${outputPath}" --no-playlist "${cleanUrl}"`;
    logger.info(`Instagram video download: ${command}`);

    try {
      return await execAsync(command, { timeout: 300000 });
    } catch (err) {
      const errMsg = err.stderr || err.message || '';
      if (errMsg.includes('No video formats found')) {
        throw new Error('This Instagram post contains only images. Use image format to download.');
      }
      throw new Error(`Instagram download failed: ${errMsg}`);
    }
  }
}

module.exports = InstagramService;
