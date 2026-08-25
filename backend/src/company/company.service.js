import companyRepository from './company.repository.js';
import ApiError from '../utils/ApiError.js';

/**
 * Company Service Layer
 * Contains all business logic, permission checks, and validation rules for Company management.
 */
class CompanyService {
  /**
   * Create a new company with business validations.
   * @param {object} companyData - Company payload
   * @param {object} currentUser - Authenticated user object (req.user)
   * @returns {Promise<object>} Created company document
   */
  async createCompany(companyData, currentUser) {
    // 1. Business Permission Check: User must be Recruiter or Admin
    if (!currentUser || (currentUser.role !== 'Recruiter' && currentUser.role !== 'Admin')) {
      throw ApiError.forbidden('Only Recruiters or Admins can create company profiles');
    }

    // 2. Business Rule Enforcement (1 Recruiter -> 1 Company): Check if recruiter already owns a company
    if (currentUser.role === 'Recruiter') {
      const ownedCompany = await companyRepository.getCompanyByOwner(currentUser._id);
      if (ownedCompany) {
        throw ApiError.conflict('Recruiter already has a company profile');
      }
    }

    // 3. Business Duplicate Check: Ensure company name is unique
    const existingCompany = await companyRepository.getCompanyByName(companyData.companyName);
    if (existingCompany) {
      throw ApiError.badRequest(`Company with name '${companyData.companyName}' already exists`);
    }

    // 4. Attach current user as owner/creator
    const payload = {
      ...companyData,
      createdBy: currentUser._id,
    };

    return await companyRepository.createCompany(payload);
  }

  /**
   * Get company profile owned by a specific user/recruiter.
   * @param {string} userId - Recruiter User ObjectId
   * @returns {Promise<object|null>} Company document or null
   */
  async getCompanyByOwner(userId) {
    return await companyRepository.getCompanyByOwner(userId);
  }

  /**
   * Get details of a company by ID.
   * @param {string} companyId - Company ObjectId
   * @returns {Promise<object>} Company document
   */
  async getCompany(companyId) {
    const company = await companyRepository.getCompany(companyId);
    if (!company) {
      throw ApiError.notFound('Company profile not found');
    }
    return company;
  }

  /**
   * Update company details with ownership authorization & duplicate checks.
   * @param {string} companyId - Company ObjectId
   * @param {object} updateData - Fields to update
   * @param {object} currentUser - Authenticated user object
   * @returns {Promise<object>} Updated company document
   */
  async updateCompany(companyId, updateData, currentUser) {
    const existingCompany = await companyRepository.getCompany(companyId, '');
    if (!existingCompany) {
      throw ApiError.notFound('Company profile not found');
    }

    // Authorization: User must be creator of company or Admin
    const isOwner = existingCompany.createdBy.toString() === currentUser._id.toString();
    const isAdmin = currentUser.role === 'Admin';
    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You are not authorized to update this company profile');
    }

    // If companyName is changing, verify new name is not already taken
    if (
      updateData.companyName &&
      updateData.companyName.trim().toLowerCase() !== existingCompany.companyName.toLowerCase()
    ) {
      const nameConflict = await companyRepository.getCompanyByName(updateData.companyName);
      if (nameConflict) {
        throw ApiError.badRequest(`Company name '${updateData.companyName}' is already taken`);
      }
    }

    return await companyRepository.updateCompany(companyId, updateData);
  }

  /**
   * Delete a company profile.
   * @param {string} companyId - Company ObjectId
   * @param {object} currentUser - Authenticated user object
   * @returns {Promise<object>} Deleted company document
   */
  async deleteCompany(companyId, currentUser) {
    const existingCompany = await companyRepository.getCompany(companyId, '');
    if (!existingCompany) {
      throw ApiError.notFound('Company profile not found');
    }

    const isOwner = existingCompany.createdBy.toString() === currentUser._id.toString();
    const isAdmin = currentUser.role === 'Admin';
    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You are not authorized to delete this company profile');
    }

    return await companyRepository.deleteCompany(companyId);
  }

  /**
   * Get paginated list of companies with optional filters and keyword search.
   * @param {object} queryFilter - Filters (industry, hiringStatus, createdBy)
   * @param {object} paginationOptions - Search keyword, page, limit, sort
   * @returns {Promise<object>} Paginated result object
   */
  async listCompanies(queryFilter = {}, paginationOptions = {}) {
    return await companyRepository.listCompanies(queryFilter, paginationOptions);
  }
}

export default new CompanyService();
export { CompanyService };
