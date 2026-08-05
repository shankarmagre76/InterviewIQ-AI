import ResumeAnalysis from './resumeAnalysis.model.js';

/**
 * Resume Analysis Repository Layer
 * Handles pure MongoDB / Mongoose database operations for ResumeAnalysis entity.
 * Contains ZERO business logic.
 */
class ResumeAnalysisRepository {
  /**
   * Create a new ResumeAnalysis record in MongoDB.
   *
   * @param {object} analysisData - Data object containing analysis fields (user, resume, atsScore, summary, etc.)
   * @param {import('mongoose').ClientSession} [session] - Optional Mongoose transaction session
   * @returns {Promise<import('./resumeAnalysis.model.js').default>} Created ResumeAnalysis Mongoose document
   */
  async createAnalysis(analysisData, session = null) {
    const options = session ? { session } : {};
    if (session) {
      const [newAnalysis] = await ResumeAnalysis.create([analysisData], options);
      return newAnalysis;
    }
    return await ResumeAnalysis.create(analysisData);
  }

  /**
   * Find the most recent / latest active analysis document for a user.
   *
   * @param {string|import('mongoose').Types.ObjectId} userId - User ID
   * @returns {Promise<import('./resumeAnalysis.model.js').default|null>} Latest ResumeAnalysis document
   */
  async getLatestAnalysis(userId) {
    return await ResumeAnalysis.findOne({ user: userId, isLatest: true }).sort({ createdAt: -1 });
  }

  /**
   * Retrieve all analysis history records belonging to a user ordered by creation recency.
   *
   * @param {string|import('mongoose').Types.ObjectId} userId - User ID
   * @returns {Promise<Array<import('./resumeAnalysis.model.js').default>>} List of historical ResumeAnalysis documents
   */
  async getAnalysisHistory(userId) {
    return await ResumeAnalysis.find({ user: userId }).sort({ createdAt: -1 });
  }

  /**
   * Delete a ResumeAnalysis document by its primary MongoDB ObjectId.
   *
   * @param {string|import('mongoose').Types.ObjectId} id - Analysis document ID
   * @param {import('mongoose').ClientSession} [session] - Optional transaction session
   * @returns {Promise<import('./resumeAnalysis.model.js').default|null>} Deleted ResumeAnalysis document
   */
  async deleteAnalysis(id, session = null) {
    const options = session ? { session } : {};
    return await ResumeAnalysis.findByIdAndDelete(id, options);
  }

  /**
   * Find all analysis records associated with a specific Resume document ID.
   *
   * @param {string|import('mongoose').Types.ObjectId} resumeId - Resume ID
   * @returns {Promise<Array<import('./resumeAnalysis.model.js').default>>} List of ResumeAnalysis documents
   */
  async findByResume(resumeId) {
    return await ResumeAnalysis.find({ resume: resumeId }).sort({ createdAt: -1 });
  }

  /**
   * Find a single ResumeAnalysis document by its ID.
   *
   * @param {string|import('mongoose').Types.ObjectId} id - Analysis ID
   * @returns {Promise<import('./resumeAnalysis.model.js').default|null>} ResumeAnalysis document
   */
  async getAnalysisById(id) {
    return await ResumeAnalysis.findById(id);
  }

  /**
   * Bulk update isLatest status for all analysis documents belonging to a user.
   *
   * @param {string|import('mongoose').Types.ObjectId} userId - User ID
   * @param {boolean} isLatest - Target status flag
   * @param {import('mongoose').ClientSession} [session] - Optional transaction session
   * @returns {Promise<object>} MongoDB write result object
   */
  async updateManyStatusByUser(userId, isLatest, session = null) {
    const options = session ? { session } : {};
    return await ResumeAnalysis.updateMany({ user: userId }, { $set: { isLatest } }, options);
  }
}

export default new ResumeAnalysisRepository();
export { ResumeAnalysisRepository };
