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

export default upload;
