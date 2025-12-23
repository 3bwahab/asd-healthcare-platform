const { validationResult } = require("express-validator");

/**
 * Validation middleware to check express-validator results
 * Returns 400 error with validation errors if validation fails
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "fail",
      errors: errors.array(),
    });
  }

  next();
};

module.exports = validatorMiddleware;
