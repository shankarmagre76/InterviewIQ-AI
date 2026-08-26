import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  Clock,
  Bookmark,
  BookmarkCheck,
  Building2,
  DollarSign,
  ArrowRight,
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const JobCard = ({
  job,
  isSaved = false,
  onSaveToggle,
  className = '',
}) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  if (!job) return null;

  const companyName = job.company?.companyName || job.companyName || 'Unknown Company';
  const companyLogo = job.company?.logoUrl || null;
  const companyInitials = companyName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleSaveClick = async (e) => {
    e.stopPropagation();
    if (!onSaveToggle) return;
    setSaving(true);
    try {
      await onSaveToggle(job._id);
    } finally {
      setSaving(false);
    }
  };

  const handleViewJob = () => {
    navigate(`/jobs/${job._id}`);
  };

  // Format Salary Range
  const formatSalary = () => {
    const s = job.salary;
    if (!s || !s.isDisclosed || (!s.min && !s.max)) return null;
    const currencySymbols = {
      USD: '$',
      EUR: '€',
      INR: '₹',
      GBP: '£',
      CAD: 'C$',
      AUD: 'A$',
    };
    const currencySymbol = currencySymbols[s.currency] || (s.currency ? `${s.currency} ` : '$');
    const periodStr = s.period === 'Hourly' ? '/hr' : s.period === 'Monthly' ? '/mo' : '/yr';

    if (s.min && s.max) {
      const minK = s.min >= 1000 ? `${(s.min / 1000).toFixed(0)}k` : s.min;
      const maxK = s.max >= 1000 ? `${(s.max / 1000).toFixed(0)}k` : s.max;
      return `${currencySymbol}${minK} – ${currencySymbol}${maxK} ${periodStr}`;
    }
    const val = s.min || s.max;
    const valK = val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val;
    return `${currencySymbol}${valK} ${periodStr}`;
  };

  const formattedSalary = formatSalary();

  // Format Experience Requirement
  const formatExp = () => {
    if (!job.experience) return null;
    const { minYears, maxYears } = job.experience;
    if (minYears === 0 && maxYears === 0) return 'Entry Level';
    if (minYears === maxYears) return `${minYears} yrs exp`;
    return `${minYears}–${maxYears} yrs exp`;
  };

  const expString = formatExp();

  // Format Posted Date Relative String
  const formatPostedDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const skillsList = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
  const displaySkills = skillsList.slice(0, 4);
  const extraSkillsCount = skillsList.length - displaySkills.length;

  return (
    <Card
      variant="glass"
      className={`
        border-slate-800 hover:border-indigo-500/50 transition-all duration-300
        flex flex-col justify-between cursor-pointer group hover:shadow-lg hover:shadow-indigo-500/5
        ${className}
      `.trim()}
      onClick={handleViewJob}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Company Avatar & Title */}
          <div className="flex items-center gap-3.5 overflow-hidden">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-800 shrink-0 bg-slate-900"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-bold font-mono text-sm flex items-center justify-center shrink-0">
                {companyInitials || <Building2 className="w-5 h-5" />}
              </div>
            )}

            <div className="overflow-hidden">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block truncate">
                {companyName}
              </span>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
                {job.title}
              </CardTitle>
            </div>
          </div>

          {/* Bookmark / Save Button */}
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={saving}
            aria-label={isSaved ? 'Unsave job' : 'Save job'}
            className={`
              p-2 rounded-xl border transition-all cursor-pointer shrink-0
              ${
                isSaved
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-amber-400 hover:border-amber-500/30'
              }
            `.trim()}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4 fill-amber-400/20" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Meta Info Badges (Work Mode, Employment Type, Experience, Location) */}
        <div className="flex flex-wrap gap-2 text-xs">
          {job.workMode && (
            <Badge variant="info" style="soft" size="xs">
              {job.workMode}
            </Badge>
          )}

          {job.employmentType && (
            <Badge variant="neutral" style="soft" size="xs">
              {job.employmentType}
            </Badge>
          )}

          {expString && (
            <Badge variant="secondary" style="soft" size="xs" leftIcon={<Briefcase className="w-3 h-3" />}>
              {expString}
            </Badge>
          )}
        </div>

        {/* Location & Salary Info */}
        <div className="space-y-1.5 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>

          {formattedSalary && (
            <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-semibold">
              <DollarSign className="w-3.5 h-3.5 shrink-0" />
              <span>{formattedSalary}</span>
            </div>
          )}
        </div>

        {/* Skills Tag Cloud */}
        {displaySkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {displaySkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300"
              >
                {skill}
              </span>
            ))}
            {extraSkillsCount > 0 && (
              <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
                +{extraSkillsCount}
              </span>
            )}
          </div>
        )}

        {/* Bottom Bar: Posted Date & View CTA */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatPostedDate(job.createdAt)}
          </span>

          <Button
            size="xs"
            variant="ghost"
            className="text-indigo-300 group-hover:text-indigo-200 group-hover:translate-x-0.5 transition-transform"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View Job
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
