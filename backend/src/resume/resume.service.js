import resumeRepository from './resume.repository.js';
import Profile from '../profile/profile.model.js';
import ApiError from '../utils/ApiError.js';
import {
  uploadRawToCloudinary,
  deleteRawFromCloudinary,
} from '../utils/cloudinary.util.js';
import logger from '../utils/logger.js';

/**
 * Resume Service Layer
 * Contains complete business logic for managing candidate resumes, Cloudinary uploads,
 * active resume replacements, user ownership validation, and profile synchronization.
 */
class ResumeService {
  /**
   * Upload a new resume for a user or replace an existing active resume.
   * Business Logic:
   * 1. Checks if user already has an active resume.
   * 2. If an active resume exists, deactivates old records and deletes the old asset from Cloudinary.
   * 3. Uploads the new PDF file buffer to Cloudinary.
   * 4. Persists the new active resume document in MongoDB via Repository.
   * 5. Synchronizes embedded resume metadata in the candidate's Profile document if present.
   *
   * @param {string} userId - MongoDB ObjectId of the authenticated user
   * @param {object} file - Multer file object containing originalname, buffer, mimetype, size
   * @returns {Promise<object>} Newly created active Resume document
   */
  async uploadOrReplaceResume(userId, file) {
    if (!userId) {
      throw ApiError.unauthorized('User authentication is required to upload a resume');
    }
    if (!file || !file.buffer) {
      throw ApiError.badRequest('Resume file buffer is required for upload');
    }

    // Step 1: Check if user already has an active resume
    const existingActiveResume = await resumeRepository.getResumeByUser(userId);

    if (existingActiveResume) {
      logger.info(
        `User ${userId} already has an active resume (${existingActiveResume._id}). Initiating replacement.`
      );

      // Step 2a: Deactivate existing active resume documents in DB
      await resumeRepository.updateManyStatusByUser(userId, false);

      // Step 2b: Remove previous asset from Cloudinary storage asynchronously
      if (existingActiveResume.publicId) {
        deleteRawFromCloudinary(existingActiveResume.publicId).catch((err) => {
          logger.warn(
            `Failed to cleanup previous Cloudinary resume asset (${existingActiveResume.publicId}): ${err.message}`
          );
        });
      }
    }

    // Step 3: Upload the new PDF file to Cloudinary raw assets folder
    let uploadResult;
    try {
      uploadResult = await uploadRawToCloudinary(file.buffer, 'interviewiq/resumes');
    } catch (error) {
      logger.error(`Cloudinary resume upload error for user ${userId}: ${error.message}`);
      throw ApiError.internal('Failed to upload resume file to storage service. Please try again.');
    }

    if (!uploadResult || !uploadResult.secure_url || !uploadResult.public_id) {
      throw ApiError.internal('Invalid response payload received from cloud storage provider.');
    }

    // Step 4: Prepare data and persist new Resume document via Repository
    const resumeData = {
      user: userId,
      originalName: file.originalname,
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      fileSize: file.size,
      mimeType: file.mimetype,
      isActive: true,
      uploadedAt: new Date(),
    };

    const newResume = await resumeRepository.createResume(resumeData);

    if (!newResume) {
      throw ApiError.internal('Failed to record resume in database.');
    }

    // Step 5: Synchronize candidate Profile document if it exists
    try {
      await Profile.findOneAndUpdate(
        { user: userId },
        {
          $set: {
            'resume.resumeUrl': newResume.url,
            'resume.cloudinaryPublicId': newResume.publicId,
            'resume.originalFileName': newResume.originalName,
            'resume.fileSize': newResume.fileSize,
            'resume.uploadedAt': newResume.uploadedAt,
            'resume.url': newResume.url,
            'resume.publicId': newResume.publicId,
            'resume.uploadedDate': newResume.uploadedAt,
          },
        }
      );
    } catch (profileError) {
      logger.warn(
        `Profile sync failed after resume upload for user ${userId}: ${profileError.message}`
      );
    }

    logger.info(`Successfully created active resume ${newResume._id} for user ${userId}`);
    return newResume;
  }

