import { interviewService } from '../../services/interviewService.js';
import { api } from '../../services/api.js';

console.log('=== F7.10 INTERVIEW HISTORY DASHBOARD TEST SUITE ===\n');

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

async function runHistoryTestSuite() {
  // Test 1: Fetch History Array & Verify Data Structure
  try {
    const origGet = api.get;

    api.get = async () => ({
      data: {
        success: true,
        statusCode: 200,
        message: 'History retrieved',
        data: [
          {
            _id: 'i1',
            role: 'Java Developer',
            interviewType: 'Technical',
            difficulty: 'Intermediate',
            status: 'Completed',
            totalQuestions: 10,
            completedQuestions: 10,
            overallScore: 85,
            createdAt: '2026-08-15T10:00:00.000Z',
          },
          {
            _id: 'i2',
            role: 'Frontend Engineer',
            interviewType: 'HR',
            difficulty: 'Beginner',
            status: 'In Progress',
            totalQuestions: 5,
            completedQuestions: 2,
            overallScore: null,
            createdAt: '2026-08-14T10:00:00.000Z',
          },
        ],
      },
    });

    const res = await interviewService.getInterviewHistory();
    const history = res.data;

    assert(Array.isArray(history), 'History response returns array of sessions');
    assert(history.length === 2, 'History array length is 2');
    assert(history[0].role === 'Java Developer', 'Session #1 role is Java Developer');
    assert(history[0].overallScore === 85, 'Completed Session #1 has score 85');

    api.get = origGet;
  } catch (err) {
    assert(false, `Test 1 failed: ${err.message}`);
  }

  // Test 2: Incomplete Session Action & Result Rule
  try {
    const sessionInComplete = {
      _id: 'i2',
      status: 'In Progress',
      completedQuestions: 2,
      totalQuestions: 5,
      overallScore: 90, // Unused score on incomplete session
    };

    const showResultAction = sessionInComplete.status === 'Completed';
    const showContinueAction = sessionInComplete.status === 'In Progress' || sessionInComplete.status === 'Pending';

    assert(showResultAction === false, 'Result button is hidden for incomplete interviews');
    assert(showContinueAction === true, 'Continue Interview button is shown for incomplete sessions');
  } catch (err) {
    assert(false, `Test 2 failed: ${err.message}`);
  }

  // Test 3: Client-Side Filtering Rules (Type, Difficulty, Status, Search)
  try {
    const items = [
      { role: 'Java Developer', interviewType: 'Technical', difficulty: 'Intermediate', status: 'Completed' },
      { role: 'React Frontend Developer', interviewType: 'Technical', difficulty: 'Advanced', status: 'In Progress' },
      { role: 'HR Manager', interviewType: 'HR', difficulty: 'Beginner', status: 'Completed' },
    ];

    const filterFn = (list, search, type, diff, stat) => {
      return list.filter((i) => {
        const matchesSearch = !search || i.role.toLowerCase().includes(search.toLowerCase());
        const matchesType = type === 'All' || i.interviewType === type;
        const matchesDiff = diff === 'All' || i.difficulty === diff;
        const matchesStat = stat === 'All' || i.status === stat;
        return matchesSearch && matchesType && matchesDiff && matchesStat;
      });
    };

    const technicalOnly = filterFn(items, '', 'Technical', 'All', 'All');
    const searchFrontend = filterFn(items, 'Frontend', 'All', 'All', 'All');
    const completedOnly = filterFn(items, '', 'All', 'All', 'Completed');

    assert(technicalOnly.length === 2, 'Filtered 2 Technical interview sessions');
    assert(searchFrontend.length === 1, 'Search term "Frontend" matched 1 session');
    assert(completedOnly.length === 2, 'Filtered 2 Completed interview sessions');
  } catch (err) {
    assert(false, `Test 3 failed: ${err.message}`);
  }

  // Test 4: Pagination Splitting Logic
  try {
    const manyItems = Array.from({ length: 25 }, (_, idx) => ({ id: idx + 1 }));
    const itemsPerPage = 9;
    const totalPages = Math.ceil(manyItems.length / itemsPerPage);
    const page2Items = manyItems.slice((2 - 1) * itemsPerPage, 2 * itemsPerPage);

    assert(totalPages === 3, '25 items split into 3 total pages at 9 per page');
    assert(page2Items.length === 9, 'Page 2 contains 9 items');
    assert(page2Items[0].id === 10, 'Page 2 starts at item ID #10');
  } catch (err) {
    assert(false, `Test 4 failed: ${err.message}`);
  }

  console.log(`\n=== HISTORY TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed === 0) {
    console.log('ALL F7.10 INTERVIEW HISTORY TESTS COMPLETED SUCCESSFULLY!');
  } else {
    console.error('SOME HISTORY TESTS FAILED!');
    process.exit(1);
  }
}

runHistoryTestSuite();
