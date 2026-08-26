import {
  buildLearningRoadmapPrompt,
  ROADMAP_PROMPT_VERSION,
  ROADMAP_JSON_SCHEMA,
} from './learningRoadmap.prompt.js';
import aiResponseParserService from '../services/aiResponseParser.service.js';

console.log('=== INTERVIEWIQ AI - PHASE 9.4 ROADMAP PROMPT ENGINEERING TEST SUITE ===\n');

async function runPromptEngineeringTests() {
  let passedCount = 0;
  let failedCount = 0;

  const assert = (condition, testName, message = '') => {
    if (condition) {
      passedCount++;
      console.log(`[PASS] ${testName}`);
    } else {
      failedCount++;
      console.error(`[FAIL] ${testName} - ${message}`);
    }
  };

  try {
    // 1. Version & Schema Export Verification
    assert(ROADMAP_PROMPT_VERSION === '1.0.0', '1. ROADMAP_PROMPT_VERSION equals 1.0.0');
    assert(typeof ROADMAP_JSON_SCHEMA === 'object' && Array.isArray(ROADMAP_JSON_SCHEMA.phases), '2. ROADMAP_JSON_SCHEMA exported with phases array');

    // 2. Prompt Generation with Full Candidate Context
    const promptInput = {
      targetRole: 'Senior Node.js Backend Engineer',
      experienceLevel: 'Mid-Level',
      skills: ['JavaScript', 'Node.js', 'Express.js', 'MongoDB'],
      resumeSummary: 'Experienced backend engineer with 3 years developing REST APIs.',
      atsAnalysis: {
        atsScore: 78,
        missingSkills: ['Redis Caching', 'Docker Containerization', 'Kafka Messaging'],
        recommendedSkills: ['GraphQL', 'Kubernetes'],
        weaknesses: ['Missing unit test metrics', 'Lacks cloud deployment details'],
      },
      interviewPerformance: {
        averageScore: 72,
        technicalScore: 75,
        communicationScore: 70,
        hrScore: 71,
        weaknesses: ['Struggled with system design database partitioning'],
      },
      jobApplicationContext: {
        targetCompanies: ['TechCorp', 'CloudSystems'],
      },
    };

    const generatedPrompt = buildLearningRoadmapPrompt(promptInput);

    assert(typeof generatedPrompt === 'string' && generatedPrompt.length > 500, '3. Prompt generator outputs comprehensive non-empty string');
    assert(generatedPrompt.includes('Senior Node.js Backend Engineer'), '4. Prompt embeds target role context');
    assert(generatedPrompt.includes('Redis Caching'), '5. Prompt embeds ATS missing skills context');
    assert(generatedPrompt.includes('database partitioning'), '6. Prompt embeds interview performance weaknesses context');
    assert(generatedPrompt.includes('DO NOT HALLUCINATE'), '7. Prompt enforces anti-hallucination constraint');
    assert(generatedPrompt.includes('PREREQUISITE PROGRESSION'), '8. Prompt enforces prerequisite ordering constraint');

    // 3. Response Parser & Normalizer Unit Verification
    const mockRawAiResponse = JSON.stringify({
      title: 'Senior Node.js & Microservices Mastery Pathway',
      description: 'Master Redis caching, Docker, and System Design for Senior Backend Engineer role.',
      skillGaps: ['Redis Caching', 'Docker Containerization', 'Kafka Messaging'],
      phases: [
        {
          title: 'Phase 1: High-Performance Caching with Redis',
          description: 'Learn Redis in-memory data structures and cache-aside middleware implementation.',
          skills: ['Redis Caching', 'Node.js'],
          priority: 'CRITICAL',
          estimatedDays: 7,
          order: 1,
          tasks: [
            {
              title: 'Study Redis Data Structures & Persistence',
              description: 'Read official Redis docs on Hashes, Sets, RDB, and AOF persistence.',
              type: 'LEARNING',
              skills: ['Redis'],
              priority: 'HIGH',
              estimatedMinutes: 45,
              order: 1,
              resources: [
                {
                  title: 'Official Redis Documentation',
                  url: 'https://redis.io/docs/',
                  type: 'DOCUMENTATION',
                },
              ],
            },
            {
              title: 'Build Express Redis Cache Middleware',
              description: 'Implement cache-aside pattern for GET endpoints.',
              type: 'CODING',
              skills: ['Node.js', 'Express.js', 'Redis Caching'],
              priority: 'CRITICAL',
              estimatedMinutes: 90,
              order: 2,
              resources: [
                {
                  title: 'Express Caching Guide',
                  url: 'https://expressjs.com/en/advanced/best-practice-performance.html',
                  type: 'ARTICLE',
                },
              ],
            },
          ],
        },
      ],
    });

    const parsedRoadmap = aiResponseParserService.parseAndValidateRoadmapResponse(mockRawAiResponse);

    assert(parsedRoadmap.title === 'Senior Node.js & Microservices Mastery Pathway', '9. Parser extracts roadmap title');
    assert(parsedRoadmap.skillGaps.length === 3 && parsedRoadmap.skillGaps[0] === 'Redis Caching', '10. Parser extracts skill gaps array');
    assert(parsedRoadmap.phases.length === 1 && parsedRoadmap.phases[0].priority === 'CRITICAL', '11. Parser extracts phases and normalizes priority enum');
    assert(parsedRoadmap.phases[0].tasks.length === 2 && parsedRoadmap.phases[0].tasks[1].type === 'CODING', '12. Parser extracts tasks and normalizes task type enum');
    assert(parsedRoadmap.phases[0].tasks[0].resources[0].type === 'DOCUMENTATION', '13. Parser extracts resources and normalizes resource type enum');

    // 4. Response Parser Resilience with Markdown Wrappers
    const markdownWrappedResponse = `\`\`\`json
${mockRawAiResponse}
\`\`\``;
    const parsedMarkdownRoadmap = aiResponseParserService.parseAndValidateRoadmapResponse(markdownWrappedResponse);
    assert(parsedMarkdownRoadmap.phases.length === 1, '14. Parser strips markdown code blocks (```json ... ```) automatically');

  } catch (err) {
    assert(false, 'Roadmap Prompt Engineering test exception', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runPromptEngineeringTests();
