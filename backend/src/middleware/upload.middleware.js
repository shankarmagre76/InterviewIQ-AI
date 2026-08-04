import multer from 'multer';
import ApiError from '../utils/ApiError.js';

// Memory storage to process file buffer directly in memory for Cloudinary streams
const storage = multer.memoryStorage();

// File filter validating image MIME types (JPEG, JPG, PNG, WEBP)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest('Invalid file format. Only JPEG, JPG, PNG, and WEBP image files are allowed.'),
      false
    );
  }
};

// Multer upload instance restricting file size to 5MB max
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes
  },
  fileFilter,
});

// File filter validating document MIME types (PDF, DOC, DOCX)
const documentFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const allowedExtensions = /\.(pdf|doc|docx)$/i;

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest('Invalid file format. Only PDF, DOC, and DOCX files are allowed.'),
      false
    );
  }
};

const documentUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes
  },
  fileFilter: documentFileFilter,
});

/**
 * Wrapper middleware to handle Multer upload and wrap Multer errors into ApiError instances
 * @param {string} fieldName - Form field name (default: 'profileImage')
 */
export const handleSingleUpload = (fieldName = 'profileImage') => {
  const uploadSingle = upload.single(fieldName);

  return (req, res, next) => {
    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(ApiError.badRequest('File size exceeds 5MB limit. Please upload a smaller image.'));
        }
        return next(ApiError.badRequest(`File upload error: ${err.message}`));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

/**
 * Wrapper middleware to handle single resume/document upload (PDF, DOC, DOCX)
 * @param {string} fieldName - Form field name (default: 'resume')
 */
export const handleResumeUpload = (fieldName = 'resume') => {
  const uploadSingle = documentUpload.single(fieldName);

  return (req, res, next) => {
    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(ApiError.badRequest('File size exceeds 5MB limit. Please upload a smaller file.'));
        }
        return next(ApiError.badRequest(`File upload error: ${err.message}`));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

export default upload;

