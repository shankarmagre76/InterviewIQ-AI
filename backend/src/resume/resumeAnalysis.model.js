import mongoose from 'mongoose';

/**
 * Section Feedback Detail Subdocument Schema
 * Provides structured evaluations, scores, and specific improvement suggestions for individual resume sections.
 */
const sectionDetailSchema = new mongoose.Schema(
  {
    score: {
      type: Number,
      min: [0, 'Section score cannot be less than 0'],
      max: [100, 'Section score cannot exceed 100'],
      default: 0,
    },
    feedback: {
      type: [String],
      default: [],
    },
    suggestions: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

/**
 * Section Feedback Subdocument Schema
 * Structured breakdown of resume sections (Summary, Experience, Education, Skills, Projects).
 */
const sectionFeedbackSchema = new mongoose.Schema(
  {
    summary: {
      type: sectionDetailSchema,
      default: () => ({}),
    },
    experience: {
      type: sectionDetailSchema,
      default: () => ({}),
    },
    education: {
      type: sectionDetailSchema,
      default: () => ({}),
    },
    skills: {
      type: sectionDetailSchema,
      default: () => ({}),
    },
    projects: {
      type: sectionDetailSchema,
      default: () => ({}),
    },
  },
  { _id: false }
);

/**
 * Token Usage Telemetry Subdocument Schema
 * Tracks LLM API consumption for metrics, billing analytics, and performance optimization.
 */
const tokenUsageSchema = new mongoose.Schema(
  {
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
  },
  { _id: false }
);

/**
 * Resume Analysis Schema
 * Stores AI-generated ATS scores, section-by-section feedback, skill recommendations,
 * prompt versioning, multi-provider telemetry, and candidate re-analysis history.
 */
const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: [true, 'Resume ID is required'],
    },
    atsScore: {
      type: Number,
      required: [true, 'ATS score is required'],
      min: [0, 'ATS score cannot be less than 0'],
      max: [100, 'ATS score cannot exceed 100'],
      default: 0,
    },
    summary: {
      type: String,
      trim: true,
      default: '',
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    recommendedSkills: {
      type: [String],
      default: [],
    },
    grammarFeedback: {
      type: [String],
      default: [],
    },
    formattingFeedback: {
      type: [String],
      default: [],
    },
    keywordFeedback: {
      type: [String],
      default: [],
    },
    sectionFeedback: {
      type: sectionFeedbackSchema,
      default: () => ({}),
    },
    recommendations: {
      type: [String],
      default: [],
    },

    /* ==========================================================================
       AI Provider, Versioning & Telemetry Fields
       ========================================================================== */
    aiProvider: {
      type: String,
      required: [true, 'AI provider name is required'],
      trim: true,
      enum: {
        values: ['Gemini', 'OpenAI', 'Claude', 'DeepSeek', 'Custom'],
        message: '{VALUE} is not a supported AI provider',
      },
      default: 'Gemini',
    },
    aiModel: {
      type: String,
      trim: true,
      default: 'gemini-1.5-pro',
    },
    promptVersion: {
      type: String,
      required: [true, 'Prompt version is required'],
      trim: true,
      default: '1.0.0',
    },
    tokenUsage: {
      type: tokenUsageSchema,
      default: () => ({}),
    },
    isLatest: {
      type: Boolean,
      default: true,
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ==========================================================================
   Indexes for Production Query Performance & Re-Analysis History
   ========================================================================== */

/**
 * Single field indexes for foreign keys
 */
resumeAnalysisSchema.index({ user: 1 });
resumeAnalysisSchema.index({ resume: 1 });

/**
 * Compound Index: Enables fast retrieval of candidate's most recent / active resume analysis.
 */
resumeAnalysisSchema.index({ user: 1, isLatest: 1 });

/**
 * Compound Index: Enables querying re-analysis history for a specific resume version ordered by recency.
 */
resumeAnalysisSchema.index({ resume: 1, createdAt: -1 });

/**
 * Compound Index: Analytics query performance by AI provider and prompt version.
 */
resumeAnalysisSchema.index({ aiProvider: 1, promptVersion: 1 });

/* ==========================================================================
   JSON Transformations
   ========================================================================== */

/**
 * Custom toJSON transformation to remove Mongoose internal version key (__v)
 */
resumeAnalysisSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const ResumeAnalysis =
  mongoose.models.ResumeAnalysis || mongoose.model('ResumeAnalysis', resumeAnalysisSchema);

export default ResumeAnalysis;
