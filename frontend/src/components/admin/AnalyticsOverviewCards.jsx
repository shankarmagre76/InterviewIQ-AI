import React from 'react';
import { Users, Building2, Briefcase, FileCheck, Video, FileText, Map, Zap } from 'lucide-react';
import { StatCard } from './StatCard.jsx';

/**
 * AnalyticsOverviewCards Component (F10.9)
 * KPI metric grid powered by backend GET /admin/dashboard & analytics services.
 *
 * @param {Object} props
 * @param {Object} props.summary - Summary metrics data document
 * @param {boolean} [props.isLoading=false] - Loading state
 */
export const AnalyticsOverviewCards = ({ summary, isLoading = false }) => {
  const users = summary?.users || {};
  const jobs = summary?.jobs || {};
  const applications = summary?.applications || {};
  const interviews = summary?.interviews || {};
  const resumes = summary?.resumes || {};
  const roadmaps = summary?.roadmaps || {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Platform Users"
        value={users.totalUsers ?? 0}
        subtitle={`${users.activeUsers ?? 0} active accounts`}
        icon={<Users className="w-5 h-5" />}
        variant="primary"
        isLoading={isLoading}
      />

      <StatCard
        title="Employer Companies"
        value={jobs.totalCompanies ?? 0}
        subtitle={`${jobs.activelyHiringCompanies ?? 0} actively hiring`}
        icon={<Building2 className="w-5 h-5" />}
        variant="success"
        isLoading={isLoading}
      />

      <StatCard
        title="Job Openings"
        value={jobs.totalJobs ?? 0}
        subtitle={`${jobs.activeJobs ?? 0} active listings`}
        icon={<Briefcase className="w-5 h-5" />}
        variant="warning"
        isLoading={isLoading}
      />

      <StatCard
        title="Applications Submitted"
        value={applications.totalApplications ?? 0}
        subtitle={`Interview Conv. ${applications.interviewConversionRatePercent ?? 0}%`}
        icon={<FileCheck className="w-5 h-5" />}
        variant="primary"
        isLoading={isLoading}
      />

      <StatCard
        title="AI Mock Interviews"
        value={interviews.totalInterviews ?? 0}
        subtitle={`Avg Score ${interviews.averageInterviewScore ?? 0}%`}
        icon={<Video className="w-5 h-5" />}
        variant="success"
        isLoading={isLoading}
      />

      <StatCard
        title="Resumes Analyzed"
        value={resumes.totalResumes ?? 0}
        subtitle={`Avg ATS Score ${resumes.averageAtsScore ?? 0}%`}
        icon={<FileText className="w-5 h-5" />}
        variant="primary"
        isLoading={isLoading}
      />

      <StatCard
        title="Active Roadmaps"
        value={roadmaps.activeRoadmaps ?? 0}
        subtitle={`Of ${roadmaps.totalRoadmaps ?? 0} total roadmaps`}
        icon={<Map className="w-5 h-5" />}
        variant="warning"
        isLoading={isLoading}
      />

      <StatCard
        title="AI Telemetry Status"
        value="Operational"
        subtitle="Gemini API Connected"
        icon={<Zap className="w-5 h-5" />}
        variant="neutral"
        isLoading={isLoading}
      />
    </div>
  );
};

export default AnalyticsOverviewCards;
