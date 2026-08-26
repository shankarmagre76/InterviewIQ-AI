import mongoose from 'mongoose';

/**
 * Allowed Enum Constants for Learning Roadmap & Sub-Phases
 */
export const ROADMAP_STATUSES = ['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'];
export const PHASE_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];
export const PHASE_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

/**
 * Sub-schema for individual Roadmap Learning Phases
 */
const phaseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Phase title is required'],
      trim: true,
      maxlength: [150, 'Phase title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Phase description cannot exceed 1000 characters'],
      default: '',
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    priority: {
      type: String,
      required: [true, 'Phase priority is required'],
      enum: {
        values: PHASE_PRIORITIES,
        message: '{VALUE} is not a valid phase priority (LOW, MEDIUM, HIGH, CRITICAL)',
      },
      default: 'MEDIUM',
      trim: true,
    },
    estimatedDays: {
      type: Number,
      required: [true, 'Estimated days is required'],
      min: [1, 'Estimated days must be at least 1'],
      default: 7,
    },
    order: {
      type: Number,
      required: [true, 'Phase order sequence is required'],
      min: [1, 'Phase order must be at least 1'],
      default: 1,
    },
    progress: {
      type: Number,
      min: [0, 'Phase progress cannot be less than 0'],
      max: [100, 'Phase progress cannot exceed 100'],
      default: 0,
    },
    status: {
      type: String,
      required: [true, 'Phase status is required'],
      enum: {
        values: PHASE_STATUSES,
        message: '{VALUE} is not a valid phase status (NOT_STARTED, IN_PROGRESS, COMPLETED)',
      },
      default: 'NOT_STARTED',
      trim: true,
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

/**
 * Main Learning Roadmap Schema Definition
 */
const learningRoadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    targetRole: {
      type: String,
      required: [true, 'Target role is required'],
      trim: true,
      maxlength: [100, 'Target role cannot exceed 100 characters'],
    },
    title: {
      type: String,
      required: [true, 'Roadmap title is required'],
      trim: true,
      maxlength: [200, 'Roadmap title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Roadmap description cannot exceed 2000 characters'],
      default: '',
    },
    skillGaps: [
      {
        type: String,
        trim: true,
      },
    ],
    phases: [phaseSchema],
    overallProgress: {
      type: Number,
      min: [0, 'Overall progress cannot be less than 0'],
      max: [100, 'Overall progress cannot exceed 100'],
      default: 0,
    },
    status: {
      type: String,
      required: [true, 'Roadmap status is required'],
      enum: {
        values: ROADMAP_STATUSES,
        message: '{VALUE} is not a valid roadmap status (DRAFT, ACTIVE, COMPLETED, ARCHIVED)',
      },
      default: 'ACTIVE',
      trim: true,
    },
    version: {
      type: Number,
      min: [1, 'Roadmap version must be at least 1'],
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    /* ==========================================================================
       AI Provenance & Generator Metadata
       ========================================================================== */
    aiProvider: {
      type: String,
      trim: true,
      default: 'gemini',
    },
    promptVersion: {
      type: String,
      trim: true,
      default: 'v1.0',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
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

// Fast retrieval of user's learning roadmaps sorted chronologically
learningRoadmapSchema.index({ user: 1, createdAt: -1 });

// Fast lookup of active/draft/completed roadmaps per user
learningRoadmapSchema.index({ user: 1, status: 1 });

// Instant query for candidate's currently active roadmap
learningRoadmapSchema.index({ user: 1, isActive: 1 });

// Compound index for role-specific roadmap queries
learningRoadmapSchema.index({ user: 1, targetRole: 1 });

/* ==========================================================================
   Pre-save Hook for Progress Calculation
   ========================================================================== */
learningRoadmapSchema.pre('save', function (next) {
  if (this.phases && this.phases.length > 0) {
    const totalPhaseProgress = this.phases.reduce(
      (sum, phase) => sum + (phase.progress || 0),
      0
    );
    this.overallProgress = Math.round(totalPhaseProgress / this.phases.length);

    // Auto-update main status if all phases are completed
    const allCompleted = this.phases.every(
      (phase) => phase.status === 'COMPLETED' || phase.progress === 100
    );
    if (allCompleted && this.status === 'ACTIVE') {
      this.status = 'COMPLETED';
    }
  }
  next();
});

/* ==========================================================================
   JSON Transformation Cleanups
   ========================================================================== */
learningRoadmapSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const LearningRoadmap =
  mongoose.models.LearningRoadmap ||
  mongoose.model('LearningRoadmap', learningRoadmapSchema);

export default LearningRoadmap;
