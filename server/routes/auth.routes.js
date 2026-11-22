const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');
const { validate, loginSchema, changePasswordSchema } = require('../utils/validators');

router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getMe);
router.post('/change-password', auth, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
