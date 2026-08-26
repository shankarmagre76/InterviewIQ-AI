import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  UserCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  TrendingUp,
  Building2,
  PlusCircle,
  Eye,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import { Spinner } from '../../components/ui/LoadingState';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';

export const RecruiterDashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getRecruiterDashboard();
        if (res?.success) {
          setData(res.data);
        } else {
          setError(res?.message || 'Failed to load recruiter metrics');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Error fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <span className="text-sm text-slate-400 font-medium">Loading Recruiter Command Center...</span>
      </div>
    );
  }

  const stats = data || {};
  const activeJobs = stats.activeJobsCount || 0;
  const totalApplicants = stats.totalApplicants || 0;
  const inInterview = stats.interviewCount || 0;
  const shortlisted = stats.shortlistedCount || 0;
  const recentApplicants = stats.recentApplicants || [];
  const activePostings = stats.activeJobPostings || [];
  const pipeline = stats.pipelineBreakdown || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-900/40 via-indigo-900/40 to-slate-900 border border-indigo-500/20 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-3">
              <Building2 className="w-3.5 h-3.5" /> Recruiter Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.firstName || 'Recruiter'}!
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Manage your active job listings, evaluate incoming candidate applications, and leverage AI candidate matching.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/recruiter/jobs"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Post New Job
            </Link>
            <Link
              to="/recruiter/ai"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs transition-all border border-cyan-500/30 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" /> AI Hiring Assistant
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Jobs</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-white tracking-tight">{activeJobs}</span>
            <span className="text-xs text-slate-400 ml-2">Job postings live</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Applicants</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-white tracking-tight">{totalApplicants}</span>
            <span className="text-xs text-slate-400 ml-2">Candidates applied</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shortlisted</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-white tracking-tight">{shortlisted}</span>
            <span className="text-xs text-slate-400 ml-2">Qualified candidates</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Interview</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-white tracking-tight">{inInterview}</span>
            <span className="text-xs text-slate-400 ml-2">Active interview rounds</span>
          </div>
        </div>
      </div>

      {/* Hiring Pipeline Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Hiring Pipeline Funnel</h2>
            <p className="text-xs text-slate-400">Current status distribution across all candidate applications</p>
          </div>
          <Link to="/recruiter/pipeline" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            Full Pipeline <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          {[
            { label: 'Applied', count: pipeline.Applied || 0, color: 'border-slate-700 bg-slate-800/40 text-slate-300' },
            { label: 'Under Review', count: pipeline['Under Review'] || 0, color: 'border-blue-500/30 bg-blue-500/10 text-blue-300' },
            { label: 'Shortlisted', count: pipeline.Shortlisted || 0, color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' },
            { label: 'Interview', count: (pipeline['Interview Scheduled'] || 0) + (pipeline['Technical Round'] || 0) + (pipeline['HR Round'] || 0), color: 'border-purple-500/30 bg-purple-500/10 text-purple-300' },
            { label: 'Offered', count: pipeline.Offered || 0, color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' },
            { label: 'Rejected', count: pipeline.Rejected || 0, color: 'border-rose-500/30 bg-rose-500/10 text-rose-300' },
            { label: 'Withdrawn', count: pipeline.Withdrawn || 0, color: 'border-slate-800 bg-slate-950 text-slate-500' },
          ].map((item, idx) => (
            <div key={idx} className={`p-3 rounded-xl border ${item.color} flex flex-col items-center justify-center text-center`}>
              <span className="text-xs font-medium text-slate-400">{item.label}</span>
              <span className="text-xl font-bold mt-1">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Recent Applicants & Active Postings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applicants (2 columns) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" /> Recent Applicants
            </h2>
            <Link to="/recruiter/applicants" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
              View All
            </Link>
          </div>

          {recentApplicants.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No applications submitted yet for your job listings.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3">Candidate</th>
                    <th className="pb-3">Applied Job</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentApplicants.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 pr-2">
                        <div className="font-semibold text-slate-200">{app.candidateName}</div>
                        <div className="text-[11px] text-slate-400">{app.candidateEmail}</div>
                      </td>
                      <td className="py-3 px-2 text-slate-300 font-medium">{app.jobTitle}</td>
                      <td className="py-3 px-2">
                        <Badge variant="primary" style="soft" size="sm">
                          {app.status || 'Applied'}
                        </Badge>
                      </td>
                      <td className="py-3 pl-2">
                        <Link
                          to="/recruiter/applicants"
                          className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" /> Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Active Job Postings (1 column) */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" /> Active Job Postings
            </h2>
            <Link to="/recruiter/jobs" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
              Manage
            </Link>
          </div>

          {activePostings.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No active job postings. Click below to create your first job posting.
            </div>
          ) : (
            <div className="space-y-3">
              {activePostings.map((job) => (
                <div key={job._id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-200 truncate">{job.title}</span>
                    <Badge variant={job.status === 'Active' ? 'success' : 'neutral'} size="sm">
                      {job.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{job.location || 'Remote'}</span>
                    <span>{job.employmentType || 'Full-time'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link
            to="/recruiter/jobs"
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-indigo-400" /> Post New Job
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboardPage;
