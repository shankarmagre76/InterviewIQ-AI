import mongoose from 'mongoose';

/**
 * Voice Analytics Aggregation Schema (Scalability for Future Voice Interviews)
 */
const voiceAnalyticsSchema = new mongoose.Schema(
  {
    averageWpm: {
      type: Number,
      min: [0, 'Average WPM cannot be negative'],
      default: 0,
    },
    totalFillerWords: {
      type: Number,
      min: [0, 'Total filler words cannot be negative'],
      default: 0,
    },
    overallClarityScore: {
      type: Number,
      min: [0, 'Clarity score must be between 0 and 100'],
      max: [100, 'Clarity score must be between 0 and 100'],
      default: 0,
    },
    toneAnalysis: {
      type: String,
      trim: true,
      default: 'Neutral',
    },
  },
  { _id: false }
);

/**
 * InterviewResult Schema Definition
 */
const interviewResultSchema = new mongoose.Schema(
  {
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: [true, 'Interview ID is required'],
      unique: true,
    },
    overallScore: {
      type: Number,
      required: [true, 'Overall score is required'],
      min: [0, 'Overall score cannot be less than 0'],
      max: [100, 'Overall score cannot exceed 100'],
      default: 0,
    },
    technicalScore: {
      type: Number,
      min: [0, 'Technical score cannot be less than 0'],
      max: [100, 'Technical score cannot exceed 100'],
      default: 0,
    },
    communicationScore: {
      type: Number,
      min: [0, 'Communication score cannot be less than 0'],
      max: [100, 'Communication score cannot exceed 100'],
      default: 0,
    },
    hrScore: {
      type: Number,
      min: [0, 'HR score cannot be less than 0'],
      max: [100, 'HR score cannot exceed 100'],
      default: 0,
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      trim: true,
      default: '',
      maxlength: [5000, 'Summary cannot exceed 5000 characters'],
    },

    /* ==========================================================================
       Scalability Fields for Future Voice & Video Analytics
       ========================================================================== */
    voiceAnalytics: {
      type: voiceAnalyticsSchema,
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
   Indexes & Constraints for Performance & Data Integrity
   ========================================================================== */

// Unique index: Enforces strictly 1-to-1 relationship between an Interview and its Result
interviewResultSchema.index({ interview: 1 }, { unique: true });

// Performance index for candidate dashboards, leaderboards & score analytics
interviewResultSchema.index({ overallScore: -1 });

/* ==========================================================================
   JSON Transformations
   ========================================================================== */
interviewResultSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const InterviewResult =
  mongoose.models.InterviewResult ||
  mongoose.model('InterviewResult', interviewResultSchema);

export default InterviewResult;
