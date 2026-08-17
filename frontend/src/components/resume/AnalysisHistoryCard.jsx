import React from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Calendar,
  Eye,
  ArrowRightLeft,
  Trash2,
} from 'lucide-react';

import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const AnalysisHistoryCard = ({
  analysis,
  previousScore = null,
  onView,
  onCompare,
  onDelete,
  isSelectedForCompare = false,
  className = '',
}) => {
  if (!analysis) return null;

  const currentScore = Math.min(100, Math.max(0, analysis.atsScore || 0));
  const isLatest = Boolean(analysis.isLatest);

  // Compute change delta
  let changeDelta = null;
  if (previousScore !== null && typeof previousScore === 'number') {
    changeDelta = currentScore - previousScore;
  }

  const formattedDate = analysis.analyzedAt || analysis.createdAt
    ? new Date(analysis.analyzedAt || analysis.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recent';

  return (
    <div
      className={`
        p-4 sm:p-5 rounded-2xl border transition-all space-y-3
        ${
          isSelectedForCompare
            ? 'bg-indigo-600/10 border-indigo-500/50 shadow-md'
            : 'bg-slate-900/70 border-slate-800/90 hover:border-slate-700'
        }
        ${className}
      `.trim()}
    >
      {/* Top Row: Date, Status Badge, Score */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {formattedDate}
              </span>

              {isLatest ? (
                <Badge variant="success" style="soft" size="xs">
                  Active Report
                </Badge>
              ) : (
                <Badge variant="secondary" style="soft" size="xs">
                  Archived
                </Badge>
              )}
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              Provider: {analysis.aiProvider || 'Gemini AI'}
            </span>
          </div>
        </div>

        {/* ATS Score & Trend Badge */}
        <div className="flex items-center gap-3">
          {changeDelta !== null && (
            <Badge
              variant={changeDelta > 0 ? 'success' : changeDelta < 0 ? 'danger' : 'neutral'}
              style="soft"
              size="xs"
              leftIcon={
                changeDelta > 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : changeDelta < 0 ? (
                  <TrendingDown className="w-3.5 h-3.5" />
                ) : null
              }
            >
              {changeDelta > 0 ? `+${changeDelta}` : changeDelta}
            </Badge>
          )}

          <div className="text-right">
            <span className="text-xl font-black text-indigo-300 font-mono">
              {currentScore}
            </span>
            <span className="text-xs text-slate-400 font-mono"> / 100</span>
          </div>
        </div>
      </div>

      {/* Summary Snippet if Available */}
      {analysis.summary && (
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {analysis.summary}
        </p>
      )}

      {/* Action Buttons Toolbar */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <Button
          size="xs"
          variant="outline"
          onClick={() => onView && onView(analysis)}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
        >
          View Details
        </Button>

        <div className="flex items-center gap-2">
          {onCompare && (
            <Button
              size="xs"
              variant={isSelectedForCompare ? 'primary' : 'ghost'}
              onClick={() => onCompare(analysis)}
              leftIcon={<ArrowRightLeft className="w-3.5 h-3.5" />}
            >
              {isSelectedForCompare ? 'Selected' : 'Compare'}
            </Button>
          )}

          {onDelete && (
            <Button
              size="xs"
              variant="ghost"
              onClick={() => onDelete(analysis._id)}
              className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisHistoryCard;
