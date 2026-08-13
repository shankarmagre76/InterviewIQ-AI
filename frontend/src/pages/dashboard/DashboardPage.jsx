import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDashboard } from '../../hooks/useDashboard';

// Dashboard Modular UI Components
import {
  DashboardHeader,
  QuickActionsCard,
  CareerReadinessCard,
  ResumeAtsCard,
  InterviewPerformanceCard,
  ApplicationOverviewCard,
  LearningProgressCard,
  RecentActivityCard,
} from '../../components/dashboard';

// UI Feedback Primitives
import { SkeletonCard } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';

/**
 * Main Authenticated Candidate Dashboard Page
 * Integrates all 8 dashboard sections backed by useDashboard() hook.
 */
export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, error, refresh } = useDashboard('main');

  const handleStartInterview = () => {
    navigate('/interviews');
  };

  // Handle Loading Skeleton State
  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="w-full h-44 rounded-3xl animate-pulse bg-slate-900/80 border border-slate-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonCard className="lg:col-span-2" />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  // Handle API Error State
  if (error && !data) {
    return (
      <div className="py-8">
        <ErrorState
          title="Dashboard Analytics Unavailable"
          message={error}
          onRetry={refresh}
        />
      </div>
    );
  }

  const profile = data?.profile || {};
  const careerReadiness = data?.careerReadiness || {};
  const resume = data?.resume || {};
  const interviews = data?.interviews || {};
  const applications = data?.applications || {};
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* 1. Welcome / Header Section */}
      <DashboardHeader
        user={user}
        profile={profile}
        loading={loading}
        onRefresh={refresh}
        onStartInterview={handleStartInterview}
      />

      {/* 2. Quick Actions Grid */}
      <section aria-label="Quick Actions">
        <QuickActionsCard />
      </section>

      {/* 3. Hero Analytics Row: Career Readiness (2 Cols) + Resume & Interview Cards (1 Col) */}
      <section aria-label="Career Readiness and Primary Metrics" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Career Readiness Composite Score Card (Left 2 Columns) */}
        <div className="lg:col-span-2 flex">
          <CareerReadinessCard careerReadiness={careerReadiness} />
        </div>

        {/* Resume ATS & Interview Performance Stacked Cards (Right 1 Column) */}
        <div className="flex flex-col gap-6">
          <ResumeAtsCard resume={resume} />
          <InterviewPerformanceCard interviews={interviews} />
        </div>
      </section>

      {/* 4. Operational & Activity Row: Application Overview, Learning Progress & Activity Stream */}
      <section aria-label="Applications, Learning & Activity" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Overview (1 Col) */}
        <div className="flex">
          <ApplicationOverviewCard applications={applications} />
        </div>

        {/* Learning Progress Roadmap (1 Col) */}
        <div className="flex">
          <LearningProgressCard profile={profile} />
        </div>

        {/* Recent Activity Stream (1 Col) */}
        <div className="flex">
          <RecentActivityCard recentActivity={recentActivity} />
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
