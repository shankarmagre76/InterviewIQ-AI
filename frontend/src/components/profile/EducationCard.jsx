import React from 'react';
import { GraduationCap, Edit3, Trash2, Calendar, Award, Building2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const EducationCard = ({
  education,
  onEdit,
  onDelete,
  className = '',
}) => {
  if (!education) return null;

  const { _id, institute, degree, branch, startYear, endYear, current, cgpa } = education;

  const yearDisplay = current
    ? `${startYear} – Present`
    : endYear
    ? `${startYear} – ${endYear}`
    : `${startYear}`;

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start justify-between gap-4 ${className}`.trim()}
    >
      <div className="flex items-start gap-4 overflow-hidden flex-1">
        <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 shadow-inner">
          <GraduationCap className="w-6 h-6" />
        </div>

        <div className="space-y-1 overflow-hidden">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-bold text-slate-100 tracking-tight">
              {degree}
            </h4>
            {branch && (
              <span className="text-xs text-indigo-300 font-semibold">
                • {branch}
              </span>
            )}
            {current && (
              <Badge variant="info" style="soft" size="xs" className="px-2">
                Currently Pursuing
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{institute}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{yearDisplay}</span>
            </div>

            {cgpa !== null && cgpa !== undefined && (
              <div className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800 text-amber-300 font-semibold">
                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>CGPA / Grade: {cgpa}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Edit & Delete Buttons */}
      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start pt-1">
        {onEdit && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onEdit(education)}
            title="Edit education entry"
            className="text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10"
            iconOnly={<Edit3 className="w-4 h-4" />}
          />
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onDelete(_id)}
            title="Delete education entry"
            className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
            iconOnly={<Trash2 className="w-4 h-4" />}
          />
        )}
      </div>
    </div>
  );
};

export default EducationCard;
