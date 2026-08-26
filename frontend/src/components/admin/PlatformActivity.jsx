import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.jsx';
import { ProgressBar } from '../ui/ProgressBar.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Users, FileCheck, Award, Zap } from 'lucide-react';

/**
 * PlatformActivity Component (F10.3)
 * Displays breakdown analytics distributions returned directly by backend GET /admin/dashboard.
 *
 * @param {Object} props
 * @param {Object} props.data - Dashboard overview data document
 * @param {boolean} [props.isLoading=false] - Loading state
 */
export const PlatformActivity = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card variant="glass" className="p-6 animate-pulse space-y-4">
          <div className="h-4 bg-slate-800 rounded w-1/3" />
          <div className="h-20 bg-slate-800/60 rounded" />
        </Card>
        <Card variant="glass" className="p-6 animate-pulse space-y-4">
          <div className="h-4 bg-slate-800 rounded w-1/3" />
          <div className="h-20 bg-slate-800/60 rounded" />
        </Card>
      </div>
    );
  }

  const users = data?.users || {};
  const userRoles = users.userRoleBreakdown || [];
  const totalUsers = users.totalUsers || 1;

  const applications = data?.applications || {};
  const statusBreakdown = applications.statusBreakdown || [];
  const totalApps = applications.totalApplications || 1;

  const resumes = data?.resumes || {};
  const interviews = data?.interviews || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* 1. User Role Distribution */}
      <Card variant="glass" className="shadow-lg">
        <CardHeader className="pb-3 border-b border-slate-800/80">
          <CardTitle className="text-sm font-bold text-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>User Role Distribution</span>
            </div>
            <Badge variant="neutral" style="soft" size="sm">
              {users.totalUsers ?? 0} Total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {userRoles.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No role distribution data available</p>
          ) : (
            userRoles.map((item) => {
              const roleName = item._id || 'Unknown';
              const count = item.count || 0;
              const percentage = Math.round((count / totalUsers) * 100);

              return (
                <div key={roleName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{roleName}</span>
                    <span className="text-slate-400 font-medium">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <ProgressBar
                    value={percentage}
                    variant={roleName === 'Admin' ? 'danger' : roleName === 'Recruiter' ? 'warning' : 'primary'}
                    size="sm"
                  />
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* 2. Application Status Funnel */}
      <Card variant="glass" className="shadow-lg">
        <CardHeader className="pb-3 border-b border-slate-800/80">
          <CardTitle className="text-sm font-bold text-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Application Status Breakdown</span>
            </div>
            <Badge variant="primary" style="soft" size="sm">
              {applications.totalApplications ?? 0} Total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {statusBreakdown.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No application status data available</p>
          ) : (
            statusBreakdown.map((item) => {
              const statusName = item._id || item.status || 'Unknown';
              const count = item.count || 0;
              const percentage = Math.round((count / totalApps) * 100);

              const getVariant = (st) => {
                if (st.includes('Offered') || st.includes('Hired')) return 'success';
                if (st.includes('Rejected')) return 'danger';
                if (st.includes('Interview') || st.includes('Round')) return 'primary';
                return 'warning';
              };

              return (
                <div key={statusName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{statusName}</span>
                    <span className="text-slate-400 font-medium">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <ProgressBar
                    value={percentage}
                    variant={getVariant(statusName)}
                    size="sm"
                  />
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* 3. Platform AI & Quality Highlights Banner */}
      <Card variant="glass" className="lg:col-span-2 p-5 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-purple-950/40 border-indigo-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>AI Performance Telemetry</span>
                <Badge variant="primary" style="soft" size="sm" className="text-[9px]">
                  Live
                </Badge>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Aggregate platform performance score across ATS resume processing and AI mock sessions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Avg ATS Score</span>
              <span className="text-emerald-400 font-extrabold text-sm">{resumes.averageAtsScore ?? 0}%</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Avg Mock Score</span>
              <span className="text-cyan-400 font-extrabold text-sm">{interviews.averageInterviewScore ?? 0}%</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Offer Conv.</span>
              <span className="text-amber-400 font-extrabold text-sm">{applications.offerConversionRatePercent ?? 0}%</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PlatformActivity;
