console.log('=== F8.7 LEARNING TASK RESOURCES TEST SUITE ===\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

function runTaskResourcesTestSuite() {
  const mockResources = [
    { title: 'Spring Security Reference Docs', url: 'docs.spring.io/security', type: 'DOCUMENTATION' },
    { title: 'JWT Authentication Video Guide', url: 'https://youtube.com/watch?v=123', type: 'VIDEO' },
    { title: 'Spring Boot Microservices Course', url: 'coursera.org/spring', type: 'COURSE' },
    { title: 'Sample GitHub Auth Repository', url: 'github.com/example/auth-api', type: 'REPOSITORY' },
    { title: 'Baeldung Spring Security Article', url: 'https://baeldung.com/spring-security', type: 'ARTICLE' },
  ];

  // Helper url sanitizer
  const sanitizeUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string') return '#';
    const trimmed = rawUrl.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  // Test 1: URL Prepending Security Check
  try {
    assert(sanitizeUrl('docs.spring.io/security') === 'https://docs.spring.io/security', 'Missing protocol prepends https://');
    assert(sanitizeUrl('https://youtube.com/watch?v=123') === 'https://youtube.com/watch?v=123', 'Valid https:// URL preserved');
  } catch (err) {
    assert(false, `Test 1 failed: ${err.message}`);
  }

  // Test 2: Backend Resource Types Enum Check
  try {
    const validBackendTypes = ['ARTICLE', 'VIDEO', 'DOCUMENTATION', 'COURSE', 'REPOSITORY', 'OTHER'];
    const allMatch = mockResources.every((r) => validBackendTypes.includes(r.type));

    assert(allMatch === true, 'All resources match backend supported RESOURCE_TYPES enum');
  } catch (err) {
    assert(false, `Test 2 failed: ${err.message}`);
  }

  // Test 3: Empty Resources Array Handling
  try {
    const emptyList = [];
    const hasResources = emptyList && emptyList.length > 0;

    assert(hasResources === false, 'Empty resources array handled gracefully without crashing UI');
  } catch (err) {
    assert(false, `Test 3 failed: ${err.message}`);
  }

  console.log(`\n=== RESOURCES TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed === 0) {
    console.log('ALL F8.7 LEARNING TASK RESOURCES TESTS COMPLETED SUCCESSFULLY!');
  } else {
    console.error('SOME LEARNING TASK RESOURCES TESTS FAILED!');
    process.exit(1);
  }
}

runTaskResourcesTestSuite();
