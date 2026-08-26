import {
  QUESTION_GENERATION_PROMPT_VERSION,
  buildQuestionGenerationPrompt,
  QUESTION_GENERATION_JSON_SCHEMA,
} from './questionGeneration.prompt.js';
import {
  ANSWER_EVALUATION_PROMPT_VERSION,
  buildAnswerEvaluationPrompt,
  ANSWER_EVALUATION_JSON_SCHEMA,
} from './answerEvaluation.prompt.js';

console.log('=== INTERVIEWIQ PHASE 7.2 AI PROMPT ENGINEERING TEST SUITE ===\n');

async function runTestSuite() {
  const testResults = [];

  const recordResult = (testName, passed, message) => {
    testResults.push({ testName, passed, message });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${testName}`);
    console.log(`       Details: ${message}\n`);
  };

  // Test 1: Question Generation Prompt Building
  try {
    const prompt = buildQuestionGenerationPrompt({
      resumeText: 'Full Stack Engineer with 4 years experience building Node.js microservices.',
      skills: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Docker'],
      experience: 'Senior (4+ Years)',
      selectedRole: 'Backend Engineer',
      selectedCompany: 'TechCorp',
      difficulty: 'Advanced',
      interviewType: 'Technical',
      totalQuestions: 5,
    });

    const checksPass =
      prompt.includes('Backend Engineer') &&
      prompt.includes('TechCorp') &&
      prompt.includes('Advanced') &&
      prompt.includes('Technical') &&
      prompt.includes('Node.js, Express, MongoDB') &&
      prompt.toLowerCase().includes('output only the raw json object');

    if (checksPass && QUESTION_GENERATION_PROMPT_VERSION === '1.0.0') {
      recordResult(
        'Question Generation Prompt Construction',
        true,
        'Prompt includes role, company, difficulty, skills, resume context, and version 1.0.0'
      );
    } else {
      recordResult(
        'Question Generation Prompt Construction',
        false,
        'Missing required parameters in generated prompt string'
      );
    }
  } catch (err) {
    recordResult('Question Generation Prompt Construction', false, err.message);
  }

  // Test 2: Answer Evaluation Prompt Building (6 Dimensions)
  try {
    const prompt = buildAnswerEvaluationPrompt({
      question: 'How do you prevent SQL injection in Node.js applications?',
      userAnswer: 'I use parameterized queries and ORMs like Mongoose or Sequelize.',
      expectedAnswer: 'Use parameterized queries, prepared statements, input sanitization, and ORM abstractions.',
      selectedRole: 'Backend Engineer',
      interviewType: 'Technical',
      difficulty: 'Intermediate',
    });

    const checksPass =
      prompt.includes('Technical Accuracy') &&
      prompt.includes('Communication') &&
      prompt.includes('Completeness') &&
      prompt.includes('Confidence') &&
      prompt.includes('Problem Solving') &&
      prompt.includes('Practical Knowledge') &&
      prompt.includes('Backend Engineer') &&
      prompt.toLowerCase().includes('output only the raw json object');

    if (checksPass && ANSWER_EVALUATION_PROMPT_VERSION === '1.0.0') {
      recordResult(
        'Answer Evaluation Prompt Construction (6 Dimensions)',
        true,
        'Prompt correctly enforces all 6 required evaluation dimensions & JSON rules'
      );
    } else {
      recordResult(
        'Answer Evaluation Prompt Construction (6 Dimensions)',
        false,
        'Prompt string did not contain all 6 evaluation dimensions'
      );
    }
  } catch (err) {
    recordResult('Answer Evaluation Prompt Construction (6 Dimensions)', false, err.message);
  }

  // Test 3: Prompt Schemas Export Verification
  try {
    const qHasKeys = Array.isArray(QUESTION_GENERATION_JSON_SCHEMA.questions);
    const eHasDimensions =
      'technicalAccuracy' in ANSWER_EVALUATION_JSON_SCHEMA.dimensionScores &&
      'communication' in ANSWER_EVALUATION_JSON_SCHEMA.dimensionScores &&
      'completeness' in ANSWER_EVALUATION_JSON_SCHEMA.dimensionScores &&
      'confidence' in ANSWER_EVALUATION_JSON_SCHEMA.dimensionScores &&
      'problemSolving' in ANSWER_EVALUATION_JSON_SCHEMA.dimensionScores &&
      'practicalKnowledge' in ANSWER_EVALUATION_JSON_SCHEMA.dimensionScores;

    if (qHasKeys && eHasDimensions) {
      recordResult(
        'Prompt Schema Validation & Export Integrity',
        true,
        'Schemas properly exported and include valid keys for all evaluation criteria'
      );
    } else {
      recordResult(
        'Prompt Schema Validation & Export Integrity',
        false,
        'Missing keys in exported JSON schemas'
      );
    }
  } catch (err) {
    recordResult('Prompt Schema Validation & Export Integrity', false, err.message);
  }

  const passedCount = testResults.filter((t) => t.passed).length;
  console.log(`=== SUMMARY: ${passedCount}/${testResults.length} PROMPT TESTS PASSED ===`);
  if (passedCount === testResults.length) {
    console.log('ALL PROMPT TESTS COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('SOME PROMPT TESTS FAILED!');
    process.exit(1);
  }
}

runTestSuite();
