import React from 'react';
import { CheckCircle2, Play, Circle, SkipForward } from 'lucide-react';
import { Badge } from '../ui/Badge';

/**
 * TaskStatusBadge Component
 * Maps backend task status enums (NOT_STARTED, IN_PROGRESS, COMPLETED, SKIPPED)
 * to color-coded design system badges with icons.
 */
export const TaskStatusBadge = ({ status = 'NOT_STARTED', size = 'sm', className = '' }) => {
  const normStatus = String(status || '').toUpperCase();

  switch (normStatus) {
    case 'COMPLETED':
      return (
        <Badge
          variant="success"
          size={size}
          icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          className={className}
        >
          Completed
        </Badge>
      );

    case 'IN_PROGRESS':
      return (
        <Badge
          variant="primary"
          size={size}
          icon={<Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />}
          className={className}
        >
          In Progress
        </Badge>
      );

    case 'SKIPPED':
      return (
        <Badge
          variant="warning"
          style="soft"
          size={size}
          icon={<SkipForward className="w-3.5 h-3.5 text-amber-400" />}
          className={className}
        >
          Skipped
        </Badge>
      );

    case 'NOT_STARTED':
    default:
      return (
        <Badge
          variant="outline"
          size={size}
          icon={<Circle className="w-3.5 h-3.5 text-slate-400" />}
          className={className}
        >
          Not Started
        </Badge>
      );
  }
};

export default TaskStatusBadge;
