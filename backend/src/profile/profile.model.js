import mongoose from 'mongoose';

/**
 * Skill Subdocument Schema
 */
const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      maxlength: [50, 'Skill name cannot exceed 50 characters'],
    },
    level: {
      type: String,
      required: [true, 'Skill level is required'],
      enum: {
        values: ['Beginner', 'Intermediate', 'Advanced'],
        message: '{VALUE} is not a valid skill level. Allowed levels: Beginner, Intermediate, Advanced',
      },
      default: 'Beginner',
      trim: true,
    },
  },
  { _id: true }
);

/**
 * Education Subdocument Schema
 */
const educationSchema = new mongoose.Schema(
  {
    institute: {
      type: String,
      required: [true, 'Institute / College name is required'],
      trim: true,
      maxlength: [100, 'Institute name cannot exceed 100 characters'],
    },
    degree: {
      type: String,
      required: [true, 'Degree name is required'],
      trim: true,
      maxlength: [100, 'Degree name cannot exceed 100 characters'],
    },
    branch: {
      type: String,
      trim: true,
      maxlength: [100, 'Branch / Specialization cannot exceed 100 characters'],
      default: '',
    },
    cgpa: {
      type: Number,
      min: [0, 'CGPA / Grade score cannot be negative'],
      max: [100, 'CGPA / Grade score cannot exceed 100'],
      default: null,
    },
    startYear: {
      type: Number,
      required: [true, 'Start year is required'],
      min: [1950, 'Start year must be 1950 or later'],
      max: [2100, 'Start year is invalid'],
    },
    endYear: {
      type: Number,
      min: [1950, 'End year must be 1950 or later'],
      max: [2100, 'End year is invalid'],
      default: null,
    },
    current: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

/**
 * Pre-validate hook for Education subdocument to ensure endYear is not before startYear
 */
educationSchema.pre('validate', function (next) {
  if (this.startYear && this.endYear && !this.current) {
    if (this.endYear < this.startYear) {
      return next(new Error('End year cannot be prior to start year'));
    }
  }
  next();
});

/**
 * Profile Schema
 * Establishes a one-to-one relationship with the User model to store extended user profile information.
 */
const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for profile creation'],
      unique: true,
      index: true,
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
      default: '',
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    headline: {
      type: String,
      trim: true,
      maxlength: [100, 'Headline cannot exceed 100 characters'],
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    gender: {
      type: String,
      enum: {
        values: ['Male', 'Female', 'Other', 'Prefer not to say', ''],
        message: '{VALUE} is not a valid gender choice',
      },
      default: 'Prefer not to say',
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    currentLocation: {
      type: String,
      trim: true,
      maxlength: [100, 'Current location cannot exceed 100 characters'],
      default: '',
    },
    preferredLocation: {
      type: String,
      trim: true,
      maxlength: [100, 'Preferred location cannot exceed 100 characters'],
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    profileImage: {
      type: String,
      trim: true,
      default: '',
    },
    skills: {
      type: [skillSchema],
      default: [],
    },
    education: {
      type: [educationSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ==========================================================================
   Indexes for Production Performance Optimization
   ========================================================================== */

// Single field unique index to enforce 1-to-1 relationship with User
profileSchema.index({ user: 1 }, { unique: true });

// Compound index on first name and last name for fast candidate name search
profileSchema.index({ firstName: 1, lastName: 1 });

// Single field index for filtering profiles by location
profileSchema.index({ currentLocation: 1 });

// Multikey index for querying candidate profiles by skill name
profileSchema.index({ 'skills.name': 1 });

// Multikey index for querying candidate profiles by institute name
profileSchema.index({ 'education.institute': 1 });

/* ==========================================================================
   Pre-Validation Hooks
   ========================================================================== */

/**
 * Pre-validate hook to prevent duplicate skills (case-insensitive) in the skills array
 */
profileSchema.pre('validate', function (next) {
  if (this.skills && Array.isArray(this.skills)) {
    const seenSkills = new Set();
    for (const skill of this.skills) {
      if (skill.name) {
        const normalizedName = skill.name.trim().toLowerCase();
        if (seenSkills.has(normalizedName)) {
          return next(new Error(`Duplicate skill "${skill.name.trim()}" is not allowed.`));
        }
        seenSkills.add(normalizedName);
      }
    }
  }
  next();
});

/* ==========================================================================
   Virtual Properties
   ========================================================================== */

/**
 * Virtual getter for computing Profile Full Name on the fly
 */
profileSchema.virtual('fullName').get(function () {
  if (this.firstName || this.lastName) {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
  return '';
});

/* ==========================================================================
   JSON Transformations
   ========================================================================== */

/**
 * Custom toJSON transformation to remove Mongoose internal version key (__v)
 */
profileSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);

export default Profile;
