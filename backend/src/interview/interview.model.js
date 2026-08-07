import mongoose from 'mongoose';

/**
 * Allowed Enum Options for Interview Model
 */
export const INTERVIEW_TYPES = ['Technical', 'HR', 'Behavioral', 'Mixed'];
export const INTERVIEW_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
export const INTERVIEW_STATUSES = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
export const INTERVIEW_MODES = ['Text', 'Voice', 'Video'];

/**
 * Embedded Sub-schema for Voice Interview Settings (Scalability for Future Voice Interviews)
 */
const voiceSettingsSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      trim: true,
      default: 'en-US',
    },
    voiceId: {
      type: String,
      trim: true,
      default: 'default',
    },
    speechRate: {
      type: Number,
      min: [0.5, 'Speech rate cannot be less than 0.5'],
      max: [2.0, 'Speech rate cannot exceed 2.0'],
      default: 1.0,
    },
    audioQuality: {
      type: String,
      enum: ['standard', 'hd'],
      default: 'standard',
    },
  },
  { _id: false }
);

/**
 * Interview Schema Definition
 */
const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
      maxlength: [100, 'Role name cannot exceed 100 characters'],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    interviewType: {
      type: String,
      required: [true, 'Interview type is required'],
      enum: {
        values: INTERVIEW_TYPES,
        message: '{VALUE} is not a valid interview type',
      },
      default: 'Technical',
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty level is required'],
      enum: {
        values: INTERVIEW_DIFFICULTIES,
        message: '{VALUE} is not a valid difficulty level',
      },
      default: 'Intermediate',
      trim: true,
    },
    status: {
      type: String,
      required: [true, 'Interview status is required'],
      enum: {
        values: INTERVIEW_STATUSES,
        message: '{VALUE} is not a valid interview status',
      },
      default: 'Pending',
      trim: true,
    },
    totalQuestions: {
      type: Number,
      required: [true, 'Total questions count is required'],
      min: [1, 'Total questions must be at least 1'],
      max: [50, 'Total questions cannot exceed 50'],
      default: 5,
    },
    completedQuestions: {
      type: Number,
      min: [0, 'Completed questions cannot be negative'],
      default: 0,
    },
    estimatedDuration: {
      type: Number,
      required: [true, 'Estimated duration is required'],
      min: [1, 'Estimated duration must be at least 1 minute'],
      max: [180, 'Estimated duration cannot exceed 180 minutes'],
      default: 30, // Duration in minutes
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },

    /* ==========================================================================
       Scalability Fields for Future Voice & Video Interviews
       ========================================================================== */
    mode: {
      type: String,
      enum: {
        values: INTERVIEW_MODES,
        message: '{VALUE} is not a supported interview mode',
      },
      default: 'Text',
      trim: true,
    },
    voiceSettings: {
      type: voiceSettingsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ==========================================================================
   Indexes for Production Query Performance
   ========================================================================== */

// Fast retrieval of user's interview history ordered by recency
interviewSchema.index({ user: 1, createdAt: -1 });

// Quick filtering of active/pending interviews for candidate dashboard
interviewSchema.index({ user: 1, status: 1 });

// System analytics index by status and creation date
interviewSchema.index({ status: 1, createdAt: -1 });

// Sparse index for company specific mock interviews
interviewSchema.index({ company: 1 }, { sparse: true });

/* ==========================================================================
   JSON Transformations
   ========================================================================== */
interviewSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Interview =
  mongoose.models.Interview || mongoose.model('Interview', interviewSchema);

export default Interview;
