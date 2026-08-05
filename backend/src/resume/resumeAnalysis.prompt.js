/**
 * AI Prompt Template for Resume Analysis
 * Version: 1.0.0
 * Supported Providers: Google Gemini (Gemini 1.5 Pro / Flash), OpenAI GPT-4o, Claude 3.5
 */

export const RESUME_ANALYSIS_PROMPT_VERSION = '1.0.0';

/**
 * Expected JSON Output Structure for LLM Validation
 */
export const RESUME_ANALYSIS_JSON_SCHEMA = {
  atsScore: 0,
  summary: '',
  strengths: [],
  weaknesses: [],
  missingSkills: [],
  recommendedSkills: [],
  grammarFeedback: [],
  formattingFeedback: [],
  keywordFeedback: [],
  sectionFeedback: {
    summary: { score: 0, feedback: [], suggestions: [] },
    experience: { score: 0, feedback: [], suggestions: [] },
    education: { score: 0, feedback: [], suggestions: [] },
    skills: { score: 0, feedback: [], suggestions: [] },
    projects: { score: 0, feedback: [], suggestions: [] },
  },
  recommendations: [],
};

/**
 * Build prompt string instructing Gemini / LLM to evaluate candidate resume and return ONLY valid JSON.
 *
 * @param {object} params
 * @param {string} params.resumeText - Extracted text content from candidate PDF
 * @param {string} [params.targetRole='Software Engineer / Technical Professional'] - Target job role
 * @param {string} [params.experienceLevel='Mid-Level'] - Target experience level
 * @returns {string} Fully engineered prompt string
 */
export const buildResumeAnalysisPrompt = ({
  resumeText,
  targetRole = 'Software Engineer / Technical Professional',
  experienceLevel = 'Mid-Level',
}) => {
  return `You are an expert HR Recruiter, Senior Executive Talent Acquisition Specialist, and Applicant Tracking System (ATS) Algorithm Auditor with 15+ years of corporate hiring experience.

Your mission is to perform a rigorous, objective, and actionable ATS & HR evaluation of the candidate resume provided below.

======================================================================
TARGET JOB ROLE: ${targetRole}
TARGET EXPERIENCE LEVEL: ${experienceLevel}
======================================================================

CANDIDATE RESUME TEXT:
"""
${resumeText}
"""

======================================================================
CRITICAL OUTPUT INSTRUCTIONS:
1. You MUST return ONLY a single valid JSON object.
2. Do NOT wrap the JSON inside markdown code blocks (do NOT use \`\`\`json or \`\`\`).
3. Do NOT include any leading text, introductory greetings, trailing notes, or explanatory commentary outside the JSON.
4. Ensure all string values are properly escaped and valid JSON.
5. All numeric scores MUST be integers between 0 and 100.
======================================================================

JSON SCHEME REQUIREMENT:
You must strictly match the following JSON keys and data types:

{
  "atsScore": number,                 // Integer 0-100: Overall ATS compatibility & readability score
  "summary": string,                 // Executive summary of resume quality (2-4 concise sentences)
  "strengths": string[],             // 3-5 specific strengths identified in candidate experience/skills
  "weaknesses": string[],            // 3-5 specific weaknesses or content gaps
  "missingSkills": string[],         // Crucial industry skills missing for ${targetRole}
  "recommendedSkills": string[],      // High-demand skills candidate should add to boost recruiter interest
  "grammarFeedback": string[],       // Phrasing, passive voice, spelling, or bullet action-verb corrections
  "formattingFeedback": string[],    // Visual hierarchy, bullet length, section heading, and structural notes
  "keywordFeedback": string[],       // ATS keyword density, industry term optimization, and searchability notes
  "sectionFeedback": {
    "summary": {
      "score": number,               // Integer 0-100
      "feedback": string[],          // Evaluation of professional summary/objective
      "suggestions": string[]        // Improvements for summary section
    },
    "experience": {
      "score": number,               // Integer 0-100
      "feedback": string[],          // Evaluation of work experience & bullet action verbs
      "suggestions": string[]        // Improvements for work experience
    },
    "education": {
      "score": number,               // Integer 0-100
      "feedback": string[],          // Evaluation of academic credentials
      "suggestions": string[]        // Improvements for education section
    },
    "skills": {
      "score": number,               // Integer 0-100
      "feedback": string[],          // Evaluation of tech stack organization & proficiency
      "suggestions": string[]        // Improvements for skills section
    },
    "projects": {
      "score": number,               // Integer 0-100
      "feedback": string[],          // Evaluation of technical projects & GitHub portfolio
      "suggestions": string[]        // Improvements for projects section
    }
  },
  "recommendations": string[]        // 3-5 prioritized, actionable next steps to transform resume into top 5%
}

Begin analysis now and output ONLY the raw JSON object.`;
};
