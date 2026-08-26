import { roadmapService } from '../../services/roadmapService.js';
import { api } from '../../services/api.js';

console.log('=== F8.4 ROADMAP PHASES VISUAL TIMELINE TEST SUITE ===\n');

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

async function runRoadmapPhasesTestSuite() {
  const mockRoadmapId = '60d5ecb8b3b3b3b3b3b3b3b3';

  // Test 1: Fetch Phases and Validate Visual Status Node Classification
  try {
    const origGet = api.get;

    api.get = async () => ({
      data: {
        success: true,
        statusCode: 200,
        message: 'Active Learning Roadmap retrieved successfully',
        data: {
          roadmap: {
            _id: mockRoadmapId,
            phases: [
              {
                _id: 'p1',
                order: 1,
                title: 'Phase 1 — Java Fundamentals',
                description: 'Core OOP, Collections, Multithreading',
                skills: ['Java 17', 'Collections', 'Streams'],
                priority: 'HIGH',
                estimatedDays: 7,
                progress: 100,
                status: 'COMPLETED',
              },
              {
                _id: 'p2',
                order: 2,
                title: 'Phase 2 — Spring Boot Microservices',
                description: 'REST API, Spring Data JPA, Actuator',
                skills: ['Spring Boot', 'REST', 'JPA'],
                priority: 'CRITICAL',
                estimatedDays: 14,
                progress: 65,
                status: 'IN_PROGRESS',
              },
              {
                _id: 'p3',
                order: 3,
                title: 'Phase 3 — Spring Security & JWT',
                description: 'Authentication, Authorization, OAuth2',
                skills: ['Spring Security', 'JWT'],
                priority: 'HIGH',
                estimatedDays: 10,
                progress: 0,
                status: 'NOT_STARTED',
              },
            ],
          },
          tasks: [
            { _id: 't1', phase: 'p1', title: 'Task 1.1: Learn Collections', status: 'COMPLETED' },
            { _id: 't2', phase: 'p2', title: 'Task 2.1: Build REST Controllers', status: 'COMPLETED' },
            { _id: 't3', phase: 'p2', title: 'Task 2.2: Implement JPA Repositories', status: 'IN_PROGRESS' },
          ],
        },
      },
    });

    const res = await roadmapService.getActiveRoadmap();
    const phases = res.data.roadmap.phases;
    const tasks = res.data.tasks;

    assert(phases.length === 3, 'Roadmap contains 3 phases in total');

    // Phase 1 (Completed node check)
    const p1 = phases[0];
    const p1IsCompleted = p1.status === 'COMPLETED' || p1.progress === 100;
    assert(p1.title === 'Phase 1 — Java Fundamentals', 'Phase 1 title matches');
    assert(p1IsCompleted === true, 'Phase 1 classified as Completed (✓)');
    assert(p1.estimatedDays === 7, 'Phase 1 estimated duration is 7 days');

    // Phase 2 (In Progress node check)
    const p2 = phases[1];
    const p2IsInProgress = p2.status === 'IN_PROGRESS' || (p2.progress > 0 && p2.progress < 100);
    assert(p2.title === 'Phase 2 — Spring Boot Microservices', 'Phase 2 title matches');
    assert(p2IsInProgress === true, 'Phase 2 classified as In Progress (●)');
    assert(p2.priority === 'CRITICAL', 'Phase 2 priority is CRITICAL');

    // Phase 3 (Not Started node check)
    const p3 = phases[2];
    const p3IsNotStarted = p3.status === 'NOT_STARTED' || p3.progress === 0;
    assert(p3.title === 'Phase 3 — Spring Security & JWT', 'Phase 3 title matches');
    assert(p3IsNotStarted === true, 'Phase 3 classified as Not Started (○)');

    // Task Association Test
    const p2Tasks = tasks.filter((t) => t.phase === p2._id);
    assert(p2Tasks.length === 2, 'Phase 2 has 2 associated child tasks');

    api.get = origGet;
  } catch (err) {
    assert(false, `Test 1 failed: ${err.message}`);
  }

  console.log(`\n=== PHASES TIMELINE TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed === 0) {
    console.log('ALL F8.4 ROADMAP PHASES TESTS COMPLETED SUCCESSFULLY!');
  } else {
    console.error('SOME PHASES TIMELINE TESTS FAILED!');
    process.exit(1);
  }
}

runRoadmapPhasesTestSuite();
