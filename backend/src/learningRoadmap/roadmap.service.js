import {
  learningRoadmapRepository,
  learningTaskRepository,
} from './learningRoadmap.repository.js';
import learningRoadmapAiService from './learningRoadmapAi.service.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Learning Roadmap Business Service Layer
 * Houses all business logic, task progress synchronization formulas,
 * ownership verification, and roadmap lifecycle state transitions.
 * Contains ZERO direct MongoDB queries (delegates to Repository layer).
 */
class RoadmapService {
  /**
   * 1. Generate or Regenerate a personalized AI Learning Roadmap.
   * Archives previous active roadmap, generates fresh curriculum via Gemini AI,
   * and batch-inserts roadmap and associated tasks.
   *
   * @param {string} userId - Authenticated user ID
   * @param {Object} [options={}] - { targetRole: string, forceRegenerate: boolean }
   * @returns {Promise<Object>} Created roadmap payload with embedded tasks
   */
  async generateRoadmap(userId, options = {}) {
    if (!userId) {
      throw ApiError.unauthorized('User authentication required for roadmap generation');
    }

    const result = await learningRoadmapAiService.generateRoadmap(userId, options);
    return result;
  }

  /**
   * 2. Retrieve candidate's currently active roadmap with embedded tasks.
   * Returns clean null payload if no active roadmap exists.
   *
   * @param {string} userId
   * @returns {Promise<Object>} Active roadmap with tasks grouped by phase
   */
  async getActiveRoadmap(userId) {
    if (!userId) {
      throw ApiError.unauthorized('User authentication required');
    }

    const activeRoadmap = await learningRoadmapRepository.getActiveRoadmap(userId);
    if (!activeRoadmap) {
      return {
        roadmap: null,
        tasks: [],
        progress: 0,
      };
    }

    const tasks = await learningTaskRepository.getRoadmapTasks(
      activeRoadmap._id,
      userId
    );

    // Group tasks by phase ID for easy UI rendering
    const phaseTaskMap = {};
    tasks.forEach((task) => {
      const key = String(task.phase);
      if (!phaseTaskMap[key]) {
        phaseTaskMap[key] = [];
      }
      phaseTaskMap[key].push(task);
    });

    const roadmapObj = activeRoadmap.toObject ? activeRoadmap.toObject() : activeRoadmap;
    if (roadmapObj.phases) {
      roadmapObj.phases.forEach((phase) => {
        phase.tasks = phaseTaskMap[String(phase._id)] || [];
      });
    }

    return {
      roadmap: roadmapObj,
      tasks,
      progress: activeRoadmap.overallProgress || 0,
    };
  }

  /**
   * 3. Retrieve specific roadmap by ID enforcing candidate ownership.
   *
   * @param {string} roadmapId
   * @param {string} userId
   * @returns {Promise<Object>} Roadmap document with embedded tasks
   */
  async getRoadmap(roadmapId, userId) {
    if (!userId) {
      throw ApiError.unauthorized('User authentication required');
    }

    const roadmap = await learningRoadmapRepository.getRoadmapById(roadmapId, userId);
    if (!roadmap) {
      throw ApiError.notFound('Learning roadmap not found or access denied');
    }

    const tasks = await learningTaskRepository.getRoadmapTasks(roadmapId, userId);

    const roadmapObj = roadmap.toObject ? roadmap.toObject() : roadmap;
    const phaseTaskMap = {};
    tasks.forEach((task) => {
      const key = String(task.phase);
      if (!phaseTaskMap[key]) {
        phaseTaskMap[key] = [];
      }
      phaseTaskMap[key].push(task);
    });

    if (roadmapObj.phases) {
      roadmapObj.phases.forEach((phase) => {
        phase.tasks = phaseTaskMap[String(phase._id)] || [];
      });
    }

    return {
      roadmap: roadmapObj,
      tasks,
    };
  }

  /**
   * 4. Retrieve candidate's historical roadmaps with pagination.
   *
   * @param {string} userId
   * @param {Object} [options={}] - { page: 1, limit: 10, status: null }
   * @returns {Promise<Object>} Paginated roadmap history
   */
  async getRoadmapHistory(userId, options = {}) {
    if (!userId) {
      throw ApiError.unauthorized('User authentication required');
    }

    return await learningRoadmapRepository.getUserRoadmaps(userId, options);
  }

