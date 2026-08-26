import React from 'react';
import { BookOpen, Wrench, FolderKanban, Code2, Video, RotateCcw } from 'lucide-react';
import { Badge } from '../ui/Badge';

/**
 * TaskTypeBadge Component
 * Maps backend task type enums (LEARNING, PRACTICE, PROJECT, CODING, INTERVIEW, REVIEW)
 * to color-coded badges with contextual icons.
 */
export const TaskTypeBadge = ({ type = 'LEARNING', size = 'sm', className = '' }) => {
  const normType = String(type || '').toUpperCase();

  switch (normType) {
    case 'LEARNING':
      return (
        <Badge
          variant="primary"
          style="soft"
          size={size}
          icon={<BookOpen className="w-3.5 h-3.5 text-indigo-400" />}
          className={className}
        >
          Learning
        </Badge>
      );

    case 'PRACTICE':
      return (
        <Badge
          variant="info"
          style="soft"
          size={size}
          icon={<Wrench className="w-3.5 h-3.5 text-cyan-400" />}
          className={className}
        >
          Practice
        </Badge>
      );

    case 'PROJECT':
      return (
        <Badge
          variant="secondary"
          style="soft"
          size={size}
          icon={<FolderKanban className="w-3.5 h-3.5 text-purple-400" />}
          className={className}
        >
          Project
        </Badge>
      );

    case 'CODING':
      return (
        <Badge
          variant="success"
          style="soft"
          size={size}
          icon={<Code2 className="w-3.5 h-3.5 text-emerald-400" />}
          className={className}
        >
          Coding
        </Badge>
      );

    case 'INTERVIEW':
      return (
        <Badge
          variant="warning"
          style="soft"
          size={size}
          icon={<Video className="w-3.5 h-3.5 text-amber-400" />}
          className={className}
        >
          Interview
        </Badge>
      );

    case 'REVIEW':
      return (
        <Badge
          variant="default"
          style="soft"
          size={size}
          icon={<RotateCcw className="w-3.5 h-3.5 text-slate-400" />}
          className={className}
        >
          Review
        </Badge>
      );

    default:
      return (
        <Badge variant="outline" size={size} className={className}>
          {type}
        </Badge>
      );
  }
};

export default TaskTypeBadge;
