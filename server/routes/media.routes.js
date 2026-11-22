const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const auth = require('../middleware/auth');
const { downloadLimiter } = require('../middleware/rateLimiter');
const { validate, urlSchema, batchUrlSchema, downloadSchema } = require('../utils/validators');

router.post('/analyze', auth, validate(urlSchema), mediaController.analyze);
router.post('/download', auth, downloadLimiter, validate(downloadSchema), mediaController.download);
router.post('/batch', auth, downloadLimiter, validate(batchUrlSchema), mediaController.batchDownload);

module.exports = router;
