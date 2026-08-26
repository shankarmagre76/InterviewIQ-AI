import mongoose from 'mongoose';

/**
 * Allowed enum options for Company schema fields
 */
export const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

export const HIRING_STATUSES = ['Actively Hiring', 'Hiring Freeze', 'Not Hiring', 'Closed'];

export const INDUSTRIES = [
  'Information Technology',
  'Software Development',
  'Finance',
  'Healthcare',
  'E-commerce',
  'EdTech',
  'AI/ML',
  'Cybersecurity',
  'Fintech',
  'Telecommunications',
  'Other',
];

/**
 * Social Links Embedded Sub-schema (without separate _id)
 */
const socialLinksSchema = new mongoose.Schema(
  {
    linkedin: {
      type: String,
      trim: true,
      default: '',
    },
    twitter: {
      type: String,
      trim: true,
      default: '',
    },
    facebook: {
      type: String,
      trim: true,
      default: '',
    },
    glassdoor: {
      type: String,
      trim: true,
      default: '',
    },
    github: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

/**
 * Company Schema Definition
 */
const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Company name must be at least 2 characters'],
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    companyLogo: {
      type: String,
      trim: true,
      default: '',
    },
    website: {
      type: String,
      required: [true, 'Company website URL is required'],
      trim: true,
      match: [
        /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
        'Please provide a valid website URL',
      ],
    },
    description: {
      type: String,
      required: [true, 'Company description is required'],
      trim: true,
      minlength: [10, 'Company description must be at least 10 characters'],
      maxlength: [2000, 'Company description cannot exceed 2000 characters'],
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
      enum: {
        values: INDUSTRIES,
        message: '{VALUE} is not a valid industry choice',
      },
    },
    headquarters: {
      type: String,
      required: [true, 'Headquarters location is required'],
      trim: true,
      maxlength: [150, 'Headquarters location cannot exceed 150 characters'],
    },
    locations: {
      type: [String],
      default: [],
    },
    companySize: {
      type: String,
      required: [true, 'Company size is required'],
      trim: true,
      enum: {
        values: COMPANY_SIZES,
        message: '{VALUE} is not a valid company size range',
      },
    },
    foundedYear: {
      type: Number,
      required: [true, 'Founded year is required'],
      min: [1800, 'Founded year must be 1800 or later'],
      max: [new Date().getFullYear(), 'Founded year cannot be in the future'],
    },
    email: {
      type: String,
      required: [true, 'Company contact email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid contact email address',
      ],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    socialLinks: {
      type: socialLinksSchema,
      default: {},
    },
    hiringStatus: {
      type: String,
      enum: {
        values: HIRING_STATUSES,
        message: '{VALUE} is not a valid hiring status',
      },
      default: 'Actively Hiring',
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
   Indexes for Production Query Performance Optimization
   ========================================================================== */

// Single field index for querying companies owned/created by a user/recruiter
companySchema.index({ createdBy: 1 });

// Single field index for filtering by industry
companySchema.index({ industry: 1 });

// Single field index for filtering by active hiring status
companySchema.index({ hiringStatus: 1 });

// Multikey index for searching companies operating in specific office locations
companySchema.index({ locations: 1 });

// Compound index for filtering active hiring companies by industry
companySchema.index({ industry: 1, hiringStatus: 1 });

/* ==========================================================================
   Pre-Validation Hooks
   ========================================================================== */

/**
 * Pre-validate hook to clean and deduplicate locations array elements
 */
companySchema.pre('validate', function (next) {
  if (this.locations && Array.isArray(this.locations)) {
    const cleanedLocations = [];
    const seen = new Set();

    for (let loc of this.locations) {
      if (typeof loc === 'string') {
        const trimmedLoc = loc.trim();
        const lower = trimmedLoc.toLowerCase();
        if (trimmedLoc.length > 0 && !seen.has(lower)) {
          seen.add(lower);
          cleanedLocations.push(trimmedLoc);
        }
      }
    }
    this.set('locations', cleanedLocations);
  }
  next();
});

/* ==========================================================================
   JSON Transformations
   ========================================================================== */

/**
 * Custom toJSON transformation to remove internal version key (__v)
 */
companySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Company = mongoose.models.Company || mongoose.model('Company', companySchema);

export default Company;
