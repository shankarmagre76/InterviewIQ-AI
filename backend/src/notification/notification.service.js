import notificationRepository from './notification.repository.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Notification Service Layer
 * Houses business logic for candidate in-app notifications, anti-spam deduplication,
 * priority handling, expiration configuration, multi-channel dispatch extension hooks,
 * and internal domain event triggers.
 */
class NotificationService {
  /**
   * Channel Dispatcher Pipeline Extension Hook.
   * Currently persists IN_APP notifications to MongoDB.
   * Designed so future EMAIL (Nodemailer), PUSH (FCM), or SMS (Twilio) providers can be attached cleanly.
   *
   * @param {Object} notificationDoc - Created Notification Mongoose Document / Object
   * @param {Array<string>} [channels=['IN_APP']] - Target channels
   */
  async dispatchToChannels(notificationDoc, channels = ['IN_APP']) {
    for (const channel of channels) {
      switch (channel) {
        case 'IN_APP':
          // In-app notification already persisted to MongoDB via notificationRepository
          break;
        case 'EMAIL':
          // Future Hook: Send email notification via Nodemailer / SendGrid
          logger.debug(`[EMAIL CHANNEL HOOK] Stubbed email dispatch for notification ${notificationDoc._id}`);
          break;
        case 'PUSH':
          // Future Hook: Send push notification via WebPush / Firebase Cloud Messaging
          logger.debug(`[PUSH CHANNEL HOOK] Stubbed push dispatch for notification ${notificationDoc._id}`);
          break;
        default:
          break;
      }
    }
  }

  /**
   * 1. Create a generic in-app notification with deduplication checks.
   *
   * @param {Object} data - Notification fields
   * @returns {Promise<Object>} Created Notification document
   */
  async createNotification(data) {
    const { user, type, title, message, priority = 'MEDIUM', relatedEntity, relatedEntityId, metadata, expiresAt } = data;

    if (!user || !title || !message) {
      throw ApiError.badRequest('Notification requires user, title, and message fields');
    }

    // Anti-Spam Safeguard: Check for duplicate notification created in last 5 minutes
    if (type && relatedEntityId) {
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
      const duplicate = await notificationRepository.findDuplicate({
        user,
        type,
        relatedEntityId,
        minCreatedAt: fiveMinsAgo,
      });

      if (duplicate) {
        logger.info(`Duplicate notification skipped for user ${user} (Type: ${type}, Entity: ${relatedEntityId})`);
        return duplicate;
      }
    }

    const notif = await notificationRepository.createNotification({
      user,
      type: type || 'SYSTEM',
      title,
      message,
      priority,
      relatedEntity: relatedEntity || null,
      relatedEntityId: relatedEntityId || null,
      metadata: metadata || {},
      expiresAt: expiresAt || null,
      isRead: false,
    });

    // Dispatch to registered channels
    await this.dispatchToChannels(notif, ['IN_APP']);

    return notif;
  }

  /**
   * 2. Retrieve candidate notifications with pagination & filtering.
   */
  async getNotifications(userId, options = {}) {
    if (!userId) {
      throw ApiError.unauthorized('User authentication required');
    }
    return await notificationRepository.getUserNotifications(userId, options);
  }

  /**
   * 3. Retrieve candidate unread notifications & count.
   */
  async getUnreadNotifications(userId, options = {}) {
    if (!userId) {
      throw ApiError.unauthorized('User authentication required');
    }
    return await notificationRepository.getUserNotifications(userId, {
      ...options,
      isRead: false,
    });
  }

  /**
   * 4. Mark single notification as read.
   */
  async markAsRead(notificationId, userId) {
    if (!userId) {
      throw ApiError.unauthorized('User authentication required');
    }
    const notif = await notificationRepository.markAsRead(notificationId, userId);
    if (!notif) {
      throw ApiError.notFound('Notification not found or access denied');
    }
    return notif;
  }

  /**
   * 5. Bulk mark all unread notifications for candidate as read.
   */
  async markAllAsRead(userId) {
    if (!userId) {
      throw ApiError.unauthorized('User authentication required');
    }
    const result = await notificationRepository.markAllAsRead(userId);
    return {
      message: 'All unread notifications marked as read',
      modifiedCount: result.modifiedCount || 0,
    };
  }

  /**
   * 6. Delete a notification document.
   */
  async deleteNotification(notificationId, userId) {
    if (!userId) {
      throw ApiError.unauthorized('User authentication required');
    }
    const notif = await notificationRepository.deleteNotification(notificationId, userId);
    if (!notif) {
      throw ApiError.notFound('Notification not found or access denied');
    }
    return {
      message: 'Notification deleted successfully',
      deletedId: notificationId,
    };
  }

  /* ==========================================================================
     INTERNAL DOMAIN EVENT NOTIFICATION TRIGGERS
     ========================================================================== */

