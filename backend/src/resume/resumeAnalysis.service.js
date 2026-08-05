import resumeAnalysisRepository from './resumeAnalysis.repository.js';
import resumeRepository from './resume.repository.js';
import pdfParserService from './pdfParser.service.js';
import aiService from './ai.service.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Resume Analysis Service Layer
 * Encapsulates complete business logic for orchestrating PDF text extraction, AI evaluation,
 * re-analysis history tracking, user authorization security, and database persistence.
 */
class ResumeAnalysisService {
  /**
   * Conduct an AI Resume Analysis for a candidate's uploaded resume document.
   * Business Logic Workflow:
   * 1. Check if target resume exists in DB and verify user ownership.
   * 2. Extract and normalize PDF text using PdfParserService. Rejects empty/scanned PDFs.
   * 3. Send text payload and prompt options to AiService (Google Gemini / OpenAI).
   * 4. Receive and validate structured JSON evaluation.
   * 5. Deactivate previous active analysis reports for this user (set isLatest: false).
   * 6. Save every analysis execution in MongoDB via ResumeAnalysisRepository (re-analysis support).
   * 7. Return formatted ResumeAnalysis document.
   *
   * @param {string} userId - Authenticated User ID
   * @param {object} [options={}] - Analysis options
   * @param {string} [options.resumeId] - Optional specific Resume ID (defaults to active resume)
   * @param {string} [options.targetRole='Software Engineer'] - Target job role
   * @param {string} [options.experienceLevel='Mid-Level'] - Target experience level
   * @param {string} [options.provider='Gemini'] - Target AI Provider choice ('Gemini', 'OpenAI', etc.)
   * @returns {Promise<import('./resumeAnalysis.model.js').default>} Persisted ResumeAnalysis document
   */
  async analyzeResume(userId, options = {}) {
    if (!userId) {
      throw ApiError.unauthorized('User authentication is required to analyze a resume');
    }

    // Step 1: Get target resume document and verify ownership
    let targetResume;
    if (options.resumeId) {
      targetResume = await resumeRepository.getResumeById(options.resumeId);
    } else {
      targetResume = await resumeRepository.getResumeByUser(userId);
    }

    if (!targetResume) {
      throw ApiError.notFound(
        'No active resume document found for analysis. Please upload a PDF resume first.'
      );
    }

    // Security Check: Enforce user ownership
    if (targetResume.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('You do not have permission to analyze this resume.');
    }

    logger.info(`Initiating AI Resume Analysis for user ${userId} on resume ${targetResume._id}`);

    // Step 2: Extract PDF text content from Cloudinary URL or file buffer
    let extractionResult;
    try {
      if (targetResume.url) {
        extractionResult = await pdfParserService.extractTextFromUrl(targetResume.url);
      } else {
        throw ApiError.badRequest('Resume document is missing file storage URL.');
      }
    } catch (extractionError) {
      logger.error(
        `PDF text extraction failed for resume ${targetResume._id}: ${extractionError.message}`
      );
      throw extractionError; // Pass-through ApiError (scanned PDF / unreadable PDF)
    }

    if (!extractionResult || !extractionResult.text) {
      throw ApiError.badRequest(
        'Scanned image or unreadable PDF detected. No extractable text found. Please upload a text-based PDF.'
      );
    }

    // Step 3: Invoke AI Service (Google Gemini) with engineered prompt
    let aiResponse;
    try {
      aiResponse = await aiService.analyzeResume(extractionResult.text, {
        provider: options.provider || 'Gemini',
        targetRole: options.targetRole || 'Software Engineer / Technical Professional',
        experienceLevel: options.experienceLevel || 'Mid-Level',
      });
    } catch (aiError) {
      logger.error(`AI analysis call failed for user ${userId}: ${aiError.message}`);
      throw aiError;
    }

    const { analysis, provider, model, promptVersion } = aiResponse;

    // Step 4: Deactivate previous analysis reports to maintain single latest active report
    await resumeAnalysisRepository.updateManyStatusByUser(userId, false);

    // Step 5: Save EVERY analysis document in MongoDB (re-analysis history support)
    const analysisPayload = {
      user: userId,
      resume: targetResume._id,
      atsScore: analysis.atsScore,
      summary: analysis.summary,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      missingSkills: analysis.missingSkills,
      recommendedSkills: analysis.recommendedSkills,
      grammarFeedback: analysis.grammarFeedback,
      formattingFeedback: analysis.formattingFeedback,
      keywordFeedback: analysis.keywordFeedback,
      sectionFeedback: analysis.sectionFeedback,
      recommendations: analysis.recommendations,
      aiProvider: provider,
      aiModel: model,
      promptVersion: promptVersion,
      isLatest: true,
      analyzedAt: new Date(),
    };

    const savedAnalysis = await resumeAnalysisRepository.createAnalysis(analysisPayload);

    if (!savedAnalysis) {
      throw ApiError.internal('Failed to persist resume analysis report in database.');
    }

    // Step 6: Update Resume document state to 'completed'
    try {
      targetResume.parsingStatus = 'completed';
      targetResume.aiAnalysis = {
        overallScore: savedAnalysis.atsScore,
        atsScore: savedAnalysis.atsScore,
        summary: savedAnalysis.summary,
        skillsExtracted: savedAnalysis.recommendedSkills,
        strengths: savedAnalysis.strengths,
        improvements: savedAnalysis.recommendations,
        suggestedRoles: [options.targetRole || 'Software Engineer'],
        analyzedAt: savedAnalysis.analyzedAt,
      };
      await targetResume.save();
    } catch (resumeSyncErr) {
      logger.warn(
        `Failed to update parent Resume parsing state for resume ${targetResume._id}: ${resumeSyncErr.message}`
      );
    }

    logger.info(`Successfully completed AI Resume Analysis (${savedAnalysis._id}) for user ${userId}`);
    return savedAnalysis;
  }

