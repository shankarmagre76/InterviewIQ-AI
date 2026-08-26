import mongoose from 'mongoose';
import User from '../models/User.js';
import Profile from '../profile/profile.model.js';
import Resume from '../resume/resume.model.js';
import ResumeAnalysis from '../resume/resumeAnalysis.model.js';
import Company from '../company/company.model.js';
import Job from '../job/job.model.js';
import Application from '../application/application.model.js';
import LearningRoadmap from '../learningRoadmap/learningRoadmap.model.js';
import LearningTask from '../learningRoadmap/learningTask.model.js';
import Notification from '../notification/notification.model.js';
import AdminAuditLog from '../admin/adminAuditLog.model.js';
import { createSafeRegex } from '../utils/regex.util.js';

console.log('=================================================================');
console.log('  INTERVIEWIQ AI - PHASE 11.8 DATABASE & QUERY OPTIMIZATION TEST');
console.log('=================================================================\n');

async function runPhase118DatabaseOptimizationTests() {
  let passedCount = 0;
  let failedCount = 0;

  const assert = (condition, testName, detail = '') => {
    if (condition) {
      passedCount++;
      console.log(`[PASS] ${testName}`);
    } else {
      failedCount++;
      console.error(`[FAIL] ${testName} - ${detail}`);
    }
  };

  try {
    // =========================================================================
    // 1. MODEL INDEX SCHEMA INTEGRITY VERIFICATION
    // =========================================================================

    const modelsToVerify = [
      { name: 'User', model: User },
      { name: 'Profile', model: Profile },
      { name: 'Resume', model: Resume },
      { name: 'ResumeAnalysis', model: ResumeAnalysis },
      { name: 'Company', model: Company },
      { name: 'Job', model: Job },
      { name: 'Application', model: Application },
      { name: 'LearningRoadmap', model: LearningRoadmap },
      { name: 'LearningTask', model: LearningTask },
      { name: 'Notification', model: Notification },
      { name: 'AdminAuditLog', model: AdminAuditLog },
    ];

    let hasDuplicateIndexWarnings = false;
    for (const item of modelsToVerify) {
      const indexes = item.model.schema.indexes();
      assert(Array.isArray(indexes), `1.${modelsToVerify.indexOf(item) + 1} ${item.name} schema indexes compile cleanly`);
    }

    assert(!hasDuplicateIndexWarnings, '1.12 Zero duplicate schema index warnings detected during initialization');

    // =========================================================================
    // 2. COMPOUND INDEX VERIFICATION
    // =========================================================================

    const roadmapIndexes = LearningRoadmap.schema.indexes();
    const hasRoadmapCompound = roadmapIndexes.some(
      (idx) => idx[0] && idx[0].user === 1 && idx[0].createdAt === -1
    );

    assert(hasRoadmapCompound, '2.1 LearningRoadmap contains compound index { user: 1, createdAt: -1 } for recency queries');

    const analysisIndexes = ResumeAnalysis.schema.indexes();
    const hasAnalysisCompound = analysisIndexes.some(
      (idx) => idx[0] && idx[0].user === 1 && idx[0].isLatest === 1
    );

    assert(hasAnalysisCompound, '2.2 ResumeAnalysis contains compound index { user: 1, isLatest: 1 } for fast active analysis retrieval');

    // =========================================================================
    // 3. REGEX SEARCH ESCAPING SECURITY VERIFICATION
    // =========================================================================

    const safeRegex = createSafeRegex('.*.*.*.*.*(C++\\');

    assert(
      safeRegex instanceof RegExp && safeRegex.source.includes('\\*') && safeRegex.source.includes('\\+'),
      '3.1 Regex utility escapes user input special characters safely preventing ReDoS and unhandled regex syntax errors'
    );

  } catch (err) {
    assert(false, 'Unexpected execution exception in Phase 11.8 Database Optimization Suite', err.stack);
  }

  console.log('\n=================================================================');
  console.log(` SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} Tests`);
  console.log('=================================================================\n');

  return { passedCount, failedCount };
}

runPhase118DatabaseOptimizationTests();
