const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { optionalAuth } = require('../middleware/auth');
const { downloadLimiter } = require('../middleware/rateLimiter');
const { validate, urlSchema, batchUrlSchema, downloadSchema } = require('../utils/validators');

// Publicly accessible for all users (guests & authenticated)
router.post('/analyze', optionalAuth, validate(urlSchema), mediaController.analyze);
router.post('/download', optionalAuth, downloadLimiter, validate(downloadSchema), mediaController.download);
router.post('/batch', optionalAuth, downloadLimiter, validate(batchUrlSchema), mediaController.batchDownload);

module.exports = router;
