const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const logger = require('../utils/logger');

class FFmpegService {
  constructor() {
    if (process.env.FFMPEG_PATH) {
      ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
    }
  }

  async convertToMp3(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .output(outputPath)
        .audioCodec('libmp3lame')
        .audioBitrate('192k')
        .on('end', () => {
          logger.info(`Converted to MP3: ${path.basename(outputPath)}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          logger.error('FFmpeg MP3 conversion error:', err.message);
          reject(err);
        })
        .run();
    });
  }
}

module.exports = new FFmpegService();
