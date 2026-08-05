import { GoogleGenAI } from '@google/genai';
import {
  buildResumeAnalysisPrompt,
  RESUME_ANALYSIS_PROMPT_VERSION,
} from '../resume/resumeAnalysis.prompt.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Isolated Google Gemini AI Provider Class
 * Handles direct interactions with the Google Gemini API, including SDK initialization,
 * prompt delivery, rate limit handling, transient error retries, and JSON parsing.
 */
class GeminiProvider {
  constructor() {
    this.name = 'Gemini';
    this.defaultModel = 'gemini-2.5-flash';
  }

  /**
   * Helper utility for asynchronous sleep delay used during exponential backoff retries
   * @param {number} ms - Delay in milliseconds
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Initialize and return the GoogleGenAI SDK client instance using environment variables.
   * @returns {GoogleGenAI} Configured GoogleGenAI instance
   */
  getClient() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key' || apiKey === 'demo_api_key') {
      logger.warn(
        'Gemini API key missing or set to demo credentials. Live Gemini calls will fallback to mock evaluation.'
      );
      return null;
    }
    return new GoogleGenAI({ apiKey });
  }

  /**
   * Execute prompt request against Gemini API with Exponential Backoff Retry Strategy for transient errors (429/503).
   *
   * @param {string} prompt - Prompt string
   * @param {string} modelName - Target model name
   * @param {number} [maxRetries=3] - Maximum retry attempts
   * @returns {Promise<string>} Raw text output from Gemini
   */
  async generateContentWithRetry(prompt, modelName = this.defaultModel, maxRetries = 3) {
    const ai = this.getClient();

    if (!ai) {
      return this.generateMockAnalysis();
    }

    let attempt = 0;
    let lastError = null;

    while (attempt < maxRetries) {
      try {
        attempt++;
        logger.info(`Sending prompt to Gemini API (${modelName}), Attempt ${attempt}/${maxRetries}...`);

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2, // Low temperature for consistent, analytical evaluation
          },
        });

        if (!response || !response.text) {
          throw new Error('Gemini API returned an empty text response.');
        }

        return response.text;
      } catch (error) {
        lastError = error;
        const errorMessage = error.message || '';
        const isRateLimit = errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('rate');
        const isTransientServerErr = errorMessage.includes('503') || errorMessage.includes('500') || errorMessage.toLowerCase().includes('overloaded');

        if ((isRateLimit || isTransientServerErr) && attempt < maxRetries) {
          const backoffDelay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
          logger.warn(
            `Gemini API transient failure (${error.message}). Retrying in ${backoffDelay / 1000}s (Attempt ${attempt}/${maxRetries})...`
          );
          await this.sleep(backoffDelay);
        } else {
          logger.error(`Gemini API non-retryable failure on attempt ${attempt}: ${error.message}`);
          break; // Stop retrying for fatal non-transient errors
        }
      }
    }

    throw ApiError.internal(
      `Gemini AI service unavailable after ${attempt} attempt(s): ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Parse and validate raw JSON text returned by AI model.
   * Strips markdown fences if present and fills safe defaults for missing fields.
   *
   * @param {string} rawResponse - Raw string output from AI
   * @returns {object} Validated structured JSON analysis object
   */
  parseAndValidateResponse(rawResponse) {
    if (typeof rawResponse === 'object') {
      return this.ensureSchemaDefaults(rawResponse);
    }

    let cleanedText = rawResponse.trim();

    // Clean markdown code block wrappers (e.g. ```json ... ``` or ``` ...)
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    }

    let parsedJson;
    try {
      parsedJson = JSON.parse(cleanedText);
    } catch (parseError) {
      logger.error(`Failed to parse AI response as JSON: ${parseError.message}`);
      logger.debug(`Raw unparseable text: ${cleanedText}`);
      throw ApiError.internal(
        'AI provider returned malformed response. Failed to parse output as valid JSON.'
      );
    }

    return this.ensureSchemaDefaults(parsedJson);
  }

  /**
   * Validate required JSON keys and apply default fallback data structures.
   *
   * @param {object} data - Parsed JSON object
   * @returns {object} Schema-compliant object
   */
  ensureSchemaDefaults(data) {
    const defaultSection = { score: 70, feedback: [], suggestions: [] };

    return {
      atsScore: typeof data.atsScore === 'number' ? Math.max(0, Math.min(100, Math.round(data.atsScore))) : 75,
      summary: typeof data.summary === 'string' ? data.summary.trim() : 'Candidate demonstrates technical competencies suitable for the target role.',
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
      missingSkills: Array.isArray(data.missingSkills) ? data.missingSkills : [],
      recommendedSkills: Array.isArray(data.recommendedSkills) ? data.recommendedSkills : [],
      grammarFeedback: Array.isArray(data.grammarFeedback) ? data.grammarFeedback : [],
      formattingFeedback: Array.isArray(data.formattingFeedback) ? data.formattingFeedback : [],
      keywordFeedback: Array.isArray(data.keywordFeedback) ? data.keywordFeedback : [],
      sectionFeedback: {
        summary: data.sectionFeedback?.summary || { ...defaultSection },
        experience: data.sectionFeedback?.experience || { ...defaultSection },
        education: data.sectionFeedback?.education || { ...defaultSection },
        skills: data.sectionFeedback?.skills || { ...defaultSection },
        projects: data.sectionFeedback?.projects || { ...defaultSection },
      },
      recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
    };
  }

  /**
   * Generate mock JSON evaluation payload for offline development or missing API keys.
   * @returns {string} Stringified JSON mock response
   */
  generateMockAnalysis() {
    logger.info('Generating simulated mock resume analysis for development environment.');
    const mock = {
      atsScore: 82,
      summary: 'Candidate presents a solid technical background with relevant experience in backend engineering and database design. Formatting and keyword density are well-aligned with target industry expectations.',
      strengths: [
        'Demonstrates practical experience with Node.js, Express, and MongoDB stack',
        'Includes clear project descriptions and core technical competencies',
        'Clean section hierarchy and readable bullet structures',
      ],
      weaknesses: [
        'Lacks quantifiable metrics and impact data in work experience section',
        'Missing modern cloud architecture and CI/CD keywords',
      ],
      missingSkills: ['Docker', 'AWS / Cloud Deployment', 'CI/CD Pipelines', 'TypeScript'],
      recommendedSkills: ['Docker', 'AWS', 'Jest / Unit Testing', 'Redis'],
      grammarFeedback: [
        'Use strong active verbs at the start of bullet points (e.g., "Architected", "Engineered")',
      ],
      formattingFeedback: [
        'Ensure consistent date formatting across all experience entries (e.g., MMM YYYY)',
      ],
      keywordFeedback: [
        'Increase density of keywords related to microservices, REST APIs, and database performance tuning',
      ],
      sectionFeedback: {
        summary: { score: 85, feedback: ['Concise summary statement'], suggestions: ['Include career objective target'] },
        experience: { score: 78, feedback: ['Solid tech stack mentioned'], suggestions: ['Add percentage achievements and metrics'] },
        education: { score: 90, feedback: ['Degree and institution clearly listed'], suggestions: ['Add relevant coursework'] },
        skills: { score: 84, feedback: ['Well-grouped technical skills'], suggestions: ['Group by category (Languages, Frameworks, Databases)'] },
        projects: { score: 80, feedback: ['Good project descriptions'], suggestions: ['Add live deployment / GitHub repository links'] },
      },
      recommendations: [
        'Quantify achievements in project and experience bullets using concrete percentages or performance metrics.',
        'Add high-demand DevOps keywords such as Docker, AWS, and CI/CD.',
        'Include links to active GitHub repositories or live web applications.',
      ],
    };
    return JSON.stringify(mock);
  }
}

