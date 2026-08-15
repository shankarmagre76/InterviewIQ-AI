import React from 'react';
import { Lightbulb, AlertTriangle } from 'lucide-react';

export const WeaknessesSection = ({ weaknesses = [] }) => {
  if (!weaknesses || weaknesses.length === 0) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
        <Lightbulb className="w-4 h-4" /> Areas for Improvement & Focus Topics
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {weaknesses.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs sm:text-sm text-amber-200 flex items-start gap-3"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeaknessesSection;
