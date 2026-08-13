import React from 'react';
import { CheckCircle2, Clock, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const ResumeStatus = ({
  isActive = true,
  parsingStatus = 'pending',
  aiAnalysis = null,
  className = '',
}) => {
  const isAnalyzed = Boolean(
    aiAnalysis && (aiAnalysis.atsScore > 0 || aiAnalysis.analyzedAt)
  );

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`.trim()}>
      {/* 1. Resume Active Status Badge */}
      {isActive ? (
        <Badge variant="success" style="soft" size="xs" leftIcon={<CheckCircle2 className="w-3 h-3 text-emerald-400" />}>
          Active Document
        </Badge>
      ) : (
        <Badge variant="secondary" style="soft" size="xs" leftIcon={<Clock className="w-3 h-3 text-slate-400" />}>
          Archived
        </Badge>
      )}

      {/* 2. Parsing & AI Analysis Status Badge */}
      {parsingStatus === 'processing' ? (
        <Badge variant="primary" style="soft" size="xs" leftIcon={<RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />}>
          Analyzing...
        </Badge>
      ) : isAnalyzed ? (
        <Badge variant="info" style="soft" size="xs" leftIcon={<Sparkles className="w-3 h-3 text-cyan-400" />}>
          ATS Analyzed ({aiAnalysis.atsScore || aiAnalysis.overallScore || 0}%)
        </Badge>
      ) : parsingStatus === 'failed' ? (
        <Badge variant="danger" style="soft" size="xs" leftIcon={<AlertCircle className="w-3 h-3 text-rose-400" />}>
          Analysis Failed
        </Badge>
      ) : (
        <Badge variant="warning" style="soft" size="xs" leftIcon={<Clock className="w-3 h-3 text-amber-400" />}>
          Not Analyzed Yet
        </Badge>
      )}
    </div>
  );
};

export default ResumeStatus;
