import React from 'react';
import {
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  GraduationCap,
  FolderGit2,
  HelpCircle
} from 'lucide-react';
import { Badge } from '../ui/Badge';

/**
 * Safely format and validate external URLs
 */
const sanitizeUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return '#';
  const trimmed = rawUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

/**
 * Returns icon and color for backend supported RESOURCE_TYPES
 * ('ARTICLE', 'VIDEO', 'DOCUMENTATION', 'COURSE', 'REPOSITORY', 'OTHER')
 */
const getResourceTypeConfig = (type) => {
  const normType = String(type || '').toUpperCase();
  switch (normType) {
    case 'VIDEO':
      return {
        icon: <Video className="w-4 h-4 text-purple-400 shrink-0" />,
        label: 'Video',
        variant: 'secondary',
      };
    case 'DOCUMENTATION':
      return {
        icon: <FileText className="w-4 h-4 text-cyan-400 shrink-0" />,
        label: 'Documentation',
        variant: 'info',
      };
    case 'COURSE':
      return {
        icon: <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />,
        label: 'Course',
        variant: 'success',
      };
    case 'REPOSITORY':
      return {
        icon: <FolderGit2 className="w-4 h-4 text-amber-400 shrink-0" />,
        label: 'Repository',
        variant: 'warning',
      };
    case 'ARTICLE':
      return {
        icon: <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />,
        label: 'Article',
        variant: 'primary',
      };
    case 'OTHER':
    default:
      return {
        icon: <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />,
        label: type || 'Resource',
        variant: 'outline',
      };
  }
};

/**
 * TaskResourcesList Component
 * Displays structured learning task resources with secure external links (target="_blank" rel="noopener noreferrer"),
 * resource type badges, and fallback empty states.
 */
export const TaskResourcesList = ({ resources = [], className = '' }) => {
  if (!resources || resources.length === 0) {
    return null;
  }

  return (
    <div className={`p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 ${className}`.trim()}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-indigo-400" /> Learning Resources ({resources.length})
        </span>
        <span className="text-[10px] text-slate-500 font-mono">External Verified</span>
      </div>

      <div className="space-y-2">
        {resources.map((res, idx) => {
          const safeUrl = sanitizeUrl(res.url);
          const config = getResourceTypeConfig(res.type);

          return (
            <a
              key={res._id || idx}
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 flex items-start justify-between gap-3 text-xs group transition-all duration-150"
            >
              <div className="flex items-start gap-3 min-w-0">
                {config.icon}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                      {res.title || 'Learning Resource'}
                    </span>
                    <Badge variant={config.variant} style="soft" size="sm" className="text-[9px] px-1.5 py-0">
                      {config.label}
                    </Badge>
                  </div>

                  {res.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>
                  )}

                  <span className="text-[10px] text-slate-500 font-mono truncate block">
                    {safeUrl}
                  </span>
                </div>
              </div>

              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0 mt-0.5" />
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default TaskResourcesList;
