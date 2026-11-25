const request = require('supertest');
const app = require('../server');
const PlatformDetector = require('../services/platforms/platformDetector');
const YouTubeService = require('../services/platforms/youtube.service');
const InstagramService = require('../services/platforms/instagram.service');
const TwitterService = require('../services/platforms/twitter.service');

describe('Social Media Downloader Pro - Comprehensive Test Suite', () => {
  describe('1. Platform Detection & Video ID Extraction', () => {
    test('Detects standard YouTube watch URL and extracts video ID', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const detected = PlatformDetector.detect(url);
      expect(detected).not.toBeNull();
      expect(detected.platform).toBe('youtube');
      expect(PlatformDetector.extractVideoId(url, 'youtube')).toBe('dQw4w9WgXcQ');
    });

    test('Detects youtu.be short URL and extracts video ID', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';
      const detected = PlatformDetector.detect(url);
      expect(detected).not.toBeNull();
      expect(detected.platform).toBe('youtube');
      expect(PlatformDetector.extractVideoId(url, 'youtube')).toBe('dQw4w9WgXcQ');
    });

    test('Detects YouTube Shorts URL and extracts video ID', () => {
      const url = 'https://www.youtube.com/shorts/abcdef12345';
      const detected = PlatformDetector.detect(url);
      expect(detected).not.toBeNull();
      expect(detected.platform).toBe('youtube');
      expect(PlatformDetector.extractVideoId(url, 'youtube')).toBe('abcdef12345');
    });

    test('Detects Instagram Reel URL and extracts content ID', () => {
      const url = 'https://www.instagram.com/reel/C2xyzABC123/';
      const detected = PlatformDetector.detect(url);
      expect(detected).not.toBeNull();
      expect(detected.platform).toBe('instagram');
      expect(PlatformDetector.extractVideoId(url, 'instagram')).toBe('C2xyzABC123');
    });

    test('Detects Instagram Post URL and extracts content ID', () => {
      const url = 'https://www.instagram.com/p/DB123456789/';
      const detected = PlatformDetector.detect(url);
      expect(detected).not.toBeNull();
      expect(detected.platform).toBe('instagram');
      expect(PlatformDetector.extractVideoId(url, 'instagram')).toBe('DB123456789');
    });

    test('Detects X / Twitter status URL and extracts tweet ID', () => {
      const url = 'https://x.com/jack/status/20';
      const detected = PlatformDetector.detect(url);
      expect(detected).not.toBeNull();
      expect(detected.platform).toBe('twitter');
      expect(PlatformDetector.extractVideoId(url, 'twitter')).toBe('20');
    });

    test('Rejects unsupported domain', () => {
      const detected = PlatformDetector.detect('https://unsupported-site.example.com/video/123');
      expect(detected).toBeNull();
    });
  });

  describe('2. Metadata Analysis Fallback Mechanisms', () => {
    test('YouTube options preserve the original video stream and matching audio', () => {
      const formats = YouTubeService.formats([
        { format_id: '248', width: 1920, height: 1080, fps: 60, ext: 'webm', vcodec: 'vp9', acodec: 'none' },
        { format_id: '251', ext: 'webm', vcodec: 'none', acodec: 'opus' },
      ]);
      expect(formats.filter(f => f.mediaType === 'video')).toEqual([
        expect.objectContaining({ formatId: '248+251', quality: '1080p', format: 'webm', fps: 60 }),
      ]);
      expect(YouTubeService.formats([])).toEqual([]);
    });

    test('An inaccessible Instagram reel does not offer invented download options', async () => {
      await expect(InstagramService.analyze('https://www.instagram.com/reel/C2xyzABC123/'))
        .rejects.toThrow('Instagram did not provide accessible media');
    });

    test('X photos expose original image formats and ignore unrelated URLs', () => {
      const formats = TwitterService.photoFormats({ photos: [
        { url: 'https://pbs.twimg.com/media/sample.jpg', width: 1199, height: 1312 },
        { url: 'https://example.com/media/sample.jpg' },
      ] });
      expect(formats).toHaveLength(1);
      expect(formats[0]).toMatchObject({ format: 'jpg', mediaType: 'image',
        source: 'https://pbs.twimg.com/media/sample?format=jpg&name=orig' });
    });
  });

  describe('3. Health and Infrastructure Endpoints', () => {
    test('GET /api/health returns 200 with environment metadata', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.environment).toBeDefined();
      expect(res.body.data.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('4. Security & Guard Middleware', () => {
    test('Protected route /api/dashboard/stats rejects unauthenticated access with 401', async () => {
      const res = await request(app).get('/api/dashboard/stats');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('Protected route /api/downloads rejects unauthenticated access with 401', async () => {
      const res = await request(app).get('/api/downloads');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('Protected route /api/settings rejects unauthenticated access with 401', async () => {
      const res = await request(app).get('/api/settings');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('Guests can analyze a supported media URL', async () => {
      const media = { platform: 'youtube', title: 'Guest preview' };
      const analyze = jest.spyOn(YouTubeService, 'analyze').mockResolvedValue(media);
      try {
        const res = await request(app).post('/api/media/analyze').send({
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toMatchObject(media);
      } finally {
        analyze.mockRestore();
      }
    });

    test('Login endpoint rejects invalid email payload', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'invalid-email-format',
        password: 'short',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
