import React, { useState, useEffect } from 'react';
import { Sparkles, Users, Award, HelpCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { Spinner } from '../../components/ui/LoadingState';
import { Badge } from '../../components/ui/Badge';

export const RecruiterAiPage = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [matchingData, setMatchingData] = useState(null);
  const [questionsData, setQuestionsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('matching'); // 'matching' | 'questions'

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        const list = res.data?.data?.items || res.data?.data || [];
        setJobs(list);
        if (list.length > 0) {
          setSelectedJob(list[0]._id);
        }
      } catch (err) {
        console.error('Failed to load jobs', err);
      }
    };
    fetchJobs();
  }, []);

  const handleRunAnalysis = async () => {
    if (!selectedJob) return;
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'matching') {
        const res = await api.get(`/recruiter/ai/match/${selectedJob}`);
        if (res.data?.success) {
          setMatchingData(res.data.data);
        }
      } else {
        const res = await api.get(`/recruiter/ai/questions/${selectedJob}`);
        if (res.data?.success) {
          setQuestionsData(res.data.data);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate AI hiring insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedJob) {
      handleRunAnalysis();
    }
  }, [selectedJob, activeTab]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-indigo-950/60 to-slate-900 border border-cyan-500/20 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Recruiter AI Assistant
        </div>
        <h1 className="text-2xl font-bold text-white">AI Candidate-Job Matching & Hiring Insights</h1>
        <p className="text-xs text-slate-300 max-w-3xl">
          Leverage Gemini AI to extract candidate skills, score resume-to-job fit, rank applicant relevance, and generate targeted interview questions.
        </p>
      </div>

      {/* Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-400">Select Job Listing:</label>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
          >
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('matching')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${activeTab === 'matching' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Candidate Ranking
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${activeTab === 'questions' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Interview Questions
          </button>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <span className="text-sm text-slate-400 font-medium">Running Gemini AI Analysis...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {error}
        </div>
      ) : activeTab === 'matching' && matchingData ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">
              AI Candidate Match Ranking ({matchingData.totalApplicants} applicants evaluated)
            </h2>
          </div>

          {matchingData.rankedCandidates.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
              No applicant data available for this job to evaluate matching scores.
            </div>
          ) : (
            <div className="space-y-3">
              {matchingData.rankedCandidates.map((c, idx) => (
                <div key={c.applicationId || idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">{c.candidateName}</h3>
                        <p className="text-xs text-slate-400">{c.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-base font-extrabold text-cyan-400">{c.matchScore}% Match</div>
                        <div className="text-[10px] text-slate-400">{c.recommendation}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400">Matched Skills:</span>
                    {c.matchedSkills.map((s, i) => (
                      <Badge key={i} variant="success" style="soft" size="sm">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'questions' && questionsData ? (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">Recommended Technical & Behavioral Questions</h2>
          <div className="space-y-3">
            {questionsData.questions.map((q) => (
              <div key={q.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="purple" style="soft" size="sm">
                    {q.category}
                  </Badge>
                </div>
                <h3 className="font-bold text-sm text-white">{q.question}</h3>
                <p className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <strong className="text-indigo-400">What to look for:</strong> {q.whatToLookFor}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default RecruiterAiPage;
