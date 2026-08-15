import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Play, RotateCcw, Award } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const InterviewHistoryTable = ({ interviews = [] }) => {
  const navigate = useNavigate();

  if (!interviews || interviews.length === 0) return null;

  const getStatusBadgeVariant = (st) => {
    switch (st) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'info';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-4 px-6">Target Role</th>
              <th className="py-4 px-6">Type & Difficulty</th>
              <th className="py-4 px-6">Date</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Score / Progress</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {interviews.map((item) => {
              const id = item._id || item.id;
              const role = item.role || 'Software Engineer';
              const type = item.interviewType || 'Technical';
              const difficulty = item.difficulty || 'Intermediate';
              const status = item.status || 'Pending';
              const totalQuestions = item.totalQuestions || 5;
              const completedQuestions = item.completedQuestions || 0;
              const score = item.overallScore ?? item.score ?? null;
              const isCompleted = status === 'Completed';
              const isInProgress = status === 'In Progress' || status === 'Pending';

              const dateFormatted = item.createdAt
                ? new Date(item.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recent';

              return (
                <tr key={id} className="hover:bg-slate-900/50 transition-colors">
                  {/* Target Role */}
                  <td className="py-4 px-6 font-bold text-white">
                    {role}
                  </td>

                  {/* Type & Difficulty */}
                  <td className="py-4 px-6 text-slate-400">
                    <span className="font-semibold text-slate-300">{type}</span> • {difficulty}
                  </td>

                  {/* Date */}
                  <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                    {dateFormatted}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    <Badge variant={getStatusBadgeVariant(status)} size="sm">
                      {status}
                    </Badge>
                  </td>

                  {/* Score / Progress */}
                  <td className="py-4 px-6">
                    {isCompleted && score !== null ? (
                      <span className="font-bold text-emerald-400 font-mono text-xs flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> {score}/100
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        {completedQuestions}/{totalQuestions} Qs
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    {isCompleted ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/interviews/setup', { state: { role, type, difficulty } })}
                          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                        >
                          Retry
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/interviews/${id}/result`)}
                          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        >
                          View Result
                        </Button>
                      </div>
                    ) : isInProgress ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/interviews/${id}`)}
                        leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                      >
                        Continue Interview
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/interviews/setup', { state: { role, type, difficulty } })}
                        leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                      >
                        Retry Session
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InterviewHistoryTable;
