import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Upload, RefreshCw } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { ATSScoreCard, ATSScoreChart, ResumeInsights } from '../../components/resume';

export const ResumeAnalysisPage = () => {
  const { data, loading, error, refresh } = useDashboard('resume');

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="w-full h-24 rounded-2xl animate-pulse bg-slate-900/80 border border-slate-800" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard className="lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="py-8">
        <ErrorState
          title="Resume Analytics Unavailable"
          message={error}
          onRetry={refresh}
        />
      </div>
    );
  }

  const currentScore = data?.currentScore ?? 0;
  const previousScore = data?.previousScore ?? 0;
  const improvement = data?.improvement ?? 0;
  const highestScore = data?.highestScore ?? 0;
  const analysisCount = data?.analysisCount ?? 0;
  const latestAnalysisDate = data?.latestAnalysisDate || null;
  const scoreHistory = data?.scoreHistory || [];
  const missingSkills = data?.missingSkills || [];
  const recommendedSkills = data?.recommendedSkills || [];
  const latestAnalysisBreakdown = data?.latestAnalysisBreakdown || null;

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      <PageHeader
        title="ATS Resume Analytics"
        description="Comprehensive AI keyword scan history, ATS score trend, missing technical skills, and improvement recommendations."
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              isLoading={loading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh Data
            </Button>

            <Button variant="primary" size="sm" leftIcon={<Upload className="w-4 h-4" />}>
              Scan New Resume
            </Button>
          </div>
        }
      />

      {/* Grid Row 1: ATSScoreCard (1 Col) & ATSScoreChart (2 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex">
          <ATSScoreCard
            currentScore={currentScore}
            previousScore={previousScore}
            improvement={improvement}
            highestScore={highestScore}
            analysisCount={analysisCount}
            latestAnalysisDate={latestAnalysisDate}
            scoreHistory={scoreHistory}
          />
        </div>

        <div className="lg:col-span-2 flex">
          <ATSScoreChart scoreHistory={scoreHistory} height={280} />
        </div>
      </div>

      {/* Grid Row 2: ResumeInsights (Missing Skills & Recommended Skills) */}
      <div className="w-full">
        <ResumeInsights
          missingSkills={missingSkills}
          recommendedSkills={recommendedSkills}
          latestAnalysisBreakdown={latestAnalysisBreakdown}
        />
      </div>
    </div>
  );
};

export default ResumeAnalysisPage;
