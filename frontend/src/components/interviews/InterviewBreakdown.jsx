import React from 'react';
import { Layers, Shield, Cpu, Users, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

/**
 * InterviewBreakdown Component
 * Renders candidate performance categorized by Difficulty (Beginner, Intermediate, Advanced)
 * and Interview Type (Technical, HR, Behavioral, Mixed).
 */
export const InterviewBreakdown = ({
  performanceByDifficulty = {},
  performanceByType = {},
  className = '',
}) => {
  // Format difficulty items array
  const difficultyItems = [
    { key: 'Beginner', label: 'Beginner', data: performanceByDifficulty?.Beginner || { total: 0, completed: 0, avgScore: 0 }, color: 'emerald' },
    { key: 'Intermediate', label: 'Intermediate', data: performanceByDifficulty?.Intermediate || { total: 0, completed: 0, avgScore: 0 }, color: 'indigo' },
    { key: 'Advanced', label: 'Advanced', data: performanceByDifficulty?.Advanced || { total: 0, completed: 0, avgScore: 0 }, color: 'amber' },
  ];

  // Format type items array
  const typeItems = [
    { key: 'Technical', label: 'Technical Rounds', icon: Cpu, data: performanceByType?.Technical || { total: 0, completed: 0, avgScore: 0 }, color: 'indigo' },
    { key: 'HR', label: 'HR / Culture Fit', icon: Users, data: performanceByType?.HR || { total: 0, completed: 0, avgScore: 0 }, color: 'cyan' },
    { key: 'Behavioral', label: 'Behavioral', icon: MessageSquare, data: performanceByType?.Behavioral || { total: 0, completed: 0, avgScore: 0 }, color: 'emerald' },
    { key: 'Mixed', label: 'Mixed / Comprehensive', icon: Shield, data: performanceByType?.Mixed || { total: 0, completed: 0, avgScore: 0 }, color: 'amber' },
  ];

  return (
    <Card variant="glass" className={`w-full flex flex-col justify-between ${className}`.trim()}>
      <CardHeader className="pb-4">
        <CardTitle as="h3" className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          Interview Breakdown & Ratings
        </CardTitle>
        <CardDescription>Average scores grouped by session difficulty and question domain.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Performance by Difficulty */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Performance by Difficulty Level
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {difficultyItems.map((item) => (
              <div
                key={item.key}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{item.label}</span>
                  <Badge variant="neutral" size="sm">
                    {item.data.completed || 0} sessions
                  </Badge>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xl font-bold text-white">
                    {item.data.avgScore || 0}
                  </span>
                  <span className="text-[10px] text-slate-400">/ 100 avg</span>
                </div>

                <ProgressBar
                  value={item.data.avgScore || 0}
                  max={100}
                  showPercentage={false}
                  color={item.color}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Performance by Interview Type */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Performance by Interview Category
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {typeItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-slate-400" /> {item.label}
                    </span>
                    <span className="font-bold text-white">
                      {item.data.avgScore || 0} <span className="text-[10px] text-slate-500 font-normal">/ 100</span>
                    </span>
                  </div>

                  <ProgressBar
                    value={item.data.avgScore || 0}
                    max={100}
                    showPercentage={false}
                    color={item.color}
                    size="sm"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewBreakdown;
