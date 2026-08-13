import React from 'react';
import { Award, Lightbulb, AlertTriangle, CheckCircle2, TrendingDown, Target, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressCircle } from '../ui/ProgressCircle';
import { ProgressBar } from '../ui/ProgressBar';

/**
 * CareerReadinessWidget Component
 * Visually strong candidate evaluation widget that highlights composite career readiness,
 * sub-scores (Profile, Resume, Interview, Applications, Skills), weakest improvement area,
 * and backend-driven recommendations.
 */
export const CareerReadinessWidget = ({ careerReadiness = {}, className = '' }) => {
  // Extract scores directly from backend response payload (Source of Truth)
  const overallScore = careerReadiness?.overallScore ?? 0;
  
  // Extract sub-component scores from careerReadiness.components or scoreBreakdown or direct properties
  const profileScore =
    careerReadiness?.components?.profile ??
    careerReadiness?.scoreBreakdown?.profileScore ??
    careerReadiness?.profileScore ??
    0;

  const resumeScore =
    careerReadiness?.components?.resume ??
    careerReadiness?.scoreBreakdown?.resumeScore ??
    careerReadiness?.resumeScore ??
    0;

  const interviewScore =
    careerReadiness?.components?.interview ??
    careerReadiness?.scoreBreakdown?.interviewScore ??
    careerReadiness?.interviewScore ??
    0;

  const applicationScore =
    careerReadiness?.components?.applications ??
    careerReadiness?.scoreBreakdown?.applicationScore ??
    careerReadiness?.applicationScore ??
    0;

  const skillsScore =
    careerReadiness?.components?.skills ??
    careerReadiness?.scoreBreakdown?.skillsScore ??
    careerReadiness?.skillsScore ??
    null;

  const recommendations = careerReadiness?.recommendations || [];

  // Readiness Level Badge & Color Palette determination
  let readinessLevel = careerReadiness?.readinessLevel || 'Needs Improvement';
  let badgeVariant = 'warning';
  let progressColor = '#f59e0b'; // Amber

  if (overallScore >= 85) {
    readinessLevel = 'Job Ready (Exceptional)';
    badgeVariant = 'success';
    progressColor = '#10b981'; // Emerald
  } else if (overallScore >= 70) {
    readinessLevel = 'Job Ready';
    badgeVariant = 'success';
    progressColor = '#10b981'; // Emerald
  } else if (overallScore >= 55) {
    readinessLevel = 'Moderately Prepared';
    badgeVariant = 'primary';
    progressColor = '#6366f1'; // Indigo
  } else if (overallScore < 40) {
    badgeVariant = 'danger';
    progressColor = '#ef4444'; // Rose
  }

  // Construct score breakdown items list
  const subScores = [
    { key: 'profile', label: 'Profile Completion', shortLabel: 'Profile', score: profileScore, color: 'indigo' },
    { key: 'resume', label: 'Resume ATS Score', shortLabel: 'Resume', score: resumeScore, color: 'cyan' },
    { key: 'interview', label: 'Interview Performance', shortLabel: 'Interview', score: interviewScore, color: 'emerald' },
    { key: 'applications', label: 'Application Activity', shortLabel: 'Applications', score: applicationScore, color: 'amber' },
  ];

  if (skillsScore !== null && skillsScore !== undefined) {
    subScores.push({
      key: 'skills',
      label: 'Skills & Profile Strength',
      shortLabel: 'Skills',
      score: skillsScore,
      color: 'rose',
    });
  }

  // Determine weakest area for dynamic focus highlight
  const weakestArea = subScores.reduce(
    (min, item) => (item.score < min.score ? item : min),
    subScores[0]
  );

  return (
    <Card variant="glass" className={`w-full flex flex-col justify-between ${className}`.trim()}>
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle as="h2" className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Career Readiness Engine
            </CardTitle>
            <CardDescription>AI composite score evaluating overall candidate job market readiness.</CardDescription>
          </div>

          <Badge variant={badgeVariant} style="soft" size="md" className="font-semibold">
            {readinessLevel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Top Hero Section: Progress Circle + Main Score Metrics */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
          <div className="shrink-0 flex items-center justify-center">
            <ProgressCircle
              value={overallScore}
              max={100}
              size={120}
              strokeWidth={10}
              color={progressColor}
              trackColor="#1e293b"
              label="Readiness"
            />
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="flex items-baseline justify-center sm:justify-start gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {overallScore}
              </span>
              <span className="text-sm font-medium text-slate-400">/ 100 Overall Score</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Calculated dynamically by backend scoring engine based on resume quality, interview ratings, profile completeness, and job application momentum.
            </p>
          </div>
        </div>

        {/* Breakdown of Component Scores */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Score Breakdown & Component Ratings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {subScores.map((item) => (
              <div
                key={item.key}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{item.label}</span>
                  <span className="font-bold text-white">
                    {item.score} <span className="text-[10px] text-slate-500 font-normal">/ 100</span>
                  </span>
                </div>

                <ProgressBar
                  value={item.score}
                  max={100}
                  showPercentage={false}
                  color={item.color}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Highlight Weakest Area Opportunity Banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-900/90 border border-amber-500/30 text-amber-200 shadow-md">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Primary Opportunity Area
              </span>
              <Badge variant="warning" size="sm">
                Lowest Score: {weakestArea.score}/100
              </Badge>
            </div>

            <p className="text-xs font-medium text-amber-100/90 leading-relaxed">
              Your <strong className="text-amber-200 font-semibold">{weakestArea.label.toLowerCase()}</strong> is currently your biggest improvement opportunity. Focus here to boost your overall readiness.
            </p>
          </div>
        </div>

        {/* Actionable Recommendations List */}
        {recommendations.length > 0 && (
          <div className="space-y-2.5 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Actionable AI Recommendations
            </h3>

            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CareerReadinessWidget;
