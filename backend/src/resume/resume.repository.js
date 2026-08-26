import Resume from './resume.model.js';

/**
 * Resume Repository Layer
 * Handles pure MongoDB / Mongoose database operations for Resume entity.
 * Contains ZERO business logic.
 */
class ResumeRepository {
  /**
   * Create a new resume record in MongoDB.
   * @param {object} resumeData - Data object containing resume fields (user, originalName, publicId, url, fileSize, mimeType, etc.)
   * @param {import('mongoose').ClientSession} [session] - Optional Mongoose transaction session
   * @returns {Promise<import('./resume.model.js').default>} Created Resume Mongoose document
   */
  async createResume(resumeData, session = null) {
    const options = session ? { session } : {};
    if (session) {
      const [newResume] = await Resume.create([resumeData], options);
      return newResume;
    }
    return await Resume.create(resumeData);
  }

  /**
   * Find active resume document belonging to a specific user.
   * @param {string|import('mongoose').Types.ObjectId} userId - MongoDB ObjectId of the user
   * @param {object} [additionalQuery={}] - Optional additional filter criteria
   * @returns {Promise<import('./resume.model.js').default|null>} Resume document or null if not found
   */
  async getResumeByUser(userId, additionalQuery = {}) {
    const query = { user: userId, isActive: true, ...additionalQuery };
    return await Resume.findOne(query);
  }

  /**
   * Find a resume document by its MongoDB ObjectId.
   * @param {string|import('mongoose').Types.ObjectId} id - Resume document ID
   * @returns {Promise<import('./resume.model.js').default|null>} Resume document or null if not found
   */
  async getResumeById(id) {
    return await Resume.findById(id);
  }

  /**
   * Update an existing resume document by its MongoDB ObjectId.
   * @param {string|import('mongoose').Types.ObjectId} id - Resume document ID
   * @param {object} updateData - Object containing fields to update
   * @param {object} [options={ new: true, runValidators: true }] - Mongoose query options
   * @returns {Promise<import('./resume.model.js').default|null>} Updated Resume document
   */
  async updateResume(id, updateData, options = { new: true, runValidators: true }) {
    return await Resume.findByIdAndUpdate(id, updateData, options);
  }

  /**
   * Delete a resume document by its MongoDB ObjectId.
   * @param {string|import('mongoose').Types.ObjectId} id - Resume document ID
   * @param {import('mongoose').ClientSession} [session] - Optional Mongoose transaction session
   * @returns {Promise<import('./resume.model.js').default|null>} Deleted Resume document
   */
  async deleteResume(id, session = null) {
    const options = session ? { session } : {};
    return await Resume.findByIdAndDelete(id, options);
  }

  /**
   * Additional DB Helper: Find all resumes belonging to a user (including historical/inactive resumes).
   * @param {string|import('mongoose').Types.ObjectId} userId - User ID
   * @returns {Promise<Array<import('./resume.model.js').default>>} List of resume documents ordered by creation date descending
   */
  async getAllResumesByUser(userId) {
    return await Resume.find({ user: userId }).sort({ createdAt: -1 });
  }

  /**
   * Additional DB Helper: Bulk update active status for a user's resumes.
   * @param {string|import('mongoose').Types.ObjectId} userId - User ID
   * @param {boolean} isActive - Target active status
   * @param {import('mongoose').ClientSession} [session] - Optional transaction session
   * @returns {Promise<object>} MongoDB update write result
   */
  async updateManyStatusByUser(userId, isActive, session = null) {
    const options = session ? { session } : {};
    return await Resume.updateMany({ user: userId }, { $set: { isActive } }, options);
  }
}

export default new ResumeRepository();
export { ResumeRepository };
