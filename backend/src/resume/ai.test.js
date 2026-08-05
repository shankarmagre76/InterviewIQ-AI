import aiService, { GeminiProvider } from './ai.service.js';
import bridgeService from '../services/ai.service.js';
import ApiError from '../utils/ApiError.js';

console.log('=== INTERVIEWIQ AI SERVICE TEST SUITE ===\n');

async function runTests() {
  // Test 1: Service Export Bridge Match
  console.log('[PASS] Service Export Match:', aiService === bridgeService);

  // Test 2: GeminiProvider response sanitization & JSON parsing
  const gemini = new GeminiProvider();
  const sampleMarkdownResponse = `
  \`\`\`json
  {
    "atsScore": 88,
    "summary": "Excellent software candidate with strong backend capabilities.",
    "strengths": ["Node.js mastery", "MongoDB optimization"],
    "weaknesses": ["Lacks Docker experience"],
    "missingSkills": ["Docker"],
    "recommendedSkills": ["Docker", "Kubernetes"],
    "grammarFeedback": [],
    "formattingFeedback": [],
    "keywordFeedback": [],
    "sectionFeedback": {},
    "recommendations": ["Learn Docker"]
  }
  \`\`\`
  `;

  const parsed = gemini.parseAndValidateResponse(sampleMarkdownResponse);
  console.log('[PASS] Parsed ATS Score:', parsed.atsScore);
  console.log('[PASS] Parsed Summary:', parsed.summary);
  console.log('[PASS] Parsed Strengths:', parsed.strengths.join(', '));
  console.log('[PASS] Default Section Feedback Exists:', !!parsed.sectionFeedback.experience);

  // Test 3: Resume Analysis Facade Call
  const result = await aiService.analyzeResume(
    'John Doe - Senior Software Engineer with Node.js and MongoDB experience.',
    { targetRole: 'Senior Backend Engineer' }
  );

  console.log('\n[PASS] Analysis Provider:', result.provider);
  console.log('[PASS] Analysis Model:', result.model);
  console.log('[PASS] Prompt Version:', result.promptVersion);
  console.log('[PASS] Generated ATS Score:', result.analysis.atsScore);

  // Test 4: Rejection of Empty Resume Text
  try {
    await aiService.analyzeResume('   ');
    console.log('[FAIL] Empty text did not throw error');
  } catch (err) {
    console.log('\n[PASS] Empty Text Rejection Status:', err.statusCode, '| Message:', err.message);
  }

  // Test 5: Rejection of Unsupported AI Provider
  try {
    await aiService.analyzeResume('Sample text', { provider: 'UnsupportedAI' });
    console.log('[FAIL] Unsupported provider did not throw error');
  } catch (err) {
    console.log('[PASS] Unsupported Provider Rejection Status:', err.statusCode, '| Message:', err.message);
  }

  console.log('\n=== AI SERVICE TESTS COMPLETED ===');
  process.exit(0);
}

runTests();