  /**
   * Retrieve candidate's latest active resume analysis report.
   *
   * @param {string} userId - Authenticated User ID
   * @returns {Promise<import('./resumeAnalysis.model.js').default>} Latest ResumeAnalysis document
   */
  async getLatestAnalysis(userId) {
    if (!userId) {
      throw ApiError.unauthorized('User authentication is required to fetch analysis report.');
    }

    const analysis = await resumeAnalysisRepository.getLatestAnalysis(userId);

    if (!analysis) {
      throw ApiError.notFound('No resume analysis report found for this user. Please analyze a resume first.');
    }

    return analysis;
  }

  /**
   * Retrieve a specific analysis report by ID with user ownership check.
   *
   * @param {string} userId - Authenticated User ID
   * @param {string} analysisId - Target ResumeAnalysis ID
   * @returns {Promise<import('./resumeAnalysis.model.js').default>} ResumeAnalysis document
   */
  async getAnalysisById(userId, analysisId) {
    if (!userId) {
      throw ApiError.unauthorized('User authentication is required');
    }
    if (!analysisId) {
      throw ApiError.badRequest('Analysis ID parameter is required');
    }

    const analysis = await resumeAnalysisRepository.getAnalysisById(analysisId);

    if (!analysis) {
      throw ApiError.notFound('Resume analysis report not found.');
    }

    // Security Check: Enforce user ownership
    if (analysis.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('You do not have permission to access this analysis report.');
    }

    return analysis;
  }

  /**
   * Retrieve all historical resume analysis reports for a candidate.
   *
   * @param {string} userId - Authenticated User ID
   * @returns {Promise<Array<import('./resumeAnalysis.model.js').default>>} List of ResumeAnalysis documents
   */
  async getAnalysisHistory(userId) {
    if (!userId) {
      throw ApiError.unauthorized('User authentication is required');
    }

    const history = await resumeAnalysisRepository.getAnalysisHistory(userId);
    return history;
  }

  /**
   * Delete an analysis report by ID with ownership verification.
   *
   * @param {string} userId - Authenticated User ID
   * @param {string} analysisId - Target ResumeAnalysis ID
   * @returns {Promise<{ message: string, deletedId: string }>} Deletion result
   */
  async deleteAnalysis(userId, analysisId) {
    if (!userId) {
      throw ApiError.unauthorized('User authentication is required');
    }
    if (!analysisId) {
      throw ApiError.badRequest('Analysis ID parameter is required');
    }

    const targetAnalysis = await resumeAnalysisRepository.getAnalysisById(analysisId);

    if (!targetAnalysis) {
      throw ApiError.notFound('Resume analysis report not found for deletion.');
    }

    // Security Check: Enforce user ownership
    if (targetAnalysis.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('You do not have permission to delete this analysis report.');
    }

    const deletedId = targetAnalysis._id;
    await resumeAnalysisRepository.deleteAnalysis(deletedId);

    logger.info(`Successfully deleted resume analysis report ${deletedId} for user ${userId}`);
    return {
      message: 'Resume analysis report deleted successfully from database',
      deletedId,
    };
  }
}

export default new ResumeAnalysisService();
export { ResumeAnalysisService };
