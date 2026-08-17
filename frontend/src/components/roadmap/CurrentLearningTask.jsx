import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, ArrowRight, CheckCircle2, Play, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

/**
 * CurrentLearningTask Component
 * Highlights candidate's current focus topic, recommended next learning task,
 * estimated completion duration, and "Continue Learning" action button.
 */
export const CurrentLearningTask = ({
  roadmap = null,
  tasks = [],
  className = '',
}) => {
  const navigate = useNavigate();

  // No active roadmap state
  if (!roadmap || !tasks) {
    return null;
  }

  // Find next pending or in-progress task
  const currentTask =
    tasks.find((t) => t.status === 'In Progress') ||
    tasks.find((t) => t.status === 'Pending' || t.status === 'Not Started') ||
    tasks[0];

  // Active phase title
  const activePhase = roadmap.phases?.find((p) => p.status === 'In Progress') || roadmap.phases?.[0];
  const currentFocus = activePhase?.title?.replace(/^Phase \d+:\s*/, '') || roadmap.targetRole || 'Software Engineering';

  const taskTitle = currentTask?.title || 'Build a REST API with Spring Boot';
  const estimatedMinutes = currentTask?.estimatedDurationMinutes || currentTask?.estimatedMinutes || 45;
  const taskDescription = currentTask?.description || 'Implement core controllers, service layers, and REST endpoints.';

  return (
    <Card variant="glass" className={`w-full flex flex-col justify-between ${className}`.trim()}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle as="h3" className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Current Focus
          </CardTitle>

          <Badge variant="primary" style="soft" size="sm">
            {currentFocus}
          </Badge>
        </div>
        <CardDescription>Recommended next action on your active roadmap.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Recommended Task Highlight Box */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Next Task
            </span>
            <span className="text-xs font-medium text-cyan-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Estimated: {estimatedMinutes} mins
            </span>
          </div>

          <h4 className="text-sm font-bold text-white leading-snug">
            "{taskTitle}"
          </h4>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {taskDescription}
          </p>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={() => navigate('/roadmap')}
          leftIcon={<Play className="w-4 h-4 text-cyan-200" />}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="shadow-lg shadow-indigo-600/20"
        >
          Continue Learning
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CurrentLearningTask;
