import mongoose from 'mongoose';

/**
 * Allowed enum options for Job schema fields
 */
export const WORK_MODES = ['Remote', 'On-site', 'Hybrid'];

export const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Freelance',
];

export const JOB_STATUSES = ['Draft', 'Active', 'Paused', 'Closed', 'Expired'];

export const SALARY_PERIODS = ['Hourly', 'Monthly', 'Yearly'];

/**
 * Experience Sub-schema
 */
const experienceSchema = new mongoose.Schema(
  {
    minYears: {
      type: Number,
      required: [true, 'Minimum experience years is required'],
      min: [0, 'Minimum experience years cannot be negative'],
      max: [50, 'Minimum experience years cannot exceed 50'],
    },
    maxYears: {
      type: Number,
      required: [true, 'Maximum experience years is required'],
      min: [0, 'Maximum experience years cannot be negative'],
      max: [50, 'Maximum experience years cannot exceed 50'],
      validate: {
        validator: function (val) {
          if (typeof this.minYears === 'number') {
            return val >= this.minYears;
          }
          return true;
        },
        message: 'Maximum experience years cannot be less than minimum experience years',
      },
    },
  },
  { _id: false }
);

/**
 * Salary Sub-schema
 */
const salarySchema = new mongoose.Schema(
  {
    min: {
      type: Number,
      default: 0,
      min: [0, 'Salary minimum cannot be negative'],
    },
    max: {
      type: Number,
      default: 0,
      min: [0, 'Salary maximum cannot be negative'],
      validate: {
        validator: function (val) {
          if (this.isDisclosed && typeof this.min === 'number' && this.min > 0 && val > 0) {
            return val >= this.min;
          }
          return true;
        },
        message: 'Maximum salary cannot be less than minimum salary',
      },
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true,
      maxlength: [3, 'Currency code must be 3 characters'],
    },
    period: {
      type: String,
      enum: {
        values: SALARY_PERIODS,
        message: '{VALUE} is not a valid salary period',
      },
      default: 'Yearly',
    },
    isDisclosed: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

/**
 * Job Schema Definition
 */
const jobSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      minlength: [3, 'Job title must be at least 3 characters'],
      maxlength: [150, 'Job title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
      minlength: [20, 'Job description must be at least 20 characters'],
      maxlength: [10000, 'Job description cannot exceed 10,000 characters'],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    requiredSkills: {
      type: [String],
      required: [true, 'At least one required skill must be specified'],
      validate: {
        validator: function (skills) {
          return Array.isArray(skills) && skills.length > 0;
        },
        message: 'At least one required skill must be specified',
      },
    },
    preferredSkills: {
      type: [String],
      default: [],
    },
    experience: {
      type: experienceSchema,
      required: [true, 'Experience requirement is required'],
    },
    salary: {
      type: salarySchema,
      default: () => ({}),
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [150, 'Location cannot exceed 150 characters'],
    },
    workMode: {
      type: String,
      required: [true, 'Work mode is required'],
      enum: {
        values: WORK_MODES,
        message: '{VALUE} is not a valid work mode',
      },
      trim: true,
    },
    employmentType: {
      type: String,
      required: [true, 'Employment type is required'],
      enum: {
        values: EMPLOYMENT_TYPES,
        message: '{VALUE} is not a valid employment type',
      },
      trim: true,
    },
    openings: {
      type: Number,
      default: 1,
      min: [1, 'Openings count must be at least 1'],
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline date is required'],
    },
    status: {
      type: String,
      enum: {
        values: JOB_STATUSES,
        message: '{VALUE} is not a valid job status',
      },
      default: 'Active',
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user ID is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ==========================================================================
   Indexes for Performance Optimization
   ========================================================================== */

jobSchema.index({ company: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ workMode: 1 });
jobSchema.index({ employmentType: 1 });
jobSchema.index({ createdBy: 1 });
jobSchema.index({ requiredSkills: 1 });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ company: 1, status: 1 });
jobSchema.index({ workMode: 1, status: 1 });
jobSchema.index({ employmentType: 1, status: 1 });

jobSchema.index(
  { title: 'text', description: 'text', location: 'text' },
  { weights: { title: 10, location: 5, description: 1 }, name: 'JobTextIndex' }
);

/* ==========================================================================
   Pre-Validation Hooks
   ========================================================================== */

jobSchema.pre('validate', function (next) {
  if (this.responsibilities && Array.isArray(this.responsibilities)) {
    const cleaned = [];
    const seen = new Set();
    for (let item of this.responsibilities) {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        const lower = trimmed.toLowerCase();
        if (trimmed.length > 0 && !seen.has(lower)) {
          seen.add(lower);
          cleaned.push(trimmed);
        }
      }
    }
    this.responsibilities = cleaned;
  }

  if (this.requiredSkills && Array.isArray(this.requiredSkills)) {
    const cleaned = [];
    const seen = new Set();
    for (let skill of this.requiredSkills) {
      if (typeof skill === 'string') {
        const trimmed = skill.trim();
        const lower = trimmed.toLowerCase();
        if (trimmed.length > 0 && !seen.has(lower)) {
          seen.add(lower);
          cleaned.push(trimmed);
        }
      }
    }
    this.requiredSkills = cleaned;
  }

  if (this.preferredSkills && Array.isArray(this.preferredSkills)) {
    const cleaned = [];
    const seen = new Set();
    for (let skill of this.preferredSkills) {
      if (typeof skill === 'string') {
        const trimmed = skill.trim();
        const lower = trimmed.toLowerCase();
        if (trimmed.length > 0 && !seen.has(lower)) {
          seen.add(lower);
          cleaned.push(trimmed);
        }
      }
    }
    this.preferredSkills = cleaned;
  }

  if (this.experience) {
    if (
      typeof this.experience.minYears === 'number' &&
      typeof this.experience.maxYears === 'number' &&
      this.experience.minYears > this.experience.maxYears
    ) {
      this.invalidate(
        'experience.maxYears',
        'Maximum experience years cannot be less than minimum experience years'
      );
    }
  }

  if (this.salary && this.salary.isDisclosed) {
    if (
      typeof this.salary.min === 'number' &&
      typeof this.salary.max === 'number' &&
      this.salary.min > 0 &&
      this.salary.max > 0 &&
      this.salary.min > this.salary.max
    ) {
      this.invalidate(
        'salary.max',
        'Maximum salary cannot be less than minimum salary'
      );
    }
  }

  next();
});

/* ==========================================================================
   JSON Transformations
   ========================================================================== */

jobSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);

export default Job;
