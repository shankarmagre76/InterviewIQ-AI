import InterviewQuestion from './interviewQuestion.model.js';

/**
 * InterviewQuestion Repository Layer
 * Handles pure MongoDB / Mongoose database operations for the InterviewQuestion entity.
 * Contains ZERO business logic.
 */
class InterviewQuestionRepository {
  /**
   * Save a single new InterviewQuestion record to MongoDB.
   *
   * @param {object} questionData - Fields for new InterviewQuestion
   * @param {import('mongoose').ClientSession} [session=null] - Optional transaction session
   * @returns {Promise<import('./interviewQuestion.model.js').default>} Created InterviewQuestion document
   */
  async saveQuestion(questionData, session = null) {
    const options = session ? { session } : {};
    if (session) {
      const [newQuestion] = await InterviewQuestion.create([questionData], options);
      return newQuestion;
    }
    return await InterviewQuestion.create(questionData);
  }

  /**
   * Bulk save multiple InterviewQuestion records in a single database round-trip.
   *
   * @param {Array<object>} questionsArray - Array of question data objects
   * @param {import('mongoose').ClientSession} [session=null] - Optional transaction session
   * @returns {Promise<Array<import('./interviewQuestion.model.js').default>>} Array of created question documents
   */
  async saveManyQuestions(questionsArray, session = null) {
    const options = session ? { session } : {};
    return await InterviewQuestion.insertMany(questionsArray, options);
  }

  /**
   * Save candidate answer, score, and AI feedback payload for a specific question ID.
   *
   * @param {string} questionId - InterviewQuestion ObjectId
   * @param {string} answer - Candidate's text or transcribed answer
   * @param {number} [score=0] - Numerical score (0-100)
   * @param {object} [aiFeedback={}] - Structured AI feedback subdocument payload
   * @returns {Promise<import('./interviewQuestion.model.js').default|null>} Updated InterviewQuestion document
   */
  async saveAnswer(questionId, answer, score = 0, aiFeedback = {}) {
    return await InterviewQuestion.findByIdAndUpdate(
      questionId,
      {
        $set: {
          answer,
          score,
          aiFeedback,
        },
      },
      { new: true, runValidators: true }
    );
  }

  /**
   * Retrieve all questions associated with an interview session sorted by sequenceNumber.
   *
   * @param {string} interviewId - Interview ObjectId
   * @returns {Promise<Array<import('./interviewQuestion.model.js').default>>} List of question documents
   */
  async getQuestions(interviewId) {
    return await InterviewQuestion.find({ interview: interviewId }).sort({ sequenceNumber: 1 });
  }

  /**
   * Find a single question document by its primary ObjectId.
   *
   * @param {string} questionId - InterviewQuestion ObjectId
   * @returns {Promise<import('./interviewQuestion.model.js').default|null>} Question document or null
   */
  async getQuestionById(questionId) {
    return await InterviewQuestion.findById(questionId);
  }

  /**
   * Delete all questions belonging to a specific interview session.
   *
   * @param {string} interviewId - Interview ObjectId
   * @param {import('mongoose').ClientSession} [session=null] - Optional transaction session
   * @returns {Promise<object>} MongoDB write result
   */
  async deleteQuestionsByInterview(interviewId, session = null) {
    const options = session ? { session } : {};
    return await InterviewQuestion.deleteMany({ interview: interviewId }, options);
  }
}

export default new InterviewQuestionRepository();
export { InterviewQuestionRepository };
