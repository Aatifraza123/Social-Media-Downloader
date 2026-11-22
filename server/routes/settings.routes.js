const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middleware/auth');
const { validate, settingsSchema } = require('../utils/validators');

router.get('/', auth, settingsController.getSettings);
router.patch('/', auth, validate(settingsSchema), settingsController.updateSettings);

module.exports = router;
