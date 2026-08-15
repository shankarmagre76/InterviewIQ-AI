import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';

export const JobListSkeleton = ({ count = 6, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`.trim()}>
      {Array.from({ length: count }).map((_, idx) => (
        <Card key={idx} variant="glass" className="border-slate-800 animate-pulse space-y-4">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-800 rounded" />
                  <div className="h-3 w-20 bg-slate-800/80 rounded" />
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-slate-800 shrink-0" />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <div className="h-5 w-16 bg-slate-800/60 rounded-full" />
              <div className="h-5 w-20 bg-slate-800/60 rounded-full" />
              <div className="h-5 w-24 bg-slate-800/60 rounded-full" />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <div className="h-3 w-full bg-slate-800/50 rounded" />
              <div className="h-3 w-3/4 bg-slate-800/50 rounded" />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="h-4 w-24 bg-slate-800 rounded" />
              <div className="h-8 w-24 bg-slate-800 rounded-xl" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default JobListSkeleton;
