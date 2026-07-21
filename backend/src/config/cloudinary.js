import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger.js';

/**
 * Configure Cloudinary SDK with environment variables.
 */
const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    logger.info('Cloudinary configured successfully');
  } else {
    logger.warn('Cloudinary credentials missing in environment variables. Uploads to Cloudinary will fail until configured.');
  }

  return cloudinary;
};

export { cloudinary };
export default configureCloudinary;
