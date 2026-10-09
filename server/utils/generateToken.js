const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token containing userId and role
 * @param {string} userId - MongoDB ObjectId string of user
 * @param {string} role - User role ('patient' | 'doctor' | 'admin')
 * @returns {string} Signed JWT token
 */
const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'supersecretjwtkey_hams_2026_secure';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      userId,
      role,
    },
    secret,
    {
      expiresIn,
    }
  );
};

module.exports = generateToken;
