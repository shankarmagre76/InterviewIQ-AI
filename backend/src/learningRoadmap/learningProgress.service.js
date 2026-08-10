import {
  learningRoadmapRepository,
  learningTaskRepository,
} from './learningRoadmap.repository.js';
import LearningTask from './learningTask.model.js';
import LearningRoadmap from './learningRoadmap.model.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Dedicated Service Layer for Learning Progress Tracking
 * Manages task lifecycle transitions (start, complete, skip, reopen),
 * phase progress recalculation, overall roadmap progress aggregation,
 * and duplicate operation prevention.
 */
class LearningProgressService {
  /**
   * Helper: Calculate phase progress ratio for a single phase.
   *
   * @param {Array<Object>} phaseTasks - Array of tasks in the target phase
   * @returns {{ progress: number, status: string, completedCount: number, totalCount: number }}
   */
  calculatePhaseProgress(phaseTasks = []) {
    const totalCount = phaseTasks.length;
    if (totalCount === 0) {
      return { progress: 0, status: 'NOT_STARTED', completedCount: 0, totalCount: 0 };
    }

    const completedCount = phaseTasks.filter(
      (t) => t.status === 'COMPLETED' || t.status === 'SKIPPED'
    ).length;

    const progress = Math.max(
      0,
      Math.min(100, Math.round((completedCount / totalCount) * 100))
    );

    let status = 'NOT_STARTED';
    if (progress === 100) {
      status = 'COMPLETED';
    } else if (progress > 0) {
      status = 'IN_PROGRESS';
    }

    return {
      progress,
      status,
      completedCount,
      totalCount,
    };
  }

  /**
   * Helper: Calculate overall roadmap progress across all phases.
   *
   * @param {Array<Object>} phases - Array of roadmap phase objects
   * @returns {{ overallProgress: number, isFullyCompleted: boolean }}
   */
  calculateRoadmapProgress(phases = []) {
    if (!phases || phases.length === 0) {
      return { overallProgress: 0, isFullyCompleted: false };
    }

    const sumProgress = phases.reduce((sum, p) => sum + (p.progress || 0), 0);
    const overallProgress = Math.max(
      0,
      Math.min(100, Math.round(sumProgress / phases.length))
    );

    const isFullyCompleted =
      phases.length > 0 &&
      phases.every((p) => p.status === 'COMPLETED' || p.progress === 100);

    return {
      overallProgress,
      isFullyCompleted,
    };
  }

  /**
   * Core Progress Sync Pipeline: Updates phase and roadmap progress after task state change.
   *
   * @param {string} roadmapId
   * @param {string} targetPhaseId
   * @param {string} userId
   * @returns {Promise<Object>} Summary progress payload
   */
  async syncRoadmapProgress(roadmapId, targetPhaseId, userId) {
    const [roadmap, allTasks] = await Promise.all([
      learningRoadmapRepository.getRoadmapById(roadmapId, userId),
      learningTaskRepository.getRoadmapTasks(roadmapId, userId),
    ]);

    if (!roadmap) {
      throw ApiError.notFound('Roadmap not found for progress synchronization');
    }

    let targetPhaseProgressInfo = { progress: 0, completedCount: 0, totalCount: 0, status: 'NOT_STARTED' };

    const updatedPhases = (roadmap.phases || []).map((phase) => {
      const phaseTasks = allTasks.filter(
        (t) => String(t.phase) === String(phase._id)
      );

      const phaseMetrics = this.calculatePhaseProgress(phaseTasks);

      if (String(phase._id) === String(targetPhaseId)) {
        targetPhaseProgressInfo = phaseMetrics;
      }

      const pObj = phase.toObject ? phase.toObject() : phase;
      return {
        ...pObj,
        progress: phaseMetrics.progress,
        status: phaseMetrics.status,
      };
    });

    const roadmapMetrics = this.calculateRoadmapProgress(updatedPhases);

    let roadmapStatus = roadmap.status;
    if (roadmapMetrics.isFullyCompleted && roadmapStatus === 'ACTIVE') {
      roadmapStatus = 'COMPLETED';
    }

    const updatedRoadmap = await learningRoadmapRepository.updateRoadmap(
      roadmapId,
      userId,
      {
        phases: updatedPhases,
        overallProgress: roadmapMetrics.overallProgress,
        status: roadmapStatus,
      }
    );

    const totalTasksCount = allTasks.length;
    const completedTasksCount = allTasks.filter(
      (t) => t.status === 'COMPLETED' || t.status === 'SKIPPED'
    ).length;

    return {
      roadmapProgress: updatedRoadmap.overallProgress,
      phaseProgress: targetPhaseProgressInfo.progress,
      completedTasks: completedTasksCount,
      totalTasks: totalTasksCount,
      phaseStatus: targetPhaseProgressInfo.status,
      roadmapStatus: updatedRoadmap.status,
    };
  }

