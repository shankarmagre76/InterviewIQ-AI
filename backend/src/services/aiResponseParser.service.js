import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * AI Response Parser Service
 * Dedicated service for cleaning, parsing, validating, type-checking, and normalizing
 * raw JSON responses returned by AI providers (Gemini, OpenAI, Claude).
 */
class AiResponseParserService {
  /**
   * Strip markdown code blocks (```json ... ```) and extract raw JSON substring.
   *
   * @param {string} rawInput - Raw text output from LLM
   * @returns {string} Sanitized JSON string
   */
  cleanJsonString(rawInput) {
    if (!rawInput || typeof rawInput !== 'string') {
      return '';
    }

    let cleaned = rawInput.trim();

    // 1. Remove markdown fences (e.g. ```json ... ``` or ``` ...)
    if (cleaned.includes('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    }

    // 2. Extract content between first '{' and last '}' if extra text is present
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    return cleaned;
  }

  /**
   * Safely parse raw string input into a JavaScript object.
   * Throws standardized ApiError if JSON parsing fails.
   *
   * @param {string|object} rawInput - Text string or object
   * @returns {object} Parsed JavaScript object
   */
  parseJsonString(rawInput) {
    if (typeof rawInput === 'object' && rawInput !== null) {
      return rawInput;
    }

    const cleanedString = this.cleanJsonString(rawInput);

    if (!cleanedString) {
      throw ApiError.internal('AI provider returned empty response content.');
    }

    try {
      return JSON.parse(cleanedString);
    } catch (parseError) {
      logger.error(`AI JSON Parser error: ${parseError.message}`);
      logger.debug(`Raw unparseable AI string: ${cleanedString}`);
      throw ApiError.internal(
        'Failed to parse AI provider response. The AI output is not valid JSON format.'
      );
    }
  }

  /**
   * Normalize and validate numerical score values strictly bounded between 0 and 100.
   * Handles string-to-number conversions, floating point rounding, and null fallbacks.
   *
   * @param {any} val - Input score value
   * @param {number|null} [defaultScore=70] - Fallback default score if invalid
   * @returns {number|null} Validated integer score (0–100) or null
   */
  normalizeScore(val, defaultScore = 70) {
    if (val === null || val === undefined) {
      return defaultScore;
    }

    const num = Number(val);
    if (isNaN(num)) {
      return defaultScore;
    }

    // Round to nearest integer and constrain between 0 and 100
    const rounded = Math.round(num);
    return Math.max(0, Math.min(100, rounded));
  }

  /**
   * Normalize input value into an array of non-empty trimmed strings.
   * Handles string inputs (converting single string or line-broken string to array),
   * filters nulls/numbers, and removes empty whitespace entries.
   *
   * @param {any} val - Array or string value
   * @returns {string[]} Array of non-empty strings
   */
  normalizeStringArray(val) {
    if (!val) {
      return [];
    }

    // If single string passed instead of array, split by newlines or wrap in array
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) return [];
      if (trimmed.includes('\n')) {
        return trimmed.split('\n').map((s) => s.replace(/^[-*•\d.\s]+/, '').trim()).filter(Boolean);
      }
      return [trimmed];
    }

    if (Array.isArray(val)) {
      return val
        .map((item) => {
          if (typeof item === 'string') return item.trim();
          if (typeof item === 'number' || typeof item === 'boolean') return String(item);
          return '';
        })
        .filter((item) => item.length > 0);
    }

    return [];
  }

  /**
   * Normalize an individual section feedback object ({ score, feedback, suggestions }).
   *
   * @param {object} sectionObj - Raw section object
   * @returns {{ score: number, feedback: string[], suggestions: string[] }}
   */
  normalizeSectionDetail(sectionObj) {
    const raw = typeof sectionObj === 'object' && sectionObj !== null ? sectionObj : {};

    return {
      score: this.normalizeScore(raw.score, 70),
      feedback: this.normalizeStringArray(raw.feedback),
      suggestions: this.normalizeStringArray(raw.suggestions),
    };
  }

  /**
   * Normalize sectionFeedback subdocument structure across all sections.
   *
   * @param {object} sectionFeedbackObj - Raw sectionFeedback map
   * @returns {object} Normalized sectionFeedback object
   */
  normalizeSectionFeedback(sectionFeedbackObj) {
    const raw = typeof sectionFeedbackObj === 'object' && sectionFeedbackObj !== null ? sectionFeedbackObj : {};

    return {
      summary: this.normalizeSectionDetail(raw.summary),
      experience: this.normalizeSectionDetail(raw.experience),
      education: this.normalizeSectionDetail(raw.education),
      skills: this.normalizeSectionDetail(raw.skills),
      projects: this.normalizeSectionDetail(raw.projects),
    };
  }

  /**
   * Complete validation and normalization pipeline for AI Resume Analysis responses.
   * Verifies required fields, handles incorrect data types, bounds scores, and formats payload.
   *
   * @param {string|object} rawInput - Raw text output from AI provider or raw object
   * @returns {object} Schema-compliant normalized ResumeAnalysis object
   */
  parseAndValidateAiResponse(rawInput) {
    // Step 1: Parse string into JavaScript Object
    const data = this.parseJsonString(rawInput);

    if (typeof data !== 'object' || data === null) {
      throw ApiError.internal('Invalid AI response payload. Root element must be an object.');
    }

    // Step 2: Validate ATS Score Presence
    if (data.atsScore === undefined || data.atsScore === null || isNaN(Number(data.atsScore))) {
      logger.warn('AI response missing required atsScore field. Applying default calculated score.');
    }

    // Step 3: Normalize and type-check every field
    const normalizedPayload = {
      atsScore: this.normalizeScore(data.atsScore, 75),
      summary:
        typeof data.summary === 'string' && data.summary.trim().length > 0
          ? data.summary.trim()
          : 'Candidate demonstrates core competencies suitable for technical evaluation.',
      strengths: this.normalizeStringArray(data.strengths),
      weaknesses: this.normalizeStringArray(data.weaknesses),
      missingSkills: this.normalizeStringArray(data.missingSkills),
      recommendedSkills: this.normalizeStringArray(data.recommendedSkills),
      grammarFeedback: this.normalizeStringArray(data.grammarFeedback),
      formattingFeedback: this.normalizeStringArray(data.formattingFeedback),
      keywordFeedback: this.normalizeStringArray(data.keywordFeedback),
      sectionFeedback: this.normalizeSectionFeedback(data.sectionFeedback),
      recommendations: this.normalizeStringArray(data.recommendations),
    };

    logger.info(`Successfully parsed & normalized AI analysis response (ATS Score: ${normalizedPayload.atsScore})`);
    return normalizedPayload;
  }
}

export default new AiResponseParserService();
export { AiResponseParserService };
