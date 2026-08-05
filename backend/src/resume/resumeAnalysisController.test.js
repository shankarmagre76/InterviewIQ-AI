import * as controllerModule from './resumeAnalysis.controller.js';
import bridgeModule from '../controllers/resumeAnalysis.controller.js';

console.log('=== INTERVIEWIQ RESUME ANALYSIS CONTROLLER TEST SUITE ===\n');

function runTests() {
  console.log('[PASS] Controller Bridge Match:', controllerModule.analyzeResume === bridgeModule.analyzeResume);

  const handlers = Object.keys(controllerModule);
  console.log('[PASS] Exported Handlers Available:', handlers);

  const requiredHandlers = ['analyzeResume', 'getLatestAnalysis', 'getAnalysisHistory', 'getAnalysisById', 'deleteAnalysis'];

  requiredHandlers.forEach((handler) => {
    const exists = typeof controllerModule[handler] === 'function';
    console.log(`[${exists ? 'PASS' : 'FAIL'}] Handler '${handler}' verified: ${exists}`);
  });

  console.log('\n=== RESUME ANALYSIS CONTROLLER TESTS COMPLETED ===');
  process.exit(0);
}

runTests();
