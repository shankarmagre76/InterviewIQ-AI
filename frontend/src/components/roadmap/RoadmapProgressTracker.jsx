import React from 'react';
import { Award, CheckCircle2, Layers, Sparkles, Target, Zap } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';

/**
 * RoadmapProgressTracker Component
 * Displays real-time progress metrics derived directly from backend response:
 * - Overall Roadmap Progress (e.g. 72%)
 * - Current Phase Progress (e.g. 80%)
 * - Tasks Completion Ratio (e.g. 8 / 12 completed)
 */
export const RoadmapProgressTracker = ({
  overallProgress = 0,
  currentPhaseProgress = 0,
  currentPhaseTitle = 'Current Focus Phase',
  completedTasks = 0,
  totalTasks = 0,
  roadmapStatus = 'ACTIVE',
  milestoneMessage = null,
  onDismissMilestone = () => {},
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`.trim()}>
      
      {/* Milestone Toast Banner */}
      {milestoneMessage && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-emerald-500/20 border border-indigo-500/40 backdrop-blur-xl shadow-lg flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Milestone Unlocked!
              </span>
              <p className="text-xs font-bold text-white leading-snug">
                {milestoneMessage}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onDismissMilestone}
            className="text-xs text-slate-400 hover:text-white underline shrink-0 px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Progress Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Overall Progress */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-400" /> Overall Progress
            </span>
            <Badge variant="primary" style="soft" size="sm">
              {roadmapStatus}
            </Badge>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{overallProgress}%</span>
            <span className="text-xs text-indigo-300 font-semibold">Source of Truth</span>
          </div>

          <ProgressBar
            value={overallProgress}
            max={100}
            showPercentage={false}
            color="indigo"
            size="md"
          />
        </div>

        {/* Card 2: Current Phase Progress */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 truncate">
              <Layers className="w-4 h-4 text-cyan-400 shrink-0" /> {currentPhaseTitle}
            </span>
            <Badge variant="info" style="soft" size="sm">
              Current Phase
            </Badge>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-cyan-300">{currentPhaseProgress}%</span>
            <span className="text-xs text-cyan-400/80 font-mono">Phase Progress</span>
          </div>

          <ProgressBar
            value={currentPhaseProgress}
            max={100}
            showPercentage={false}
            color="cyan"
            size="md"
          />
        </div>

        {/* Card 3: Tasks Ratio */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Tasks Completion
            </span>
            <Badge variant="success" style="soft" size="sm">
              {totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : '0%'}
            </Badge>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400">
              {completedTasks} <span className="text-sm font-normal text-slate-400">/ {totalTasks} completed</span>
            </span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>

          <ProgressBar
            value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}
            max={100}
            showPercentage={false}
            color="emerald"
            size="md"
          />
        </div>

      </div>

    </div>
  );
};

export default RoadmapProgressTracker;
