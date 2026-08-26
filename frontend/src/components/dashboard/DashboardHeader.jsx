import React from 'react';
import { RefreshCw, Sparkles, UserCheck, Target } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

/**
 * DashboardHeader Component
 * Renders candidate greeting, target role, profile completion indicator, and refresh action.
 */
export const DashboardHeader = ({
  user,
  profile = {},
  loading = false,
  onRefresh,
  onStartInterview,
}) => {
  const userName = user?.firstName || user?.name?.split(' ')[0] || 'Candidate';
  const targetRole = profile?.targetRole || 'Software Engineer';
  const completion = profile?.completionPercentage ?? 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-indigo-950/40 border border-slate-800/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      {/* Subtle background glow effect */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Side: Greeting & Status Badges */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="primary" style="soft" size="sm" icon={<Target className="w-3.5 h-3.5" />}>
              {targetRole}
            </Badge>

            <Badge
              variant={completion >= 80 ? 'success' : completion >= 50 ? 'warning' : 'neutral'}
              style="soft"
              size="sm"
              icon={<UserCheck className="w-3.5 h-3.5" />}
            >
              Profile {completion}% Complete
            </Badge>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-indigo-300 via-cyan-300 to-teal-200 bg-clip-text text-transparent">{userName}</span> 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
              Track your ATS resume readiness, practice AI mock interviews, and optimize your candidate career score.
            </p>
          </div>

          {/* Quick Profile Progress Bar */}
          {completion < 100 && (
            <div className="pt-1 max-w-md">
              <ProgressBar
                value={completion}
                max={100}
                label="Candidate Profile Completion"
                size="sm"
                color={completion >= 80 ? 'emerald' : completion >= 50 ? 'indigo' : 'amber'}
              />
            </div>
          )}
        </div>

        {/* Right Side: Header CTA Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="md"
            onClick={onRefresh}
            isLoading={loading}
            disabled={loading}
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            aria-label="Refresh Dashboard Metrics"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onStartInterview}
            leftIcon={<Sparkles className="w-4 h-4 text-cyan-200" />}
            className="shadow-lg shadow-indigo-600/25"
          >
            Start AI Interview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
