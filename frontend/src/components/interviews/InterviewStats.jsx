import React from 'react';
import { Video, Award, TrendingUp, TrendingDown, Zap, Lightbulb, Code2, MessageSquare, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

/**
 * InterviewStats Component
 * Renders aggregate interview metrics, category score averages (Technical, Communication, HR),
 * and dynamic comparative interpretation ("Technical score is stronger than Communication score").
 */
export const InterviewStats = ({
  total = 0,
  completed = 0,
  inProgress = 0,
  averageScore = 0,
  bestScore = 0,
  latestScore = 0,
  scoreImprovement = 0,
  technicalAverage = 0,
  communicationAverage = 0,
  hrAverage = 0,
  className = '',
}) => {
  const isPositive = scoreImprovement > 0;
  const isNegative = scoreImprovement < 0;

  // Generate dynamic comparative interpretation based strictly on backend provided averages
  let interpretation = '';
  if (completed === 0) {
    interpretation = 'Complete your first AI Mock Interview session to unlock comparative competency insights.';
  } else if (technicalAverage > communicationAverage && technicalAverage > hrAverage) {
    interpretation = `Your technical performance (${technicalAverage}) is stronger than your communication score (${communicationAverage}).`;
  } else if (communicationAverage > technicalAverage) {
    interpretation = `Your communication score (${communicationAverage}) is currently outperforming your technical evaluation (${technicalAverage}).`;
  } else if (hrAverage > technicalAverage) {
    interpretation = `Your behavioral and HR response skills (${hrAverage}) are currently your strongest competency area.`;
  } else {
    interpretation = `Your interview performance is well-balanced across technical (${technicalAverage}) and soft skill competencies.`;
  }

  return (
    <Card variant="glass" className={`w-full flex flex-col justify-between ${className}`.trim()}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle as="h2" className="flex items-center gap-2">
            <Video className="w-5 h-5 text-cyan-400" />
            Interview Performance Analytics
          </CardTitle>

          {scoreImprovement !== 0 && completed > 1 && (
            <Badge
              variant={isPositive ? 'success' : isNegative ? 'danger' : 'neutral'}
              style="soft"
              size="sm"
              icon={isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            >
              {isPositive ? `+${scoreImprovement}% score growth` : `${scoreImprovement}% score change`}
            </Badge>
          )}
        </div>
        <CardDescription>Aggregate ratings across completed AI technical & behavioral sessions.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Score Hero Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Average Score
            </span>
            <div className="flex items-baseline justify-center sm:justify-start gap-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {averageScore}
              </span>
              <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </div>
          </div>

          <div className="space-y-1 text-center sm:text-left border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Highest Rating
            </span>
            <div className="flex items-center justify-center sm:justify-start gap-1 text-emerald-400 font-extrabold text-2xl">
              <Award className="w-5 h-5" />
              <span>{bestScore}</span>
            </div>
          </div>

          <div className="space-y-1 text-center sm:text-left border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Sessions Overview
            </span>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-2xl font-bold text-cyan-300">{completed}</span>
              <span className="text-xs text-slate-400 font-normal">/ {total} total</span>
            </div>
          </div>
        </div>

        {/* Competency Category Breakdown (Technical, Communication, HR) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Competency Breakdown Averages
          </h3>

          <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" /> Technical Skills
                </span>
                <span className="font-bold text-white">{technicalAverage} / 100</span>
              </div>
              <ProgressBar value={technicalAverage} max={100} showPercentage={false} color="indigo" size="sm" />
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> Communication & Soft Skills
                </span>
                <span className="font-bold text-white">{communicationAverage} / 100</span>
              </div>
              <ProgressBar value={communicationAverage} max={100} showPercentage={false} color="cyan" size="sm" />
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" /> HR & Behavioral Fit
                </span>
                <span className="font-bold text-white">{hrAverage} / 100</span>
              </div>
              <ProgressBar value={hrAverage} max={100} showPercentage={false} color="emerald" size="sm" />
            </div>
          </div>
        </div>

        {/* AI Interpretation Banner */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200">
          <Lightbulb className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">AI Competency Insight</span>
            <p className="text-xs text-indigo-100/90 leading-relaxed">
              {interpretation}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewStats;
