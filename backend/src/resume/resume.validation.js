import { body, param, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Standard Validation Result Handler
 * Extracts field-level validation errors from express-validator and throws a standardized ApiError.badRequest.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    const primaryMessage = errorDetails[0]?.message || 'Validation failed';
    throw ApiError.badRequest(primaryMessage, errorDetails);
  }
  next();
};

/**
 * Maximum allowed file size for resume uploads: 5MB in bytes
 */
export const MAX_RESUME_FILE_SIZE = 5 * 1024 * 1024; // 5 Megabytes

/**
 * Allowed MIME type strictly restricted to PDF documents
 */
export const ALLOWED_MIME_TYPE = 'application/pdf';

/**
 * Custom File Validation Middleware for Resume Uploads
 * Validates file presence, MIME type, file extension, size limit (5MB), and PDF magic bytes.
 */
export const validateResumeFile = (req, res, next) => {
  // Rule 1: Check required file presence
  if (!req.file) {
    return next(
      ApiError.badRequest('Resume file is required. Please upload a PDF document.', [
        { field: 'resume', message: 'Resume file is required' },
      ])
    );
  }

  const { mimetype, originalname, size, buffer } = req.file;

  // Rule 2: Allowed MIME type check
  if (mimetype !== ALLOWED_MIME_TYPE) {
    return next(
      ApiError.badRequest('Invalid file format. Only PDF documents are allowed.', [
        {
          field: 'resume',
          message: `Invalid MIME type '${mimetype}'. Allowed MIME type: application/pdf`,
        },
      ])
    );
  }

  // Rule 3: File extension validation
  if (!originalname.match(/\.pdf$/i)) {
    return next(
      ApiError.badRequest('Invalid file extension. Only .pdf files are allowed.', [
        {
          field: 'resume',
          message: 'File extension must end with .pdf',
        },
      ])
    );
  }

  // Rule 4: Maximum file size validation (5MB max limit)
  if (size > MAX_RESUME_FILE_SIZE) {
    const sizeInMB = (size / (1024 * 1024)).toFixed(2);
    return next(
      ApiError.badRequest(`File size (${sizeInMB}MB) exceeds the maximum allowed limit of 5MB.`, [
        {
          field: 'resume',
          message: `File size must not exceed 5MB (${MAX_RESUME_FILE_SIZE} bytes). Received ${size} bytes.`,
        },
      ])
    );
  }

  // Rule 5: PDF Magic Bytes validation to prevent file spoofing / invalid uploads
  // Valid PDF files MUST begin with the ASCII sequence '%PDF-' (hex: 0x25, 0x50, 0x44, 0x46, 0x2D)
  if (buffer && buffer.length >= 5) {
    const pdfMagicBytes = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]); // '%PDF-'
    const fileHeader = buffer.subarray(0, 5);
    if (!fileHeader.equals(pdfMagicBytes)) {
      return next(
        ApiError.badRequest('Corrupted or invalid PDF file. File content signature failed validation.', [
          {
            field: 'resume',
            message: 'File signature does not match valid PDF header (%PDF-)',
          },
        ])
      );
    }
  }

  next();
};

/**
 * Validation rules for Resume ID URL parameter
 */
export const resumeIdParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid resume ID format'),
  validate,
];

/**
 * Validation rules for updating Resume metadata
 */
export const updateResumeMetadataValidation = [
  body('originalName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Original file name cannot be empty')
    .isLength({ max: 255 })
    .withMessage('File name cannot exceed 255 characters'),
  validate,
];