  /**
   * Retrieve the currently active resume document for a user.
   * Business Logic:
   * 1. Queries repository for active resume matching userId.
   * 2. Throws standardized ApiError.notFound if no active resume exists.
   *
   * @param {string} userId - MongoDB ObjectId of the user
   * @returns {Promise<object>} Active Resume document
   */
  async getActiveResumeByUser(userId) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to fetch active resume');
    }

    const resume = await resumeRepository.getResumeByUser(userId);

    if (!resume) {
      throw ApiError.notFound('No active resume found for this user. Please upload a resume.');
    }

    return resume;
  }

  /**
   * Retrieve a specific resume by ID with ownership verification.
   * Business Logic:
   * 1. Fetches resume by ID via Repository.
   * 2. Throws ApiError.notFound if resume document does not exist.
   * 3. Verifies that request userId matches resume.user ownership.
   * 4. Throws ApiError.forbidden if user attempts unauthorized access.
   *
   * @param {string} userId - Requesting user's ID
   * @param {string} resumeId - Target Resume ID
   * @returns {Promise<object>} Resume document
   */
  async getResumeById(userId, resumeId) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required');
    }
    if (!resumeId) {
      throw ApiError.badRequest('Resume ID is required');
    }

    const resume = await resumeRepository.getResumeById(resumeId);

    if (!resume) {
      throw ApiError.notFound('Resume not found');
    }

    // Security Check: Enforce user ownership
    if (resume.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('You do not have permission to access this resume');
    }

    return resume;
  }

  /**
   * Delete a user's resume (active or specific ID) from Cloudinary storage and database.
   * Business Logic:
   * 1. Locates target resume by resumeId or active status for user.
   * 2. Verifies ownership and existence.
   * 3. Destroys asset on Cloudinary storage.
   * 4. Deletes document record from MongoDB via Repository.
   * 5. Clears resume reference in candidate Profile document if it was active.
   *
   * @param {string} userId - Authenticated user ID
   * @param {string} [resumeId] - Optional specific Resume ID to delete
   * @returns {Promise<{ message: string, deletedResumeId: string }>} Result summary object
   */
  async deleteResume(userId, resumeId = null) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required');
    }

    let targetResume;
    if (resumeId) {
      targetResume = await resumeRepository.getResumeById(resumeId);
    } else {
      targetResume = await resumeRepository.getResumeByUser(userId);
    }

    if (!targetResume) {
      throw ApiError.notFound('Resume document not found for deletion');
    }

    // Security Check: Enforce user ownership
    if (targetResume.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('You do not have permission to delete this resume');
    }

    const deletedId = targetResume._id;

    // Step 1: Delete raw file from Cloudinary storage
    if (targetResume.publicId) {
      await deleteRawFromCloudinary(targetResume.publicId);
    }

    // Step 2: Delete document from MongoDB
    await resumeRepository.deleteResume(deletedId);

    // Step 3: If deleted resume was active, clear Profile resume object
    if (targetResume.isActive) {
      try {
        await Profile.findOneAndUpdate(
          { user: userId },
          {
            $set: {
              resume: {
                resumeUrl: '',
                cloudinaryPublicId: '',
                originalFileName: '',
                fileSize: 0,
                uploadedAt: null,
                url: '',
                publicId: '',
                uploadedDate: null,
              },
            },
          }
        );
      } catch (profileError) {
        logger.warn(`Failed to clear Profile resume field for user ${userId}: ${profileError.message}`);
      }
    }

    logger.info(`Successfully deleted resume ${deletedId} for user ${userId}`);
    return {
      message: 'Resume deleted successfully from storage and database',
      deletedResumeId: deletedId,
    };
  }

  /**
   * Retrieve all uploaded resumes (active and historical) belonging to a user.
   * Business Logic:
   * 1. Fetches all resumes sorted by recency via Repository.
   * 2. Returns list of resume objects.
   *
   * @param {string} userId - Authenticated user ID
   * @returns {Promise<Array<object>>} List of historical and active resumes
   */
  async getResumeHistory(userId) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required');
    }

    const resumes = await resumeRepository.getAllResumesByUser(userId);
    return resumes;
  }
}

export default new ResumeService();
export { ResumeService };
