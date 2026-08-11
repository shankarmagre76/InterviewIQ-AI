import { execSync } from 'child_process';
import path from 'path';
import fileUrl from 'url';

console.log('=================================================================');
console.log('  INTERVIEWIQ AI - PHASE 10 COMPLETE ADMIN API MASTER TEST SUITE');
console.log('=================================================================\n');

const testSuites = [
  { name: 'Phase 10.1 Admin Authorization', file: 'src/admin/adminAuth.test.js' },
  { name: 'Phase 10.2 User Management', file: 'src/admin/adminUserManagement.test.js' },
  { name: 'Phase 10.3 Company Management', file: 'src/admin/adminCompanyManagement.test.js' },
  { name: 'Phase 10.4 Job Management', file: 'src/admin/adminJobManagement.test.js' },
  { name: 'Phase 10.5 Application Monitoring', file: 'src/admin/adminApplicationMonitoring.test.js' },
  { name: 'Phase 10.6 AI Usage Monitoring', file: 'src/admin/adminAiUsageMonitoring.test.js' },
  { name: 'Phase 10.7 Admin Analytics', file: 'src/admin/adminAnalytics.test.js' },
  { name: 'Phase 10.8 Admin Audit Logging', file: 'src/admin/adminAuditLogging.test.js' },
  { name: 'Phase 10.9 Admin Notifications', file: 'src/admin/adminNotification.test.js' },
];

let totalPassedSuites = 0;

for (const suite of testSuites) {
  console.log(`\n-----------------------------------------------------------------`);
  console.log(` RUNNING: ${suite.name} (${suite.file})`);
  console.log(`-----------------------------------------------------------------`);

  try {
    const output = execSync(`node ${suite.file}`, {
      encoding: 'utf-8',
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'test' },
    });
    console.log(output);
    totalPassedSuites++;
  } catch (err) {
    console.error(`[FAIL] Test suite failed: ${suite.name}`);
    console.error(err.stdout || err.message);
    process.exit(1);
  }
}

console.log('\n=================================================================');
console.log(`  ALL ${totalPassedSuites} / ${testSuites.length} PHASE 10 ADMIN TEST SUITES PASSED 100%!`);
console.log('=================================================================\n');
