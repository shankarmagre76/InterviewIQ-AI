import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ArrowRight,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const InterviewCard = ({ interview }) => {
  const navigate = useNavigate();

  if (!interview) return null;

  const id = interview._id || interview.id;
  const role = interview.role || 'Software Engineer';
  const type = interview.interviewType || 'Technical';
  const difficulty = interview.difficulty || 'Intermediate';
  const status = interview.status || 'Pending';
  const totalQuestions = interview.totalQuestions || 5;
  const completedQuestions = interview.completedQuestions || 0;
  const duration = interview.estimatedDuration || 30;
  const score = interview.overallScore ?? interview.score ?? null;

  const dateFormatted = interview.createdAt
    ? new Date(interview.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  const isCompleted = status === 'Completed';
  const isInProgress = status === 'In Progress' || status === 'Pending';

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
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl hover:border-slate-700 transition-all duration-200 flex flex-col justify-between space-y-5">
      
      {/* Top Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant={getStatusBadgeVariant(status)} size="sm">
            {status}
          </Badge>
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" /> {dateFormatted}
          </span>
        </div>

        <div>
          <h3 className="text-base font-extrabold text-white tracking-tight line-clamp-1">
            {role}
          </h3>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 font-medium">{type} Interview</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-medium">{difficulty}</span>
          </div>
        </div>
      </div>

      {/* Center Details Metric Row */}
      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>~{duration} mins</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
          <span>{completedQuestions}/{totalQuestions} questions</span>
        </div>

        {/* Show Score ONLY if completed */}
        {isCompleted && score !== null ? (
          <div className="flex items-center gap-1 text-emerald-400 font-bold font-mono text-sm">
            <Award className="w-4 h-4" /> {score}/100
          </div>
        ) : null}
      </div>

      {/* Footer Action Buttons */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
        {isCompleted ? (
          <>
            <Button
              variant="outline"
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
          </>
        ) : isInProgress ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/interviews/${id}`)}
            leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
            className="w-full"
          >
            Continue Interview
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/interviews/setup', { state: { role, type, difficulty } })}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="w-full"
          >
            Retry Session
          </Button>
        )}
      </div>
    </div>
  );
};

export default InterviewCard;
