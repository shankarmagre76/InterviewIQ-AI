import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { Filter, ArrowDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

const STAGE_COLORS = {
  'Applied': '#6366f1', // Indigo
  'Under Review': '#f59e0b', // Amber
  'Interview': '#06b6d4', // Cyan
  'Offered': '#10b981', // Emerald
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs space-y-1 z-50">
        <p className="font-bold text-white flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: data.fill }} />
          Stage: {data.stage}
        </p>
        <p className="text-slate-300">
          <span className="font-bold text-white">{data.count}</span> candidates ({data.percentage}% conversion)
        </p>
      </div>
    );
  }
  return null;
};

/**
 * ApplicationFunnel Component
 * Visualizes candidate progression down the recruitment funnel: Applied -> Under Review -> Interview -> Offered.
 */
export const ApplicationFunnel = ({
  recruitmentFunnel = [],
  height = 240,
  className = '',
}) => {
  // Default funnel stages if backend provided
  const stages = recruitmentFunnel.length > 0 ? recruitmentFunnel : [
    { stage: 'Applied', count: 0, percentage: 100 },
    { stage: 'Under Review', count: 0, percentage: 0 },
    { stage: 'Interview', count: 0, percentage: 0 },
    { stage: 'Offered', count: 0, percentage: 0 },
  ];

  const chartData = stages.map((item) => ({
    stage: item.stage,
    count: item.count || 0,
    percentage: item.percentage || 0,
    fill: STAGE_COLORS[item.stage] || '#6366f1',
  }));

  const totalApplied = chartData[0]?.count || 0;

  return (
    <Card variant="glass" className={`w-full ${className}`.trim()}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle as="h3" className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-cyan-400" />
            Recruitment Funnel Conversion
          </CardTitle>
          <span className="text-xs text-slate-400 font-medium">
            {totalApplied} Total Candidates
          </span>
        </div>
        <CardDescription>Stage-by-stage progression from initial application to job offer.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Stage Progress Bars View */}
        <div className="space-y-3">
          {chartData.map((item, idx) => (
            <div key={item.stage} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  {item.stage}
                </span>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{item.count}</span>
                  <span className="text-xs text-slate-400">({item.percentage}%)</span>
                </div>
              </div>

              <ProgressBar
                value={item.percentage}
                max={100}
                showPercentage={false}
                color={idx === 3 ? 'emerald' : idx === 2 ? 'cyan' : idx === 1 ? 'amber' : 'indigo'}
                size="sm"
              />
            </div>
          ))}
        </div>

        {/* Recharts Horizontal Funnel Visualization */}
        <div style={{ width: '100%', height: 160 }} role="region" aria-label="Recruitment Funnel Bar Chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <XAxis type="number" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis dataKey="stage" type="category" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} width={85} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationFunnel;
