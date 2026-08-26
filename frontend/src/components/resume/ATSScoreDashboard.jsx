import React from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { ATSScoreChart } from './ATSScoreChart';

export const ATSScoreDashboard = ({
  analysis = null,
  history = [],
  onAnalyze,
  isAnalyzing = false,
  progressStage = '',
  className = '',
}) => {
  // Empty State: No analysis available yet
  if (!analysis && !isAnalyzing) {
    return (
      <Card variant="glass" className={`border-slate-800 ${className}`.trim()}>
        <CardContent className="p-8">
          <EmptyState
            icon={Sparkles}
            title="No ATS Resume Analysis Report Yet"
            description="Run your first Google Gemini AI Resume Analysis to unlock your ATS compatibility score, skill gap breakdown, and formatting recommendations."
            actionLabel="Analyze Resume with Gemini AI"
            onAction={onAnalyze}
          />
        </CardContent>
      </Card>
    );
  }

  // Processing State: AI Analysis actively running
  if (isAnalyzing) {
    return (
      <Card variant="glass" className={`border-slate-800 ${className}`.trim()}>
        <CardContent className="p-10 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-100">Analyzing Your Resume...</h3>
            <p className="text-xs font-mono text-indigo-300">
              {progressStage || 'Evaluating PDF text with Google Gemini AI...'}
            </p>
          </div>

          <div className="max-w-xs mx-auto">
            <ProgressBar value={75} variant="primary" size="md" animated />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extract analysis fields from backend payload
  const currentScore = Math.min(100, Math.max(0, analysis?.atsScore || 0));

  // Determine Rating Label and Badge Color
  const getRatingConfig = (score) => {
    if (score >= 80) return { label: 'Great Resume • Strong Candidate', variant: 'success', text: 'text-emerald-300' };
    if (score >= 60) return { label: 'Good Resume • Solid Match', variant: 'info', text: 'text-cyan-300' };
    if (score >= 40) return { label: 'Average Resume • Needs Optimization', variant: 'warning', text: 'text-amber-300' };
    return { label: 'Needs Significant Improvements', variant: 'danger', text: 'text-rose-300' };
  };

  const rating = getRatingConfig(currentScore);

  // Compute Trend Improvement from History
  let previousScore = null;
  let improvement = 0;

  if (history && history.length > 1) {
    // History is sorted newest first or oldest first. Find the second report
    const prevReport = history.find((item) => item._id !== analysis._id);
    if (prevReport && typeof prevReport.atsScore === 'number') {
      previousScore = prevReport.atsScore;
      improvement = currentScore - previousScore;
    }
  }

  // Prepare categories actually returned or calculated from backend feedback
  const categoryScores = [];

  // 1. Keywords & Matching (Based on missing/recommended skills count)
  if (analysis.keywordFeedback || analysis.missingSkills) {
    const missingCount = Array.isArray(analysis.missingSkills) ? analysis.missingSkills.length : 0;
    const keywordScore = Math.max(30, 100 - missingCount * 12);
    categoryScores.push({
      label: 'Keywords & Skill Matching',
      score: keywordScore,
      description: missingCount === 0 ? 'Optimal keyword coverage' : `${missingCount} missing target keywords`,
    });
  }

  // 2. Formatting & Grammar
  if (analysis.formattingFeedback || analysis.grammarFeedback) {
    const formattingCount = Array.isArray(analysis.formattingFeedback) ? analysis.formattingFeedback.length : 0;
    const formatScore = Math.max(40, 100 - formattingCount * 10);
    categoryScores.push({
      label: 'Formatting & Structure',
      score: formatScore,
      description: formattingCount === 0 ? 'Clean ATS layout' : `${formattingCount} formatting suggestions`,
    });
  }

  // 3. Experience & Achievements
  if (analysis.strengths) {
    const strengthsCount = Array.isArray(analysis.strengths) ? analysis.strengths.length : 0;
    const experienceScore = Math.min(100, 50 + strengthsCount * 15);
    categoryScores.push({
      label: 'Experience & Impact Metrics',
      score: experienceScore,
      description: `${strengthsCount} verified career accomplishments`,
    });
  }

  // 4. Section Completeness
  if (analysis.sectionFeedback) {
    const sectionsCount = Object.keys(analysis.sectionFeedback).length;
    categoryScores.push({
      label: 'Section Completeness',
      score: Math.min(100, sectionsCount * 25),
      description: `${sectionsCount} resume sections verified`,
    });
  }

  // Format score history sequence for trend card
  const chartHistory = history.map((item, idx) => ({
    score: item.atsScore,
    date: item.analyzedAt,
    aiProvider: item.aiProvider || 'Gemini AI',
    index: idx + 1,
  }));

  return (
    <div className={`space-y-6 ${className}`.trim()}>
      {/* 1. Hero ATS Score Banner */}
      <Card variant="glass" className="border-slate-800 relative overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>ATS Compatibility Benchmark</span>
            </CardTitle>

            <Badge variant={rating.variant} style="soft" size="sm">
              {rating.label}
            </Badge>
          </div>
          <CardDescription>
            Backend verified ATS match score generated by Google Gemini AI evaluation.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Prominent Circular ATS Score Ring */}
            <div className="flex items-center gap-6">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-indigo-500/20 bg-indigo-600/10 flex flex-col items-center justify-center shadow-inner">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                  {currentScore}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-100">
                  ATS Score: <span className={rating.text}>{currentScore}%</span>
                </h3>

                {/* Trend Delta Indicator */}
                {previousScore !== null && (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={improvement >= 0 ? 'success' : 'danger'}
                      style="soft"
                      size="xs"
                      leftIcon={
                        improvement >= 0 ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )
                      }
                    >
                      {improvement >= 0
                        ? `↑ +${improvement} from previous scan`
                        : `↓ ${improvement} from previous scan`}
                    </Badge>
                  </div>
                )}

                <p className="text-xs text-slate-400 max-w-sm">
                  {analysis.summary || 'Resume analyzed for role readiness and ATS keyword compliance.'}
                </p>
              </div>
            </div>

            {/* Re-analyze CTA */}
            {onAnalyze && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAnalyze}
                leftIcon={<RefreshCw className="w-4 h-4" />}
                className="shrink-0 self-end sm:self-center"
              >
                Re-Analyze Resume
              </Button>
            )}
          </div>

          {/* 2. Category Scores Grid */}
          {categoryScores.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Category Metric Scores
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categoryScores.map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{cat.label}</span>
                      <span className="font-mono text-indigo-300 font-bold">{cat.score}%</span>
                    </div>

                    <ProgressBar
                      value={cat.score}
                      variant={cat.score >= 75 ? 'success' : cat.score >= 50 ? 'primary' : 'warning'}
                      size="sm"
                    />

                    <span className="text-[11px] text-slate-400 block truncate">
                      {cat.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Time-Series Score History Trend Chart */}
      {chartHistory.length > 0 && (
        <ATSScoreChart scoreHistory={chartHistory} />
      )}
    </div>
  );
};

export default ATSScoreDashboard;
