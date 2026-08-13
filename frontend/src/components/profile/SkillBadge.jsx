import React from 'react';
import { X, Edit2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const SkillBadge = ({
  skill,
  onEdit,
  onDelete,
  readOnly = false,
  className = '',
}) => {
  if (!skill) return null;

  const { _id, name, level = 'Beginner' } = skill;

  const getLevelVariant = (lvl) => {
    switch (lvl) {
      case 'Advanced':
        return 'success';
      case 'Intermediate':
        return 'primary';
      case 'Beginner':
      default:
        return 'warning';
    }
  };

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800
        hover:border-slate-700 transition-all text-xs font-semibold text-slate-100 shadow-sm group ${className}
      `.trim()}
    >
      <span className="font-bold tracking-tight text-white">{name}</span>

      <Badge variant={getLevelVariant(level)} style="soft" size="sm" className="px-2 py-0.5 text-[10px]">
        {level}
      </Badge>

      {!readOnly && (
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity ml-0.5">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(skill)}
              title={`Edit level for ${name}`}
              className="p-1 rounded-md text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/20 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(_id || name)}
              title={`Remove ${name}`}
              className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillBadge;
