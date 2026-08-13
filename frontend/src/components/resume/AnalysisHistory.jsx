import React, { useState } from 'react';
import {
  History,
  Eye,
  ArrowRightLeft,
  Trash2,
  RefreshCw,
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonCard } from '../ui/LoadingState';
import { AnalysisHistoryCard } from './AnalysisHistoryCard';
import { AnalysisComparisonModal } from './AnalysisComparisonModal';

export const AnalysisHistory = ({
  history = [],
  loading = false,
  onViewReport,
  onReanalyze,
  onDeleteReport,
  className = '',
}) => {
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  if (loading) {
    return <SkeletonCard className={className} />;
  }

  if (!history || history.length === 0) {
    return (
      <Card variant="glass" className={`border-slate-800 ${className}`.trim()}>
        <CardContent className="p-6">
          <EmptyState
            icon={History}
            title="No ATS Analysis History Found"
            description="Run your first Google Gemini AI Resume Analysis to start tracking ATS score improvements over time."
            actionLabel="Run First AI Resume Scan"
            onAction={onReanalyze}
          />
        </CardContent>
      </Card>
    );
  }

  const handleToggleCompare = (report) => {
    setSelectedForCompare((prev) => {
      const exists = prev.some((r) => r._id === report._id);
      if (exists) {
        return prev.filter((r) => r._id !== report._id);
      }
      if (prev.length >= 2) {
        return [prev[1], report];
      }
      return [...prev, report];
    });
  };

  const handleOpenComparison = () => {
    if (selectedForCompare.length === 2) {
      setCompareModalOpen(true);
    }
  };

  // Sort history chronologically ascending to compute accurate deltas
  const chronologicalHistory = [...history].sort(
    (a, b) => new Date(a.analyzedAt || a.createdAt) - new Date(b.analyzedAt || b.createdAt)
  );

  const getPreviousScore = (reportId) => {
    const idx = chronologicalHistory.findIndex((r) => r._id === reportId);
    if (idx > 0) {
      return chronologicalHistory[idx - 1].atsScore;
    }
    return null;
  };

  const olderReport = selectedForCompare[0] && selectedForCompare[1]
    ? new Date(selectedForCompare[0].analyzedAt) < new Date(selectedForCompare[1].analyzedAt)
      ? selectedForCompare[0]
      : selectedForCompare[1]
    : null;

  const newerReport = selectedForCompare[0] && selectedForCompare[1]
    ? new Date(selectedForCompare[0].analyzedAt) >= new Date(selectedForCompare[1].analyzedAt)
      ? selectedForCompare[0]
      : selectedForCompare[1]
    : null;

  return (
    <Card variant="glass" className={`border-slate-800 ${className}`.trim()}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              <span>ATS Analysis History ({history.length})</span>
            </CardTitle>
            <CardDescription>
              Time-series log of all past AI resume evaluations and ATS match scores.
            </CardDescription>
          </div>

          {/* Compare Toolbar CTA */}
          <div className="flex items-center gap-2">
            {selectedForCompare.length === 2 && (
              <Button
                size="xs"
                variant="primary"
                onClick={handleOpenComparison}
                leftIcon={<ArrowRightLeft className="w-3.5 h-3.5" />}
              >
                Compare 2 Selected ({selectedForCompare.length})
              </Button>
            )}

            {onReanalyze && (
              <Button
                size="xs"
                variant="outline"
                onClick={onReanalyze}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Re-Analyze Current Resume
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Desktop Table View (Hidden on mobile) */}
        <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">ATS Score</th>
                <th className="py-3 px-4">Change</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
              {history.map((item) => {
                const prevScore = getPreviousScore(item._id);
                const score = item.atsScore || 0;
                const delta = prevScore !== null ? score - prevScore : null;
                const isSelected = selectedForCompare.some((r) => r._id === item._id);

                return (
                  <tr
                    key={item._id}
                    className={`hover:bg-slate-900/60 transition-colors ${
                      isSelected ? 'bg-indigo-600/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      {new Date(item.analyzedAt || item.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-indigo-300">
                      {score} / 100
                    </td>

                    <td className="py-3 px-4 font-mono">
                      {delta !== null ? (
                        <span
                          className={`font-bold ${
                            delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-rose-400' : 'text-slate-400'
                          }`}
                        >
                          {delta > 0 ? `+${delta}` : delta}
                        </span>
                      ) : (
                        <span className="text-slate-500">Initial</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {item.isLatest ? (
                        <Badge variant="success" style="soft" size="xs">
                          Active Report
                        </Badge>
                      ) : (
                        <Badge variant="secondary" style="soft" size="xs">
                          Archived
                        </Badge>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => onViewReport && onViewReport(item)}
                        leftIcon={<Eye className="w-3 h-3" />}
                      >
                        View
                      </Button>

                      <Button
                        size="xs"
                        variant={isSelected ? 'primary' : 'ghost'}
                        onClick={() => handleToggleCompare(item)}
                      >
                        {isSelected ? 'Selected' : 'Compare'}
                      </Button>

                      {onDeleteReport && (
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => onDeleteReport(item._id)}
                          className="text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile & Tablet Card Grid (Hidden on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:hidden">
          {history.map((item) => {
            const prevScore = getPreviousScore(item._id);
            const isSelected = selectedForCompare.some((r) => r._id === item._id);

            return (
              <AnalysisHistoryCard
                key={item._id}
                analysis={item}
                previousScore={prevScore}
                onView={onViewReport}
                onCompare={handleToggleCompare}
                onDelete={onDeleteReport}
                isSelectedForCompare={isSelected}
              />
            );
          })}
        </div>

        {/* Comparison Modal */}
        <AnalysisComparisonModal
          isOpen={compareModalOpen}
          onClose={() => setCompareModalOpen(false)}
          olderReport={olderReport}
          newerReport={newerReport}
        />
      </CardContent>
    </Card>
  );
};

export default AnalysisHistory;
