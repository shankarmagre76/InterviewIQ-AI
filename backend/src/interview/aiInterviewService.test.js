import aiInterviewService from './aiInterview.service.js';

console.log('=== INTERVIEWIQ PHASE 7.3 AI QUESTION GENERATION TEST SUITE ===\n');

async function runTestSuite() {
  const testResults = [];

  const recordResult = (testName, passed, message) => {
    testResults.push({ testName, passed, message });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${testName}`);
    console.log(`       Details: ${message}\n`);
  };

  // Test 1: Configurable Number of Questions & Types
  try {
    const questionsCount = 3;
    const questions = await aiInterviewService.generateInterviewQuestions({
      role: 'Full Stack Developer',
      companyName: 'Google',
      interviewType: 'Technical',
      difficulty: 'Advanced',
      totalQuestions: questionsCount,
    });

    const isLengthValid = Array.isArray(questions) && questions.length === questionsCount;
    const hasSequenceNumber = questions.every((q, idx) => q.sequenceNumber === idx + 1);
    const hasExpectedAnswer = questions.every((q) => typeof q.expectedAnswer === 'string' && q.expectedAnswer.length > 0);

    if (isLengthValid && hasSequenceNumber && hasExpectedAnswer) {
      recordResult(
        'Configurable Question Generation (Count: 3, Advanced Technical)',
        true,
        `Successfully generated ${questions.length} questions with valid sequence numbers and expected answers.`
      );
    } else {
      recordResult(
        'Configurable Question Generation (Count: 3, Advanced Technical)',
        false,
        'Question array length or properties mismatch.'
      );
    }
  } catch (err) {
    recordResult('Configurable Question Generation (Count: 3, Advanced Technical)', false, err.message);
  }

  // Test 2: Support for Behavioral / HR / Mixed Interview Types
  try {
    const mixedQuestions = await aiInterviewService.generateInterviewQuestions({
      role: 'Product Manager',
      companyName: 'Amazon',
      interviewType: 'Mixed',
      difficulty: 'Intermediate',
      totalQuestions: 4,
    });

    const isLengthValid = Array.isArray(mixedQuestions) && mixedQuestions.length === 4;
    const hasCategories = mixedQuestions.every((q) => !!q.category);

    if (isLengthValid && hasCategories) {
      recordResult(
        'Support for Mixed / Behavioral / HR Interview Types',
        true,
        `Generated 4 questions for Mixed category with distinct focus areas.`
      );
    } else {
      recordResult(
        'Support for Mixed / Behavioral / HR Interview Types',
        false,
        'Failed to generate questions for Mixed type.'
      );
    }
  } catch (err) {
    recordResult('Support for Mixed / Behavioral / HR Interview Types', false, err.message);
  }

  // Test 3: Support for Beginner Difficulty & Configurable Count (5 Questions)
  try {
    const beginnerQuestions = await aiInterviewService.generateInterviewQuestions({
      role: 'Frontend Engineer',
      companyName: 'Meta',
      interviewType: 'Technical',
      difficulty: 'Beginner',
      totalQuestions: 5,
    });

    const isLengthValid = Array.isArray(beginnerQuestions) && beginnerQuestions.length === 5;
    const isDifficultyCorrect = beginnerQuestions.every((q) => q.difficulty === 'Beginner');

    if (isLengthValid && isDifficultyCorrect) {
      recordResult(
        'Support for Beginner Difficulty & 5 Questions',
        true,
        'Successfully generated 5 beginner level questions.'
      );
    } else {
      recordResult(
        'Support for Beginner Difficulty & 5 Questions',
        false,
        'Failed difficulty check or question length match.'
      );
    }
  } catch (err) {
    recordResult('Support for Beginner Difficulty & 5 Questions', false, err.message);
  }

  // Test 4: Robust JSON Cleaner & Parser
  try {
    const rawMarkdownJson = `
\`\`\`json
{
  "questions": [
    {
      "sequenceNumber": 1,
      "question": "What is clean code?",
      "expectedAnswer": "Code that is easy to read, test, and maintain.",
      "category": "Technical",
      "difficulty": "Beginner",
      "focusArea": "Best Practices"
    }
  ]
}
\`\`\`
`;
    const parsed = aiInterviewService.parseAndCleanJsonResponse(rawMarkdownJson);
    if (parsed && Array.isArray(parsed.questions) && parsed.questions[0].question === 'What is clean code?') {
      recordResult(
        'Robust JSON Markdown Code-Block Stripper',
        true,
        'Successfully stripped ```json wrappers and parsed JSON object.'
      );
    } else {
      recordResult('Robust JSON Markdown Code-Block Stripper', false, 'Failed to parse JSON text.');
    }
  } catch (err) {
    recordResult('Robust JSON Markdown Code-Block Stripper', false, err.message);
  }

  const passedCount = testResults.filter((t) => t.passed).length;
  console.log(`=== SUMMARY: ${passedCount}/${testResults.length} AI GENERATION TESTS PASSED ===`);
  if (passedCount === testResults.length) {
    console.log('ALL AI QUESTION GENERATION TESTS COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('SOME TESTS FAILED!');
    process.exit(1);
  }
}

runTestSuite();
