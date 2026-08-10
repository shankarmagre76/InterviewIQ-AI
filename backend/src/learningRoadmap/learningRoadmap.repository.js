import mongoose from 'mongoose';
import LearningRoadmap from './learningRoadmap.model.js';
import LearningTask from './learningTask.model.js';

/**
 * Learning Roadmap Repository Layer
 * Handles pure MongoDB / Mongoose queries for LearningRoadmap entity.
 * Contains ZERO business logic.
 */
class LearningRoadmapRepository {
  /**
   * Helper to safely cast string ID to Mongoose ObjectId
   */
  toObjectId(id) {
    if (!id) return null;
    if (id instanceof mongoose.Types.ObjectId) return id;
    if (mongoose.Types.ObjectId.isValid(id)) return new mongoose.Types.ObjectId(id);
    return id;
  }

  /**
   * 1. Create a new LearningRoadmap document in MongoDB.
   *
   * @param {Object} roadmapData - Roadmap document fields
   * @param {import('mongoose').ClientSession} [session=null] - Optional transaction session
   * @returns {Promise<Object>} Created LearningRoadmap document
   */
  async createRoadmap(roadmapData, session = null) {
    const options = session ? { session } : {};
    if (session) {
      const [newRoadmap] = await LearningRoadmap.create([roadmapData], options);
      return newRoadmap;
    }
    return await LearningRoadmap.create(roadmapData);
  }

  /**
   * 2. Find a roadmap by ID enforcing user ownership check.
   *
   * @param {string|mongoose.Types.ObjectId} roadmapId
   * @param {string|mongoose.Types.ObjectId} [userId=null]
   * @returns {Promise<Object|null>} LearningRoadmap document or null
   */
  async getRoadmapById(roadmapId, userId = null) {
    const query = { _id: this.toObjectId(roadmapId) };
    if (userId) {
      query.user = this.toObjectId(userId);
    }
    return await LearningRoadmap.findOne(query);
  }

  /**
   * 3. Find candidate's currently active roadmap.
   *
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<Object|null>} Active LearningRoadmap document or null
   */
  async getActiveRoadmap(userId) {
    return await LearningRoadmap.findOne({
      user: this.toObjectId(userId),
      isActive: true,
      status: 'ACTIVE',
    }).sort({ version: -1 });
  }

  /**
   * 4. Find candidate's historical roadmaps with pagination & status filtering.
   *
   * @param {string|mongoose.Types.ObjectId} userId
   * @param {Object} [options={}] - { page: 1, limit: 10, status: null }
   * @returns {Promise<Object>} Paginated result { roadmaps, pagination }
   */
  async getUserRoadmaps(userId, options = {}) {
    const { page = 1, limit = 10, status = null } = options;
    const skip = (Number(page) - 1) * Number(limit);

    const query = { user: this.toObjectId(userId) };
    if (status) {
      query.status = status;
    }

    const [roadmaps, total] = await Promise.all([
      LearningRoadmap.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      LearningRoadmap.countDocuments(query),
    ]);

    return {
      roadmaps,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    };
  }

  /**
   * 5. Update an existing LearningRoadmap document.
   *
   * @param {string|mongoose.Types.ObjectId} roadmapId
   * @param {string|mongoose.Types.ObjectId} userId
   * @param {Object} updateData
   * @param {Object} [options={ new: true, runValidators: true }]
   * @returns {Promise<Object|null>} Updated LearningRoadmap document
   */
  async updateRoadmap(roadmapId, userId, updateData, options = { new: true, runValidators: true }) {
    return await LearningRoadmap.findOneAndUpdate(
      { _id: this.toObjectId(roadmapId), user: this.toObjectId(userId) },
      updateData,
      options
    );
  }

  /**
   * 6. Archive an active roadmap document.
   *
   * @param {string|mongoose.Types.ObjectId} roadmapId
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<Object|null>} Archived LearningRoadmap document
   */
  async archiveRoadmap(roadmapId, userId) {
    return await LearningRoadmap.findOneAndUpdate(
      { _id: this.toObjectId(roadmapId), user: this.toObjectId(userId) },
      { status: 'ARCHIVED', isActive: false },
      { new: true }
    );
  }

  /**
   * 7. Delete a roadmap document by ID.
   *
   * @param {string|mongoose.Types.ObjectId} roadmapId
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<Object|null>} Deleted LearningRoadmap document
   */
  async deleteRoadmap(roadmapId, userId) {
    return await LearningRoadmap.findOneAndDelete({
      _id: this.toObjectId(roadmapId),
      user: this.toObjectId(userId),
    });
  }
}

/**
 * Learning Task Repository Layer
 * Handles pure MongoDB / Mongoose queries for LearningTask entity.
 * Contains ZERO business logic.
 */
