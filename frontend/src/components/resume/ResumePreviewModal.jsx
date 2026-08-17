import React, { useState } from 'react';
import {
  FileText,
  ExternalLink,
  Download,
  Calendar,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ResumeStatus } from './ResumeStatus';

export const ResumePreviewModal = ({
  isOpen = false,
  onClose,
  resume = null,
}) => {
  const [iframeError, setIframeError] = useState(false);

  if (!resume) return null;

  const {
    originalName = 'Candidate_Resume.pdf',
    fileSize,
    url,
    isActive = true,
    parsingStatus = 'pending',
    aiAnalysis = null,
    createdAt,
  } = resume;

  const pdfUrl = url || resume.fileUrl || resume.resumeUrl || '';

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recent';

  // Google Docs Viewer fallback for browsers that block raw PDF inline streaming
  const googleDocsViewerUrl = pdfUrl
    ? `https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`
    : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-100">
          <FileText className="w-5 h-5 text-indigo-400" />
          <span className="truncate max-w-[280px] sm:max-w-md">{originalName}</span>
        </div>
      }
      size="xl"
    >
      <div className="space-y-4">
        {/* Top Metadata Header Toolbar */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 overflow-hidden">
            <ResumeStatus
              isActive={isActive}
              parsingStatus={parsingStatus}
              aiAnalysis={aiAnalysis}
            />
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono pt-0.5">
              {fileSize && <span>{formatFileSize(fileSize)}</span>}
              {fileSize && <span>•</span>}
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                Uploaded: {formattedDate}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {pdfUrl && (
              <>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button
                    size="xs"
                    variant="outline"
                    leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    Open in New Tab
                  </Button>
                </a>

                <a href={pdfUrl} download={originalName} className="inline-flex">
                  <Button
                    size="xs"
                    variant="primary"
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    Download PDF
                  </Button>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Embedded PDF Viewer Container */}
        {pdfUrl ? (
          <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden min-h-[420px] sm:min-h-[550px]">
            {!iframeError ? (
              <iframe
                src={pdfUrl}
                title={`PDF Viewer - ${originalName}`}
                className="w-full h-[450px] sm:h-[600px] border-0"
                onError={() => setIframeError(true)}
              />
            ) : (
              // Fallback Embedded Viewer using Google Docs Viewer iframe
              <iframe
                src={googleDocsViewerUrl}
                title={`Google Docs Preview - ${originalName}`}
                className="w-full h-[450px] sm:h-[600px] border-0"
              />
            )}
          </div>
        ) : (
          // Informative Metadata Fallback when PDF URL is not provided
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-200">
              PDF Inline Preview Unavailable
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              A secure stream URL for this document could not be established. You can view the document details above or replace this resume.
            </p>
          </div>
        )}

        {/* Footer Note */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure Cloud Storage • Authenticated TLS Encrypted Stream</span>
          </div>

          <Button size="xs" variant="ghost" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ResumePreviewModal;
