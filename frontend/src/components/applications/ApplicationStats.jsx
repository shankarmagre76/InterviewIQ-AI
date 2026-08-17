import React from 'react';
import { Briefcase, Send, Clock, CalendarCheck, CheckCircle2, XCircle, MinusCircle, Percent, Code2, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

/**
 * ApplicationStats Component
 * Displays application totals, status breakdowns (Applied, Under Review, Interview, Technical, HR, Offered, Rejected, Withdrawn),
 * and conversion rates with division-by-zero UI defense.
 */
export const ApplicationStats = ({
  total = 0,
  applied = 0,
  underReview = 0,
  interviewScheduled = 0,
  technicalRound = 0,
  hrRound = 0,
  interviewTotal = 0,
  offered = 0,
  rejected = 0,
  withdrawn = 0,
  interviewConversionRate = 0,
  offerConversionRate = 0,
  className = '',
}) => {
  // Use interviewTotal if provided, else aggregate interview rounds
  const totalInterviews = interviewTotal || (interviewScheduled + technicalRound + hrRound);

  return (
    <Card variant="glass" className={`w-full flex flex-col justify-between ${className}`.trim()}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle as="h2" className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-400" />
            Job Application Analytics
          </CardTitle>

          <Badge variant="success" style="soft" size="sm">
            {total} Total Tracked
          </Badge>
        </div>
        <CardDescription>Pipeline breakdown and recruitment funnel conversion metrics.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Conversion Rates Hero */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total Applications
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {total}
            </span>
          </div>

          <div className="space-y-1 text-center sm:text-left border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Interview Conversion
            </span>
            <div className="flex items-center justify-center sm:justify-start gap-1 text-cyan-300 font-extrabold text-2xl">
              <Percent className="w-4 h-4 text-cyan-400" />
              <span>{total > 0 ? interviewConversionRate : 0}%</span>
            </div>
          </div>

          <div className="space-y-1 text-center sm:text-left border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Offer Conversion
            </span>
            <div className="flex items-center justify-center sm:justify-start gap-1 text-emerald-300 font-extrabold text-2xl">
              <Percent className="w-4 h-4 text-emerald-400" />
              <span>{total > 0 ? offerConversionRate : 0}%</span>
            </div>
          </div>
        </div>

        {/* Full Pipeline Status Breakdown Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Pipeline Stage Breakdown
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-center sm:text-left">
              <span className="text-[11px] text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1">
                <Send className="w-3 h-3 text-indigo-400" /> Applied
              </span>
              <span className="text-lg font-bold text-white block">{applied}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-center sm:text-left">
              <span className="text-[11px] text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1">
                <Clock className="w-3 h-3 text-amber-400" /> Under Review
              </span>
              <span className="text-lg font-bold text-white block">{underReview}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-center sm:text-left">
              <span className="text-[11px] text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1">
                <CalendarCheck className="w-3 h-3 text-cyan-400" /> Interview Stage
              </span>
              <span className="text-lg font-bold text-cyan-300 block">{totalInterviews}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-center sm:text-left">
              <span className="text-[11px] text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Offered
              </span>
              <span className="text-lg font-bold text-emerald-300 block">{offered}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-center sm:text-left">
              <span className="text-[11px] text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1">
                <Code2 className="w-3 h-3 text-indigo-300" /> Tech Round
              </span>
              <span className="text-base font-bold text-slate-200 block">{technicalRound}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-center sm:text-left">
              <span className="text-[11px] text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1">
                <Users className="w-3 h-3 text-cyan-300" /> HR Round
              </span>
              <span className="text-base font-bold text-slate-200 block">{hrRound}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-center sm:text-left">
              <span className="text-[11px] text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1">
                <XCircle className="w-3 h-3 text-rose-400" /> Rejected
              </span>
              <span className="text-base font-bold text-rose-300 block">{rejected}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-center sm:text-left">
              <span className="text-[11px] text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1">
                <MinusCircle className="w-3 h-3 text-slate-500" /> Withdrawn
              </span>
              <span className="text-base font-bold text-slate-400 block">{withdrawn}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationStats;
