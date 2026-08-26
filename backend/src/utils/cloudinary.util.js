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
      const base64Str = fileBuffer ? fileBuffer.toString('base64') : '';
      const mockPublicId = `${folder}/image_mock_${Date.now()}`;
      return resolve({
        public_id: mockPublicId,
        secure_url: `data:image/jpeg;base64,${base64Str}`,
      });
    }

    let isSettled = false;
    let timer = null;

    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || !process.env.NODE_ENV) {
      timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          logger.warn('Cloudinary image upload timed out (3s) in dev mode. Falling back to base64 Data URI.');
          const base64Str = fileBuffer ? fileBuffer.toString('base64') : '';
          const mockPublicId = `${folder}/fallback_${Date.now()}`;
          resolve({
            public_id: mockPublicId,
            secure_url: `data:image/jpeg;base64,${base64Str}`,
          });
        }
      }, 3000);
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
        if (timer) clearTimeout(timer);
        if (isSettled) return;
        isSettled = true;

        if (error) {
          logger.error(`Cloudinary upload failed: ${error.message}`);
          if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || !process.env.NODE_ENV) {
            logger.warn('Cloudinary upload failed in dev mode. Falling back to base64 Data URI.');
            const base64Str = fileBuffer ? fileBuffer.toString('base64') : '';
            const mockPublicId = `${folder}/fallback_${Date.now()}`;
            return resolve({
              public_id: mockPublicId,
              secure_url: `data:image/jpeg;base64,${base64Str}`,
            });
          }
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
  if (!imageUrl || imageUrl.startsWith('data:') || !imageUrl.includes('cloudinary.com')) {
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

import { v4 as uuidv4 } from 'uuid';

/**
 * Upload raw PDF document Buffer to Cloudinary via upload_stream
 * Generates a unique public ID for every file to prevent name collision/overwriting.
 *
 * @param {Buffer} fileBuffer - Document file buffer
 * @param {string} folder - Target Cloudinary folder (default: 'interviewiq/resumes')
 * @param {string} [originalName='resume.pdf'] - Original file name for reference
 * @returns {Promise<{ public_id: string, secure_url: string, url: string }>} Cloudinary upload response object
 */
export const uploadRawToCloudinary = (
  fileBuffer,
  folder = 'interviewiq/resumes',
  originalName = 'resume.pdf'
) => {
  return new Promise((resolve, reject) => {
    // Generate unique public_id using UUID v4 and timestamp
    const uniqueId = `resume_${Date.now()}_${uuidv4().substring(0, 8)}`;

    if (
      process.env.CLOUDINARY_CLOUD_NAME === 'demo_cloud_name' ||
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_API_SECRET === 'sample_cloudinary_api_secret'
    ) {
      logger.warn('Cloudinary using demo credentials. Simulating PDF resume upload for development.');
      const mockPublicId = `${folder}/${uniqueId}`;
      const base64Str = fileBuffer ? fileBuffer.toString('base64') : '';
      const dataUrl = `data:application/pdf;base64,${base64Str}`;
      return resolve({
        public_id: mockPublicId,
        secure_url: dataUrl,
        url: dataUrl,
      });
    }

    let isSettled = false;
    let timer = null;

    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || !process.env.NODE_ENV) {
      timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          logger.warn('Cloudinary raw upload timed out (3s) in dev mode. Falling back to Data URI.');
          const base64Str = fileBuffer ? fileBuffer.toString('base64') : '';
          const mockPublicId = `${folder}/${uniqueId}`;
          const dataUrl = `data:application/pdf;base64,${base64Str}`;
          resolve({
            public_id: mockPublicId,
            secure_url: dataUrl,
            url: dataUrl,
          });
        }
      }, 3000);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: uniqueId,
        resource_type: 'raw',
        format: 'pdf',
      },
      (error, result) => {
        if (timer) clearTimeout(timer);
        if (isSettled) return;
        isSettled = true;

        if (error) {
          logger.error(`Cloudinary raw upload failed: ${error.message}`);
          if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || !process.env.NODE_ENV) {
            logger.warn('Cloudinary raw document upload failed in dev mode. Falling back to Data URI.');
            const base64Str = fileBuffer ? fileBuffer.toString('base64') : '';
            const mockPublicId = `${folder}/${uniqueId}`;
            const dataUrl = `data:application/pdf;base64,${base64Str}`;
            return resolve({
              public_id: mockPublicId,
              secure_url: dataUrl,
              url: dataUrl,
            });
          }
          return reject(error);
        }
        resolve(result);
      }
    );

    try {
      uploadStream.end(fileBuffer);
    } catch (streamError) {
      if (timer) clearTimeout(timer);
      if (isSettled) return;
      isSettled = true;
      logger.error(`Failed to pipe file buffer into Cloudinary upload stream: ${streamError.message}`);
      reject(streamError);
    }
  });
};

/**
 * Destroy raw asset on Cloudinary using publicId or URL
 * @param {string} publicIdOrUrl - Cloudinary publicId or full asset URL
 */
export const deleteRawFromCloudinary = async (publicIdOrUrl) => {
  if (!publicIdOrUrl || publicIdOrUrl.startsWith('data:') || (!publicIdOrUrl.includes('cloudinary.com') && !publicIdOrUrl.includes('interviewiq/'))) {
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