  /**
   * 1. Start Task: Transition status to IN_PROGRESS
   */
  async startTask(taskId, userId) {
    const task = await learningTaskRepository.getTaskById(taskId, userId);
    if (!task) {
      throw ApiError.notFound('Learning task not found or access denied');
    }

    if (task.status === 'COMPLETED') {
      throw ApiError.badRequest('Completed task cannot be started. Use reopenTask to reset status.');
    }

    const updatedTask = await learningTaskRepository.updateTask(taskId, userId, {
      status: 'IN_PROGRESS',
    });

    const progressSummary = await this.syncRoadmapProgress(
      updatedTask.roadmap,
      updatedTask.phase,
      userId
    );

    return {
      task: updatedTask,
      progress: progressSummary,
    };
  }

  /**
   * 2. Complete Task: Transition status to COMPLETED & set completedAt timestamp.
   * Prevents duplicate completion triggers idempotently.
   */
  async completeTask(taskId, userId) {
    const task = await learningTaskRepository.getTaskById(taskId, userId);
    if (!task) {
      throw ApiError.notFound('Learning task not found or access denied');
    }

    // Duplicate Completion Idempotency Check
    if (task.status === 'COMPLETED') {
      logger.info(`Task ${taskId} is already COMPLETED. Returning progress idempotently.`);
      const progressSummary = await this.syncRoadmapProgress(
        task.roadmap,
        task.phase,
        userId
      );
      return {
        task,
        progress: progressSummary,
      };
    }

    const updatedTask = await learningTaskRepository.completeTask(taskId, userId);

    const progressSummary = await this.syncRoadmapProgress(
      updatedTask.roadmap,
      updatedTask.phase,
      userId
    );

    return {
      task: updatedTask,
      progress: progressSummary,
    };
  }

  /**
   * 3. Skip Task: Transition status to SKIPPED.
   */
  async skipTask(taskId, userId) {
    const task = await learningTaskRepository.getTaskById(taskId, userId);
    if (!task) {
      throw ApiError.notFound('Learning task not found or access denied');
    }

    const updatedTask = await learningTaskRepository.updateTask(taskId, userId, {
      status: 'SKIPPED',
    });

    const progressSummary = await this.syncRoadmapProgress(
      updatedTask.roadmap,
      updatedTask.phase,
      userId
    );

    return {
      task: updatedTask,
      progress: progressSummary,
    };
  }

  /**
   * 4. Reopen Task: Reset status to IN_PROGRESS and clear completedAt timestamp.
   */
  async reopenTask(taskId, userId) {
    const task = await learningTaskRepository.getTaskById(taskId, userId);
    if (!task) {
      throw ApiError.notFound('Learning task not found or access denied');
    }

    const updatedTask = await learningTaskRepository.updateTask(taskId, userId, {
      status: 'IN_PROGRESS',
      completedAt: null,
    });

    const progressSummary = await this.syncRoadmapProgress(
      updatedTask.roadmap,
      updatedTask.phase,
      userId
    );

    return {
      task: updatedTask,
      progress: progressSummary,
    };
  }
}

export default new LearningProgressService();
export { LearningProgressService };
