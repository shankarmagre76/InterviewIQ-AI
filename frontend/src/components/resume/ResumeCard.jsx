import React from 'react';
import {
  FileText,
  RefreshCw,
  Trash2,
  Sparkles,
  Calendar,
  ExternalLink,
  Eye,
} from 'lucide-react';

import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { ResumeStatus } from './ResumeStatus';

export const ResumeCard = ({
  resume,
  onView,
  onReplace,
  onDelete,
  onAnalyze,
  isActionLoading = false,
  className = '',
}) => {
  if (!resume) return null;

  const {
    originalName,
    fileSize,
    url,
    isActive = true,
    parsingStatus = 'pending',
    aiAnalysis = null,
    createdAt,
  } = resume;

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
    : 'Recently';

  const lastAnalyzedDate = aiAnalysis?.analyzedAt
    ? new Date(aiAnalysis.analyzedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const downloadUrl = url || resume.fileUrl || resume.resumeUrl || '';

  return (
    <Card variant="glass" className={`border-slate-800 relative overflow-hidden ${className}`.trim()}>
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Top Header Row: Icon, Filename & Status Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
              <FileText className="w-6 h-6" />
            </div>

            <div className="overflow-hidden space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate">
                {originalName || 'Candidate_Resume.pdf'}
              </h3>

              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                {fileSize && <span>{formatFileSize(fileSize)}</span>}
                {fileSize && <span>•</span>}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  Uploaded: {formattedDate}
                </span>
              </div>
            </div>
          </div>

          <ResumeStatus
            isActive={isActive}
            parsingStatus={parsingStatus}
            aiAnalysis={aiAnalysis}
          />
        </div>

        {/* Last Analyzed Date Notice if Available */}
        {lastAnalyzedDate && (
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Last ATS analysis completed on {lastAnalyzedDate}</span>
          </div>
        )}

        {/* Action Controls Toolbar */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onView ? (
              <Button
                size="xs"
                variant="outline"
                onClick={onView}
                leftIcon={<Eye className="w-3.5 h-3.5" />}
              >
                View Resume
              </Button>
            ) : downloadUrl ? (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button
                  size="xs"
                  variant="outline"
                  leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  View / Download PDF
                </Button>
              </a>
            ) : null}

            {onView && downloadUrl && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center"
                title="Open PDF directly in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {onReplace && (
              <Button
                size="xs"
                variant="ghost"
                onClick={onReplace}
                disabled={isActionLoading}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Replace PDF
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onAnalyze && (
              <Button
                size="xs"
                variant="primary"
                onClick={onAnalyze}
                disabled={isActionLoading}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-cyan-300" />}
              >
                Analyze ATS Score
              </Button>
            )}

            {onDelete && (
              <Button
                size="xs"
                variant="ghost"
                onClick={onDelete}
                disabled={isActionLoading}
                className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeCard;