/**
 * Unified AI Service Layer (Facade Pattern)
 * Decouples application logic from specific AI providers. Enables seamlessly switching between
 * Gemini, OpenAI, Claude, or custom models.
 */
class AiService {
  constructor() {
    this.providers = {
      Gemini: new GeminiProvider(),
      // Future Providers (OpenAI, Claude) can be registered here cleanly:
      // OpenAI: new OpenAiProvider(),
      // Claude: new ClaudeProvider(),
    };
  }

  /**
   * Analyze candidate resume text using target AI provider.
   *
   * @param {string} resumeText - Extracted text content from PDF
   * @param {object} [options={}] - Options object
   * @param {string} [options.provider='Gemini'] - Provider choice ('Gemini', 'OpenAI', etc.)
   * @param {string} [options.targetRole='Software Engineer / Technical Professional'] - Target job role
   * @param {string} [options.experienceLevel='Mid-Level'] - Target experience level
   * @returns {Promise<{ analysis: object, provider: string, model: string, promptVersion: string }>} Structured analysis result
   */
  async analyzeResume(resumeText, options = {}) {
    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
      throw ApiError.badRequest('Resume text is required for AI analysis');
    }

    const providerName = options.provider || 'Gemini';
    const provider = this.providers[providerName];

    if (!provider) {
      throw ApiError.badRequest(
        `AI provider '${providerName}' is not supported. Allowed providers: ${Object.keys(this.providers).join(', ')}`
      );
    }

    // Step 1: Build versioned prompt string
    const prompt = buildResumeAnalysisPrompt({
      resumeText,
      targetRole: options.targetRole,
      experienceLevel: options.experienceLevel,
    });

    // Step 2: Generate content with automatic retries for transient errors
    const rawOutput = await provider.generateContentWithRetry(prompt, options.model || provider.defaultModel);

    // Step 3: Parse and validate JSON structure
    const structuredAnalysis = provider.parseAndValidateResponse(rawOutput);

    return {
      analysis: structuredAnalysis,
      provider: providerName,
      model: options.model || provider.defaultModel,
      promptVersion: RESUME_ANALYSIS_PROMPT_VERSION,
    };
  }
}

export default new AiService();
export { AiService, GeminiProvider };