  /**
   * 5. Synchronize task completion progress across phases and overall roadmap.
   * Recalculates phase completion percentage based on task ratios and updates roadmap overallProgress.
   *
   * @param {string} roadmapId
   * @param {string} userId
   * @returns {Promise<Object>} Updated LearningRoadmap document
   */
  async recalculateProgress(roadmapId, userId) {
    const roadmap = await learningRoadmapRepository.getRoadmapById(roadmapId, userId);
    if (!roadmap) {
      throw ApiError.notFound('Roadmap not found for progress recalculation');
    }

    const allTasks = await learningTaskRepository.getRoadmapTasks(roadmapId, userId);

    let updatedPhases = [];
    if (roadmap.phases && roadmap.phases.length > 0) {
      updatedPhases = roadmap.phases.map((phase) => {
        const phaseTasks = allTasks.filter(
          (t) => String(t.phase) === String(phase._id)
        );

        let phaseProgress = phase.progress || 0;
        let phaseStatus = phase.status || 'NOT_STARTED';

        if (phaseTasks.length > 0) {
          const completedCount = phaseTasks.filter(
            (t) => t.status === 'COMPLETED'
          ).length;
          phaseProgress = Math.round((completedCount / phaseTasks.length) * 100);

          if (phaseProgress === 100) {
            phaseStatus = 'COMPLETED';
          } else if (phaseProgress > 0) {
            phaseStatus = 'IN_PROGRESS';
          } else {
            phaseStatus = 'NOT_STARTED';
          }
        }

        const pObj = phase.toObject ? phase.toObject() : phase;
        return {
          ...pObj,
          progress: Math.max(0, Math.min(100, phaseProgress)),
          status: phaseStatus,
        };
      });
    }

    // Calculate overall roadmap progress as unweighted mean of phase progress
    let overallProgress = 0;
    if (updatedPhases.length > 0) {
      const sumProgress = updatedPhases.reduce(
        (sum, p) => sum + (p.progress || 0),
        0
      );
      overallProgress = Math.round(sumProgress / updatedPhases.length);
    }
    overallProgress = Math.max(0, Math.min(100, overallProgress));

    let roadmapStatus = roadmap.status;
    const allPhasesCompleted =
      updatedPhases.length > 0 &&
      updatedPhases.every((p) => p.status === 'COMPLETED' || p.progress === 100);

    if (allPhasesCompleted && roadmapStatus === 'ACTIVE') {
      roadmapStatus = 'COMPLETED';
    }

    const updatedRoadmap = await learningRoadmapRepository.updateRoadmap(
      roadmapId,
      userId,
      {
        phases: updatedPhases,
        overallProgress,
        status: roadmapStatus,
      }
    );

    logger.info(
      `Recalculated progress for roadmap ${roadmapId}: overallProgress = ${overallProgress}%`
    );
    return updatedRoadmap;
  }

  /**
   * 6. Update roadmap details (title, description, status).
   *
   * @param {string} roadmapId
   * @param {string} userId
   * @param {Object} updateData
   * @returns {Promise<Object>} Updated roadmap document
   */
  async updateRoadmap(roadmapId, userId, updateData) {
    if (!userId) {
      throw ApiError.unauthorized('User authentication required');
    }

    const roadmap = await learningRoadmapRepository.getRoadmapById(roadmapId, userId);
    if (!roadmap) {
      throw ApiError.notFound('Learning roadmap not found or access denied');
    }

    // Protect system-managed fields
    delete updateData.user;
    delete updateData._id;

    const updated = await learningRoadmapRepository.updateRoadmap(
      roadmapId,
      userId,
      updateData
    );

    // Recalculate progress if phases were updated
    if (updateData.phases) {
      return await this.recalculateProgress(roadmapId, userId);
    }

    return updated;
  }

  /**
   * 7. Archive an active roadmap.
   *
   * @param {string} roadmapId
   * @param {string} userId
   * @returns {Promise<Object>} Archived roadmap document
   */
  async archiveRoadmap(roadmapId, userId) {
    if (!userId) {
      throw ApiError.unauthorized('User authentication required');
    }

    const roadmap = await learningRoadmapRepository.getRoadmapById(roadmapId, userId);
    if (!roadmap) {
      throw ApiError.notFound('Learning roadmap not found or access denied');
    }

    return await learningRoadmapRepository.archiveRoadmap(roadmapId, userId);
  }

  /**
   * 8. Delete a roadmap and cascade-delete all child tasks.
   *
   * @param {string} roadmapId
   * @param {string} userId
   * @returns {Promise<Object>} Confirmation payload
   */
  async deleteRoadmap(roadmapId, userId) {
    if (!userId) {
      throw ApiError.unauthorized('User authentication required');
    }

    const roadmap = await learningRoadmapRepository.getRoadmapById(roadmapId, userId);
    if (!roadmap) {
      throw ApiError.notFound('Learning roadmap not found or access denied');
    }

    await Promise.all([
      learningRoadmapRepository.deleteRoadmap(roadmapId, userId),
      learningTaskRepository.deleteTasksByRoadmap(roadmapId, userId),
    ]);

    logger.info(`Deleted roadmap ${roadmapId} and cascade deleted associated learning tasks.`);

    return {
      message: 'Learning roadmap and associated tasks deleted successfully',
      deletedRoadmapId: roadmapId,
    };
  }
}

export default new RoadmapService();
export { RoadmapService };
