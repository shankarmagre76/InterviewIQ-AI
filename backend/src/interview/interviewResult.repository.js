import InterviewResult from './interviewResult.model.js';

/**
 * InterviewResult Repository Layer
 * Handles pure MongoDB / Mongoose database operations for the InterviewResult entity.
 * Contains ZERO business logic.
 */
class InterviewResultRepository {
  /**
   * Save or update (upsert) an InterviewResult record in MongoDB.
   *
   * @param {object} resultData - Result object containing fields (interview, overallScore, technicalScore, communicationScore, hrScore, strengths, weaknesses, recommendations, summary)
   * @param {import('mongoose').ClientSession} [session=null] - Optional transaction session
   * @returns {Promise<import('./interviewResult.model.js').default>} Saved/Upserted InterviewResult document
   */
  async saveResult(resultData, session = null) {
    const options = {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
      ...(session ? { session } : {}),
    };

    if (!resultData.interview) {
      throw new Error('Interview ID is required to save an InterviewResult document');
    }

    return await InterviewResult.findOneAndUpdate(
      { interview: resultData.interview },
      { $set: resultData },
      options
    );
  }

  /**
   * Retrieve the unique InterviewResult evaluation report associated with an interview ID.
   *
   * @param {string} interviewId - Interview ObjectId
   * @returns {Promise<import('./interviewResult.model.js').default|null>} Found InterviewResult document or null
   */
  async getResult(interviewId) {
    return await InterviewResult.findOne({ interview: interviewId }).populate('interview');
  }

  /**
   * Retrieve an InterviewResult document by its primary ObjectId.
   *
   * @param {string} resultId - InterviewResult ObjectId
   * @returns {Promise<import('./interviewResult.model.js').default|null>} Found InterviewResult document or null
   */
  async getResultById(resultId) {
    return await InterviewResult.findById(resultId).populate('interview');
  }

  /**
   * Delete an InterviewResult document by interview ID.
   *
   * @param {string} interviewId - Interview ObjectId
   * @param {import('mongoose').ClientSession} [session=null] - Optional transaction session
   * @returns {Promise<import('./interviewResult.model.js').default|null>} Deleted InterviewResult document or null
   */
  async deleteResultByInterview(interviewId, session = null) {
    const options = session ? { session } : {};
    return await InterviewResult.findOneAndDelete({ interview: interviewId }, options);
  }
}

export default new InterviewResultRepository();
export { InterviewResultRepository };
