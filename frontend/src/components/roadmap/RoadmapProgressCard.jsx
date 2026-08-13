import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, CheckCircle2, Circle, ArrowRight, Sparkles, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

/**
 * RoadmapProgressCard Component
 * Displays candidate's active learning roadmap progress, completed vs remaining tasks,
 * and current focus phase. Shows "Generate Roadmap" CTA when no active roadmap exists.
 */
export const RoadmapProgressCard = ({
  roadmap = null,
  tasks = [],
  progress = 0,
  className = '',
}) => {
  const navigate = useNavigate();

  // No active roadmap state
  if (!roadmap) {
    return (
      <Card variant="glass" className={`w-full flex flex-col justify-between ${className}`.trim()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle as="h3" className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              AI Learning Roadmap
            </CardTitle>
            <Badge variant="warning" style="soft" size="sm">
              Not Generated
            </Badge>
          </div>
          <CardDescription>Personalized AI skill roadmap tailored to your target role.</CardDescription>
        </CardHeader>

        <CardContent className="py-4">
          <EmptyState
            icon={<Sparkles className="w-8 h-8 text-amber-400" />}
            title="No Active Roadmap"
            description="Generate your personalized learning roadmap."
            className="py-4 border-0 bg-transparent p-0"
          />
        </CardContent>

        <CardFooter>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => navigate('/roadmap')}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Generate Roadmap
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Active roadmap calculations
  const title = roadmap.title || 'Learning Roadmap';
  const targetRole = roadmap.targetRole || 'Software Engineer';
  const overallProgress = progress ?? roadmap.overallProgress ?? 0;

  // Task status counts
  const completedTasksCount = tasks.filter((t) => t.status === 'Completed').length;
  const remainingTasksCount = Math.max(0, tasks.length - completedTasksCount);

  // Find active phase
  const activePhase = roadmap.phases?.find((p) => p.status === 'In Progress') || roadmap.phases?.[0];
  const currentFocus = activePhase?.title?.replace(/^Phase \d+:\s*/, '') || 'Technical Foundation';

  return (
    <Card variant="glass" className={`w-full flex flex-col justify-between ${className}`.trim()}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle as="h3" className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            Your Roadmap
          </CardTitle>
          <Badge variant="success" style="soft" size="sm" icon={<Target className="w-3.5 h-3.5" />}>
            {targetRole}
          </Badge>
        </div>
        <CardDescription>{title}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Main Progress Bar & Percentage Hero */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Overall Completion</span>
            <span className="text-base font-extrabold text-amber-300">{overallProgress}% Complete</span>
          </div>

          <ProgressBar
            value={overallProgress}
            max={100}
            showPercentage={false}
            color="amber"
            size="md"
          />
        </div>

        {/* Current Focus & Tasks Stats */}
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] font-medium block">Current Focus Phase</span>
            <span className="text-sm font-bold text-white block truncate">{currentFocus}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Completed Tasks
              </span>
              <span className="text-lg font-bold text-emerald-300 block">{completedTasksCount}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                <Circle className="w-3.5 h-3.5 text-amber-400" /> Tasks Remaining
              </span>
              <span className="text-lg font-bold text-amber-300 block">{remainingTasksCount}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={() => navigate('/roadmap')}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          View Full Roadmap
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RoadmapProgressCard;
