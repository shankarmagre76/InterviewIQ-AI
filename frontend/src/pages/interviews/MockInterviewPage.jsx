import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Play, RefreshCw } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { InterviewStats, InterviewScoreChart, InterviewBreakdown } from '../../components/interviews';

export const MockInterviewPage = () => {
  const navigate = useNavigate();
  const { data, loading, error, refresh } = useDashboard('interviews');

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
          title="Interview Analytics Unavailable"
          message={error}
          onRetry={refresh}
        />
      </div>
    );
  }

  const total = data?.total ?? 0;
  const completed = data?.completed ?? 0;
  const inProgress = data?.inProgress ?? 0;
  const averageScore = data?.averageScore ?? 0;
  const bestScore = data?.bestScore ?? 0;
  const latestScore = data?.latestScore ?? 0;
  const scoreImprovement = data?.scoreImprovement ?? 0;
  const technicalAverage = data?.technicalAverage ?? 0;
  const communicationAverage = data?.communicationAverage ?? 0;
  const hrAverage = data?.hrAverage ?? 0;
  const scoreHistory = data?.scoreHistory || [];
  const performanceByDifficulty = data?.performanceByDifficulty || {};
  const performanceByType = data?.performanceByType || {};

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      <PageHeader
        title="AI Mock Interview Analytics"
        description="Track your mock session scores, technical vs. communication competency averages, and performance breakdown by difficulty."
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

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/interviews/start')}
              leftIcon={<Play className="w-4 h-4" />}
            >
              Start New Mock Session
            </Button>
          </div>
        }
      />

      {/* Row 1: InterviewStats (1 Col) & InterviewScoreChart (2 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex">
          <InterviewStats
            total={total}
            completed={completed}
            inProgress={inProgress}
            averageScore={averageScore}
            bestScore={bestScore}
            latestScore={latestScore}
            scoreImprovement={scoreImprovement}
            technicalAverage={technicalAverage}
            communicationAverage={communicationAverage}
            hrAverage={hrAverage}
          />
        </div>

        <div className="lg:col-span-2 flex">
          <InterviewScoreChart scoreHistory={scoreHistory} height={280} />
        </div>
      </div>

      {/* Row 2: InterviewBreakdown (Difficulty & Category Breakdown) */}
      <div className="w-full">
        <InterviewBreakdown
          performanceByDifficulty={performanceByDifficulty}
          performanceByType={performanceByType}
        />
      </div>
    </div>
  );
};

export default MockInterviewPage;
