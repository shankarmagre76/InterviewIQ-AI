import React from 'react';
import { Briefcase, Edit3, Trash2, Calendar, MapPin, Building2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const ExperienceCard = ({
  experience,
  onEdit,
  onDelete,
  className = '',
}) => {
  if (!experience) return null;

  const { _id, company, position, employmentType, location, startDate, endDate, current, description } = experience;

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
  const dateRangeDisplay = startFormatted ? `${startFormatted} – ${endFormatted || 'Present'}` : 'Dates not specified';

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start justify-between gap-4 ${className}`.trim()}
    >
      <div className="flex items-start gap-4 overflow-hidden flex-1">
        <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
          <Briefcase className="w-6 h-6" />
        </div>

        <div className="space-y-1.5 overflow-hidden flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-bold text-slate-100 tracking-tight">
              {position}
            </h4>
            {employmentType && (
              <Badge variant="indigo" style="soft" size="xs">
                {employmentType}
              </Badge>
            )}
            {current && (
              <Badge variant="success" style="soft" size="xs" className="px-2">
                Active Role
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{company}</span>
            </div>

            {location && (
              <div className="flex items-center gap-1 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{location}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-0.5">
            <div className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{dateRangeDisplay}</span>
            </div>
          </div>

          {description && (
            <p className="text-xs text-slate-300 pt-1.5 leading-relaxed whitespace-pre-line bg-slate-950/30 p-3 rounded-xl border border-slate-800/40">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Action Edit & Delete Buttons */}
      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start pt-1">
        {onEdit && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onEdit(experience)}
            title="Edit experience entry"
            className="text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10"
            iconOnly={<Edit3 className="w-4 h-4" />}
          />
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onDelete(_id)}
            title="Delete experience entry"
            className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
            iconOnly={<Trash2 className="w-4 h-4" />}
          />
        )}
      </div>
    </div>
  );
};

export default ExperienceCard;
