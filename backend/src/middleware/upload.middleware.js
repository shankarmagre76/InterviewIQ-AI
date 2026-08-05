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

// File filter validating PDF documents ONLY & rejecting Images, DOC, ZIP, Executables
const pdfResumeFileFilter = (req, file, cb) => {
  const mimetype = (file.mimetype || '').toLowerCase();
  const originalname = (file.originalname || '').toLowerCase();

  // 1. Reject Images
  if (mimetype.startsWith('image/') || originalname.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/)) {
    return cb(
      ApiError.badRequest('Image files are not allowed. Please upload a PDF document.'),
      false
    );
  }

  // 2. Reject Word / DOC / DOCX documents
  if (
    mimetype.includes('msword') ||
    mimetype.includes('wordprocessingml') ||
    originalname.match(/\.(doc|docx)$/)
  ) {
    return cb(
      ApiError.badRequest('Word (.doc/.docx) files are not allowed. Only PDF documents are allowed.'),
      false
    );
  }

  // 3. Reject ZIP / Archives
  if (
    mimetype.includes('zip') ||
    mimetype.includes('compressed') ||
    mimetype.includes('tar') ||
    originalname.match(/\.(zip|rar|7z|tar|gz|bz2)$/)
  ) {
    return cb(
      ApiError.badRequest('ZIP and compressed archives are not allowed. Only PDF documents are allowed.'),
      false
    );
  }

  // 4. Reject Executables and Scripts
  if (
    mimetype.includes('executable') ||
    mimetype.includes('x-msdownload') ||
    originalname.match(/\.(exe|sh|bat|cmd|bin|msi|jar|ps1|vbs|app)$/)
  ) {
    return cb(
      ApiError.badRequest('Executable and script files are strictly forbidden.'),
      false
    );
  }

  // 5. Allow PDF ONLY
  if (mimetype === 'application/pdf' && originalname.endsWith('.pdf')) {
    return cb(null, true);
  }

  return cb(
    ApiError.badRequest('Invalid file format. Only PDF (.pdf) documents are allowed.'),
    false
  );
};

const pdfResumeUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes limit
  },
  fileFilter: pdfResumeFileFilter,
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
 * Wrapper middleware to handle single resume upload (PDF ONLY, max 5MB)
 * @param {string} fieldName - Form field name (default: 'resume')
 */
export const handleResumeUpload = (fieldName = 'resume') => {
  const uploadSingle = pdfResumeUpload.single(fieldName);

  return (req, res, next) => {
    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(ApiError.badRequest('File size exceeds maximum allowed limit of 5MB. Please upload a smaller PDF file.'));
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

