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
    test('YouTubeService returns structured formats without crashing', async () => {
      const metadata = await YouTubeService.analyze('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(metadata.platform).toBe('youtube');
      expect(metadata.availableFormats.length).toBeGreaterThan(0);
      expect(metadata.availableFormats[0]).toHaveProperty('quality');
      expect(metadata.availableFormats[0]).toHaveProperty('format');
    });

    test('InstagramService returns structured metadata', async () => {
      const metadata = await InstagramService.analyze('https://www.instagram.com/reel/C2xyzABC123/');
      expect(metadata.platform).toBe('instagram');
      expect(metadata.availableFormats.length).toBeGreaterThan(0);
    });

    test('TwitterService returns structured metadata', async () => {
      const metadata = await TwitterService.analyze('https://x.com/jack/status/20');
      expect(metadata.platform).toBe('twitter');
      expect(metadata.availableFormats.length).toBeGreaterThan(0);
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

    test('Protected route /api/media/analyze rejects unauthenticated access with 401', async () => {
      const res = await request(app).post('/api/media/analyze').send({
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
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
