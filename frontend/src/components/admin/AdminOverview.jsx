import React from 'react';
import { Users, Building2, Briefcase, FileCheck, Video, FileText, Map, Sparkles } from 'lucide-react';
import { StatCard } from './StatCard.jsx';

/**
 * AdminOverview Component (F10.3)
 * Grid layout rendering primary platform summary KPIs returned directly by backend GET /admin/dashboard.
 *
 * @param {Object} props
 * @param {Object} props.data - Dashboard overview data document
 * @param {boolean} [props.isLoading=false] - Loading state
 */
export const AdminOverview = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
          <StatCard key={idx} isLoading={true} />
        ))}
      </div>
    );
  }

  const users = data?.users || {};
  const companies = data?.jobs || {}; // backend groups company and job totals
  const jobs = data?.jobs || {};
  const applications = data?.applications || {};
  const interviews = data?.interviews || {};
  const resumes = data?.resumes || {};
  const roadmaps = data?.roadmaps || {};

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Platform Overview KPIs</span>
        </h3>
        <span className="text-xs text-slate-500">
          Source: Real-time Database Aggregation
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Registered Users */}
        <StatCard
          title="Total Registered Users"
          value={users.totalUsers ?? 0}
          subtitle={`${users.activeUsers ?? 0} active • ${users.newUsersLast30Days ?? 0} new (30d)`}
          icon={<Users className="w-6 h-6" />}
          variant="primary"
        />

        {/* 2. Companies & Hiring */}
        <StatCard
          title="Total Companies"
          value={companies.totalCompanies ?? 0}
          subtitle={`${companies.activelyHiringCompanies ?? 0} actively hiring`}
          icon={<Building2 className="w-6 h-6" />}
          variant="success"
        />

        {/* 3. Job Postings */}
        <StatCard
          title="Job Postings"
          value={jobs.totalJobs ?? 0}
          subtitle={`${jobs.activeJobs ?? 0} active openings`}
          icon={<Briefcase className="w-6 h-6" />}
          variant="warning"
        />

        {/* 4. Candidate Applications */}
        <StatCard
          title="Total Applications"
          value={applications.totalApplications ?? 0}
          subtitle={`Interview Conv. ${applications.interviewConversionRatePercent ?? 0}%`}
          icon={<FileCheck className="w-6 h-6" />}
          variant="primary"
        />

        {/* 5. AI Mock Interviews */}
        <StatCard
          title="AI Mock Interviews"
          value={interviews.totalInterviews ?? 0}
          subtitle={`${interviews.completedInterviews ?? 0} completed • Avg ${interviews.averageInterviewScore ?? 0}%`}
          icon={<Video className="w-6 h-6" />}
          variant="success"
        />

        {/* 6. Resumes Processed */}
        <StatCard
          title="Resumes Processed"
          value={resumes.totalResumes ?? 0}
          subtitle={`Avg ATS Score ${resumes.averageAtsScore ?? 0}%`}
          icon={<FileText className="w-6 h-6" />}
          variant="primary"
        />

        {/* 7. Active Roadmaps */}
        <StatCard
          title="Learning Roadmaps"
          value={roadmaps.totalRoadmaps ?? 0}
          subtitle={`${roadmaps.activeRoadmaps ?? 0} active • ${roadmaps.completedRoadmaps ?? 0} completed`}
          icon={<Map className="w-6 h-6" />}
          variant="warning"
        />

        {/* 8. Notifications */}
        <StatCard
          title="System Notifications"
          value={data?.notifications?.totalNotifications ?? 0}
          subtitle={`${data?.notifications?.unreadNotifications ?? 0} unread`}
          icon={<Sparkles className="w-6 h-6" />}
          variant="neutral"
        />
      </div>
    </div>
  );
};

export default AdminOverview;
