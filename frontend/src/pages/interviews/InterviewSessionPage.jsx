import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Bot,
  BrainCircuit,
  Clock,
  LogOut
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Textarea';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Alert } from '../../components/ui/Alert';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SkeletonCard } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { interviewService } from '../../services/interviewService';

export const InterviewSessionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Session & Questions State
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');

  // UI & Loading States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [evaluationFeedback, setEvaluationFeedback] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [endingSession, setEndingSession] = useState(false);

  // Web Speech API State (Optional Voice Recognition)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition if browser supports it
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setUserAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        };

        recognition.onerror = (err) => {
          console.warn('Speech recognition error:', err);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your answer.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setIsListening(false);
      }
    }
  };

  // Fetch Session Data & Questions on Mount
  const fetchSessionDetails = useCallback(async () => {
    if (!id) {
      setError('Interview ID parameter is required.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await interviewService.getInterviewDetails(id);
      const data = res?.data || {};

      const interviewData = data.interview || (data._id ? data : null);
      const questionsList = data.questions || interviewData?.questions || [];

      if (!interviewData) {
        throw new Error('Interview session details could not be found.');
      }

      setSession(interviewData);
      setQuestions(questionsList);

      // Check if session is already completed
      if (interviewData.status === 'Completed') {
        navigate(`/interviews/${id}/result`);
        return;
      }

      // Find first unanswered question
      const firstUnansweredIndex = questionsList.findIndex(
        (q) => !q.answer || q.answer.trim().length === 0
      );

      if (firstUnansweredIndex !== -1) {
        setCurrentQuestionIndex(firstUnansweredIndex);
        setUserAnswer(questionsList[firstUnansweredIndex].answer || '');
      } else if (questionsList.length > 0) {
        setCurrentQuestionIndex(0);
        setUserAnswer(questionsList[0].answer || '');
      }
    } catch (err) {
      console.error('Error fetching interview session:', err);
      const status = err?.response?.status;
      let msg = err?.response?.data?.message || err?.message || 'Failed to load interview session.';

      if (status === 404) {
        msg = 'Interview session not found or has been deleted.';
      } else if (status === 401 || status === 403) {
        msg = 'Unauthorized access to this interview session.';
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchSessionDetails();
  }, [fetchSessionDetails]);

  // Warn candidate before unloading page if draft answer exists
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (userAnswer.trim().length > 0 && !submitting) {
        e.preventDefault();
        e.returnValue = 'You have an unsaved response. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userAnswer, submitting]);

  // Active question document
  const currentQuestion = questions[currentQuestionIndex] || null;
  const totalQuestionsCount = session?.totalQuestions || questions.length || 5;
  const completedQuestionsCount = currentQuestionIndex;
  const remainingQuestionsCount = Math.max(0, totalQuestionsCount - (currentQuestionIndex + 1));

  // Submit Candidate Answer
  const handleSubmitAnswer = async (e) => {
    if (e) e.preventDefault();

    if (submitting || !userAnswer.trim() || !currentQuestion) {
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    }

    setSubmitting(true);
    setError(null);
    setEvaluationFeedback(null);

    try {
      const payload = {
        questionId: currentQuestion._id || currentQuestion.id,
        answer: userAnswer.trim(),
        userAnswer: userAnswer.trim(),
      };

      const res = await interviewService.submitAnswer(id, payload);
      const evalData = res?.data || {};

      // Flash feedback if evaluation is present
      if (evalData.evaluation) {
        setEvaluationFeedback({
          score: evalData.evaluation.score || evalData.question?.score || 85,
          feedback: evalData.evaluation.feedback || 'Answer evaluated by Gemini AI.',
        });
      }

      // Check if session is completed
      if (evalData.isCompleted || (currentQuestionIndex + 1 >= totalQuestionsCount)) {
        // Complete session and navigate to results
        setTimeout(() => {
          navigate(`/interviews/${id}/result`);
        }, 1200);
        return;
      }

      // Advance to next question
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < questions.length) {
        setCurrentQuestionIndex(nextIndex);
        setUserAnswer(questions[nextIndex].answer || '');
      } else {
        // Re-fetch or navigate to result
        navigate(`/interviews/${id}/result`);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit answer for evaluation.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Keyboard shortcut handler (Ctrl + Enter)
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  // End Session Confirmation Handler
  const handleConfirmEndSession = async () => {
    setEndingSession(true);
    try {
      await interviewService.completeInterview(id, { status: 'Completed' });
      navigate(`/interviews/${id}/result`);
    } catch {
      // Fallback navigation even if complete endpoint throws
      navigate('/interviews');
    } finally {
      setEndingSession(false);
      setShowExitConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div className="w-full h-24 rounded-2xl animate-pulse bg-slate-900/80 border border-slate-800" />
        <SkeletonCard />
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="py-12 max-w-3xl mx-auto space-y-6">
        <ErrorState
          title="Interview Session Error"
          message={error}
          onRetry={fetchSessionDetails}
        />
        <div className="text-center">
          <Button variant="outline" onClick={() => navigate('/interviews')}>
            Return to Interviews Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const role = session?.role || 'Software Engineer';
  const type = session?.interviewType || 'Technical';
  const difficulty = session?.difficulty || 'Intermediate';

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto pb-16">
      
      {/* Header & Controls */}
      <PageHeader
        title="AI Mock Interview"
        description={`${role} • ${type} Interview (${difficulty} Level)`}
        action={
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowExitConfirm(true)}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            End Interview
          </Button>
        }
      />

      {/* Top Header Card: Question Count & Progress Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI MOCK INTERVIEW
            </span>
            <Badge variant="info" size="sm">
              Live Session
            </Badge>
          </div>

          <div className="text-sm font-extrabold text-white tracking-wide">
            Question <span className="text-indigo-400">{currentQuestionIndex + 1}</span> of{' '}
            <span className="text-slate-400">{totalQuestionsCount}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          value={currentQuestionIndex + 1}
          max={totalQuestionsCount}
          showPercentage={true}
          color="indigo"
          size="md"
        />

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> ~{session?.estimatedDuration || 30} mins total duration
          </span>
          <span className="font-semibold text-slate-300">
            {remainingQuestionsCount} question{remainingQuestionsCount === 1 ? '' : 's'} remaining
          </span>
        </div>
      </div>

      {/* Top Banner Error Alert if submit failed */}
      {error && (
        <Alert
          variant="danger"
          title="Submission Issue"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Evaluation Feedback Alert */}
      {evaluationFeedback && (
        <Alert
          variant="success"
          title={`Answer Evaluated (Score: ${evaluationFeedback.score}/100)`}
          message={evaluationFeedback.feedback}
          onClose={() => setEvaluationFeedback(null)}
        />
      )}

      {/* AI Interviewer Question Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Glow Accent */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                🤖 AI Interviewer
              </h3>
              <p className="text-xs text-slate-400">Powered by Gemini AI Engine</p>
            </div>
          </div>

          <Badge variant="outline" size="sm" className="border-indigo-500/30 text-indigo-300">
            Question #{currentQuestionIndex + 1}
          </Badge>
        </div>

        {/* Question Text */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-100 text-base sm:text-lg font-medium leading-relaxed shadow-inner">
          "{currentQuestion?.question || 'Explain your technical approach to this domain problem.'}"
        </div>
      </div>

      {/* Candidate Answer Input Card */}
      <form onSubmit={handleSubmitAnswer} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        
        <div className="flex items-center justify-between">
          <label htmlFor="interview-answer-input" className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-indigo-400" /> Your Technical Response
          </label>
          <span className="text-xs text-slate-400 font-mono">
            {userAnswer.length} / 10,000 characters
          </span>
        </div>

        <Textarea
          id="interview-answer-input"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={7}
          placeholder="Type your response here... (Describe your methodology, architectural trade-offs, code principles, or STAR framework response)"
          disabled={submitting}
          autoFocus
          className="text-slate-100 placeholder-slate-500 focus:ring-indigo-500/50"
        />

        {/* Action Controls Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-800/80 pt-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant={isListening ? 'danger' : 'outline'}
              size="sm"
              onClick={toggleVoiceInput}
              disabled={submitting}
              leftIcon={isListening ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4 text-indigo-400" />}
            >
              {isListening ? 'Stop Listening' : 'Voice Input (Optional)'}
            </Button>

            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Enter</kbd> to submit
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={submitting}
            disabled={submitting || !userAnswer.trim()}
            rightIcon={<Send className="w-4.5 h-4.5" />}
            className="px-8 shadow-indigo-500/30"
          >
            {submitting ? 'Evaluating with Gemini AI...' : 'Submit Answer'}
          </Button>
        </div>
      </form>

      {/* Confirmation Modal for Ending Session */}
      <ConfirmDialog
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={handleConfirmEndSession}
        title="End Mock Interview Session?"
        description="Are you sure you want to conclude this interview session? Your answered questions will be evaluated, and your performance report will be generated."
        confirmText="End & View Report"
        cancelText="Resume Session"
        variant="primary"
        isLoading={endingSession}
      />
    </div>
  );
};

export default InterviewSessionPage;
