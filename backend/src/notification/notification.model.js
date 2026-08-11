import mongoose from 'mongoose';

/**
 * Allowed Enum Constants for Notifications
 */
export const NOTIFICATION_TYPES = [
  'LEARNING_TASK',
  'ROADMAP_UPDATE',
  'ROADMAP_MILESTONE',
  'INTERVIEW_RESULT',
  'INTERVIEW_REMINDER',
  'RESUME_ANALYSIS',
  'RESUME_IMPROVEMENT',
  'APPLICATION_STATUS',
  'APPLICATION_DEADLINE',
  'SKILL_GAP',
  'SYSTEM',
];

export const NOTIFICATION_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export const RELATED_ENTITIES = [
  'LearningTask',
  'LearningRoadmap',
  'Interview',
  'Resume',
  'ResumeAnalysis',
  'Application',
  'Job',
  'System',
];

/**
 * Main Notification Schema Definition
 */
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: {
        values: NOTIFICATION_TYPES,
        message: '{VALUE} is not a valid notification type',
      },
      default: 'SYSTEM',
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    priority: {
      type: String,
      required: [true, 'Notification priority is required'],
      enum: {
        values: NOTIFICATION_PRIORITIES,
        message: '{VALUE} is not a valid notification priority',
      },
      default: 'MEDIUM',
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },

    /* ==========================================================================
       Polymorphic Entity Relationship (Dynamic refPath)
       ========================================================================== */
    relatedEntity: {
      type: String,
      enum: {
        values: RELATED_ENTITIES,
        message: '{VALUE} is not a supported related entity',
      },
      trim: true,
      default: null,
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedEntity',
      default: null,
    },

    /* ==========================================================================
       Flexible Metadata Payload & Lifecycle Expiry
       ========================================================================== */
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ==========================================================================
   Production Compound Indexes for High-Performance Inbox Queries
   ========================================================================== */

// 1. Primary index for unread notification count & unread inbox feed
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

// 2. Index for full chronological candidate notification history
notificationSchema.index({ user: 1, createdAt: -1 });

// 3. Index for filtering notifications by type
notificationSchema.index({ user: 1, type: 1, createdAt: -1 });

// 4. Sparse TTL Index for automatic background cleanup of expired notifications
notificationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, sparse: true }
);

/* ==========================================================================
   Pre-save Hook for Lifecycle Read Timestamp Management
   ========================================================================== */
notificationSchema.pre('save', function (next) {
  if (this.isModified('isRead')) {
    if (this.isRead && !this.readAt) {
      this.readAt = new Date();
    } else if (!this.isRead) {
      this.readAt = null;
    }
  }
  next();
});

/* ==========================================================================
   JSON Transformation Cleanups
   ========================================================================== */
notificationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Notification =
  mongoose.models.Notification ||
  mongoose.model('Notification', notificationSchema);

export default Notification;
