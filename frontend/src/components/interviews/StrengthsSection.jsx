import React from 'react';
import { Award, CheckCircle2 } from 'lucide-react';

export const StrengthsSection = ({ strengths = [] }) => {
  if (!strengths || strengths.length === 0) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
        <Award className="w-4 h-4" /> Key Candidate Strengths
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {strengths.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs sm:text-sm text-emerald-200 flex items-start gap-3"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StrengthsSection;
