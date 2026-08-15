import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  SkipForward,
  RotateCcw,
  Clock,
  Tag,
  BookOpen
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskTypeBadge } from './TaskTypeBadge';
import { TaskResourcesList } from './TaskResourcesList';
import { roadmapService } from '../../services/roadmapService';

/**
 * LearningTaskCard Component
 * Displays individual learning task attributes, resources, and action controls
 * (Start, Complete, Skip, Reopen) with single-task loading locks, keyboard focus rings,
 * screen-reader friendly ARIA attributes, and responsive layout.
 */
export const LearningTaskCard = ({
  task = {},
  onTaskUpdated = () => {},
  className = '',
}) => {
  const [activeAction, setActiveAction] = useState(null); // 'start' | 'complete' | 'skip' | 'reopen'
  const [error, setError] = useState(null);

  const taskId = task._id || task.id;
  const status = String(task.status || 'NOT_STARTED').toUpperCase();
  const isCompleted = status === 'COMPLETED';
  const isInProgress = status === 'IN_PROGRESS';
  const isSkipped = status === 'SKIPPED';

  // Handle Task Action (Start, Complete, Skip, Reopen)
  const handleAction = async (actionType) => {
    if (!taskId || activeAction) return;

    setActiveAction(actionType);
    setError(null);

    try {
      let updatedResult;
      if (actionType === 'start') {
        updatedResult = await roadmapService.startTask(taskId);
      } else if (actionType === 'complete') {
        updatedResult = await roadmapService.completeTask(taskId);
      } else if (actionType === 'skip') {
        updatedResult = await roadmapService.skipTask(taskId);
      } else if (actionType === 'reopen') {
        updatedResult = await roadmapService.reopenTask(taskId);
      }

      const payload = updatedResult?.data || updatedResult;
      onTaskUpdated(payload?.task || payload || { ...task, status: actionType.toUpperCase() });
    } catch (err) {
      console.error(`Error performing task ${actionType}:`, err);
      const msg = err?.response?.data?.message || err?.message || `Failed to ${actionType} task.`;
      setError(msg);
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <Card
      variant="glass"
      className={`w-full flex flex-col justify-between transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500/50 ${
        isCompleted
          ? 'border-emerald-500/30 bg-slate-950/70'
          : isInProgress
          ? 'border-indigo-500/40 bg-slate-900/90 shadow-md shadow-indigo-500/10'
          : 'border-slate-800 bg-slate-900/60'
      } ${className}`.trim()}
      aria-labelledby={`task-title-${taskId}`}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Type & Status Badges */}
          <div className="flex items-center gap-2">
            <TaskTypeBadge type={task.type} size="sm" />
            <TaskStatusBadge status={task.status} size="sm" />
            <span className="sr-only">Task Status: {status}</span>
          </div>

          {/* Priority & Duration */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Badge variant="outline" size="sm">
              <span className="sr-only">Priority Level:</span> {task.priority || 'MEDIUM'}
            </Badge>
            <span className="flex items-center gap-1 font-mono text-[11px]" aria-label={`Estimated duration ${task.estimatedMinutes || 30} minutes`}>
              <Clock className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" /> {task.estimatedMinutes || 30} mins
            </span>
          </div>
        </div>

        {/* Task Title */}
        <CardTitle
          id={`task-title-${taskId}`}
          as="h4"
          className={`text-base font-bold text-white pt-2 leading-snug ${isCompleted ? 'line-through text-slate-400' : ''}`}
        >
          {task.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
          {task.description || 'No detailed description provided.'}
        </p>

        {/* Error Alert if action failed */}
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between" role="alert">
            <span>{error}</span>
          </div>
        )}

        {/* Skills Tags */}
        {task.skills && task.skills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1" aria-label="Skills trained in this task">
            {task.skills.map((sk, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-[10px] text-slate-300 flex items-center gap-1 font-mono"
              >
                <Tag className="w-2.5 h-2.5 text-indigo-400" aria-hidden="true" /> {sk}
              </span>
            ))}
          </div>
        )}

        {/* External Resources Section */}
        <TaskResourcesList resources={task.resources} />
      </CardContent>

      <CardFooter className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        
        {/* Left Secondary Action: Skip / Reopen */}
        <div>
          {isCompleted || isSkipped ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('reopen')}
              isLoading={activeAction === 'reopen'}
              disabled={Boolean(activeAction)}
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />}
              aria-label={`Reopen task: ${task.title}`}
              className="min-h-[38px] px-3 focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Reopen
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction('skip')}
              isLoading={activeAction === 'skip'}
              disabled={Boolean(activeAction)}
              leftIcon={<SkipForward className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />}
              aria-label={`Skip task: ${task.title}`}
              className="text-slate-400 hover:text-slate-200 min-h-[38px] px-3 focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Skip
            </Button>
          )}
        </div>

        {/* Right Primary Action: Start / Complete */}
        <div>
          {!isCompleted && !isInProgress && !isSkipped && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleAction('start')}
              isLoading={activeAction === 'start'}
              disabled={Boolean(activeAction)}
              leftIcon={<Play className="w-3.5 h-3.5 fill-indigo-200" aria-hidden="true" />}
              aria-label={`Start learning task: ${task.title}`}
              className="min-h-[38px] px-4 shadow-md shadow-indigo-500/20 focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Start Task
            </Button>
          )}

          {isInProgress && (
            <Button
              variant="success"
              size="sm"
              onClick={() => handleAction('complete')}
              isLoading={activeAction === 'complete'}
              disabled={Boolean(activeAction)}
              leftIcon={<CheckCircle2 className="w-4 h-4" aria-hidden="true" />}
              aria-label={`Mark task as complete: ${task.title}`}
              className="min-h-[38px] px-4 shadow-md shadow-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Complete Task
            </Button>
          )}

          {isCompleted && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Task Completed
            </span>
          )}
        </div>

      </CardFooter>
    </Card>
  );
};

export default LearningTaskCard;
