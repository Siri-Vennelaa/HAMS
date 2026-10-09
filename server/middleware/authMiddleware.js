const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect private routes by verifying JWT Bearer token
 */
const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'supersecretjwtkey_hams_2026_secure';
    const decoded = jwt.verify(token, secret);

    // Find the user and exclude password field
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. The user associated with this token no longer exists.',
      });
    }

    // Attach user to the request object
    req.user = user;
    next();
  } catch (error) {
    let errorMessage = 'Unauthorized. Invalid token.';

    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Unauthorized. Token has expired, please log in again.';
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Unauthorized. Malformed or invalid token.';
    }

    return res.status(401).json({
      success: false,
      message: errorMessage,
    });
  }
};

module.exports = {
  protect,
};
