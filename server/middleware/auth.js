const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');

const auth = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    
    // Also support Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return ApiResponse.error(res, 'Authentication required', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-jwt-key');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return ApiResponse.error(res, 'User not found or session invalid', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Session expired, please login again', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return ApiResponse.error(res, 'Invalid authentication token', 401);
    }
    logger.error('Auth middleware error:', error);
    return ApiResponse.error(res, 'Authentication failed', 401);
  }
};

module.exports = auth;
