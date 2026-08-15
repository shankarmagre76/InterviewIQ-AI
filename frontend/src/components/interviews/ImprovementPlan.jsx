import React from 'react';
import { FileText, ArrowRight, Target } from 'lucide-react';

export const ImprovementPlan = ({ recommendations = [] }) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" /> Actionable Next Steps & Preparation Roadmap
          </h3>
          <p className="text-xs text-slate-400">Tailored AI recommendations to prepare for real-world candidate rounds</p>
        </div>
        <Target className="w-5 h-5 text-indigo-400" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs sm:text-sm text-slate-200 flex items-start gap-3 hover:border-indigo-500/30 transition-colors"
          >
            <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 text-xs font-bold font-mono">
              {idx + 1}
            </span>
            <div className="space-y-1">
              <p className="leading-relaxed">{rec}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImprovementPlan;
