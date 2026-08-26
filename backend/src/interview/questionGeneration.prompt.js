/**
 * AI Prompt Engineering Template for Interview Question Generation
 * Version: 1.0.0
 * Provider Compatibility: Google Gemini (Gemini 1.5 Pro / Flash, Gemini 2.0 Flash)
 */

export const QUESTION_GENERATION_PROMPT_VERSION = '1.0.0';

/**
 * Expected JSON Output Structure for Question Generation
 */
export const QUESTION_GENERATION_JSON_SCHEMA = {
  questions: [
    {
      sequenceNumber: 1,
      question: '',
      expectedAnswer: '',
      category: '',
      difficulty: '',
      focusArea: '',
    },
  ],
};

/**
 * Build engineered prompt string instructing Gemini AI to generate custom interview questions.
 *
 * @param {object} params
 * @param {string} [params.resumeText=''] - Text extracted from candidate's resume
 * @param {string[]|string} [params.skills=[]] - Candidate skills array or string
 * @param {string} [params.experience='Mid-Level'] - Years / Level of experience
 * @param {string} [params.selectedRole='Software Engineer'] - Target job position
 * @param {string} [params.selectedCompany='General Industry Standard'] - Target company
 * @param {string} [params.difficulty='Intermediate'] - Interview difficulty (Beginner, Intermediate, Advanced)
 * @param {string} [params.interviewType='Technical'] - Interview type (Technical, HR, Behavioral, Mixed)
 * @param {number} [params.totalQuestions=5] - Number of questions to generate
 * @returns {string} Fully formatted Gemini prompt string
 */
export const buildQuestionGenerationPrompt = ({
  resumeText = '',
  skills = [],
  experience = 'Mid-Level',
  selectedRole = 'Software Engineer',
  selectedCompany = 'General Industry Standard',
  difficulty = 'Intermediate',
  interviewType = 'Technical',
  totalQuestions = 5,
}) => {
  const formattedSkills = Array.isArray(skills)
    ? skills.join(', ')
    : skills || 'Not specified';

  return `You are a Principal Lead Technical Interviewer and Head of Engineering Hiring at ${selectedCompany}. You have 15+ years of experience interviewing top software engineers, product managers, and technology leaders.

Your task is to generate exactly ${totalQuestions} realistic, highly tailored, and non-repetitive interview questions for a candidate applying for the position of "${selectedRole}" at "${selectedCompany}".

======================================================================
CANDIDATE PROFILE & CONTEXT:
- Target Role: ${selectedRole}
- Target Company: ${selectedCompany}
- Interview Type: ${interviewType} (Options: Technical, HR, Behavioral, Mixed)
- Difficulty Level: ${difficulty} (Options: Beginner, Intermediate, Advanced)
- Experience Level: ${experience}
- Core Skills: ${formattedSkills}
- Resume Background Excerpt:
"""
${resumeText ? resumeText.slice(0, 3000) : 'No resume attached; generate based on target role and skills.'}
"""
======================================================================

QUESTION GENERATION GUIDELINES:
1. Target Role & Company Relevance: Craft questions that directly test domain knowledge required for ${selectedRole} at ${selectedCompany}.
2. Candidate Customization: Cross-reference the candidate's skills (${formattedSkills}) and resume background to ask scenario-based questions that test depth.
3. Interview Type Alignment:
   - If "Technical": Focus on core concepts, system architecture, data structures, algorithms, debugging, syntax, and performance optimization.
   - If "HR": Focus on career goals, motivation, compensation expectations, work style, ethics, and company culture fit.
   - If "Behavioral": Focus on STAR method scenarios (Situation, Task, Action, Result), conflict resolution, leadership, failure recovery, and teamwork.
   - If "Mixed": Provide a balanced blend of Technical, Behavioral, and HR questions.
4. Difficulty Calibration (${difficulty}):
   - Beginner: Fundamental concepts, syntax, basic problem solving, core definitions.
   - Intermediate: Trade-offs, real-world application scenarios, edge cases, framework internals.
   - Advanced: Scalability bottlenecks, system design, low-level optimization, complex architectural decisions under constraints.
5. Benchmark Expected Answers: For EACH question, provide a comprehensive, bulleted "expectedAnswer" detailing the key concepts, technical terms, and logic a top-tier candidate must include.

======================================================================
CRITICAL OUTPUT INSTRUCTIONS:
1. You MUST return ONLY a single valid JSON object.
2. Do NOT wrap the JSON inside markdown code blocks (do NOT use \`\`\`json or \`\`\`).
3. Do NOT include any leading text, introductory greetings, trailing notes, or commentary outside the JSON.
4. Ensure all string values are properly escaped and valid JSON.
======================================================================

EXPECTED JSON SCHEMA:
{
  "questions": [
    {
      "sequenceNumber": 1,                                // Integer starting from 1 up to ${totalQuestions}
      "question": "Clear, precise question text",         // String
      "expectedAnswer": "Comprehensive reference answer", // String detailing key points
      "category": "${interviewType}",                    // String: Technical / HR / Behavioral / General
      "difficulty": "${difficulty}",                      // String: Beginner / Intermediate / Advanced
      "focusArea": "Specific skill or topic tested"      // String (e.g., 'Concurrency & Event Loop')
    }
  ]
}

Begin generation now and output ONLY the raw JSON object.`;
};
