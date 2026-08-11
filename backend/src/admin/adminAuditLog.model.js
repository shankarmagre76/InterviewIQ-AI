import mongoose from 'mongoose';

/**
 * Allowed Enum Action Constants for Admin Audit Logs
 */
export const AUDIT_ACTIONS = [
  'CREATE_USER',
  'UPDATE_USER',
  'CHANGE_USER_ROLE',
  'DEACTIVATE_USER',
  'ACTIVATE_USER',
  'DELETE_USER',
  'CREATE_COMPANY',
  'UPDATE_COMPANY',
  'DELETE_COMPANY',
  'CREATE_JOB',
  'UPDATE_JOB',
  'DELETE_JOB',
  'DEACTIVATE_JOB',
  'ACTIVATE_JOB',
  'SEND_NOTIFICATION',
];

/**
 * Allowed Target Types for Admin Audit Logs
 */
export const AUDIT_TARGET_TYPES = ['User', 'Company', 'Job', 'Notification', 'System'];

/**
 * Admin Audit Log Schema Definition
 */
const adminAuditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin user reference is required'],
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Audit action is required'],
      enum: {
        values: AUDIT_ACTIONS,
        message: '{VALUE} is not a valid audit action',
      },
      trim: true,
      index: true,
    },
    targetType: {
      type: String,
      required: [true, 'Target entity type is required'],
      enum: {
        values: AUDIT_TARGET_TYPES,
        message: '{VALUE} is not a valid target type',
      },
      trim: true,
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Audit action description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      trim: true,
      default: '',
    },
    userAgent: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* Single and compound indexes for fast filtering and sorting */
adminAuditLogSchema.index({ createdAt: -1 });
adminAuditLogSchema.index({ action: 1, createdAt: -1 });
adminAuditLogSchema.index({ targetType: 1, targetId: 1 });
adminAuditLogSchema.index({ admin: 1, createdAt: -1 });

adminAuditLogSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const AdminAuditLog =
  mongoose.models.AdminAuditLog || mongoose.model('AdminAuditLog', adminAuditLogSchema);

export default AdminAuditLog;
