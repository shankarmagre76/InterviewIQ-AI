import React from 'react';
import { BrainCircuit, BarChart3, TrendingUp, Sparkles } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export const ScoreBreakdown = ({
  technicalScore = 0,
  communicationScore = 0,
  problemSolvingScore = 0,
  clarityScore = 0,
  relevanceScore = 0,
}) => {
  const chartData = [
    { name: 'Technical', score: technicalScore, fill: '#6366f1' },
    { name: 'Communication', score: communicationScore, fill: '#06b6d4' },
    { name: 'Problem Solving', score: problemSolvingScore, fill: '#10b981' },
    { name: 'Clarity', score: clarityScore || communicationScore, fill: '#8b5cf6' },
    { name: 'Relevance', score: relevanceScore || technicalScore, fill: '#f59e0b' },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" /> Score Breakdown by Competency
          </h3>
          <p className="text-xs text-slate-400">Evaluated performance dimensions (0-100 scale)</p>
        </div>
        <span className="text-xs text-indigo-400 font-mono font-semibold">5 Key Metrics</span>
      </div>

      {/* Recharts Visual Bar Chart */}
      <div className="h-48 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '0.75rem',
                color: '#f8fafc',
                fontSize: '12px',
              }}
              formatter={(val) => [`${val}/100`, 'Score']}
            />
            <Bar dataKey="score" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Individual Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-indigo-400" /> Technical Accuracy
            </span>
            <span className="text-indigo-400 font-bold">{technicalScore}/100</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${technicalScore}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-cyan-400" /> Communication
            </span>
            <span className="text-cyan-400 font-bold">{communicationScore}/100</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: `${communicationScore}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Problem Solving
            </span>
            <span className="text-emerald-400 font-bold">{problemSolvingScore}/100</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${problemSolvingScore}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreBreakdown;
