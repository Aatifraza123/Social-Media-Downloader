const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');

const LOCK_TIME = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret-jwt-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const setTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return ApiResponse.error(res, 'Invalid email or password', 401);
    }

    if (user.isLocked()) {
      return ApiResponse.error(res, 'Account is temporarily locked due to excessive failed attempts. Please try again later.', 423);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME);
        user.loginAttempts = 0;
      }
      await user.save();
      return ApiResponse.error(res, 'Invalid email or password', 401);
    }

    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    await ActivityLog.create({
      userId: user._id,
      action: 'login',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    logger.info(`User logged in successfully: ${email}`);

    return ApiResponse.success(res, {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    }, 'Login successful');
  } catch (error) {
    logger.error('Login error:', error);
    return ApiResponse.error(res, 'Login failed');
  }
};

exports.logout = async (req, res) => {
  try {
    if (req.user) {
      await ActivityLog.create({
        userId: req.user._id,
        action: 'logout',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
    }
    res.clearCookie('token', { path: '/' });
    return ApiResponse.success(res, null, 'Logged out successfully');
  } catch (error) {
    return ApiResponse.error(res, 'Logout failed');
  }
};

exports.getMe = async (req, res) => {
  try {
    return ApiResponse.success(res, {
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    return ApiResponse.error(res, 'Failed to get profile');
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return ApiResponse.error(res, 'Current password is incorrect', 400);
    }

    user.password = newPassword;
    await user.save();

    await ActivityLog.create({
      userId: user._id,
      action: 'password_change',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    return ApiResponse.success(res, { token }, 'Password changed successfully');
  } catch (error) {
    return ApiResponse.error(res, 'Failed to change password');
  }
};
