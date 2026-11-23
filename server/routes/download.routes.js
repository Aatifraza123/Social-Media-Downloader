const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');
const auth = require('../middleware/auth');

// Admin-only access to full history records and deletions
router.get('/', auth, downloadController.getAll);
router.delete('/:id', auth, downloadController.delete);

// Individual download streaming / progress (for active downloads)
router.get('/:id', downloadController.getOne);
router.get('/:id/file', downloadController.getFile);
router.get('/:id/progress', downloadController.getProgress);
router.post('/:id/cancel', downloadController.cancel);

module.exports = router;
