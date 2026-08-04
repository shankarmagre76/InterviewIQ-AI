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
    if (
      process.env.CLOUDINARY_CLOUD_NAME === 'demo_cloud_name' ||
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_API_SECRET === 'sample_cloudinary_api_secret'
    ) {
      logger.warn('Cloudinary using demo credentials. Simulating image upload for development.');
      const timestamp = Date.now();
      const mockPublicId = `${folder}/image_mock_${timestamp}`;
      return resolve({
        public_id: mockPublicId,
        secure_url: `https://res.cloudinary.com/demo/image/upload/v${timestamp}/${mockPublicId}.jpg`,
      });
    }

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

  if (
    process.env.CLOUDINARY_CLOUD_NAME === 'demo_cloud_name' ||
    !process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_API_SECRET === 'sample_cloudinary_api_secret'
  ) {
    logger.info(`Simulated Cloudinary image deletion for demo environment: ${imageUrl}`);
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

/**
 * Upload raw document Buffer (PDF, DOC, DOCX) to Cloudinary via upload_stream
 * @param {Buffer} fileBuffer - Document file buffer
 * @param {string} folder - Target Cloudinary folder
 * @returns {Promise<object>} Cloudinary upload response object containing secure_url and public_id
 */
export const uploadRawToCloudinary = (fileBuffer, folder = 'interviewiq/resumes') => {
  return new Promise((resolve, reject) => {
    if (
      process.env.CLOUDINARY_CLOUD_NAME === 'demo_cloud_name' ||
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_API_SECRET === 'sample_cloudinary_api_secret'
    ) {
      logger.warn('Cloudinary using demo credentials. Simulating raw document upload for development.');
      const timestamp = Date.now();
      const mockPublicId = `${folder}/resume_mock_${timestamp}`;
      return resolve({
        public_id: mockPublicId,
        secure_url: `https://res.cloudinary.com/demo/raw/upload/v${timestamp}/${mockPublicId}.pdf`,
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'raw',
      },
      (error, result) => {
        if (error) {
          logger.error(`Cloudinary raw upload failed: ${error.message}`);
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Destroy raw asset on Cloudinary using publicId or URL
 * @param {string} publicIdOrUrl - Cloudinary publicId or full asset URL
 */
export const deleteRawFromCloudinary = async (publicIdOrUrl) => {
  if (!publicIdOrUrl) {
    return;
  }

  if (
    process.env.CLOUDINARY_CLOUD_NAME === 'demo_cloud_name' ||
    !process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_API_SECRET === 'sample_cloudinary_api_secret'
  ) {
    logger.info(`Simulated Cloudinary raw document deletion for demo environment: ${publicIdOrUrl}`);
    return;
  }

  try {
    let publicId = publicIdOrUrl;
    if (publicIdOrUrl.includes('cloudinary.com')) {
      const regex = /\/upload\/(?:v\d+\/)?(.+)$/;
      const match = publicIdOrUrl.match(regex);
      if (match && match[1]) {
        publicId = match[1];
      }
    }

    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    logger.info(`Successfully deleted previous Cloudinary raw asset: ${publicId}`);
  } catch (error) {
    logger.warn(`Failed to delete previous Cloudinary raw asset: ${error.message}`);
  }
};


