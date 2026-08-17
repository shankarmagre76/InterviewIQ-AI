import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Video, Sparkles, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';

/**
 * Custom Dark Tooltip Component for Recharts Interview History
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs space-y-1.5 z-50 min-w-[180px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1">
          <span className="font-bold text-white flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            {data.role || 'Mock Interview'}
          </span>
          <span className="text-[11px] font-bold text-cyan-300">{data.score}%</span>
        </div>

        {data.date && <p className="text-slate-400 text-[11px]">{data.date}</p>}

        <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] text-slate-300">
          <div>Tech: <span className="font-semibold text-indigo-300">{data.technicalScore || 0}</span></div>
          <div>Comm: <span className="font-semibold text-cyan-300">{data.communicationScore || 0}</span></div>
          <div>HR: <span className="font-semibold text-emerald-300">{data.hrScore || 0}</span></div>
        </div>

        {(data.interviewType || data.difficulty) && (
          <p className="text-[10px] text-slate-400 pt-0.5 border-t border-slate-800">
            {data.interviewType || 'General'} • {data.difficulty || 'Intermediate'}
          </p>
        )}
      </div>
    );
  }
  return null;
};

/**
 * InterviewScoreChart Component
 * Renders time-series performance trend over completed interview sessions.
 */
export const InterviewScoreChart = ({
  scoreHistory = [],
  height = 260,
  className = '',
}) => {
  // Empty State: No interview sessions recorded yet
  if (!scoreHistory || scoreHistory.length === 0) {
    return (
      <Card variant="glass" className={`w-full ${className}`.trim()}>
        <CardHeader>
          <CardTitle as="h3">Interview Score Trend</CardTitle>
          <CardDescription>Time-series performance history across mock sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Video className="w-8 h-8 text-slate-500" />}
            title="No Interview Sessions Recorded"
            description="Start and complete your first AI Mock Interview to begin tracking score trends over time."
            className="py-8"
          />
        </CardContent>
      </Card>
    );
  }

  // Format chart data points dynamically from backend response
  const chartData = scoreHistory.map((item, index) => {
    let formattedDate = `Session ${index + 1}`;
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
      score: item.score ?? item.overallScore ?? 0,
      date: formattedDate,
      role: item.role || 'Candidate',
      interviewType: item.interviewType || 'Technical',
      difficulty: item.difficulty || 'Intermediate',
      technicalScore: item.technicalScore || 0,
      communicationScore: item.communicationScore || 0,
      hrScore: item.hrScore || 0,
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
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Interview Performance Trend
            </CardTitle>
            <CardDescription>
              {isSingleDataPoint
                ? 'Initial mock interview score evaluation.'
                : `Progress trend over ${chartData.length} sessions (${initialScore} → ${latestScore}).`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Accessible Context for Screen Readers */}
        <div className="sr-only">
          Mock interview performance trend chart over {chartData.length} sessions. Initial score was {initialScore}, current score is {latestScore}.
        </div>

        <div style={{ width: '100%', height }} role="region" aria-label="Interview Score Trend Chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="interviewScoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
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
                stroke="#06b6d4"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#interviewScoreGradient)"
                dot={{ r: 5, fill: '#06b6d4', stroke: '#0f172a', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewScoreChart;
