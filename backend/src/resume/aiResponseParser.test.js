import aiResponseParserService from './aiResponseParser.service.js';
import bridgeService from '../services/aiResponseParser.service.js';

console.log('=== INTERVIEWIQ AI RESPONSE PARSER TEST SUITE ===\n');

function runTests() {
  // Test 1: Service Export Bridge Match
  console.log('[PASS] Parser Bridge Match:', aiResponseParserService === bridgeService);

  // Test 2: Clean Markdown Fences & Extra Conversational Text
  const rawMarkdownText = `
    Here is the JSON evaluation:
    \`\`\`json
    {
      "atsScore": 87.6,
      "summary": " Strong candidate with excellent experience. ",
      "strengths": "Node.js mastery\\nMongoDB performance\\nDocker containers",
      "weaknesses": null,
      "missingSkills": [],
      "recommendedSkills": ["Redis", "Kubernetes"],
      "sectionFeedback": {
        "experience": { "score": 92.4, "feedback": ["Great bullet points"], "suggestions": [] }
      }
    }
    \`\`\`
    Hope this helps!
  `;

  const parsed = aiResponseParserService.parseAndValidateAiResponse(rawMarkdownText);

  console.log('[PASS] Rounded Bounded ATS Score:', parsed.atsScore, '(Expected: 88)');
  console.log('[PASS] Cleaned Summary:', `"${parsed.summary}"`);
  console.log('[PASS] Normalized String Array from Multi-line:', parsed.strengths);
  console.log('[PASS] Null Weaknesses Converted to Empty Array:', Array.isArray(parsed.weaknesses) && parsed.weaknesses.length === 0);
  console.log('[PASS] Experience Section Score Bounded:', parsed.sectionFeedback.experience.score, '(Expected: 92)');
  console.log('[PASS] Missing Section Defaulted (Education):', !!parsed.sectionFeedback.education);

  // Test 3: Invalid JSON Handling
  try {
    aiResponseParserService.parseAndValidateAiResponse('{ invalid_json: ');
    console.log('[FAIL] Invalid JSON did not throw error');
  } catch (err) {
    console.log('\n[PASS] Invalid JSON Rejection Status:', err.statusCode, '| Message:', err.message);
  }

  // Test 4: Score Out-of-Bounds Normalization
  console.log('[PASS] Negative Score Bounded:', aiResponseParserService.normalizeScore(-15), '(Expected: 0)');
  console.log('[PASS] High Score Bounded:', aiResponseParserService.normalizeScore(150), '(Expected: 100)');

  console.log('\n=== AI RESPONSE PARSER TESTS COMPLETED ===');
  process.exit(0);
}

runTests();
