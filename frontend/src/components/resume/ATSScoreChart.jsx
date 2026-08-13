import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Dot,
} from 'recharts';
import { FileText, Sparkles, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';

/**
 * Custom Dark Theme Tooltip Component for Recharts
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs space-y-1 z-50">
        <p className="font-bold text-white flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          ATS Score: <span className="text-indigo-300 text-sm">{data.score} / 100</span>
        </p>
        {data.date && <p className="text-slate-400 text-[11px]">{data.date}</p>}
        {data.aiProvider && <p className="text-cyan-400 text-[10px]">Scanned with {data.aiProvider}</p>}
      </div>
    );
  }
  return null;
};

/**
 * ATSScoreChart Component
 * Renders time-series ATS score progression trend using Recharts.
 */
export const ATSScoreChart = ({
  scoreHistory = [],
  height = 260,
  className = '',
}) => {
  // Empty State: No score history available
  if (!scoreHistory || scoreHistory.length === 0) {
    return (
      <Card variant="glass" className={`w-full ${className}`.trim()}>
        <CardHeader>
          <CardTitle as="h3">ATS Score Trend</CardTitle>
          <CardDescription>Time-series progression across resume scans.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<FileText className="w-8 h-8 text-slate-500" />}
            title="No ATS Scan History"
            description="Upload and analyze your resume to start tracking score trends over time."
            className="py-8"
          />
        </CardContent>
      </Card>
    );
  }

  // Format chart data points dynamically from backend
  const chartData = scoreHistory.map((item, index) => {
    let formattedDate = `Scan ${index + 1}`;
    if (item.date) {
      try {
        const d = new Date(item.date);
        formattedDate = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      } catch {
        formattedDate = item.date;
      }
    }
    return {
      index: index + 1,
      score: item.score ?? 0,
      date: formattedDate,
      fullDate: item.date,
      aiProvider: item.aiProvider || 'Gemini AI',
    };
  });

  const latestScore = chartData[chartData.length - 1]?.score || 0;
  const initialScore = chartData[0]?.score || 0;
  const isSingleDataPoint = chartData.length === 1;

  return (
    <Card variant="glass" className={`w-full ${className}`.trim()}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle as="h3" className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              ATS Score History Trend
            </CardTitle>
            <CardDescription>
              {isSingleDataPoint
                ? 'Showing initial ATS baseline evaluation.'
                : `Progression over ${chartData.length} resume analyses (${initialScore} → ${latestScore}).`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Accessible Description for Screen Readers */}
        <div className="sr-only">
          ATS Score trend chart over {chartData.length} scans. Initial score was {initialScore}, current score is {latestScore}.
        </div>

        <div style={{ width: '100%', height }} role="region" aria-label="ATS Score Trend Chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="atsScoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke="#64748b"
                fontSize={11}
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#atsScoreGradient)"
                dot={{ r: 5, fill: '#6366f1', stroke: '#0f172a', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ATSScoreChart;
