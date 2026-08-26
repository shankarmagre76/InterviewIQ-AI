import { GoogleGenAI } from '@google/genai';
import Profile from '../profile/profile.model.js';
import Resume from '../resume/resume.model.js';
import ResumeAnalysis from '../resume/resumeAnalysis.model.js';
import {
  buildQuestionGenerationPrompt,
  QUESTION_GENERATION_PROMPT_VERSION,
} from './questionGeneration.prompt.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * AI Interview Service
 * Responsible for retrieving candidate profile/resume context and generating structured, AI-driven
 * interview questions via Google Gemini API with built-in retries, rate limiting, and fallback handling.
 */
class AiInterviewService {
  constructor() {
    this.defaultModel = 'gemini-2.5-flash';
    this.maxRetries = 3;
  }

  /**
   * Helper utility for asynchronous sleep delay used during exponential backoff retries
   * @param {number} ms - Delay in milliseconds
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Initialize and return GoogleGenAI SDK client instance using environment variable keys.
   * @returns {GoogleGenAI|null} Configured SDK client instance or null if unconfigured
   */
  getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key' || apiKey === 'demo_api_key') {
      logger.warn(
        'Gemini API key missing or unconfigured. Question generation will use fallback simulated questions.'
      );
      return null;
    }
    return new GoogleGenAI({ apiKey });
  }

  /**
   * Reads candidate profile and active resume analysis from MongoDB to construct full context.
   *
   * @param {string} userId - Mongoose User ID
   * @returns {Promise<{ skills: string[], experience: string, resumeText: string }>} Extracted context payload
   */
  async fetchCandidateContext(userId) {
    try {
      let skills = [];
      let experience = 'Mid-Level';
      let resumeText = '';

      // 1. Read User Profile if available
      if (userId) {
        const profile = await Profile.findOne({ user: userId }).lean();
        if (profile) {
          if (Array.isArray(profile.skills) && profile.skills.length > 0) {
            skills = profile.skills.map((s) => (typeof s === 'string' ? s : s.name));
          }
          if (Array.isArray(profile.experience) && profile.experience.length > 0) {
            const totalExpYears = profile.experience.reduce((acc, exp) => {
              const start = exp.startDate ? new Date(exp.startDate) : new Date();
              const end = exp.current || !exp.endDate ? new Date() : new Date(exp.endDate);
              const years = Math.max(0, (end - start) / (1000 * 60 * 60 * 24 * 365.25));
              return acc + years;
            }, 0);
            experience = `${Math.round(totalExpYears * 10) / 10} years (${profile.experience[0]?.position || 'Software Engineer'})`;
          }
        }

        // 2. Read Active Resume Analysis or Resume Record if available
        const latestAnalysis = await ResumeAnalysis.findOne({ user: userId, isLatest: true })
          .sort({ createdAt: -1 })
          .lean();

        if (latestAnalysis && latestAnalysis.summary) {
          resumeText = `ATS Score: ${latestAnalysis.atsScore}/100. Summary: ${latestAnalysis.summary}. Key Strengths: ${(latestAnalysis.strengths || []).join(', ')}.`;
        } else {
          const activeResume = await Resume.findOne({ user: userId, isActive: true }).lean();
          if (activeResume && activeResume.extractedText) {
            resumeText = activeResume.extractedText.slice(0, 3000);
          }
        }
      }

      return { skills, experience, resumeText };
    } catch (error) {
      logger.error(`Error fetching candidate context for userId ${userId}: ${error.message}`);
      return { skills: [], experience: 'Mid-Level', resumeText: '' };
    }
  }

  /**
   * Safely parse raw AI output into valid JSON, stripping code block wrappers (```json ... ```).
   *
   * @param {string} rawText - Raw response text from Gemini
   * @returns {object} Parsed JSON object
   */
  parseAndCleanJsonResponse(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      throw new Error('Empty raw text response received from AI service.');
    }

    let cleaned = rawText.trim();

    // Strip markdown code fences if present
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
    }

    try {
      return JSON.parse(cleaned);
    } catch (parseErr) {
      logger.error(`JSON Parse Error on raw AI response: ${parseErr.message}`);
      throw new Error(`Failed to parse structured JSON from AI output: ${parseErr.message}`);
    }
  }

  /**
   * Execute content generation with exponential backoff retries for transient errors & rate limits (429/503).
   *
   * @param {string} prompt - Engineered prompt text
   * @param {string} modelName - Model name identifier
   * @param {number} [maxRetries=3] - Maximum retry attempts
   * @returns {Promise<string>} Raw text output from Gemini
   */
  async generateWithRetry(prompt, modelName = this.defaultModel, maxRetries = this.maxRetries) {
    const ai = this.getGeminiClient();

    if (!ai) {
      return null;
    }

    let attempt = 0;
    let lastError = null;

    while (attempt < maxRetries) {
      try {
        attempt++;
        logger.info(`Sending Question Generation prompt to Gemini (${modelName}), Attempt ${attempt}/${maxRetries}...`);

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.4, // Balanced creativity and precision for interview questions
          },
        });

        if (!response || !response.text) {
          throw new Error('Gemini API returned an empty text response.');
        }

        return response.text;
      } catch (error) {
        lastError = error;
        const errorMessage = error.message || '';
        const isRateLimit =
          errorMessage.includes('429') ||
          errorMessage.toLowerCase().includes('quota') ||
          errorMessage.toLowerCase().includes('rate');
        const isTransientServerErr =
          errorMessage.includes('503') ||
          errorMessage.includes('500') ||
          errorMessage.toLowerCase().includes('overloaded');

        if ((isRateLimit || isTransientServerErr) && attempt < maxRetries) {
          const backoffDelay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
          logger.warn(
            `Gemini API transient error (${error.message}). Retrying in ${backoffDelay / 1000}s (Attempt ${attempt}/${maxRetries})...`
          );
          await this.sleep(backoffDelay);
        } else {
          logger.error(`Gemini API non-retryable failure on attempt ${attempt}: ${error.message}`);
          break;
        }
      }
    }

    logger.error(`Gemini API exhausted ${attempt} attempts: ${lastError?.message}`);
    return null;
  }

  /**
   * Main Service Entry Point: Generates structured interview questions for a session.
   *
   * @param {object} config - Interview session configuration
   * @param {string} [config.userId] - Candidate User ID
   * @param {string} [config.role='Software Engineer'] - Target Job Role
   * @param {string} [config.companyName='General Industry Standard'] - Target Company
   * @param {string} [config.interviewType='Technical'] - Interview Type (Technical, HR, Behavioral, Mixed)
   * @param {string} [config.difficulty='Intermediate'] - Difficulty (Beginner, Intermediate, Advanced)
   * @param {number} [config.totalQuestions=5] - Number of questions to generate
   * @returns {Promise<Array<{ sequenceNumber: number, question: string, expectedAnswer: string, category: string, difficulty: string, focusArea: string }>>} Array of generated question objects
   */
  async generateInterviewQuestions(config = {}) {
    const {
      userId,
      role = 'Software Engineer',
      companyName = 'General Industry Standard',
      interviewType = 'Technical',
      difficulty = 'Intermediate',
      totalQuestions = 5,
    } = config;

    // 1. Fetch Candidate Context (Profile & Resume)
    const { skills, experience, resumeText } = await this.fetchCandidateContext(userId);

    // 2. Build engineered prompt template
    const prompt = buildQuestionGenerationPrompt({
      resumeText,
      skills,
      experience,
      selectedRole: role,
      selectedCompany: companyName,
      difficulty,
      interviewType,
      totalQuestions,
    });

    // 3. Call Gemini API with retries and rate limit handling
    let rawOutput = await this.generateWithRetry(prompt);
    let parsedData = null;

    if (rawOutput) {
      try {
        parsedData = this.parseAndCleanJsonResponse(rawOutput);
      } catch (err) {
        logger.warn(`Initial JSON parsing failed. Retrying AI generation once...`);
        rawOutput = await this.generateWithRetry(prompt, this.defaultModel, 1);
        if (rawOutput) {
          try {
            parsedData = this.parseAndCleanJsonResponse(rawOutput);
          } catch (retryErr) {
            logger.error(`Retry JSON parsing also failed: ${retryErr.message}`);
          }
        }
      }
    }

    // 4. Validate output schema & apply fallback if needed
    if (parsedData && Array.isArray(parsedData.questions) && parsedData.questions.length > 0) {
      return parsedData.questions.map((q, index) => ({
        sequenceNumber: q.sequenceNumber || index + 1,
        question: q.question || `Explain core concepts of ${role}.`,
        expectedAnswer: q.expectedAnswer || 'A top candidate should cover core principles and practical examples.',
        category: q.category || interviewType,
        difficulty: q.difficulty || difficulty,
        focusArea: q.focusArea || role,
      }));
    }

    // 5. Fallback Mock Generator for missing keys / API failure / offline dev
    logger.info(`Using deterministic fallback question generator for role "${role}" (${interviewType}, ${difficulty}).`);
    return this.generateMockQuestionsFallback({
      role,
      companyName,
      interviewType,
      difficulty,
      totalQuestions,
    });
  }

  /**
   * Deterministic fallback mock question generator when API is offline or key is missing.
   *
   * @param {object} params
   * @returns {Array<object>} Mock interview questions
   */
  generateMockQuestionsFallback({ role, companyName, interviewType, difficulty, totalQuestions }) {
    const templates = [
      {
        question: `What are the core architectural principles you consider when designing scalable applications for ${role} positions?`,
        expectedAnswer: `Candidate should mention modularity, single responsibility, caching strategies, database optimization, error boundary handling, and asynchronous event-driven design.`,
        focusArea: 'System Architecture & Design',
      },
      {
        question: `How do you handle asynchronous operations, race conditions, and error recovery in production ${role} workflows?`,
        expectedAnswer: `Candidate should explain promises, async/await, error handling middleware, idempotency keys, retry queues, and graceful shutdown patterns.`,
        focusArea: 'Asynchronous Programming & Resilience',
      },
      {
        question: `Describe a challenging technical problem you solved while working at your previous company. What trade-offs did you evaluate?`,
        expectedAnswer: `Candidate should use the STAR method (Situation, Task, Action, Result) highlighting problem analysis, performance benchmarking, and team collaboration.`,
        focusArea: 'Problem Solving & Trade-off Analysis',
      },
      {
        question: `How do you optimize database query performance and indexes when dealing with high-throughput traffic at ${companyName}?`,
        expectedAnswer: `Candidate should explain query execution plans (EXPLAIN), compound indexes, query pagination, database caching (Redis), and connection pooling.`,
        focusArea: 'Database Performance & Optimization',
      },
      {
        question: `Tell me about a time when you had a disagreement with a team member or stakeholder regarding a technical decision. How was it resolved?`,
        expectedAnswer: `Candidate should demonstrate emotional intelligence, active listening, data-driven compromise, technical prototyping, and alignment on project goals.`,
        focusArea: 'Behavioral & Leadership',
      },
    ];

    const questions = [];
    for (let i = 0; i < totalQuestions; i++) {
      const template = templates[i % templates.length];
      questions.push({
        sequenceNumber: i + 1,
        question: template.question,
        expectedAnswer: template.expectedAnswer,
        category: interviewType === 'Mixed' ? (i % 2 === 0 ? 'Technical' : 'Behavioral') : interviewType,
        difficulty,
        focusArea: template.focusArea,
      });
    }

    return questions;
  }
}

export default new AiInterviewService();
export { AiInterviewService };
