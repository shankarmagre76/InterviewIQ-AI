import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Play,
  Clock,
  Layers,
  BarChart3,
  Target,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Tag,
  CheckCircle
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { interviewService } from '../../services/interviewService';

export const InterviewLobbyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchSessionData = async () => {
      if (!id) {
        setError('Interview ID parameter is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await interviewService.getInterviewDetails(id);
        const data = res?.data || {};

        if (isMounted) {
          if (data.interview) {
            setSession(data.interview);
            setQuestions(data.questions || []);
          } else if (data._id) {
            setSession(data);
            setQuestions(data.questions || []);
          } else {
            setError('Interview session details could not be retrieved.');
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching interview lobby details:', err);
          const status = err?.response?.status;
          let msg = err?.response?.data?.message || err?.message || 'Failed to load interview session details.';

          if (status === 404) {
            msg = 'Interview session not found or has been deleted.';
          } else if (status === 401 || status === 403) {
            msg = 'Unauthorized access to this interview session. Please sign in.';
          }

          setError(msg);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSessionData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Prevent double clicks when starting interview
  const handleStartInterview = () => {
    if (isStarting || !session) return;
    setIsStarting(true);
    navigate(`/interviews/${session._id || id}`);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div className="w-full h-24 rounded-2xl animate-pulse bg-slate-900/80 border border-slate-800" />
        <SkeletonCard />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="py-12 max-w-3xl mx-auto space-y-6">
        <ErrorState
          title="Interview Session Not Found"
          message={error || 'The requested interview session does not exist or has been deleted.'}
          onRetry={() => window.location.reload()}
        />
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" onClick={() => navigate('/interviews')}>
            Return to Dashboard
          </Button>
          <Button variant="primary" onClick={() => navigate('/interviews/setup')}>
            Setup New Interview
          </Button>
        </div>
      </div>
    );
  }

  // Actual backend interview fields
  const role = session.role || 'Software Engineer';
  const type = session.interviewType || 'Technical';
  const difficulty = session.difficulty || 'Intermediate';
  const totalQuestions = session.totalQuestions || questions.length || 5;
  const estimatedDuration = session.estimatedDuration || (totalQuestions * 5);

  // Derive relevant topics/skills from generated questions or role domain
  const extractedSkills = questions.length > 0
    ? Array.from(
        new Set(
          questions.flatMap((q) => {
            const text = (q.question || '').toLowerCase();
            const topics = [];
            if (text.includes('react') || text.includes('component') || text.includes('dom')) topics.push('Frontend & React');
            if (text.includes('node') || text.includes('async') || text.includes('express')) topics.push('Node.js & Backend');
            if (text.includes('sql') || text.includes('database') || text.includes('mongo')) topics.push('Database Systems');
            if (text.includes('system') || text.includes('design') || text.includes('scale')) topics.push('System Architecture');
            if (text.includes('algorithm') || text.includes('complexity') || text.includes('structure')) topics.push('Algorithms & Data Structures');
            if (text.includes('star') || text.includes('conflict') || text.includes('team')) topics.push('Behavioral & Leadership');
            if (text.includes('hr') || text.includes('career') || text.includes('salary')) topics.push('Culture & HR');
            return topics.length > 0 ? topics : [type];
          })
        )
      )
    : [type, `${role} Core Competencies`];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <PageHeader
        title="AI Mock Interview Lobby"
        description="Review your interview settings and guidelines before starting your AI-evaluated mock session."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/interviews')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Dashboard
          </Button>
        }
      />

      {/* Main Glassmorphism Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl space-y-8 relative overflow-hidden">
        
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section 1: Header Badge & Role Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 relative">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI MOCK INTERVIEW
              </span>
              <Badge variant="success" size="sm">
                Ready
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Target className="w-7 h-7 text-indigo-400 shrink-0" />
              {role}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/interviews/setup')}
              disabled={isStarting}
            >
              Configure New
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartInterview}
              isLoading={isStarting}
              disabled={isStarting}
              leftIcon={<Play className="w-5 h-5 fill-current" />}
              className="px-8 shadow-indigo-500/30"
            >
              Start Interview
            </Button>
          </div>
        </div>

        {/* Section 2: Primary Interview Parameters Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Layers className="w-4 h-4 text-indigo-400" /> Interview Type
            </div>
            <div className="text-base font-bold text-slate-100">{type} Interview</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <BarChart3 className="w-4 h-4 text-amber-400" /> Difficulty
            </div>
            <div className="text-base font-bold text-slate-100">{difficulty} Difficulty</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Zap className="w-4 h-4 text-emerald-400" /> Questions
            </div>
            <div className="text-base font-bold text-slate-100">{totalQuestions} Questions</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Clock className="w-4 h-4 text-cyan-400" /> Estimated Time
            </div>
            <div className="text-base font-bold text-slate-100">~{estimatedDuration} minutes</div>
          </div>
        </div>

        {/* Section 3: Evaluated Skills & Topics */}
        {extractedSkills.length > 0 && (
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-400" /> Covered Skills & Focus Topics
            </label>
            <div className="flex flex-wrap gap-2">
              {extractedSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Before You Begin Instructions */}
        <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-indigo-400" /> Before You Begin
          </h3>

          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="font-medium text-slate-200">Answer clearly</span> — provide specific technical explanations or STAR method responses.
            </li>

            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="font-medium text-slate-200">Take your time</span> — analyze each question carefully before submitting your final response.
            </li>

            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="font-medium text-slate-200">Treat this like a real interview</span> — your responses are scored individually by Gemini AI.
            </li>
          </ul>
        </div>

        {/* Section 5: Bottom CTA Action */}
        <div className="border-t border-slate-800/80 pt-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Session ready for candidate execution
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleStartInterview}
            isLoading={isStarting}
            disabled={isStarting}
            leftIcon={<Play className="w-5 h-5 fill-current" />}
            className="px-8 shadow-indigo-500/30"
          >
            Start Interview
          </Button>
        </div>

      </div>
    </div>
  );
};

export default InterviewLobbyPage;
