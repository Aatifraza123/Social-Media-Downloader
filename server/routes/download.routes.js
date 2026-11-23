const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');
const { optionalAuth } = require('../middleware/auth');

// Publicly accessible download & status retrieval
router.get('/', optionalAuth, downloadController.getAll);
router.get('/:id', downloadController.getOne);
router.get('/:id/file', downloadController.getFile);
router.get('/:id/progress', downloadController.getProgress);
router.post('/:id/cancel', downloadController.cancel);
router.delete('/:id', optionalAuth, downloadController.delete);

module.exports = router;
