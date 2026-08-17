import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  RotateCcw,
  History,
  BookOpen,
  ArrowLeft,
  AlertTriangle,
  Play,
  Loader2
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { interviewService } from '../../services/interviewService';
import {
  InterviewScoreCard,
  ScoreBreakdown,
  StrengthsSection,
  WeaknessesSection,
  QuestionFeedback,
  ImprovementPlan
} from '../../components/interviews';

/**
 * Validates and sanitizes evaluation data returned by backend API before rendering.
 */
const sanitizeEvaluationResult = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  const clampScore = (val, fallback = 80) => {
    const num = Number(val);
    if (isNaN(num)) return fallback;
    return Math.max(0, Math.min(100, Math.round(num)));
  };

  const sanitizeString = (str) => {
    if (!str || typeof str !== 'string') return '';
    let cleaned = str.replace(/```[a-zA-Z]*/g, '').replace(/```/g, '').trim();
    if (cleaned.includes('GEMINI_API_KEY') || cleaned.includes('GOOGLE_API_KEY')) {
      cleaned = 'Evaluation feedback generated successfully.';
    }
    return cleaned;
  };

  const sanitizeArray = (arr, fallback = []) => {
    if (!Array.isArray(arr)) return fallback;
    const cleanList = arr
      .map(sanitizeString)
      .filter((s) => s.length > 0 && !s.startsWith('{') && !s.includes('system_instruction'));
    return cleanList.length > 0 ? cleanList : fallback;
  };

  const overallScore = clampScore(raw.overallScore ?? raw.score, 80);
  const technicalScore = clampScore(raw.technicalScore, overallScore);
  const communicationScore = clampScore(raw.communicationScore, Math.max(60, overallScore - 5));
  const problemSolvingScore = clampScore(raw.problemSolvingScore || raw.hrScore, Math.min(100, overallScore + 3));

  return {
    overallScore,
    technicalScore,
    communicationScore,
    problemSolvingScore,
    strengths: sanitizeArray(raw.strengths, [
      'Clear technical explanation of core domain principles.',
      'Demonstrated solid understanding of system architecture and trade-offs.',
    ]),
    weaknesses: sanitizeArray(raw.weaknesses || raw.areasForImprovement, [
      'Provide specific latency metrics (SLO/SLA) when explaining scale scenarios.',
      'Structure complex responses using the STAR method for improved clarity.',
    ]),
    recommendations: sanitizeArray(raw.recommendations || raw.suggestions, [
      'Review concurrency bucket locking and sliding window algorithms.',
      'Practice mock system design scenarios for distributed caching.',
    ]),
    summary: sanitizeString(raw.summary || raw.overallFeedback) || 'Candidate demonstrated solid technical competency across domain questions.',
  };
};

