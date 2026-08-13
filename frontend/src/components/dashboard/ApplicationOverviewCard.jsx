import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Send, Clock, CalendarCheck, CheckCircle2, ArrowRight, Percent, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

export const ApplicationOverviewCard = ({ applications = {} }) => {
  const navigate = useNavigate();

  const total = applications?.total ?? 0;
  const applied = applications?.applied ?? 0;
  const underReview = applications?.underReview ?? 0;
  const interview = applications?.interview ?? applications?.interviewScheduled ?? 0;
  const offered = applications?.offered ?? 0;
  const interviewRate = applications?.interviewConversionRate ?? 0;
  const offerRate = applications?.offerConversionRate ?? 0;

  // Empty State: No applications tracked yet
  if (total === 0) {
    return (
      <Card variant="glass" className="w-full flex flex-col justify-between">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle as="h3" className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              Job Applications
            </CardTitle>
            <Badge variant="neutral" style="soft" size="sm">
              0 Active
            </Badge>
          </div>
          <CardDescription>Funnel conversion & application pipeline breakdown.</CardDescription>
        </CardHeader>

        <CardContent className="py-4">
          <EmptyState
            icon={<Briefcase className="w-8 h-8 text-emerald-400" />}
            title="No Applications Tracked"
            description="Explore jobs and start applying."
            className="py-4 border-0 bg-transparent p-0"
          />
        </CardContent>

        <CardFooter>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => navigate('/jobs')}
            leftIcon={<Search className="w-4 h-4" />}
          >
            Browse Jobs
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="w-full flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle as="h3" className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-400" />
            Job Applications
          </CardTitle>
          <Badge variant="success" style="soft" size="sm">
            {total} Active Tracker
          </Badge>
        </div>
        <CardDescription>Funnel conversion & application pipeline breakdown.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Pipeline Stage Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] font-medium">
              <Send className="w-3 h-3 text-indigo-400" /> Applied
            </div>
            <span className="text-xl font-bold text-white block">{applied}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] font-medium">
              <Clock className="w-3 h-3 text-amber-400" /> Review
            </div>
            <span className="text-xl font-bold text-white block">{underReview}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] font-medium">
              <CalendarCheck className="w-3 h-3 text-cyan-400" /> Interview
            </div>
            <span className="text-xl font-bold text-white block">{interview}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Offered
            </div>
            <span className="text-xl font-bold text-emerald-300 block">{offered}</span>
          </div>
        </div>

        {/* Funnel Conversion Rates */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
          <div className="space-y-0.5">
            <span className="text-slate-400 block">Interview Conversion Rate</span>
            <span className="text-sm font-bold text-cyan-300 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5" /> {interviewRate}%
            </span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="space-y-0.5 text-right">
            <span className="text-slate-400 block">Offer Conversion Rate</span>
            <span className="text-sm font-bold text-emerald-300 flex items-center justify-end gap-1">
              <Percent className="w-3.5 h-3.5" /> {offerRate}%
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={() => navigate('/applications')}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          View Application Tracker
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApplicationOverviewCard;
