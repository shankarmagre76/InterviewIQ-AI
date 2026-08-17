import React from 'react';
import { AlertCircle, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';

export const WeaknessesList = ({
  weaknesses = [],
  recommendations = [],
  className = '',
}) => {
  const items = Array.isArray(weaknesses) && weaknesses.length > 0 ? weaknesses : recommendations;
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <Card variant="glass" className={`border-slate-800 ${className}`.trim()}>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-amber-300">
          <Target className="w-5 h-5 text-amber-400" />
          <span>Areas for Improvement ({items.length})</span>
        </CardTitle>
        <CardDescription>
          Actionable recommendations to boost ATS keywords and role readiness.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-2.5">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs sm:text-sm text-amber-200 flex items-start gap-3 transition-colors hover:bg-amber-500/10"
            >
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="leading-normal">{item}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeaknessesList;
