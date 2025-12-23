/**
 * Global error handling middleware
 * Handles different error types and sends appropriate responses
 * based on environment (development vs production)
 */
const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.MODE_ENV === "development") {
    // Development: Send detailed error information
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Production: Send limited error information
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
};

module.exports = globalError;
