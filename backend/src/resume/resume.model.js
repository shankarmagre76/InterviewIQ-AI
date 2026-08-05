import mongoose from 'mongoose';

/**
 * AI Resume Analysis Embedded Subdocument Schema
 * Designed to store structured feedback, ATS scores, extracted skills, and recommendations
 * generated during future AI Resume Analysis execution.
 */
const aiAnalysisSchema = new mongoose.Schema(
  {
    overallScore: {
      type: Number,
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100'],
      default: 0,
    },
    atsScore: {
      type: Number,
      min: [0, 'ATS score cannot be less than 0'],
      max: [100, 'ATS score cannot exceed 100'],
      default: 0,
    },
    summary: {
      type: String,
      trim: true,
      default: '',
    },
    skillsExtracted: {
      type: [String],
      default: [],
    },
    strengths: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
    suggestedRoles: {
      type: [String],
      default: [],
    },
    analyzedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

/**
 * Resume Schema
 * Manages candidate resume documents, Cloudinary storage metadata, single-active status,
 * and future AI resume parsing/analysis integration.
 */
const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
      maxlength: [255, 'Original file name cannot exceed 255 characters'],
    },
    publicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'Resume URL is required'],
      trim: true,
      match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
      min: [1, 'File size must be greater than 0 bytes'],
      max: [5 * 1024 * 1024, 'File size cannot exceed 5MB'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      trim: true,
      enum: {
        values: ['application/pdf'],
        message:
          '{VALUE} is not a supported file type. Only PDF (.pdf) documents are allowed.',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },

    /* ==========================================================================
       Fields for Future AI Resume Analysis & Parsing
       ========================================================================== */
    parsingStatus: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'completed', 'failed'],
        message: '{VALUE} is not a valid parsing status',
      },
      default: 'pending',
      index: true,
    },
    parsedText: {
      type: String,
      trim: true,
      default: '',
      select: false, // Exclude heavy raw text by default to save network bandwidth
    },
    aiAnalysis: {
      type: aiAnalysisSchema,
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
   Indexes for Production Performance & Business Rules
   ========================================================================== */

/**
 * Partial Unique Index: Guarantees a user can have ONLY ONE ACTIVE RESUME at any time.
 * If a user uploads a new resume, previous active resumes are marked isActive: false,
 * retaining upload history while database constraints prevent multiple active resumes.
 */
resumeSchema.index(
  { user: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

/**
 * Compound Index for querying user upload history sorted by recency
 */
resumeSchema.index({ user: 1, createdAt: -1 });

/* ==========================================================================
   JSON Transformations
   ========================================================================== */

/**
 * Custom toJSON transformation to remove Mongoose internal version key (__v)
 */
resumeSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);

export default Resume;
