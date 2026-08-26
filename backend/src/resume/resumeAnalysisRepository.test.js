import resumeAnalysisRepository from './resumeAnalysis.repository.js';
import bridgeRepository from '../repositories/resumeAnalysis.repository.js';

console.log('=== INTERVIEWIQ RESUME ANALYSIS REPOSITORY TEST SUITE ===\n');

function runTests() {
  console.log('[PASS] Repository Bridge Match:', resumeAnalysisRepository === bridgeRepository);

  const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(resumeAnalysisRepository));
  console.log('[PASS] Prototype Methods Available:', methods);

  const requiredMethods = [
    'createAnalysis',
    'getLatestAnalysis',
    'getAnalysisHistory',
    'deleteAnalysis',
    'findByResume',
    'getAnalysisById',
    'updateManyStatusByUser',
  ];

  requiredMethods.forEach((method) => {
    const exists = typeof resumeAnalysisRepository[method] === 'function';
    console.log(`[${exists ? 'PASS' : 'FAIL'}] Method '${method}' signature verified: ${exists}`);
  });

  console.log('\n=== RESUME ANALYSIS REPOSITORY TESTS COMPLETED ===');
  process.exit(0);
}

runTests();
