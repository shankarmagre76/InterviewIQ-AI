import mongoose from 'mongoose';

/**
 * Allowed Enum Constants for Learning Tasks & Resources
 */
export const TASK_TYPES = [
  'LEARNING',
  'PRACTICE',
  'PROJECT',
  'CODING',
  'INTERVIEW',
  'REVIEW',
];
export const TASK_STATUSES = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
  'SKIPPED',
];
export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const RESOURCE_TYPES = [
  'ARTICLE',
  'VIDEO',
  'DOCUMENTATION',
  'COURSE',
  'REPOSITORY',
  'OTHER',
];

/**
 * Standard URL Regex Pattern
 */
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;

/**
 * Sub-schema for Structured Task Learning Resources
 */
const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      maxlength: [150, 'Resource title cannot exceed 150 characters'],
    },
    url: {
      type: String,
      required: [true, 'Resource URL is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return URL_REGEX.test(v);
        },
        message: (props) => `${props.value} is not a valid resource URL`,
      },
    },
    type: {
      type: String,
      enum: {
        values: RESOURCE_TYPES,
        message: '{VALUE} is not a valid resource type',
      },
      default: 'ARTICLE',
      trim: true,
    },
  },
  { _id: true }
);

/**
 * Main Learning Task Schema Definition
 */
const learningTaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    roadmap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningRoadmap',
      required: [true, 'Learning Roadmap reference is required'],
    },
    phase: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Roadmap Phase reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Task title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Task description cannot exceed 2000 characters'],
      default: '',
    },
    type: {
      type: String,
      required: [true, 'Task type is required'],
      enum: {
        values: TASK_TYPES,
        message: '{VALUE} is not a valid task type (LEARNING, PRACTICE, PROJECT, CODING, INTERVIEW, REVIEW)',
      },
      default: 'LEARNING',
      trim: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    priority: {
      type: String,
      required: [true, 'Task priority is required'],
      enum: {
        values: TASK_PRIORITIES,
        message: '{VALUE} is not a valid task priority (LOW, MEDIUM, HIGH, CRITICAL)',
      },
      default: 'MEDIUM',
      trim: true,
    },
    estimatedMinutes: {
      type: Number,
      required: [true, 'Estimated duration in minutes is required'],
      min: [1, 'Estimated minutes must be at least 1'],
      max: [1440, 'Estimated minutes cannot exceed 1440 (24 hours)'],
      default: 30,
    },
    resources: [resourceSchema],
    status: {
      type: String,
      required: [true, 'Task status is required'],
      enum: {
        values: TASK_STATUSES,
        message: '{VALUE} is not a valid task status (NOT_STARTED, IN_PROGRESS, COMPLETED, SKIPPED)',
      },
      default: 'NOT_STARTED',
      trim: true,
    },
    order: {
      type: Number,
      required: [true, 'Task order index is required'],
      min: [1, 'Task order index must be at least 1'],
      default: 1,
    },
    completedAt: {
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
   Production Compound Indexes
   ========================================================================== */

// Ordered task list retrieval for a specific roadmap phase
learningTaskSchema.index({ user: 1, roadmap: 1, phase: 1, order: 1 });

// Instant calculation of phase completion stats per roadmap
learningTaskSchema.index({ roadmap: 1, status: 1 });

// Fast querying of candidate active/pending learning tasks
learningTaskSchema.index({ user: 1, status: 1, createdAt: -1 });

/* ==========================================================================
   Pre-save Hook for Lifecycle & Timestamp Management
   ========================================================================== */
learningTaskSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'COMPLETED' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'COMPLETED') {
      this.completedAt = null;
    }
  }
  next();
});

/* ==========================================================================
   JSON Transformation Cleanups
   ========================================================================== */
learningTaskSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const LearningTask =
  mongoose.models.LearningTask ||
  mongoose.model('LearningTask', learningTaskSchema);

export default LearningTask;
