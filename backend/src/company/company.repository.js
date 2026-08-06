import Company from './company.model.js';

/**
 * Company Repository Layer
 * Handles pure MongoDB / Mongoose database operations for Company entity.
 * Contains ZERO business logic.
 */
class CompanyRepository {
  /**
   * Create a new company document in MongoDB.
   * @param {object} companyData - Object containing company schema fields
   * @param {import('mongoose').ClientSession} [session=null] - Optional Mongoose transaction session
   * @returns {Promise<import('./company.model.js').default>} Created Company document
   */
  async createCompany(companyData, session = null) {
    const options = session ? { session } : {};
    if (session) {
      const [newCompany] = await Company.create([companyData], options);
      return newCompany;
    }
    return await Company.create(companyData);
  }

  /**
   * Retrieve a company document by its MongoDB ObjectId.
   * @param {string|import('mongoose').Types.ObjectId} id - Company ObjectId
   * @param {string} [populateFields='createdBy'] - Fields to populate
   * @returns {Promise<import('./company.model.js').default|null>} Company document or null
   */
  async getCompany(id, populateFields = 'createdBy') {
    let query = Company.findById(id);
    if (populateFields) {
      query = query.populate(populateFields, 'firstName lastName email role');
    }
    return await query.exec();
  }

  /**
   * Find a company document by companyName.
   * @param {string} companyName - Exact company name
   * @returns {Promise<import('./company.model.js').default|null>} Company document or null
   */
  async getCompanyByName(companyName) {
    return await Company.findOne({
      companyName: { $regex: new RegExp(`^${companyName.trim()}$`, 'i') },
    });
  }

  /**
   * Update an existing company document by ID.
   * @param {string|import('mongoose').Types.ObjectId} id - Company ObjectId
   * @param {object} updateData - Fields to update
   * @param {object} [options={ new: true, runValidators: true }] - Query options
   * @returns {Promise<import('./company.model.js').default|null>} Updated Company document
   */
  async updateCompany(
    id,
    updateData,
    options = { new: true, runValidators: true }
  ) {
    return await Company.findByIdAndUpdate(id, updateData, options);
  }

  /**
   * Delete a company document by ID.
   * @param {string|import('mongoose').Types.ObjectId} id - Company ObjectId
   * @param {import('mongoose').ClientSession} [session=null] - Optional transaction session
   * @returns {Promise<import('./company.model.js').default|null>} Deleted Company document
   */
  async deleteCompany(id, session = null) {
    const options = session ? { session } : {};
    return await Company.findByIdAndDelete(id, options);
  }

  /**
   * Retrieve a paginated and filtered list of companies.
   * @param {object} [filter={}] - Filter conditions (industry, hiringStatus, createdBy, search)
   * @param {object} [options={}] - Pagination and sorting options (page, limit, sort)
   * @returns {Promise<{ companies: Array, total: number, page: number, totalPages: number }>}
   */
  async listCompanies(filter = {}, options = {}) {
    const page = Math.max(1, parseInt(options.page || 1, 10));
    const limit = Math.max(1, parseInt(options.limit || 10, 10));
    const skip = (page - 1) * limit;
    const sort = options.sort || { createdAt: -1 };

    const queryFilter = { ...filter };

    // Support text/keyword search across companyName & headquarters
    if (options.search) {
      const searchRegex = new RegExp(options.search.trim(), 'i');
      queryFilter.$or = [
        { companyName: searchRegex },
        { headquarters: searchRegex },
        { industry: searchRegex },
      ];
    }

    const [companies, total] = await Promise.all([
      Company.find(queryFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'firstName lastName email')
        .exec(),
      Company.countDocuments(queryFilter),
    ]);

    return {
      companies,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

export default new CompanyRepository();
export { CompanyRepository };
