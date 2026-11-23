const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const logger = require('../utils/logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a local file to Cloudinary.
 * Returns { url, publicId, bytes }
 */
async function uploadFile(localPath, options = {}) {
  const isVideo = options.resourceType === 'video' || /\.(mp4|webm|mov|mkv)$/i.test(localPath);
  const isAudio = options.resourceType === 'audio' || /\.(mp3|m4a|wav)$/i.test(localPath);
  const isImage = options.resourceType === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(localPath);

  const resourceType = isImage ? 'image' : (isAudio ? 'video' : 'video'); // cloudinary uses 'video' for audio too

  const result = await cloudinary.uploader.upload(localPath, {
    resource_type: resourceType,
    folder: options.folder || 'social-downloader',
    public_id: options.publicId,
    use_filename: false,
    unique_filename: true,
    overwrite: false,
    ...options.extra,
  });

  logger.info(`Cloudinary upload done: ${result.public_id} (${(result.bytes / 1024 / 1024).toFixed(2)} MB)`);

  return {
    url: result.secure_url,
    publicId: result.public_id,
    bytes: result.bytes,
    resourceType: result.resource_type,
  };
}

/**
 * Delete a file from Cloudinary by publicId.
 */
async function deleteFile(publicId, resourceType = 'video') {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    logger.info(`Cloudinary deleted: ${publicId}`);
  } catch (err) {
    logger.warn(`Cloudinary delete failed for ${publicId}: ${err.message}`);
  }
}

module.exports = { uploadFile, deleteFile };
