import React from 'react';
import { CheckCircle2, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';

export const StrengthsList = ({ strengths = [], className = '' }) => {
  if (!Array.isArray(strengths) || strengths.length === 0) return null;

  return (
    <Card variant="glass" className={`border-slate-800 ${className}`.trim()}>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-emerald-300">
          <Award className="w-5 h-5 text-emerald-400" />
          <span>Candidate Strengths ({strengths.length})</span>
        </CardTitle>
        <CardDescription>
          Highlights and standout achievements recognized in your resume.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-2.5">
          {strengths.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs sm:text-sm text-emerald-200 flex items-start gap-3 transition-colors hover:bg-emerald-500/10"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-normal">{item}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StrengthsList;
