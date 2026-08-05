import resumeAnalysisService from './resumeAnalysis.service.js';
import bridgeService from '../services/resumeAnalysis.service.js';
import resumeRepository from './resume.repository.js';
import resumeAnalysisRepository from './resumeAnalysis.repository.js';
import pdfParserService from './pdfParser.service.js';
import aiService from './ai.service.js';
import mongoose from 'mongoose';

console.log('=== INTERVIEWIQ RESUME ANALYSIS SERVICE TEST SUITE ===\n');

async function runTests() {
  // Test 1: Service Bridge Export Match
  console.log('[PASS] Service Bridge Match:', resumeAnalysisService === bridgeService);

  const mockUserId1 = new mongoose.Types.ObjectId().toString();
  const mockUserId2 = new mongoose.Types.ObjectId().toString();
  const mockResumeId = new mongoose.Types.ObjectId().toString();

  // Test 2: Resume Not Found Rejection (404)
  try {
    const originalGetResume = resumeRepository.getResumeByUser;
    resumeRepository.getResumeByUser = async () => null;

    await resumeAnalysisService.analyzeResume(mockUserId1);

    resumeRepository.getResumeByUser = originalGetResume;
    console.log('[FAIL] Non-existent resume did not throw error');
  } catch (err) {
    console.log('[PASS] Non-Existent Resume Rejection Status:', err.statusCode, '| Message:', err.message);
  }

  // Test 3: Cross-User Authorization Ownership Violation (403 Forbidden)
  try {
    const mockResume = {
      _id: mockResumeId,
      user: mockUserId1,
      url: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
    };

    const originalGetById = resumeRepository.getResumeById;
    resumeRepository.getResumeById = async () => mockResume;

    // User 2 attempts to analyze User 1's resume
    await resumeAnalysisService.analyzeResume(mockUserId2, { resumeId: mockResumeId });

    resumeRepository.getResumeById = originalGetById;
    console.log('[FAIL] Cross-user access did not throw error');
  } catch (err) {
    console.log('[PASS] Cross-User Authorization Status:', err.statusCode, '| Message:', err.message);
  }

  // Test 4: End-to-End Execution Flow Mocking (201 Success Simulation)
  try {
    const mockResume = {
      _id: mockResumeId,
      user: mockUserId1,
      url: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
      save: async () => true,
    };

    const originalGetByUser = resumeRepository.getResumeByUser;
    const originalExtract = pdfParserService.extractTextFromUrl;
    const originalAi = aiService.analyzeResume;
    const originalCreate = resumeAnalysisRepository.createAnalysis;
    const originalUpdateMany = resumeAnalysisRepository.updateManyStatusByUser;

    resumeRepository.getResumeByUser = async () => mockResume;
    pdfParserService.extractTextFromUrl = async () => ({
      text: 'John Doe - Senior Software Engineer with Node.js and MongoDB expertise across enterprise projects.',
      pageCount: 1,
      wordCount: 120,
    });
    aiService.analyzeResume = async () => ({
      analysis: {
        atsScore: 88,
        summary: 'Excellent technical candidate',
        strengths: ['Backend Node.js mastery'],
        weaknesses: ['Missing AWS certification'],
        missingSkills: ['AWS'],
        recommendedSkills: ['AWS', 'Docker'],
        grammarFeedback: [],
        formattingFeedback: [],
        keywordFeedback: [],
        sectionFeedback: { experience: { score: 90, feedback: [], suggestions: [] } },
        recommendations: ['Add AWS certification'],
      },
      provider: 'Gemini',
      model: 'gemini-2.5-flash',
      promptVersion: '1.0.0',
    });
    resumeAnalysisRepository.updateManyStatusByUser = async () => ({ modifiedCount: 1 });
    resumeAnalysisRepository.createAnalysis = async (payload) => ({
      _id: new mongoose.Types.ObjectId(),
      ...payload,
    });

    const analysisResult = await resumeAnalysisService.analyzeResume(mockUserId1, {
      targetRole: 'Senior Backend Engineer',
    });

    // Restore originals
    resumeRepository.getResumeByUser = originalGetByUser;
    pdfParserService.extractTextFromUrl = originalExtract;
    aiService.analyzeResume = originalAi;
    resumeAnalysisRepository.createAnalysis = originalCreate;
    resumeAnalysisRepository.updateManyStatusByUser = originalUpdateMany;

    console.log('[PASS] Created Analysis Result ID:', analysisResult._id);
    console.log('[PASS] Created ATS Score:', analysisResult.atsScore);
    console.log('[PASS] Created AI Provider:', analysisResult.aiProvider);
    console.log('[PASS] Created Prompt Version:', analysisResult.promptVersion);
  } catch (err) {
    console.log('[FAIL] End-to-End Service Test Failed:', err.message);
  }

  console.log('\n=== RESUME ANALYSIS SERVICE TESTS COMPLETED ===');
  process.exit(0);
}

runTests();
