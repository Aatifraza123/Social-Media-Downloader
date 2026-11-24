const { z } = require('zod');
const logger = require('./logger');

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

const urlSchema = z.object({
  url: z.string().url('Invalid URL').max(2048, 'URL too long'),
});

const batchUrlSchema = z.object({
  urls: z.array(z.string().url('Invalid URL').max(2048, 'URL too long'))
    .min(1, 'At least one URL is required')
    .max(20, 'Maximum 20 URLs per batch'),
});

const downloadSchema = z.object({
  url: z.string().url('Invalid URL'),
  platform: z.enum(['youtube', 'instagram', 'twitter', 'tiktok']).optional(),
  format: z.enum(['mp4', 'webm', 'mp3', 'm4a', 'jpg', 'png', 'webp']).optional(),
  quality: z.string().optional(),
});

const settingsSchema = z.object({
  defaultFormat: z.enum(['mp4', 'webm', 'mp3', 'm4a']).optional(),
  preferredQuality: z.string().optional(),
  maxConcurrentDownloads: z.number().min(1).max(5).optional(),
  fileRetentionDays: z.number().min(1).max(365).optional(),
  autoCleanup: z.boolean().optional(),
  theme: z.enum(['dark', 'light']).optional(),
  animationsEnabled: z.boolean().optional(),
});

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    const errorDetails = error.errors?.map(e => ({
      field: e.path.join('.'),
      message: e.message,
      received: e.received
    }));
    
    logger.error('Validation error:', JSON.stringify(errorDetails));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorDetails,
    });
  }
};

module.exports = {
  loginSchema,
  changePasswordSchema,
  urlSchema,
  batchUrlSchema,
  downloadSchema,
  settingsSchema,
  validate,
};