  /** Event 1: AI Learning Roadmap Generated */
  async notifyRoadmapGenerated(userId, roadmapId, title) {
    return await this.createNotification({
      user: userId,
      type: 'ROADMAP_UPDATE',
      title: 'New AI Learning Roadmap Ready',
      message: `Your customized learning path "${title}" has been generated!`,
      priority: 'HIGH',
      relatedEntity: 'LearningRoadmap',
      relatedEntityId: roadmapId,
    });
  }

  /** Event 2: Roadmap Learning Milestone Completed */
  async notifyRoadmapMilestone(userId, roadmapId, milestoneTitle, percentage) {
    return await this.createNotification({
      user: userId,
      type: 'ROADMAP_MILESTONE',
      title: 'Roadmap Milestone Reached!',
      message: `Congratulations! You reached ${percentage}% progress on "${milestoneTitle}".`,
      priority: 'HIGH',
      relatedEntity: 'LearningRoadmap',
      relatedEntityId: roadmapId,
    });
  }

  /** Event 3: Learning Task Due Reminder */
  async notifyTaskDue(userId, taskId, taskTitle) {
    return await this.createNotification({
      user: userId,
      type: 'LEARNING_TASK',
      title: 'Learning Task Reminder',
      message: `Task "${taskTitle}" is scheduled for completion today.`,
      priority: 'MEDIUM',
      relatedEntity: 'LearningTask',
      relatedEntityId: taskId,
    });
  }

  /** Event 4: Learning Task Completed */
  async notifyTaskCompleted(userId, taskId, taskTitle) {
    return await this.createNotification({
      user: userId,
      type: 'LEARNING_TASK',
      title: 'Task Completed',
      message: `Great job! Task "${taskTitle}" has been marked as completed.`,
      priority: 'LOW',
      relatedEntity: 'LearningTask',
      relatedEntityId: taskId,
    });
  }

  /** Event 5: Mock Interview Results Evaluation Ready */
  async notifyInterviewResult(userId, interviewId, overallScore, role) {
    return await this.createNotification({
      user: userId,
      type: 'INTERVIEW_RESULT',
      title: 'Mock Interview Feedback Ready',
      message: `Your evaluation for ${role} mock interview is ready. Overall Score: ${overallScore}/100.`,
      priority: 'URGENT',
      relatedEntity: 'Interview',
      relatedEntityId: interviewId,
      metadata: { overallScore, role },
    });
  }

  /** Event 6: Resume ATS Analysis Completed */
  async notifyResumeAnalysis(userId, analysisId, atsScore) {
    return await this.createNotification({
      user: userId,
      type: 'RESUME_ANALYSIS',
      title: 'Resume ATS Score Ready',
      message: `Your resume received an ATS compatibility score of ${atsScore}/100.`,
      priority: 'HIGH',
      relatedEntity: 'ResumeAnalysis',
      relatedEntityId: analysisId,
      metadata: { atsScore },
    });
  }

  /** Event 7: Resume Score Improvement Detected */
  async notifyResumeImprovement(userId, scoreImprovement) {
    return await this.createNotification({
      user: userId,
      type: 'RESUME_IMPROVEMENT',
      title: 'ATS Score Improved!',
      message: `Your resume ATS score increased by +${scoreImprovement} points after your latest update!`,
      priority: 'MEDIUM',
      relatedEntity: 'Resume',
    });
  }

  /** Event 8: Job Application Status Changed */
  async notifyApplicationStatusChanged(userId, applicationId, newStatus, companyName) {
    return await this.createNotification({
      user: userId,
      type: 'APPLICATION_STATUS',
      title: 'Application Status Update',
      message: `Your job application at ${companyName || 'Target Employer'} was updated to "${newStatus}".`,
      priority: 'URGENT',
      relatedEntity: 'Application',
      relatedEntityId: applicationId,
      metadata: { newStatus, companyName },
    });
  }

  /** Event 9: Application Deadline Approaching */
  async notifyApplicationDeadline(userId, applicationId, jobTitle, companyName) {
    return await this.createNotification({
      user: userId,
      type: 'APPLICATION_DEADLINE',
      title: 'Application Deadline Warning',
      message: `The deadline for ${jobTitle} at ${companyName} is approaching soon!`,
      priority: 'URGENT',
      relatedEntity: 'Application',
      relatedEntityId: applicationId,
    });
  }

  /** Event 10: Missing Skill Gap Identified */
  async notifySkillGapDetected(userId, missingSkills = []) {
    const skillsText = missingSkills.slice(0, 3).join(', ');
    return await this.createNotification({
      user: userId,
      type: 'SKILL_GAP',
      title: 'Skill Gap Identified',
      message: `Analysis detected key missing skills: ${skillsText}. Add them to your learning roadmap!`,
      priority: 'MEDIUM',
      relatedEntity: 'System',
    });
  }
}

export default new NotificationService();
export { NotificationService };
