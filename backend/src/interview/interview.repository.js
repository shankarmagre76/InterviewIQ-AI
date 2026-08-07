import Interview from './interview.model.js';

/**
 * Interview Repository Layer
 * Handles pure MongoDB / Mongoose database operations for the Interview entity.
 * Contains ZERO business logic.
 */
class InterviewRepository {
  /**
   * Create a new Interview record in MongoDB.
   *
   * @param {object} interviewData - Data fields for new Interview
   * @param {import('mongoose').ClientSession} [session=null] - Optional Mongoose transaction session
   * @returns {Promise<import('./interview.model.js').default>} Created Interview document
   */
  async createInterview(interviewData, session = null) {
    const options = session ? { session } : {};
    if (session) {
      const [newInterview] = await Interview.create([interviewData], options);
      return newInterview;
    }
    return await Interview.create(interviewData);
  }

  /**
   * Find an Interview document by ID or filter criteria.
   *
   * @param {string|object} idOrQuery - Mongoose ObjectId string or query filter object
   * @param {boolean} [populate=false] - Whether to populate foreign key references (user, company)
   * @returns {Promise<import('./interview.model.js').default|null>} Found Interview document or null
   */
  async findInterview(idOrQuery, populate = false) {
    let query;
    if (typeof idOrQuery === 'string' || idOrQuery instanceof Object && idOrQuery._bsontype === 'ObjectID') {
      query = Interview.findById(idOrQuery);
    } else {
      query = Interview.findOne(idOrQuery);
    }

    if (populate) {
      query = query.populate('user', 'firstName lastName email profileImage').populate('company', 'name logo website');
    }

    return await query;
  }

  /**
   * Find an Interview document specifically by its primary ObjectId.
   *
   * @param {string} id - Interview ObjectId
   * @param {boolean} [populate=false] - Whether to populate foreign key references
   * @returns {Promise<import('./interview.model.js').default|null>} Found Interview document or null
   */
  async findInterviewById(id, populate = false) {
    return await this.findInterview(id, populate);
  }

  /**
   * Update an existing Interview document by ID.
   *
   * @param {string} id - Interview ObjectId
   * @param {object} updateData - Fields to update
   * @param {object} [options={ new: true, runValidators: true }] - Mongoose update options
   * @returns {Promise<import('./interview.model.js').default|null>} Updated Interview document
   */
  async updateInterview(id, updateData, options = { new: true, runValidators: true }) {
    return await Interview.findByIdAndUpdate(id, updateData, options);
  }

  /**
   * Delete an Interview document by ID.
   *
   * @param {string} id - Interview ObjectId
   * @param {import('mongoose').ClientSession} [session=null] - Optional Mongoose transaction session
   * @returns {Promise<import('./interview.model.js').default|null>} Deleted Interview document
   */
  async deleteInterview(id, session = null) {
    const options = session ? { session } : {};
    return await Interview.findByIdAndDelete(id, options);
  }

  /**
   * Retrieve all Interview sessions belonging to a specific candidate user.
   *
   * @param {string} userId - User ObjectId
   * @param {object} [filter={}] - Additional query filter criteria (e.g. { status: 'Completed' })
   * @param {object} [options={ limit: 20, skip: 0, sort: { createdAt: -1 } }] - Query pagination options
   * @returns {Promise<Array<import('./interview.model.js').default>>} Array of Interview documents
   */
  async getInterviewsByUser(userId, filter = {}, options = {}) {
    const query = { user: userId, ...filter };
    const limit = options.limit || 20;
    const skip = options.skip || 0;
    const sort = options.sort || { createdAt: -1 };

    return await Interview.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('company', 'name logo');
  }
}

export default new InterviewRepository();
export { InterviewRepository };
