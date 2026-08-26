import mongoose from 'mongoose';

/**
 * SavedJob Schema Definition
 */
const savedJobSchema = new mongoose.Schema(
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
    savedAt: {
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
   Indexes & Constraints for Performance & Data Integrity
   ========================================================================== */

// Strict unique compound index: Prevents duplicate job bookmarks per user
savedJobSchema.index({ user: 1, job: 1 }, { unique: true });

// Single field index for relational lookup
savedJobSchema.index({ job: 1 });

// Compound index for querying user's saved jobs list sorted chronologically
savedJobSchema.index({ user: 1, savedAt: -1 });

/* ==========================================================================
   JSON Transformations
   ========================================================================== */

savedJobSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const SavedJob =
  mongoose.models.SavedJob || mongoose.model('SavedJob', savedJobSchema);

export default SavedJob;
