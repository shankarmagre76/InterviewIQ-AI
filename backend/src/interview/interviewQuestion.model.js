import mongoose from 'mongoose';

/**
 * Speech Metrics Subdocument Schema (Future Voice Interview Support)
 */
const speechMetricsSchema = new mongoose.Schema(
  {
    wpm: {
      type: Number,
      min: [0, 'Words per minute cannot be negative'],
      default: 0,
    },
    fillerWordsCount: {
      type: Number,
      min: [0, 'Filler words count cannot be negative'],
      default: 0,
    },
    confidenceScore: {
      type: Number,
      min: [0, 'Confidence score must be between 0 and 100'],
      max: [100, 'Confidence score must be between 0 and 100'],
      default: 0,
    },
    pauseDurationSeconds: {
      type: Number,
      min: [0, 'Pause duration cannot be negative'],
      default: 0,
    },
  },
  { _id: false }
);

/**
 * Audio Response Subdocument Schema (Future Voice Interview Support)
 */
const audioResponseSchema = new mongoose.Schema(
  {
    userAudioUrl: {
      type: String,
      trim: true,
      default: '',
    },
    questionAudioUrl: {
      type: String,
      trim: true,
      default: '',
    },
    durationSeconds: {
      type: Number,
      min: [0, 'Audio duration cannot be negative'],
      default: 0,
    },
    transcript: {
      type: String,
      trim: true,
      default: '',
    },
    speechMetrics: {
      type: speechMetricsSchema,
      default: () => ({}),
    },
  },
  { _id: false }
);

/**
 * AI Feedback Detail Subdocument Schema
 */
const aiFeedbackSchema = new mongoose.Schema(
  {
    comments: {
      type: String,
      trim: true,
      default: '',
      maxlength: [5000, 'Comments cannot exceed 5000 characters'],
    },
    keyPointsCovered: {
      type: [String],
      default: [],
    },
    keyPointsMissed: {
      type: [String],
      default: [],
    },
    clarityScore: {
      type: Number,
      min: [0, 'Clarity score must be between 0 and 100'],
      max: [100, 'Clarity score must be between 0 and 100'],
      default: 0,
    },
    relevanceScore: {
      type: Number,
      min: [0, 'Relevance score must be between 0 and 100'],
      max: [100, 'Relevance score must be between 0 and 100'],
      default: 0,
    },
  },
  { _id: false }
);

/**
 * InterviewQuestion Schema Definition
 */
const interviewQuestionSchema = new mongoose.Schema(
  {
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: [true, 'Interview ID is required'],
    },
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      maxlength: [2000, 'Question text cannot exceed 2000 characters'],
    },
    answer: {
      type: String,
      trim: true,
      default: '',
      maxlength: [10000, 'Answer text cannot exceed 10000 characters'],
    },
    expectedAnswer: {
      type: String,
      trim: true,
      default: '',
      maxlength: [10000, 'Expected answer text cannot exceed 10000 characters'],
    },
    aiFeedback: {
      type: aiFeedbackSchema,
      default: () => ({}),
    },
    score: {
      type: Number,
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100'],
      default: 0,
    },
    sequenceNumber: {
      type: Number,
      required: [true, 'Sequence number is required'],
      min: [1, 'Sequence number must be at least 1'],
    },

    /* ==========================================================================
       Scalability Fields for Future Voice Interviews
       ========================================================================== */
    audioResponse: {
      type: audioResponseSchema,
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

// Unique compound index: Guarantees unique question ordering per interview session
interviewQuestionSchema.index({ interview: 1, sequenceNumber: 1 }, { unique: true });

// Foreign key lookup index
interviewQuestionSchema.index({ interview: 1 });

/* ==========================================================================
   JSON Transformations
   ========================================================================== */
interviewQuestionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const InterviewQuestion =
  mongoose.models.InterviewQuestion ||
  mongoose.model('InterviewQuestion', interviewQuestionSchema);

export default InterviewQuestion;
