const cloudinary = require("cloudinary").v2;

/**
 * Configure Cloudinary for file uploads
 * Initializes Cloudinary with credentials from environment variables
 * @returns {Object} cloudinary - Configured Cloudinary instance
 */
exports.cloudinaryConfig = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });

  return cloudinary;
};
