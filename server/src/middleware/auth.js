import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    console.log('=== AUTH MIDDLEWARE DEBUG ===');
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    console.log('Request cookies:', req.cookies);

    const token = req.cookies.accessToken;
    console.log('Access token found:', !!token);

    if (!token) {
      console.log('No access token found, returning 401');
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    console.log('Verifying JWT token...');
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    console.log('JWT decoded successfully, userId:', decoded.userId);

    console.log('Looking up user in database...');
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    console.log('User found:', !!user, user ? `Role: ${user.role}, Active: ${user.isActive}` : 'No user found');

    if (!user || !user.isActive) {
      console.log('User not found or inactive, returning 401');
      return res.status(401).json({
        success: false,
        message: 'Invalid or inactive user'
      });
    }

    console.log('Authentication successful, setting req.user');
    req.user = user;
    next();
  } catch (error) {
    console.log('Authentication error:', error.name, error.message);

    if (error.name === 'JsonWebTokenError') {
      console.log('JWT error - invalid token');
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      console.log('JWT error - token expired');
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.log('General authentication error');
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

export const requireAdmin = (req, res, next) => {
  console.log('=== REQUIRE ADMIN DEBUG ===');
  console.log('User:', req.user);
  console.log('User role:', req.user?.role);

  if (!req.user || req.user.role !== 'admin') {
    console.log('Admin access denied');
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  console.log('Admin access granted');
  next();
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.userId).select('-password -refreshTokens');

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
};
