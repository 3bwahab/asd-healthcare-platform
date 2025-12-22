const jwt = require("jsonwebtoken");

/**
 * Create JWT token for user authentication
 * @param {string} payload - User ID to encode in token
 * @returns {string} - Signed JWT token
 */
const createToken = (payload) =>
  jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

module.exports = createToken;
