import app from '../app.js';
import companyRoutes from '../company/company.routes.js';
import jobRoutes from '../job/job.routes.js';
import applicationRoutes from '../application/application.routes.js';
import savedJobRoutes from '../savedJob/savedJob.routes.js';

console.log('=== INTERVIEWIQ AI - ROUTES & AUTHORIZATION INTEGRATION TEST SUITE ===\n');

function runRoutesIntegrationTests() {
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
    assert(typeof app === 'function', '1. Express application instance exported from src/app.js');
    assert(typeof companyRoutes === 'function', '2. Company Express router exported');
    assert(typeof jobRoutes === 'function', '3. Job Express router exported');
    assert(typeof applicationRoutes === 'function', '4. Application Express router exported');
    assert(typeof savedJobRoutes === 'function', '5. SavedJob Express router exported');

    // Inspect Express router stack to verify mounted endpoints
    const routesStack = app._router.stack;
    const indexRouteLayer = routesStack.find((layer) => layer.name === 'router');

    assert(
      !!indexRouteLayer,
      '6. Main API router mounted successfully in Express app middleware pipeline'
    );
  } catch (err) {
    assert(false, 'Routes integration verification', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runRoutesIntegrationTests();
