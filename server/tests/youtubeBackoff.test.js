const { promisify } = require('util');
const run = jest.fn();
const url = 'https://www.youtube.com/watch?v=jNQXAC9IVRw';
let service;

beforeEach(() => {
  jest.resetModules();
  run.mockReset();
  jest.doMock('child_process', () => ({
    execFile: Object.assign(jest.fn(), { [promisify.custom]: run }),
  }));
  service = require('../services/platforms/youtube.service');
  jest.useFakeTimers();
});

afterEach(() => jest.useRealTimers());

const metadata = { stdout: JSON.stringify({ formats: [
  { format_id: '18', height: 360, ext: 'mp4', vcodec: 'h264', acodec: 'aac' },
] }) };

test('concurrent previews and download preparation share a format lookup', async () => {
  run.mockResolvedValue(metadata);
  await Promise.all([service.analyze(url), service.analyze(url)]);
  await service.analyze(url);
  expect(run).toHaveBeenCalledTimes(1);
  jest.advanceTimersByTime(300001);
  await service.analyze(url);
  expect(run).toHaveBeenCalledTimes(2);
});

test.each(['HTTP Error 429', 'Sign in to confirm you’re not a bot'])(
  'temporarily pauses probes and downloads after %s', async stderr => {
    run.mockRejectedValueOnce({ stderr }).mockResolvedValue(metadata);
    await expect(service.analyze(url)).rejects.toMatchObject({ statusCode: 429 });
    await expect(service.download(url, 'mp4', '360p', 'test.mp4', '18')).rejects.toMatchObject({ statusCode: 429 });
    await expect(service.analyze(url)).rejects.toMatchObject({ statusCode: 429 });
    expect(run).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(900001);
    await expect(service.analyze(url)).resolves.toHaveProperty('availableFormats');
  });
