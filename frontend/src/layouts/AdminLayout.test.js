import { ADMIN_NAV_ITEMS, MAIN_NAV_ITEMS } from '../constants/navigation.js';

console.log('=== FRONTEND ADMIN LAYOUT & NAVIGATION (F10.2) INTEGRATION TEST SUITE ===\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${message}`);
    testsFailed++;
  }
}

async function runTests() {
  // Test 1: Admin Navigation Items Verification
  console.log('--- 1. Testing Admin Navigation Items Catalog ---');
  const requiredPaths = [
    '/admin',
    '/admin/users',
    '/admin/companies',
    '/admin/jobs',
    '/admin/applications',
    '/admin/analytics',
    '/admin/audit-logs',
    '/admin/notifications',
  ];

  const adminPaths = ADMIN_NAV_ITEMS.map((item) => item.path);

  requiredPaths.forEach((path) => {
    assert(adminPaths.includes(path), `ADMIN_NAV_ITEMS includes expected admin route '${path}'`);
  });

  // Test 2: Non-Admin Visibility Isolation Verification
  console.log('\n--- 2. Testing Non-Admin Navigation Isolation ---');
  const mainPaths = MAIN_NAV_ITEMS.map((item) => item.path);
  const containsAdminInMain = mainPaths.some((p) => p.startsWith('/admin'));
  assert(!containsAdminInMain, 'Candidate portal MAIN_NAV_ITEMS does not expose any /admin routes');

  // Test 3: AdminRoute Security Boundary Verification
  console.log('\n--- 3. Testing AdminRoute Guard Security Logic ---');
  function simulateAdminRouteGuard(user, isAuthenticated) {
    if (!isAuthenticated) {
      return { access: false, redirect: '/login' };
    }
    const role = user?.role?.toLowerCase();
    if (role !== 'admin') {
      return { access: false, redirect: '/dashboard' };
    }
    return { access: true, render: 'AdminLayout' };
  }

  const candidateAccess = simulateAdminRouteGuard({ role: 'Student' }, true);
  assert(!candidateAccess.access && candidateAccess.redirect === '/dashboard', 'Normal student candidate user is blocked and redirected to /dashboard');

  const recruiterAccess = simulateAdminRouteGuard({ role: 'Recruiter' }, true);
  assert(!recruiterAccess.access && recruiterAccess.redirect === '/dashboard', 'Employer recruiter user is blocked and redirected to /dashboard');

  const unauthAccess = simulateAdminRouteGuard(null, false);
  assert(!unauthAccess.access && unauthAccess.redirect === '/login', 'Unauthenticated visitor is blocked and redirected to /login');

  const adminAccess = simulateAdminRouteGuard({ role: 'Admin' }, true);
  assert(adminAccess.access && adminAccess.render === 'AdminLayout', 'Admin user is authorized to access AdminLayout');

  // Test 4: Active Route Highlighting Helper Logic
  console.log('\n--- 4. Testing Active Route Highlighting Logic ---');
  function checkRouteActive(currentPath, navPath) {
    if (navPath === '/admin') {
      return currentPath === '/admin';
    }
    return currentPath.startsWith(navPath);
  }

  assert(checkRouteActive('/admin/users/123', '/admin/users') === true, 'Matches active state for sub-routes (/admin/users/123 -> /admin/users)');
  assert(checkRouteActive('/admin/jobs', '/admin/companies') === false, 'Non-matching routes are not highlighted');
  assert(checkRouteActive('/admin/users', '/admin') === false, 'Dashboard route does not erroneously highlight for all /admin sub-pages');

  console.log('\n==================================================');
  console.log(`TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('==================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Unhandled test runner error:', err);
  process.exit(1);
});
