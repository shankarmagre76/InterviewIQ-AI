import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, Award } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const InterviewScoreCard = ({
  role = 'Software Engineer',
  interviewType = 'Technical',
  difficulty = 'Intermediate',
  overallScore = 0,
  summary = '',
}) => {
  const isPassed = overallScore >= 70;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Session Complete
            </span>
            <Badge variant={isPassed ? 'success' : 'warning'} size="sm">
              {isPassed ? 'Passed Bar' : 'Needs Practice'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {role} Interview Performance
          </h1>
          <p className="text-xs text-slate-400">
            {interviewType} Interview • {difficulty} Level
          </p>
        </div>

        {/* Overall Score Circle Display */}
        <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800 p-4 rounded-2xl shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col items-center justify-center text-indigo-400">
            <span className="text-3xl font-black">{overallScore}</span>
            <span className="text-[10px] uppercase font-bold text-indigo-300/80">/ 100</span>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">Overall AI Score</div>
            <div className="text-[11px] text-slate-400">Evaluated by Gemini AI</div>
          </div>
        </div>
      </div>

      {/* AI Summary Banner */}
      {summary && (
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Executive AI Summary
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            "{summary}"
          </p>
        </div>
      )}
    </div>
  );
};

export default InterviewScoreCard;