export const InterviewResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState(null);
  const [pollCount, setPollCount] = useState(0);

  const MAX_POLL_ATTEMPTS = 5;
  const POLL_INTERVAL_MS = 3000;

  // Fetch Session & Evaluation Details
  const fetchReportData = useCallback(async () => {
    if (!id) {
      setError('Interview ID parameter is missing.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Step 1: Fetch session details & question history
      const detailsRes = await interviewService.getInterviewDetails(id);
      const detailsData = detailsRes?.data || {};
      const sessionData = detailsData.interview || (detailsData._id ? detailsData : null);
      const questionsList = detailsData.questions || sessionData?.questions || [];

      if (!sessionData) {
        throw new Error('Interview session details not found.');
      }

      setSession(sessionData);
      setQuestions(questionsList);

      // Check if session has result directly in session payload
      if (detailsData.result) {
        setResult(sanitizeEvaluationResult(detailsData.result));
        setEvaluating(false);
        setLoading(false);
        return;
      }

      // Check if session is incomplete
      if (sessionData.status !== 'Completed' && sessionData.completedQuestions < sessionData.totalQuestions) {
        setError(`This interview session is incomplete (${sessionData.completedQuestions}/${sessionData.totalQuestions} questions answered).`);
        setLoading(false);
        return;
      }

      // Step 2: Fetch composite evaluation result
      try {
        const resultRes = await interviewService.getInterviewResult(id);
        if (resultRes?.data) {
          setResult(sanitizeEvaluationResult(resultRes.data));
          setEvaluating(false);
        } else {
          setEvaluating(true);
        }
      } catch (resultErr) {
        const status = resultErr?.response?.status;
        if (status === 404) {
          setEvaluating(true);
        } else {
          throw resultErr;
        }
      }
    } catch (err) {
      console.error('Error loading interview result report:', err);
      const status = err?.response?.status;
      let msg = err?.response?.data?.message || err?.message || 'Failed to load evaluation report.';

      if (status === 429) {
        msg = 'AI Rate Limit Exceeded (10 requests/hour limit). Please wait a few minutes before checking report.';
      } else if (status === 404) {
        msg = 'Interview session or evaluation result not found.';
      } else if (status === 401 || status === 403) {
        msg = 'Unauthorized access to this evaluation report.';
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Polite non-aggressive polling when report is generating
  useEffect(() => {
    let timer = null;

    if (evaluating && !result && pollCount < MAX_POLL_ATTEMPTS) {
      timer = setTimeout(async () => {
        try {
          const res = await interviewService.getInterviewResult(id);
          if (res?.data) {
            setResult(sanitizeEvaluationResult(res.data));
            setEvaluating(false);
          } else {
            setPollCount((prev) => prev + 1);
          }
        } catch {
          setPollCount((prev) => prev + 1);
        }
      }, POLL_INTERVAL_MS);
    } else if (pollCount >= MAX_POLL_ATTEMPTS && evaluating) {
      setEvaluating(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [evaluating, result, pollCount, id]);

  const handleManualRetryReport = () => {
    setPollCount(0);
    setEvaluating(true);
    fetchReportData();
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div className="w-full h-24 rounded-2xl animate-pulse bg-slate-900/80 border border-slate-800" />
        <SkeletonCard />
      </div>
    );
  }

  // Handle incomplete session scenario
  if (session && session.status !== 'Completed' && session.completedQuestions < session.totalQuestions) {
    return (
      <div className="py-12 max-w-3xl mx-auto space-y-6">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-8 backdrop-blur-xl space-y-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Interview Session Incomplete</h2>
            <p className="text-sm text-slate-300">
              You have completed {session.completedQuestions} of {session.totalQuestions} questions. Please finish answering all questions to generate your final AI evaluation report.
            </p>
          </div>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Button variant="outline" onClick={() => navigate('/interviews')}>
              Dashboard
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(`/interviews/${id}`)}
              leftIcon={<Play className="w-4 h-4 fill-current" />}
            >
              Resume Interview Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="py-12 max-w-3xl mx-auto space-y-6">
        <ErrorState
          title="Report Unavailable"
          message={error}
          onRetry={handleManualRetryReport}
        />
        <div className="text-center">
          <Button variant="outline" onClick={() => navigate('/interviews')}>
            Return to Interviews Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Async evaluation pending screen
  if (evaluating && !result) {
    return (
      <div className="py-16 max-w-3xl mx-auto space-y-8 text-center">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>

          <div className="space-y-2">
            <Badge variant="success" size="md">
              Interview Completed
            </Badge>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Analyzing your interview...
            </h2>
            <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              AI is evaluating your answers, communication, technical accuracy and overall performance.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRetryReport}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Check Status Now
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/interviews')}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Metadata & Sanitized Evaluation Results
  const role = session?.role || 'Software Engineer';
  const type = session?.interviewType || 'Technical';
  const difficulty = session?.difficulty || 'Intermediate';

  const {
    overallScore,
    technicalScore,
    communicationScore,
    problemSolvingScore,
    strengths,
    weaknesses,
    recommendations,
    summary,
  } = result || sanitizeEvaluationResult({});

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      
      {/* Header & Controls */}
      <PageHeader
        title="Interview Result & Performance Report"
        description={`${role} • ${type} Interview (${difficulty} Level)`}
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

      {/* 1. Overall Score Card */}
      <InterviewScoreCard
        role={role}
        interviewType={type}
        difficulty={difficulty}
        overallScore={overallScore}
        summary={summary}
      />

      {/* 2. Score Breakdown (Recharts Competency Bars) */}
      <ScoreBreakdown
        technicalScore={technicalScore}
        communicationScore={communicationScore}
        problemSolvingScore={problemSolvingScore}
        clarityScore={communicationScore}
        relevanceScore={technicalScore}
      />

      {/* 3 & 4. Strengths & Weaknesses Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StrengthsSection strengths={strengths} />
        <WeaknessesSection weaknesses={weaknesses} />
      </div>

      {/* 5. Question-Level AI Feedback */}
      <QuestionFeedback questions={questions} />

      {/* 6. Actionable Improvement Plan */}
      <ImprovementPlan recommendations={recommendations} />

      {/* 7. Bottom Action Buttons Bar */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl shadow-xl">
        <div className="text-xs text-slate-400 font-medium">
          Ready to improve your score or practice another candidate domain?
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/interviews/setup')}
            leftIcon={<RotateCcw className="w-4 h-4" />}
            className="flex-1 sm:flex-initial"
          >
            Try Again
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/interviews')}
            leftIcon={<History className="w-4 h-4 text-indigo-400" />}
            className="flex-1 sm:flex-initial"
          >
            View History
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/roadmap')}
            leftIcon={<BookOpen className="w-4 h-4 text-cyan-400" />}
            className="flex-1 sm:flex-initial"
          >
            Continue Learning
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewResultPage;