class LearningTaskRepository {
  /**
   * Helper to safely cast string ID to Mongoose ObjectId
   */
  toObjectId(id) {
    if (!id) return null;
    if (id instanceof mongoose.Types.ObjectId) return id;
    if (mongoose.Types.ObjectId.isValid(id)) return new mongoose.Types.ObjectId(id);
    return id;
  }

  /**
   * 1. Create a single LearningTask document.
   *
   * @param {Object} taskData
   * @param {import('mongoose').ClientSession} [session=null]
   * @returns {Promise<Object>} Created LearningTask document
   */
  async createTask(taskData, session = null) {
    const options = session ? { session } : {};
    if (session) {
      const [newTask] = await LearningTask.create([taskData], options);
      return newTask;
    }
    return await LearningTask.create(taskData);
  }

  /**
   * 2. Batch insert multiple LearningTask documents in a single bulk operation.
   * Prevents N+1 database queries.
   *
   * @param {Array<Object>} tasksArray
   * @param {import('mongoose').ClientSession} [session=null]
   * @returns {Promise<Array<Object>>} Array of created LearningTask documents
   */
  async createManyTasks(tasksArray, session = null) {
    const options = session ? { session } : {};
    return await LearningTask.insertMany(tasksArray, options);
  }

  /**
   * 3. Find a task by ID enforcing candidate user ownership check.
   *
   * @param {string|mongoose.Types.ObjectId} taskId
   * @param {string|mongoose.Types.ObjectId} [userId=null]
   * @returns {Promise<Object|null>} LearningTask document or null
   */
  async getTaskById(taskId, userId = null) {
    const query = { _id: this.toObjectId(taskId) };
    if (userId) {
      query.user = this.toObjectId(userId);
    }
    return await LearningTask.findOne(query);
  }

  /**
   * 4. Retrieve tasks for a roadmap or specific phase sorted by order sequence.
   *
   * @param {string|mongoose.Types.ObjectId} roadmapId
   * @param {string|mongoose.Types.ObjectId} [userId=null]
   * @param {Object} [options={}] - { phaseId: null, status: null }
   * @returns {Promise<Array<Object>>} Tasks array sorted by order
   */
  async getRoadmapTasks(roadmapId, userId = null, options = {}) {
    const { phaseId = null, status = null } = options;

    const query = { roadmap: this.toObjectId(roadmapId) };
    if (userId) {
      query.user = this.toObjectId(userId);
    }
    if (phaseId) {
      query.phase = this.toObjectId(phaseId);
    }
    if (status) {
      query.status = status;
    }

    return await LearningTask.find(query).sort({ order: 1 }).lean();
  }

  /**
   * 5. Update an existing LearningTask document.
   *
   * @param {string|mongoose.Types.ObjectId} taskId
   * @param {string|mongoose.Types.ObjectId} userId
   * @param {Object} updateData
   * @param {Object} [options={ new: true, runValidators: true }]
   * @returns {Promise<Object|null>} Updated LearningTask document
   */
  async updateTask(taskId, userId, updateData, options = { new: true, runValidators: true }) {
    return await LearningTask.findOneAndUpdate(
      { _id: this.toObjectId(taskId), user: this.toObjectId(userId) },
      updateData,
      options
    );
  }

  /**
   * 6. Mark a task as COMPLETED and set completedAt timestamp.
   *
   * @param {string|mongoose.Types.ObjectId} taskId
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<Object|null>} Completed LearningTask document
   */
  async completeTask(taskId, userId) {
    return await LearningTask.findOneAndUpdate(
      { _id: this.toObjectId(taskId), user: this.toObjectId(userId) },
      { status: 'COMPLETED', completedAt: new Date() },
      { new: true }
    );
  }

  /**
   * 7. Delete a task document by ID.
   *
   * @param {string|mongoose.Types.ObjectId} taskId
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<Object|null>} Deleted LearningTask document
   */
  async deleteTask(taskId, userId) {
    return await LearningTask.findOneAndDelete({
      _id: this.toObjectId(taskId),
      user: this.toObjectId(userId),
    });
  }

  /**
   * 8. Bulk delete all tasks belonging to a deleted roadmap.
   *
   * @param {string|mongoose.Types.ObjectId} roadmapId
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<Object>} MongoDB deleteMany output { deletedCount }
   */
  async deleteTasksByRoadmap(roadmapId, userId) {
    return await LearningTask.deleteMany({
      roadmap: this.toObjectId(roadmapId),
      user: this.toObjectId(userId),
    });
  }
}

export const learningRoadmapRepository = new LearningRoadmapRepository();
export const learningTaskRepository = new LearningTaskRepository();

export default learningRoadmapRepository;
