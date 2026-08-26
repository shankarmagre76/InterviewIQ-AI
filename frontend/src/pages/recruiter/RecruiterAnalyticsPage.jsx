import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Briefcase, Award } from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import { Spinner } from '../../components/ui/LoadingState';

export const RecruiterAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getRecruiterDashboard();
        if (res?.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load recruiter analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <span className="text-sm text-slate-400 font-medium">Loading Recruitment Analytics...</span>
      </div>
    );
  }

  const stats = data || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-400" /> Recruitment Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor job application conversion rates, hiring velocity, and applicant funnels.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Applications Received</span>
          <div className="text-3xl font-extrabold text-white">{stats.totalApplicants || 0}</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shortlisted Candidates</span>
          <div className="text-3xl font-extrabold text-cyan-400">{stats.shortlistedCount || 0}</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Job Listings</span>
          <div className="text-3xl font-extrabold text-indigo-400">{stats.activeJobsCount || 0}</div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterAnalyticsPage;
