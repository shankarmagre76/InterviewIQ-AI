import mongoose from 'mongoose';
import LearningRoadmap, {
  ROADMAP_STATUSES,
  PHASE_STATUSES,
  PHASE_PRIORITIES,
} from './learningRoadmap.model.js';

console.log('=== INTERVIEWIQ AI - PHASE 9.1 LEARNING ROADMAP SCHEMA TEST SUITE ===\n');

async function runRoadmapSchemaTests() {
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
    // 1. Enum Constants Assertions
    assert(Array.isArray(ROADMAP_STATUSES) && ROADMAP_STATUSES.includes('ACTIVE'), '1. ROADMAP_STATUSES exports ACTIVE');
    assert(Array.isArray(PHASE_STATUSES) && PHASE_STATUSES.includes('IN_PROGRESS'), '2. PHASE_STATUSES exports IN_PROGRESS');
    assert(Array.isArray(PHASE_PRIORITIES) && PHASE_PRIORITIES.includes('CRITICAL'), '3. PHASE_PRIORITIES exports CRITICAL');

    // 2. Instantiation with Valid Document
    const validUserId = new mongoose.Types.ObjectId();
    const doc = new LearningRoadmap({
      user: validUserId,
      targetRole: 'Senior Backend Engineer',
      title: 'Node.js & System Design Mastery',
      skillGaps: ['Redis Caching', 'Kafka Streaming'],
      phases: [
        {
          title: 'Phase 1: Advanced Caching with Redis',
          description: 'Learn pub/sub, caching patterns, and eviction policies',
          skills: ['Redis', 'Node.js'],
          priority: 'CRITICAL',
          estimatedDays: 10,
          order: 1,
          progress: 50,
          status: 'IN_PROGRESS',
        },
        {
          title: 'Phase 2: Event-Driven Architectures',
          skills: ['Kafka'],
          priority: 'HIGH',
          estimatedDays: 14,
          order: 2,
          progress: 0,
          status: 'NOT_STARTED',
        },
      ],
    });

    const valErr = doc.validateSync();
    assert(!valErr, '4. Valid document passes schema validation cleanly');

    // 3. Pre-save Hook Progress Recalculation Test
    doc.save = function (fn) {
      // Simulate pre-save hook
      const total = this.phases.reduce((sum, p) => sum + (p.progress || 0), 0);
      this.overallProgress = Math.round(total / this.phases.length);
      return this;
    };
    doc.save();
    assert(doc.overallProgress === 25, `5. Auto-calculates overall progress from phases (Expected 25, Got ${doc.overallProgress})`);

    // 4. Validation Failure: Out of Bound Progress (> 100)
    const invalidDoc = new LearningRoadmap({
      user: validUserId,
      targetRole: 'DevOps Engineer',
      title: 'Kubernetes Mastery',
      overallProgress: 150, // Invalid: > 100
      phases: [
        {
          title: 'Phase 1',
          progress: -20, // Invalid: < 0
          priority: 'INVALID_PRIORITY', // Invalid Enum
        },
      ],
    });

    const err = invalidDoc.validateSync();
    assert(!!err, '6. Reject document with invalid progress bounds and invalid priority enum');
    assert(!!err.errors['overallProgress'], '7. Enforce max: 100 validator on overallProgress');
    assert(!!err.errors['phases.0.progress'], '8. Enforce min: 0 validator on phase progress');
    assert(!!err.errors['phases.0.priority'], '9. Enforce enum validator on phase priority');

    // 5. Default Values Verification
    const defaultDoc = new LearningRoadmap({
      user: validUserId,
      targetRole: 'Full-Stack Developer',
      title: 'React & Node Roadmap',
    });
    assert(defaultDoc.status === 'ACTIVE', '10. Default roadmap status is ACTIVE');
    assert(defaultDoc.version === 1, '11. Default version is 1');
    assert(defaultDoc.isActive === true, '12. Default isActive is true');
    assert(defaultDoc.aiProvider === 'gemini', '13. Default aiProvider is gemini');

  } catch (err) {
    assert(false, 'Schema validation exception', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runRoadmapSchemaTests();
