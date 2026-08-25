import Company from './company.model.js';
import { createSafeRegex, escapeRegex } from '../utils/regex.util.js';

/**
 * Company Repository Layer
 * Handles pure MongoDB / Mongoose database operations for Company entity.
 * Contains ZERO business logic.
 */
class CompanyRepository {
  /**
   * Create a new company document in MongoDB.
   * @param {object} companyData - Object containing company schema fields
   * @param {import('mongoose').ClientSession} [session=null] - Optional transaction session
   * @returns {Promise<import('./company.model.js').default>} Created Company document
   */
  async createCompany(companyData, session = null) {
    if (session) {
      const [newCompany] = await Company.create([companyData], { session });
      return newCompany;
    }
    return await Company.create(companyData);
  }

  /**
   * Find a company document by ID with optional populated user/job details.
   * @param {string} id - Company ObjectId
   * @param {string} [populateFields='createdBy'] - Fields to populate
   * @returns {Promise<import('./company.model.js').default|null>} Company document or null
   */
  async getCompanyById(id, populateFields = 'createdBy') {
    const query = Company.findById(id);
    if (populateFields) {
      query.populate(populateFields, 'firstName lastName email role');
    }
    return await query.exec();
  }

  /**
   * Alias method for getCompanyById for consistency.
   */
  async getCompany(id, populateFields = 'createdBy') {
    return await this.getCompanyById(id, populateFields);
  }

  /**
   * Find a company document owned/created by a recruiter user ID.
   * @param {string|import('mongoose').Types.ObjectId} createdBy - User ObjectId
   * @param {string} [populateFields='createdBy'] - Fields to populate
   * @returns {Promise<import('./company.model.js').default|null>} Company document or null
   */
  async getCompanyByOwner(createdBy, populateFields = 'createdBy') {
    const query = Company.findOne({ createdBy });
    if (populateFields) {
      query.populate(populateFields, 'firstName lastName email role');
    }
    return await query.exec();
  }

  /**
   * Find a company document by companyName safely escaping regex special characters.
   * @param {string} companyName - Exact company name
   * @returns {Promise<import('./company.model.js').default|null>} Company document or null
   */
  async getCompanyByName(companyName) {
    if (!companyName || typeof companyName !== 'string') return null;
    const escapedName = escapeRegex(companyName.trim());
    return await Company.findOne({
      companyName: { $regex: new RegExp(`^${escapedName}$`, 'i') },
    });
  }

  /**
   * Update an existing company document by ID.
   * @param {string} id - Company ObjectId
   * @param {object} updateData - Object containing fields to update
   * @param {object} [options={ new: true, runValidators: true }] - Mongoose update options
   * @returns {Promise<import('./company.model.js').default|null>} Updated Company document
   */
  async updateCompany(id, updateData, options = { new: true, runValidators: true }) {
    return await Company.findByIdAndUpdate(id, updateData, options);
  }

  /**
   * Hard-delete a company document by ID.
   * @param {string} id - Company ObjectId
   * @returns {Promise<import('./company.model.js').default|null>} Deleted Company document
   */
  async deleteCompany(id) {
    return await Company.findByIdAndDelete(id);
  }

  /**
   * Fetch paginated companies matching query filters.
   * @param {object} filter - Query filter object (e.g. { isActive: true, industry: 'Tech' })
   * @param {object} options - Pagination, sorting, and search options
   * @returns {Promise<[Array<import('./company.model.js').default>, number]>} Tuple of [companiesArray, totalCount]
   */
  async getCompanies(filter = {}, options = {}) {
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.max(1, parseInt(options.limit, 10) || 10);
    const skip = (page - 1) * limit;
    const sort = options.sort || { createdAt: -1 };

    const queryFilter = { ...filter };

    // Support text/keyword search across companyName & headquarters
    if (options.search) {
      const searchRegex = createSafeRegex(options.search);
      if (searchRegex) {
        queryFilter.$or = [
          { companyName: searchRegex },
          { headquarters: searchRegex },
          { industry: searchRegex },
        ];
      }
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

    return [companies, total];
  }

  /**
   * Alias / helper method for listCompanies returning pagination metadata object.
   */
  async listCompanies(filter = {}, options = {}) {
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.max(1, parseInt(options.limit, 10) || 10);
    const [companies, total] = await this.getCompanies(filter, options);
    const totalPages = Math.ceil(total / limit) || 1;
    return { companies, total, page, totalPages };
  }
}

export default new CompanyRepository();
