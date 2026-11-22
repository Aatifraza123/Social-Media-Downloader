const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');
const auth = require('../middleware/auth');

router.get('/', auth, downloadController.getAll);
router.get('/:id', auth, downloadController.getOne);
router.get('/:id/file', auth, downloadController.getFile);
router.get('/:id/progress', auth, downloadController.getProgress);
router.post('/:id/cancel', auth, downloadController.cancel);
router.post('/:id/retry', auth, downloadController.retry);
router.delete('/:id', auth, downloadController.remove);

module.exports = router;
