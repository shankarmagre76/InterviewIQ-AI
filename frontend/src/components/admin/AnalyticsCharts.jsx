import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.jsx';
import { ProgressBar } from '../ui/ProgressBar.jsx';
import { Badge } from '../ui/Badge.jsx';
import { TrendingUp, Briefcase, Zap, FileCheck } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

/**
 * Custom Dark Tooltip for Recharts
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-xl text-xs space-y-1">
        <p className="font-semibold text-slate-300">{label}</p>
        <p className="text-indigo-400 font-bold">
          Count: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

/**
 * AnalyticsCharts Component (F10.9)
 * Renders Recharts time-series growth curves and distribution breakdowns.
 * Data is strictly sourced from backend analytics endpoints without fabrication.
 *
 * @param {Object} props
 * @param {Object} props.userAnalytics - User growth analytics payload
 * @param {Object} props.jobAnalytics - Job & Company analytics payload
 * @param {boolean} [props.isLoading=false] - Loading state
 */
export const AnalyticsCharts = ({
  userAnalytics,
  jobAnalytics,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card variant="glass" className="p-6 animate-pulse space-y-4">
          <div className="h-4 bg-slate-800 rounded w-1/3" />
          <div className="h-48 bg-slate-800/60 rounded" />
        </Card>
        <Card variant="glass" className="p-6 animate-pulse space-y-4">
          <div className="h-4 bg-slate-800 rounded w-1/3" />
          <div className="h-48 bg-slate-800/60 rounded" />
        </Card>
      </div>
    );
  }

  const dailyGrowth = userAnalytics?.dailyGrowth || [];
  const dailyPostings = jobAnalytics?.jobs?.dailyPostingsTrend || [];
  const workModes = jobAnalytics?.jobs?.workModeBreakdown || [];
  const employmentTypes = jobAnalytics?.jobs?.employmentTypeBreakdown || [];

  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. User Registration Growth AreaChart */}
        <Card variant="glass" className="shadow-lg">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <CardTitle className="text-sm font-bold text-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>User Registrations Over Time</span>
              </div>
              <Badge variant="primary" style="soft" size="sm">
                Time-Series
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {dailyGrowth.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-xs text-slate-500">
                <p>No user registration trend data available for selected period.</p>
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#userGrowthGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Job Postings Volume BarChart */}
        <Card variant="glass" className="shadow-lg">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <CardTitle className="text-sm font-bold text-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>Job Postings Volume Trend</span>
              </div>
              <Badge variant="success" style="soft" size="sm">
                Daily Postings
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {dailyPostings.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-xs text-slate-500">
                <p>No job posting volume data available for selected period.</p>
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyPostings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. Work Mode & Employment Type Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Mode Breakdown */}
        <Card variant="glass" className="shadow-lg">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <CardTitle className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Work Mode Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {workModes.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No work mode distribution data available</p>
            ) : (
              workModes.map((item) => {
                const total = workModes.reduce((sum, w) => sum + w.count, 0) || 1;
                const percentage = Math.round((item.count / total) * 100);

                return (
                  <div key={item.workMode} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">{item.workMode}</span>
                      <span className="text-slate-400 font-medium">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <ProgressBar
                      value={percentage}
                      variant={item.workMode === 'Remote' ? 'primary' : item.workMode === 'Hybrid' ? 'warning' : 'neutral'}
                      size="sm"
                    />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Employment Type Breakdown */}
        <Card variant="glass" className="shadow-lg">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <CardTitle className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-purple-400" />
              <span>Employment Type Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {employmentTypes.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No employment type distribution data available</p>
            ) : (
              employmentTypes.map((item) => {
                const total = employmentTypes.reduce((sum, e) => sum + e.count, 0) || 1;
                const percentage = Math.round((item.count / total) * 100);

                return (
                  <div key={item.employmentType} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">{item.employmentType}</span>
                      <span className="text-slate-400 font-medium">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <ProgressBar
                      value={percentage}
                      variant={item.employmentType === 'Full-time' ? 'success' : 'primary'}
                      size="sm"
                    />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
