import React from 'react';
import { FolderGit2, Edit3, Trash2, Calendar, GitBranch, Globe, Code2, User } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const ProjectCard = ({
  project,
  onEdit,
  onDelete,
  className = '',
}) => {
  if (!project) return null;

  const {
    _id,
    title,
    name,
    description,
    technologies = [],
    role,
    startDate,
    endDate,
    current,
    githubUrl,
    liveUrl,
    projectType = 'Personal',
  } = project;

  const projectTitle = title || name || 'Untitled Project';

  const formatDate = (dateVal) => {
    if (!dateVal) return '';
    try {
      const dateObj = new Date(dateVal);
      return dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return String(dateVal);
    }
  };

  const startFormatted = formatDate(startDate);
  const endFormatted = current ? 'Present' : formatDate(endDate);
  const dateRangeDisplay = startFormatted ? `${startFormatted} – ${endFormatted || 'Present'}` : null;

  const techList = Array.isArray(technologies)
    ? technologies
    : typeof technologies === 'string'
    ? technologies.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start justify-between gap-4 ${className}`.trim()}
    >
      <div className="flex items-start gap-4 overflow-hidden flex-1">
        <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
          <FolderGit2 className="w-6 h-6" />
        </div>

        <div className="space-y-2 overflow-hidden flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-bold text-slate-100 tracking-tight">
              {projectTitle}
            </h4>

            {projectType && (
              <Badge variant="warning" style="soft" size="xs">
                {projectType}
              </Badge>
            )}

            {current && (
              <Badge variant="success" style="soft" size="xs" className="px-2">
                Active Project
              </Badge>
            )}
          </div>

          {/* Role & Date Meta */}
          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs font-medium text-slate-300">
            {role && (
              <div className="flex items-center gap-1.5 text-indigo-300">
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{role}</span>
              </div>
            )}

            {dateRangeDisplay && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>{dateRangeDisplay}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/30 p-3 rounded-xl border border-slate-800/40">
              {description}
            </p>
          )}

          {/* Tech Stack Chips */}
          {techList.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
                <Code2 className="w-3 h-3 text-indigo-400" /> Stack:
              </span>
              {techList.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-cyan-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Links */}
          {(githubUrl || liveUrl) && (
            <div className="flex flex-wrap items-center gap-2 pt-1.5">
              {githubUrl && (
                <a
                  href={githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                >
                  <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                  <span>GitHub Repository</span>
                </a>
              )}

              {liveUrl && (
                <a
                  href={liveUrl.startsWith('http') ? liveUrl : `https://${liveUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-300 hover:text-indigo-200 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Live Demo</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Edit & Delete Buttons */}
      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start pt-1">
        {onEdit && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onEdit(project)}
            title="Edit project entry"
            className="text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10"
            iconOnly={<Edit3 className="w-4 h-4" />}
          />
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onDelete(_id)}
            title="Delete project entry"
            className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
            iconOnly={<Trash2 className="w-4 h-4" />}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
