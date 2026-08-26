import mongoose from 'mongoose';

/**
 * Allowed enum options for Application status
 */
export const APPLICATION_STATUSES = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview Scheduled',
  'Technical Round',
  'HR Round',
  'Offered',
  'Rejected',
  'Withdrawn',
];

/**
 * Feedback Embedded Sub-schema
 */
const feedbackSchema = new mongoose.Schema(
  {
    comments: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Feedback comments cannot exceed 2000 characters'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
    },
    givenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: false }
);

/**
 * Application Schema Definition
 */
const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: [true, 'Resume ID is required'],
    },
    coverLetter: {
      type: String,
      trim: true,
      default: '',
      maxlength: [5000, 'Cover letter cannot exceed 5000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: APPLICATION_STATUSES,
        message: '{VALUE} is not a valid application status',
      },
      default: 'Applied',
      trim: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    interviewDate: {
      type: Date,
      default: null,
    },
    recruiterNotes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [3000, 'Recruiter notes cannot exceed 3000 characters'],
    },
    feedback: {
      type: feedbackSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ==========================================================================
   Indexes & Constraints for Performance & Data Integrity
   ========================================================================== */

// Strict unique constraint: One candidate user can apply only ONCE per job
applicationSchema.index({ user: 1, job: 1 }, { unique: true });

// Single field indexes for relational lookups
applicationSchema.index({ job: 1 });
applicationSchema.index({ company: 1 });
applicationSchema.index({ status: 1 });

// Compound indexes for common recruiter & candidate dashboard query workflows
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ company: 1, status: 1 });
applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ status: 1, appliedAt: -1 });

/* ==========================================================================
   JSON Transformations
   ========================================================================== */

applicationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Application =
  mongoose.models.Application || mongoose.model('Application', applicationSchema);

export default Application;
