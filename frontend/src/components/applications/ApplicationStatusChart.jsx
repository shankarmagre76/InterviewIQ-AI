import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { PieChart as PieIcon, Briefcase } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';

const STATUS_COLORS = {
  'Applied': '#6366f1', // Indigo
  'Under Review': '#f59e0b', // Amber
  'Shortlisted': '#06b6d4', // Cyan
  'Interview Scheduled': '#8b5cf6', // Violet
  'Technical Round': '#3b82f6', // Blue
  'HR Round': '#14b8a6', // Teal
  'Offered': '#10b981', // Emerald
  'Rejected': '#ef4444', // Rose
  'Withdrawn': '#64748b', // Slate
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs space-y-1 z-50">
        <p className="font-bold text-white flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: data.fill }}
          />
          {data.status}
        </p>
        <p className="text-slate-300">
          <span className="font-bold text-white">{data.count}</span> applications ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

/**
 * ApplicationStatusChart Component
 * Renders Donut Pie Chart visualization for status distribution across job applications.
 */
export const ApplicationStatusChart = ({
  statusDistribution = [],
  height = 260,
  className = '',
}) => {
  const activeItems = statusDistribution.filter((item) => item.count > 0);

  if (!statusDistribution || statusDistribution.length === 0 || activeItems.length === 0) {
    return (
      <Card variant="glass" className={`w-full ${className}`.trim()}>
        <CardHeader>
          <CardTitle as="h3">Status Distribution</CardTitle>
          <CardDescription>Breakdown by application stage.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Briefcase className="w-8 h-8 text-slate-500" />}
            title="No Applications Tracked"
            description="Add or apply to jobs to begin tracking status distribution analytics."
            className="py-8"
          />
        </CardContent>
      </Card>
    );
  }

  const chartData = activeItems.map((item) => ({
    status: item.status,
    count: item.count,
    percentage: item.percentage || 0,
    fill: STATUS_COLORS[item.status] || '#6366f1',
  }));

  return (
    <Card variant="glass" className={`w-full ${className}`.trim()}>
      <CardHeader className="pb-2">
        <CardTitle as="h3" className="flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-indigo-400" />
          Status Distribution
        </CardTitle>
        <CardDescription>Visual ratio of active job search pipeline stages.</CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <div style={{ width: '100%', height }} role="region" aria-label="Application Status Distribution Chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="count"
                nameKey="status"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="#0f172a" strokeWidth={2} />
                ))}
              </Pie>

              <Tooltip content={<CustomTooltip />} />
              
              <Legend
                formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationStatusChart;
