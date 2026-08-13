import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { RefreshCw, Plus } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { ApplicationStats, ApplicationStatusChart, ApplicationFunnel } from '../../components/applications';

export const ApplicationsPage = () => {
  const { data, loading, error, refresh } = useDashboard('applications');

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="w-full h-24 rounded-2xl animate-pulse bg-slate-900/80 border border-slate-800" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonCard className="lg:col-span-2" />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="py-8">
        <ErrorState
          title="Application Analytics Unavailable"
          message={error}
          onRetry={refresh}
        />
      </div>
    );
  }

  const total = data?.total ?? 0;
  const applied = data?.applied ?? 0;
  const underReview = data?.underReview ?? 0;
  const interviewScheduled = data?.interviewScheduled ?? 0;
  const technicalRound = data?.technicalRound ?? 0;
  const hrRound = data?.hrRound ?? 0;
  const interviewTotal = data?.interviewTotal ?? 0;
  const offered = data?.offered ?? 0;
  const rejected = data?.rejected ?? 0;
  const withdrawn = data?.withdrawn ?? 0;
  const interviewConversionRate = data?.interviewConversionRate ?? 0;
  const offerConversionRate = data?.offerConversionRate ?? 0;
  const statusDistribution = data?.statusDistribution || [];
  const recruitmentFunnel = data?.recruitmentFunnel || [];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      <PageHeader
        title="Job Application Analytics"
        description="Track submitted applications, conversion rates across recruitment stages, and pipeline funnel progression."
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              isLoading={loading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh Analytics
            </Button>
          </div>
        }
      />

      {/* Row 1: Full Application Pipeline Stats */}
      <div className="w-full">
        <ApplicationStats
          total={total}
          applied={applied}
          underReview={underReview}
          interviewScheduled={interviewScheduled}
          technicalRound={technicalRound}
          hrRound={hrRound}
          interviewTotal={interviewTotal}
          offered={offered}
          rejected={rejected}
          withdrawn={withdrawn}
          interviewConversionRate={interviewConversionRate}
          offerConversionRate={offerConversionRate}
        />
      </div>

      {/* Row 2: Status Distribution Donut Chart (1 Col) & Recruitment Funnel (2 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex">
          <ApplicationStatusChart statusDistribution={statusDistribution} height={280} />
        </div>

        <div className="lg:col-span-2 flex">
          <ApplicationFunnel recruitmentFunnel={recruitmentFunnel} height={280} />
        </div>
      </div>
    </div>
  );
};

export default ApplicationsPage;
