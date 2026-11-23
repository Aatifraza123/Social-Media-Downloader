const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middleware/auth');
const { validate, settingsSchema } = require('../utils/validators');

// Public endpoint — returns only branding fields, no auth required
router.get('/branding', settingsController.getBranding);

router.get('/', auth, settingsController.getSettings);
router.patch('/', auth, validate(settingsSchema), settingsController.updateSettings);

module.exports = router;
