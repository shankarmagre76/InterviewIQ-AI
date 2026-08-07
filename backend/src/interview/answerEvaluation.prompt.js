/**
 * AI Prompt Engineering Template for Interview Answer Evaluation
 * Version: 1.0.0
 * Provider Compatibility: Google Gemini (Gemini 1.5 Pro / Flash, Gemini 2.0 Flash)
 */

export const ANSWER_EVALUATION_PROMPT_VERSION = '1.0.0';

/**
 * Expected JSON Output Structure for Answer Evaluation
 */
export const ANSWER_EVALUATION_JSON_SCHEMA = {
  score: 0,
  aiFeedback: {
    comments: '',
    keyPointsCovered: [],
    keyPointsMissed: [],
    clarityScore: 0,
    relevanceScore: 0,
  },
  dimensionScores: {
    technicalAccuracy: { score: 0, feedback: '' },
    communication: { score: 0, feedback: '' },
    completeness: { score: 0, feedback: '' },
    confidence: { score: 0, feedback: '' },
    problemSolving: { score: 0, feedback: '' },
    practicalKnowledge: { score: 0, feedback: '' },
  },
  strengths: [],
  weaknesses: [],
  recommendations: [],
  sampleImprovedAnswer: '',
};

/**
 * Build engineered prompt string instructing Gemini AI to evaluate a candidate's interview answer.
 *
 * @param {object} params
 * @param {string} params.question - The question asked during the interview
 * @param {string} params.userAnswer - Candidate's spoken or written answer text
 * @param {string} [params.expectedAnswer=''] - Ideal reference answer / rubric
 * @param {string} [params.selectedRole='Software Engineer'] - Target job role
 * @param {string} [params.interviewType='Technical'] - Interview type (Technical, HR, Behavioral, Mixed)
 * @param {string} [params.difficulty='Intermediate'] - Interview difficulty level
 * @returns {string} Fully formatted Gemini prompt string
 */
export const buildAnswerEvaluationPrompt = ({
  question,
  userAnswer,
  expectedAnswer = '',
  selectedRole = 'Software Engineer',
  interviewType = 'Technical',
  difficulty = 'Intermediate',
}) => {
  return `You are a Principal AI Interview Evaluation Specialist and Executive Hiring Assessor for top technology companies.

Your mission is to perform a rigorous, objective, and multi-dimensional evaluation of a candidate's answer for a "${selectedRole}" position during a "${difficulty}" level "${interviewType}" interview.

======================================================================
INTERVIEW CONTEXT:
- Target Role: ${selectedRole}
- Interview Type: ${interviewType}
- Difficulty Level: ${difficulty}

QUESTION ASKED:
"""
${question}
"""

CANDIDATE ANSWER:
"""
${userAnswer ? userAnswer : '[No answer provided by candidate]'}
"""

BENCHMARK EXPECTED ANSWER:
"""
${expectedAnswer ? expectedAnswer : 'Evaluate based on industry standard best practices for this role.'}
"""
======================================================================

REQUIRED EVALUATION DIMENSIONS:
You MUST evaluate the candidate's answer across these 6 distinct dimensions (each scored 0-100):

1. Technical Accuracy:
   - Correctness of concepts, syntax, terminology, architecture, algorithms, and domain principles.
2. Communication:
   - Structure, clarity of expression, professional tone, articulation, and concise delivery.
3. Completeness:
   - Coverage of all required sub-parts, edge cases, trade-offs, and depth relative to the question prompt.
4. Confidence:
   - Assertiveness, conviction in reasoning, absence of hedging/hesitation, and authoritative delivery.
5. Problem Solving:
   - Analytical breakdown, structured logic, systemic thinking, trade-off evaluation, and adaptability.
6. Practical Knowledge:
   - Hands-on execution experience, production readiness, real-world constraints, and industry best practices.

======================================================================
CRITICAL OUTPUT INSTRUCTIONS:
1. You MUST return ONLY a single valid JSON object.
2. Do NOT wrap the JSON inside markdown code blocks (do NOT use \`\`\`json or \`\`\`).
3. Do NOT include any leading text, introductory greetings, trailing notes, or commentary outside the JSON.
4. All scores MUST be integers between 0 and 100.
5. If candidate answer is missing or empty, assign scores of 0 and provide clear feedback on what was missing.
======================================================================

EXPECTED JSON SCHEMA:
{
  "score": number,                                         // Integer 0-100: Weighted overall performance score
  "aiFeedback": {
    "comments": string,                                    // Detailed 2-3 sentence executive evaluation summary
    "keyPointsCovered": string[],                          // Specific correct concepts candidate included
    "keyPointsMissed": string[],                           // Crucial concepts/skills candidate omitted
    "clarityScore": number,                                // Integer 0-100
    "relevanceScore": number                               // Integer 0-100
  },
  "dimensionScores": {
    "technicalAccuracy": {
      "score": number,                                     // Integer 0-100
      "feedback": string                                   // Direct assessment of technical correctness
    },
    "communication": {
      "score": number,                                     // Integer 0-100
      "feedback": string                                   // Assessment of structure, tone, and clarity
    },
    "completeness": {
      "score": number,                                     // Integer 0-100
      "feedback": string                                   // Assessment of coverage depth and edge cases
    },
    "confidence": {
      "score": number,                                     // Integer 0-100
      "feedback": string                                   // Assessment of assertiveness and delivery conviction
    },
    "problemSolving": {
      "score": number,                                     // Integer 0-100
      "feedback": string                                   // Assessment of analytical approach and trade-offs
    },
    "practicalKnowledge": {
      "score": number,                                     // Integer 0-100
      "feedback": string                                   // Assessment of real-world production experience
    }
  },
  "strengths": string[],                                   // 2-4 key strengths observed
  "weaknesses": string[],                                  // 2-4 key weaknesses or knowledge gaps
  "recommendations": string[],                             // 2-4 actionable tips to improve answer quality
  "sampleImprovedAnswer": string                           // Exemplary 10/10 sample answer for candidate learning
}

Begin evaluation now and output ONLY the raw JSON object.`;
};
