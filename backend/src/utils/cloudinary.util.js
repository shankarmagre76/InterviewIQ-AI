import { cloudinary } from '../config/cloudinary.js';
import logger from './logger.js';

/**
 * Upload image Buffer to Cloudinary via upload_stream
 * @param {Buffer} fileBuffer - Image file buffer
 * @param {string} folder - Target Cloudinary folder
 * @returns {Promise<object>} Cloudinary upload response object containing secure_url and public_id
 */
export const uploadToCloudinary = (fileBuffer, folder = 'interviewiq/profiles') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 500, height: 500, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          logger.error(`Cloudinary upload failed: ${error.message}`);
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Extract public_id from existing Cloudinary image URL and destroy asset
 * @param {string} imageUrl - Existing image URL
 */
export const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return;
  }

  try {
    // Regex matching Cloudinary asset public_id from secure URL format
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/;
    const match = imageUrl.match(regex);
    if (match && match[1]) {
      const publicId = match[1];
      await cloudinary.uploader.destroy(publicId);
      logger.info(`Successfully deleted previous Cloudinary image: ${publicId}`);
    }
  } catch (error) {
    logger.warn(`Failed to delete previous Cloudinary asset: ${error.message}`);
  }
};
