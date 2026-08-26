import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Bookmark,
  BookmarkCheck,
  Building2,
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const JobDetailsHeader = ({
  job,
  isSaved = false,
  existingApplication = null,
  onSaveToggle,
  onOpenApplyModal,
  className = '',
}) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  if (!job) return null;

  const companyName = job.company?.companyName || job.companyName || 'Company';
  const companyLogo = job.company?.logoUrl || null;
  const companyInitials = companyName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Check if job is expired or closed
  const isExpired = job.applicationDeadline && new Date() > new Date(job.applicationDeadline);
  const isClosed = job.status !== 'Active';
  const hasApplied = Boolean(existingApplication);

  const handleSave = async () => {
    if (!onSaveToggle) return;
    setSaving(true);
    try {
      await onSaveToggle(job._id);
    } finally {
      setSaving(false);
    }
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

  // Format Experience
  const formatExp = () => {
    if (!job.experience) return null;
    const { minYears, maxYears } = job.experience;
    if (minYears === 0 && maxYears === 0) return 'Entry Level';
    if (minYears === maxYears) return `${minYears} yrs exp`;
    return `${minYears}–${maxYears} yrs exp`;
  };

  const expString = formatExp();

  const formattedDeadline = job.applicationDeadline
    ? new Date(job.applicationDeadline).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Card variant="glass" className={`border-slate-800 space-y-4 ${className}`.trim()}>
      <CardHeader className="pb-4">
        {/* Navigation & Action Header Bar */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <Button
            size="xs"
            variant="ghost"
            onClick={() => navigate('/jobs')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="text-slate-400 hover:text-slate-200"
          >
            Back to Jobs
          </Button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`
                px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer
                ${
                  isSaved
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-amber-400'
                }
              `.trim()}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 fill-amber-400/20" /> Saved
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" /> Save Job
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hero Title & Company Avatar */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-800 bg-slate-900 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-bold font-mono text-xl flex items-center justify-center shrink-0">
                {companyInitials || <Building2 className="w-7 h-7" />}
              </div>
            )}

            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                {companyName}
              </span>
              <CardTitle className="text-xl sm:text-2xl font-black text-slate-100">
                {job.title}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Posted {new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Apply CTA / Status Badge */}
          <div className="self-start sm:self-center shrink-0">
            {hasApplied ? (
              <Badge variant="success" style="soft" size="md" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Applied ({existingApplication.status || 'Submitted'})
              </Badge>
            ) : isClosed ? (
              <Badge variant="secondary" style="soft" size="md" leftIcon={<AlertCircle className="w-4 h-4" />}>
                Job Position Closed
              </Badge>
            ) : isExpired ? (
              <Badge variant="danger" style="soft" size="md" leftIcon={<AlertCircle className="w-4 h-4" />}>
                Deadline Expired
              </Badge>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={onOpenApplyModal}
                leftIcon={<Send className="w-4 h-4" />}
                className="w-full sm:w-auto shadow-lg shadow-indigo-600/20"
              >
                Apply Now
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Meta Specs Pill Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Work Mode</span>
            <span className="font-bold text-slate-200 block">{job.workMode}</span>
          </div>

          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Employment Type</span>
            <span className="font-bold text-slate-200 block">{job.employmentType}</span>
          </div>

          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Experience</span>
            <span className="font-bold text-slate-200 block">{expString || 'Not specified'}</span>
          </div>

          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Salary</span>
            <span className="font-mono font-bold text-emerald-400 block">
              {formattedSalary || 'Undisclosed'}
            </span>
          </div>
        </div>

        {formattedDeadline && (
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Application Deadline: <strong className="text-slate-200">{formattedDeadline}</strong></span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default JobDetailsHeader;
