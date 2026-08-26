import React from 'react';
import {
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const AnalysisComparisonModal = ({
  isOpen = false,
  onClose,
  olderReport = null,
  newerReport = null,
}) => {
  if (!olderReport || !newerReport) return null;

  const oldScore = olderReport.atsScore || 0;
  const newScore = newerReport.atsScore || 0;
  const delta = newScore - oldScore;

  const formatDate = (dStr) => {
    if (!dStr) return 'Past Scan';
    return new Date(dStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-100">
          <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
          <span>Compare ATS Analysis Reports</span>
        </div>
      }
      size="xl"
    >
      <div className="space-y-6">
        {/* Top Hero Metric Comparison Card */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-inner">
          {/* Older Scan */}
          <div className="text-center sm:text-left space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Previous Scan ({formatDate(olderReport.analyzedAt || olderReport.createdAt)})
            </span>
            <div className="flex items-baseline justify-center sm:justify-start gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-300 font-mono">
                {oldScore}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ 100</span>
            </div>
          </div>

          {/* Score Improvement Badge */}
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Score Delta
            </span>
            <Badge
              variant={delta > 0 ? 'success' : delta < 0 ? 'danger' : 'neutral'}
              style="soft"
              size="md"
              leftIcon={
                delta > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : delta < 0 ? (
                  <TrendingDown className="w-4 h-4" />
                ) : null
              }
            >
              {delta > 0 ? `Improvement: +${delta}` : delta < 0 ? `Drop: ${delta}` : 'No Change'}
            </Badge>
          </div>

          {/* Newer Scan */}
          <div className="text-center sm:text-right space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block">
              Current Scan ({formatDate(newerReport.analyzedAt || newerReport.createdAt)})
            </span>
            <div className="flex items-baseline justify-center sm:justify-end gap-1">
              <span className="text-3xl sm:text-4xl font-black text-indigo-300 font-mono">
                {newScore}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ 100</span>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Older Report Column */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Report #1 ({formatDate(olderReport.analyzedAt)})</span>
              <span className="font-mono text-slate-400">{oldScore}% ATS</span>
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              {olderReport.summary || 'No summary available.'}
            </p>

            {Array.isArray(olderReport.missingSkills) && olderReport.missingSkills.length > 0 && (
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-rose-400 font-bold block">
                  Missing Skills ({olderReport.missingSkills.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {olderReport.missingSkills.map((sk, idx) => (
                    <Badge key={idx} variant="danger" style="soft" size="xs">
                      {sk}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Newer Report Column */}
          <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center justify-between">
              <span>Report #2 ({formatDate(newerReport.analyzedAt)})</span>
              <span className="font-mono text-indigo-300 font-bold">{newScore}% ATS</span>
            </h4>

            <p className="text-xs text-indigo-100 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-indigo-500/20">
              {newerReport.summary || 'No summary available.'}
            </p>

            {Array.isArray(newerReport.missingSkills) && newerReport.missingSkills.length > 0 && (
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-rose-400 font-bold block">
                  Missing Skills ({newerReport.missingSkills.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {newerReport.missingSkills.map((sk, idx) => (
                    <Badge key={idx} variant="danger" style="soft" size="xs">
                      {sk}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button size="xs" variant="ghost" onClick={onClose}>
            Close Comparison
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AnalysisComparisonModal;
