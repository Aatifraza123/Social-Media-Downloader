const fs = require('fs').promises;
const os = require('os');
const path = require('path');
const manager = require('../services/downloadManager');
const Download = require('../models/Download');
const TikTok = require('../services/platforms/tiktok.service');
const detector = require('../services/platforms/platformDetector');

const url = 'https://www.tiktok.com/@sample/video/123456';

describe('TikTok download outcomes', () => {
  const storage = manager.storagePath;
  beforeEach(async () => {
    manager.storagePath = await fs.mkdtemp(path.join(os.tmpdir(), 'download-test-'));
  });
  afterEach(async () => {
    jest.restoreAllMocks();
    const temp = manager.storagePath;
    manager.storagePath = storage;
    await fs.rm(temp, { recursive: true, force: true });
  });

  test.each(['error', 'empty', 'success'])('%s result is recorded correctly', async (result) => {
    const record = { save: jest.fn() };
    jest.spyOn(Download, 'findById').mockResolvedValue(record);
    const download = jest.spyOn(TikTok, 'download').mockImplementation(async (_, format, quality, file) => {
      if (result === 'error') throw new Error('Downloader failed');
      await fs.writeFile(file, result === 'empty' ? '' : 'test fixture');
    });
    await manager.processDownload('test', { url, platform: detector.detect(url).platform });
    expect(download).toHaveBeenCalledTimes(1);
    if (result === 'success') {
      expect(record.status).toBe('completed');
      expect(record.fileSize).toBe(12);
    } else {
      expect(record.status).toBe('failed');
      expect(record.filePath).toBeUndefined();
      if (result === 'error') expect(await fs.readdir(manager.storagePath)).toEqual([]);
    }
  });
});
