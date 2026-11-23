const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');
const auth = require('../middleware/auth');

router.get('/', auth, downloadController.getAll);
router.get('/:id', downloadController.getOne);
router.get('/:id/file', downloadController.getFile);
router.get('/:id/progress', downloadController.getProgress);
router.post('/:id/cancel', downloadController.cancel);
router.delete('/:id', auth, downloadController.delete);

module.exports = router;
