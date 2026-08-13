import React from 'react';
import { FileText, TrendingUp, TrendingDown, Award, Calendar, Layers, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

/**
 * ATSScoreCard Component
 * Displays current ATS score, previous score, improvement delta, highest score,
 * analysis count, latest scan date, and sequence breadcrumb (60 -> 67 -> 74 -> 82).
 */
export const ATSScoreCard = ({
  currentScore = 0,
  previousScore = 0,
  improvement = 0,
  highestScore = 0,
  analysisCount = 0,
  latestAnalysisDate = null,
  scoreHistory = [],
  className = '',
}) => {
  const isPositive = improvement > 0;
  const isNegative = improvement < 0;

  const formattedDate = latestAnalysisDate
    ? new Date(latestAnalysisDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No scans yet';

  // Extract score sequence (e.g. [60, 67, 74, 82])
  const historySequence = scoreHistory.map((item) => item.score).filter((s) => typeof s === 'number');

  return (
    <Card variant="glass" className={`w-full flex flex-col justify-between ${className}`.trim()}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle as="h2" className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            ATS Resume Score
          </CardTitle>

          {analysisCount > 0 && (
            <Badge
              variant={isPositive ? 'success' : isNegative ? 'danger' : 'neutral'}
              style="soft"
              size="sm"
              icon={isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : isNegative ? <TrendingDown className="w-3.5 h-3.5" /> : null}
            >
              {isPositive ? `+${improvement} from previous` : improvement < 0 ? `${improvement} from previous` : 'No change'}
            </Badge>
          )}
        </div>
        <CardDescription>AI keyword matching & ATS compatibility metrics.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Score Hero */}
        <div className="flex items-baseline justify-between p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Current ATS Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {currentScore}
              </span>
              <span className="text-sm text-slate-400 font-normal">/ 100</span>
            </div>
          </div>

          <div className="text-right space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              All-Time High
            </span>
            <div className="flex items-center justify-end gap-1.5 text-emerald-400 font-bold text-lg">
              <Award className="w-4 h-4" />
              <span>{highestScore}</span>
            </div>
          </div>
        </div>

        {/* Metric Grid: Previous Score, Analyses Run, Latest Date */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium block">Previous Score</span>
            <span className="text-base font-bold text-slate-200 block">
              {previousScore > 0 ? previousScore : 'N/A'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium block">Total Scans</span>
            <span className="text-base font-bold text-indigo-300 block flex items-center justify-center gap-1">
              <Layers className="w-3.5 h-3.5" /> {analysisCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium block">Latest Scan</span>
            <span className="text-xs font-semibold text-slate-300 block truncate flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> {formattedDate}
            </span>
          </div>
        </div>

        {/* Score History Progression Sequence (60 -> 67 -> 74 -> 82) */}
        {historySequence.length > 0 && (
          <div className="space-y-2 pt-1 border-t border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Score History Progression
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              {historySequence.map((score, idx) => (
                <React.Fragment key={idx}>
                  <div
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      idx === historySequence.length - 1
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {score}
                  </div>
                  {idx < historySequence.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ATSScoreCard;
