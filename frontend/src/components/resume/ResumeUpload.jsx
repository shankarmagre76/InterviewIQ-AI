import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  File,
  ShieldCheck,
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { Alert } from '../ui/Alert';
import { useToast } from '../../hooks/useToast';
import { resumeService } from '../../services/resumeService';
import { parseApiError } from '../../utils/helpers';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB matching backend Multer limit

export const ResumeUpload = ({
  onUploadSuccess,
  maxSizeMB = 5,
  className = '',
}) => {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  /**
   * Helper to format file size in human-readable units (KB / MB)
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Reads PDF magic bytes (%PDF- / 0x25 0x50 0x44 0x46) for client-side security verification
   */
  const verifyPdfMagicBytes = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = (e) => {
        if (!e.target || e.target.readyState !== FileReader.DONE) {
          resolve(false);
          return;
        }
        const arr = new Uint8Array(e.target.result).subarray(0, 4);
        const header = Array.from(arr)
          .map((byte) => byte.toString(16))
          .join('');
        // 25504446 corresponds to %PDF
        const isValid = header.toLowerCase() === '25504446';
        resolve(isValid);
      };
      reader.onerror = () => resolve(false);
      // Read first 4 bytes of file
      const slice = file.slice(0, 4);
      reader.readAsArrayBuffer(slice);
    });
  };

  /**
   * Full Client-side PDF Validation
   */
  const validateFile = async (file) => {
    if (!file) return false;

    setErrorMsg('');
    setSuccessMsg('');

    const fileName = file.name || '';
    const fileMime = (file.type || '').toLowerCase();

    // 1. Extension Check
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Invalid file format. Only PDF (.pdf) documents are allowed.');
      toast.error('Only PDF documents are allowed.');
      return false;
    }

    // 2. MIME Type Check (Allow empty MIME if extension is verified, but reject non-pdf MIME)
    if (fileMime && fileMime !== 'application/pdf') {
      setErrorMsg('Invalid MIME type. Selected file is not a valid PDF document.');
      toast.error('Selected file is not a valid PDF document.');
      return false;
    }

    // 3. File Size Check (Backend 5MB limit)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const formattedLimit = `${maxSizeMB}MB`;
      const currentSizeStr = formatFileSize(file.size);
      const msg = `File size (${currentSizeStr}) exceeds maximum allowed limit of ${formattedLimit}. Please upload a smaller PDF file.`;
      setErrorMsg(msg);
      toast.error(`File size exceeds ${formattedLimit} limit.`);
      return false;
    }

    // 4. Magic Bytes Inspection
    const isMagicValid = await verifyPdfMagicBytes(file);
    if (!isMagicValid) {
      setErrorMsg('Invalid PDF document structure. File header does not match a valid PDF document.');
      toast.error('Corrupted or invalid PDF header detected.');
      return false;
    }

    return true;
  };

  /**
   * Handle File Selection via Input or Drop
   */
  const handleFileSelected = async (file) => {
    if (!file) return;

    const isValid = await validateFile(file);
    if (isValid) {
      setSelectedFile(file);
      setErrorMsg('');
    } else {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  // Drag & Drop Event Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setErrorMsg('');
    setSuccessMsg('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Execute PDF Upload via resumeService
   */
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(15);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Simulate smooth progress animation before completion
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 85) {
            clearInterval(interval);
            return 85;
          }
          return prev + 15;
        });
      }, 150);

      const response = await resumeService.uploadResume(selectedFile);
      clearInterval(interval);
      setUploadProgress(100);

      const uploadedData = response?.data || response;
      const successText = `Resume "${selectedFile.name}" uploaded successfully!`;
      setSuccessMsg(successText);
      toast.success('Resume uploaded successfully!');

      if (onUploadSuccess) {
        onUploadSuccess(uploadedData);
      }
    } catch (err) {
      setUploadProgress(0);
      const parsedError = parseApiError(err);
      setErrorMsg(parsedError);
      toast.error(parsedError);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card variant="glass" className={`border-slate-800 ${className}`.trim()}>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-400" />
            <span>Upload PDF Resume</span>
          </div>
          <span className="text-xs font-mono text-slate-400 font-normal">
            Max limit: {maxSizeMB}MB
          </span>
        </CardTitle>
        <CardDescription>
          Upload your latest software engineering PDF resume to power AI ATS scoring and interview recommendations.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Alert */}
        {errorMsg && (
          <Alert
            variant="danger"
            title="Upload Failed"
            onClose={() => setErrorMsg('')}
            className="animate-fadeIn"
          >
            {errorMsg}
          </Alert>
        )}

        {/* Success Alert */}
        {successMsg && (
          <Alert
            variant="success"
            title="Upload Complete"
            onClose={() => setSuccessMsg('')}
            className="animate-fadeIn"
          >
            {successMsg}
          </Alert>
        )}

        {/* Drag and Drop Zone */}
        {!selectedFile && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={`
              relative p-8 sm:p-10 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center
              flex flex-col items-center justify-center gap-3 group
              ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-600/10 shadow-lg scale-[1.01]'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90'
              }
            `.trim()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleInputChange}
              className="hidden"
              aria-label="Upload PDF resume document"
            />

            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Upload className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-100">
                Drag & Drop your PDF resume here
              </p>
              <p className="text-xs text-slate-400">
                or <span className="text-indigo-400 font-semibold underline">Browse Files</span> from your computer
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>PDF format ONLY • Max size: {maxSizeMB}MB • Client verified</span>
            </div>
          </div>
        )}

        {/* Selected File Details Card */}
        {selectedFile && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-sm font-bold text-slate-100 block truncate">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs font-mono text-slate-400 block">
                    {formatFileSize(selectedFile.size)} • PDF Document
                  </span>
                </div>
              </div>

              {!isUploading && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  title="Remove selected file"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Upload Progress Indicator */}
            {isUploading && (
              <div className="space-y-2 pt-1">
                <ProgressBar value={uploadProgress} variant="primary" size="md" animated />
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Uploading PDF to secure storage...</span>
                  <span>{uploadProgress}%</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!isUploading && !successMsg && (
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  leftIcon={<X className="w-4 h-4" />}
                >
                  Cancel
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleUpload}
                  leftIcon={<Upload className="w-4 h-4" />}
                >
                  Upload & Process PDF
                </Button>
              </div>
            )}

            {/* Retry Button after Error */}
            {errorMsg && !isUploading && (
              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUpload}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Retry Upload
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeUpload;
