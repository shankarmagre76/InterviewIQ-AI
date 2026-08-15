import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ArrowDown,
  Layers,
  ChevronDown,
  ChevronUp,
  Tag,
  CircleDot,
  Circle
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

/**
 * Helper to return color variants for Priority Badges
 */
const getPriorityBadgeVariant = (priority) => {
  switch (String(priority || '').toUpperCase()) {
    case 'CRITICAL':
      return 'danger';
    case 'HIGH':
      return 'warning';
    case 'MEDIUM':
      return 'primary';
    case 'LOW':
    default:
      return 'default';
  }
};

/**
 * RoadmapPhaseTimeline Component
 * Renders a visual connected vertical node timeline showing learning phases.
 * Fully keyboard accessible (Enter/Space), ARIA expanded states, and mobile responsive.
 */
export const RoadmapPhaseTimeline = ({
  phases = [],
  tasks = [],
  onSelectPhase = () => {},
  className = '',
}) => {
  const [expandedPhaseId, setExpandedPhaseId] = useState(null);

  if (!phases || phases.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-400 text-xs">
        No learning phases found for this roadmap.
      </div>
    );
  }

  const toggleExpand = (phaseId) => {
    setExpandedPhaseId((prev) => (prev === phaseId ? null : phaseId));
  };

  return (
    <div className={`space-y-6 ${className}`.trim()}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" aria-hidden="true" />
          Learning Roadmap Curriculum ({phases.length} Phases)
        </h3>
        <span className="text-xs text-slate-400 font-mono">Sequential Path</span>
      </div>

      {/* Connected Vertical Timeline Nodes */}
      <div className="space-y-6 relative">
        {phases.map((phase, index) => {
          const phaseId = phase._id || phase.id || `phase-${index}`;
          const isCompleted = phase.status === 'COMPLETED' || phase.progress === 100;
          const isInProgress = phase.status === 'IN_PROGRESS' || (phase.progress > 0 && !isCompleted);
          const isExpanded = expandedPhaseId === phaseId;
          const isLast = index === phases.length - 1;

          // Filter tasks belonging to this phase
          const phaseTasks = tasks.filter(
            (t) => String(t.phaseId || t.phase) === String(phase._id || phase.id)
          );

          return (
            <div key={phaseId} className="relative">
              
              {/* Connector Line (except for last item) */}
              {!isLast && (
                <div className="absolute left-[23px] sm:left-[27px] top-12 bottom--6 w-0.5 bg-slate-800 z-0" aria-hidden="true" />
              )}

              {/* Node Card */}
              <div
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-controls={`phase-panel-${phaseId}`}
                aria-label={`Phase ${phase.order || index + 1}: ${phase.title}. ${isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started'}`}
                className={`relative z-10 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                  isCompleted
                    ? 'bg-slate-900/80 border-emerald-500/30 hover:border-emerald-500/50'
                    : isInProgress
                    ? 'bg-slate-900/95 border-indigo-500/50 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/20'
                    : 'bg-slate-950/60 border-slate-800/90 opacity-80 hover:opacity-100 hover:border-slate-700'
                }`}
                onClick={() => {
                  toggleExpand(phaseId);
                  onSelectPhase(phase);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleExpand(phaseId);
                    onSelectPhase(phase);
                  }
                }}
              >
                
                {/* Phase Main Row */}
                <div className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
                  
                  {/* Phase Status Icon Node */}
                  <div className="shrink-0 mt-0.5">
                    {isCompleted ? (
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
                        <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                        <span className="sr-only">Phase Completed</span>
                      </div>
                    ) : isInProgress ? (
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-300 shadow-md shadow-indigo-500/20">
                        <CircleDot className="w-5 h-5 text-indigo-400" aria-hidden="true" />
                        <span className="sr-only">Phase In Progress</span>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                        <Circle className="w-5 h-5" aria-hidden="true" />
                        <span className="sr-only">Phase Not Started</span>
                      </div>
                    )}
                  </div>

                  {/* Phase Main Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                          Phase {phase.order || index + 1}
                        </span>
                        <h4 className="text-base font-bold text-white truncate">
                          {phase.title}
                        </h4>
                      </div>

                      {/* Status & Priority Badges */}
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getPriorityBadgeVariant(phase.priority)}
                          style="soft"
                          size="sm"
                        >
                          {phase.priority || 'MEDIUM'}
                        </Badge>

                        <Badge
                          variant={isCompleted ? 'success' : isInProgress ? 'primary' : 'outline'}
                          size="sm"
                        >
                          {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started'}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {phase.description}
                    </p>

                    {/* Progress Bar & Meta Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 items-center">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                          <span>Completion Progress</span>
                          <span className={isCompleted ? 'text-emerald-400 font-bold' : 'text-indigo-400 font-bold'}>
                            {phase.progress || 0}%
                          </span>
                        </div>
                        <ProgressBar
                          value={phase.progress || 0}
                          max={100}
                          showPercentage={false}
                          color={isCompleted ? 'emerald' : 'indigo'}
                          size="sm"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" /> {phase.estimatedDays || 7} Days
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" aria-hidden="true" />
                        )}
                      </div>
                    </div>

                    {/* Skill Tags */}
                    {phase.skills && phase.skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {phase.skills.map((sk, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-800 text-[10px] font-medium text-slate-300 flex items-center gap-1"
                          >
                            <Tag className="w-2.5 h-2.5 text-indigo-400" aria-hidden="true" /> {sk}
                          </span>
                        ))}
                      </div>
                    )}

                  </div>

                </div>

                {/* Expandable Task Detail Accordion */}
                {isExpanded && (
                  <div
                    id={`phase-panel-${phaseId}`}
                    className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-800/80 bg-slate-950/40 space-y-3"
                  >
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                      Phase Tasks ({phaseTasks.length})
                    </span>

                    {phaseTasks.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No task breakdown available for this phase.</p>
                    ) : (
                      <div className="space-y-2">
                        {phaseTasks.map((t, tIdx) => {
                          const isTaskDone = t.status === 'COMPLETED' || t.status === 'Completed';
                          return (
                            <div
                              key={t._id || tIdx}
                              className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between text-xs gap-3"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {isTaskDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                                )}
                                <span className={`truncate font-medium ${isTaskDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                  {t.title}
                                </span>
                              </div>

                              <span className="text-[11px] text-slate-400 font-mono shrink-0">
                                {t.estimatedMinutes || 45} mins
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Connecting Down Arrow (between nodes) */}
              {!isLast && (
                <div className="flex justify-center my-2 text-slate-600" aria-hidden="true">
                  <ArrowDown className="w-4 h-4" />
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoadmapPhaseTimeline;
