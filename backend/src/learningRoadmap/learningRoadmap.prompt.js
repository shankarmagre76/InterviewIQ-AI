/**
 * AI Prompt Template for Learning Roadmap Generation
 * Version: 1.0.0
 * Supported AI Providers: Google Gemini (Gemini 2.5 Flash / 1.5 Pro)
 */

export const ROADMAP_PROMPT_VERSION = '1.0.0';

/**
 * Expected JSON Output Schema for LLM Validation & Type Safety
 */
export const ROADMAP_JSON_SCHEMA = {
  title: '',
  description: '',
  skillGaps: [],
  phases: [
    {
      title: '',
      description: '',
      skills: [],
      priority: 'HIGH', // Enum: LOW, MEDIUM, HIGH, CRITICAL
      estimatedDays: 7,
      order: 1,
      tasks: [
        {
          title: '',
          description: '',
          type: 'LEARNING', // Enum: LEARNING, PRACTICE, PROJECT, CODING, INTERVIEW, REVIEW
          skills: [],
          priority: 'HIGH', // Enum: LOW, MEDIUM, HIGH, CRITICAL
          estimatedMinutes: 30,
          order: 1,
          resources: [
            {
              title: '',
              url: 'https://...',
              type: 'DOCUMENTATION', // Enum: ARTICLE, VIDEO, DOCUMENTATION, COURSE, REPOSITORY, OTHER
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Engineered Prompt Generator for AI Learning Roadmap Creation
 *
 * @param {object} context - Candidate profile, resume, ATS, interview, and application data
 * @param {string} context.targetRole - Candidate's target job role
 * @param {string} [context.experienceLevel='Mid-Level'] - Target experience level
 * @param {string[]} [context.skills=[]] - Candidate's existing verified profile skills
 * @param {string} [context.resumeSummary=''] - Background summary extracted from candidate resume
 * @param {object} [context.atsAnalysis=null] - Latest ATS score, missing skills, and recommended skills
 * @param {object} [context.interviewPerformance=null] - Average mock interview scores & identified weaknesses
 * @param {object} [context.jobApplicationContext=null] - Targeted company applications or job descriptions
 * @returns {string} Fully structured system & user prompt string for Gemini AI
 */
export const buildLearningRoadmapPrompt = ({
  targetRole = 'Software Engineer',
  experienceLevel = 'Mid-Level',
  skills = [],
  resumeSummary = '',
  atsAnalysis = null,
  interviewPerformance = null,
  jobApplicationContext = null,
}) => {
  // Format verified context components
  const existingSkillsStr =
    skills && skills.length > 0 ? skills.join(', ') : 'Not explicitly specified';

  const atsMissingSkillsStr =
    atsAnalysis?.missingSkills && atsAnalysis.missingSkills.length > 0
      ? atsAnalysis.missingSkills.join(', ')
      : 'None identified';

  const atsRecommendedSkillsStr =
    atsAnalysis?.recommendedSkills && atsAnalysis.recommendedSkills.length > 0
      ? atsAnalysis.recommendedSkills.join(', ')
      : 'None identified';

  const atsWeaknessesStr =
    atsAnalysis?.weaknesses && atsAnalysis.weaknesses.length > 0
      ? atsAnalysis.weaknesses.join('; ')
      : 'None identified';

  const interviewWeaknessesStr =
    interviewPerformance?.weaknesses && interviewPerformance.weaknesses.length > 0
      ? interviewPerformance.weaknesses.join('; ')
      : 'None identified';

  const interviewScoresStr = interviewPerformance
    ? `Overall Avg: ${interviewPerformance.averageScore || 0}/100, Technical: ${
        interviewPerformance.technicalScore || 0
      }, Comm: ${interviewPerformance.communicationScore || 0}`
    : 'No completed mock interviews';

  const targetJobInfoStr = jobApplicationContext?.targetCompanies
    ? `Target Employers: ${jobApplicationContext.targetCompanies.join(', ')}`
    : 'General industry postings';

  return `You are a World-Class Technical Curriculum Architect, Principal Engineering Mentor, and Executive Developer Coach with 15+ years of experience leading engineering teams and designing candidate career roadmaps.

Your mission is to construct a personalized, realistic, highly structured, and actionable Learning Roadmap tailored specifically to the candidate context provided below.

======================================================================
CANDIDATE CONTEXT (STRICT CONSTRAINTS - DO NOT HALLUCINATE):
======================================================================
TARGET JOB ROLE: ${targetRole}
TARGET EXPERIENCE LEVEL: ${experienceLevel}
VERIFIED CANDIDATE SKILLS: ${existingSkillsStr}
RESUME BACKGROUND SUMMARY: ${resumeSummary || 'Candidate background provided in profile skills.'}

ATS RESUME ANALYSIS CONTEXT:
- ATS Compatibility Score: ${atsAnalysis?.atsScore || 'N/A'}
- Identified Skill Gaps (Missing Skills): ${atsMissingSkillsStr}
- High-Value Recommended Skills: ${atsRecommendedSkillsStr}
- Resume Weaknesses: ${atsWeaknessesStr}

AI MOCK INTERVIEW EVALUATION CONTEXT:
- Interview Scores: ${interviewScoresStr}
- Performance Weaknesses Identified: ${interviewWeaknessesStr}

JOB APPLICATION CONTEXT:
- Target Job Context: ${targetJobInfoStr}
======================================================================

CRITICAL CURRICULUM ARCHITECTURE RULES:
1. STRICT TRUTHFULNESS & NO HALLUCINATIONS: Rely strictly on the supplied candidate context. Do NOT invent fake work experience or fake claims about the candidate.
2. PREREQUISITE PROGRESSION: Order phases logically. Core fundamentals and prerequisite foundational gaps MUST be mastered in earlier phases before advancing to high-level architecture or complex projects.
3. NO DUPLICATE TOPICS: Ensure learning topics and skills do NOT repeat across phases. Each phase must focus on distinct skill domains.
4. BALANCED REALISTIC TIMELINE: Pacing must be realistic for a ${experienceLevel} professional. Estimated phase days should range between 3 and 14 days. Task durations should range between 15 and 120 minutes.
5. DIVERSE ACTIONABLE TASK TYPES: Include a healthy mix of task types per phase:
   - LEARNING (Reading docs/tutorials)
   - CODING (Hands-on coding exercises)
   - PRACTICE (System design & conceptual drills)
   - PROJECT (Building mini-features/repositories)
   - INTERVIEW (Mock interview question prep)
   - REVIEW (Self-assessment & revision)
6. REALISTIC HIGH-QUALITY RESOURCES: Provide valid, helpful HTTPS URLs for learning resources (e.g. official docs, MDN, GitHub repositories, freeCodeCamp, roadmap.sh).

======================================================================
CRITICAL JSON OUTPUT FORMATTING RULES:
1. You MUST return ONLY a single valid JSON object.
2. Do NOT wrap the JSON inside markdown code blocks (do NOT use \`\`\`json or \`\`\`).
3. Do NOT include any leading text, greetings, trailing notes, or commentary outside the JSON.
4. Ensure all JSON strings are properly escaped.
======================================================================

REQUIRED JSON SCHEMA & EXACT KEYS:
You must strictly return a JSON object conforming to the following structure:

{
  "title": string,                   // Action-oriented roadmap title (e.g., "Full-Stack Node.js & React Mastery Pathway")
  "description": string,             // Executive overview of learning goals and milestone objectives (2-3 sentences)
  "skillGaps": string[],             // Array of 3-7 core skill gaps targeted by this roadmap
  "phases": [
    {
      "title": string,               // Phase title (e.g., "Phase 1: Advanced Asynchronous Node.js & Caching")
      "description": string,         // Overview of phase learning objectives
      "skills": string[],            // Specific technical skills mastered in this phase
      "priority": string,            // MUST be one of: "LOW", "MEDIUM", "HIGH", "CRITICAL"
      "estimatedDays": number,       // Integer between 1 and 30
      "order": number,               // Phase sequence number starting from 1
      "tasks": [
        {
          "title": string,           // Actionable task title (e.g., "Implement Redis Cache-Aside Middleware")
          "description": string,     // Step-by-step task instructions
          "type": string,            // MUST be one of: "LEARNING", "PRACTICE", "PROJECT", "CODING", "INTERVIEW", "REVIEW"
          "skills": string[],        // Skills practiced in this task
          "priority": string,        // MUST be one of: "LOW", "MEDIUM", "HIGH", "CRITICAL"
          "estimatedMinutes": number,// Integer between 15 and 180
          "order": number,           // Task sequence number within phase starting from 1
          "resources": [
            {
              "title": string,       // Resource title (e.g., "Official Redis Documentation")
              "url": string,         // Valid HTTPS URL
              "type": string         // MUST be one of: "ARTICLE", "VIDEO", "DOCUMENTATION", "COURSE", "REPOSITORY", "OTHER"
            }
          ]
        }
      ]
    }
  ]
}

Begin curriculum design now and output ONLY the raw JSON object.`;
};
