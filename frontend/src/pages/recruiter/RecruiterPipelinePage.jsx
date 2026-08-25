import React, { useState, useEffect } from 'react';
import { GitPullRequest, Search, CheckCircle2, XCircle, ArrowRight, UserCheck } from 'lucide-react';
import { api } from '../../services/api';
import { Spinner } from '../../components/ui/LoadingState';
import { Badge } from '../../components/ui/Badge';

const STAGES = [
  { key: 'Applied', title: 'Applied', color: 'border-slate-700 bg-slate-900/50' },
  { key: 'Under Review', title: 'Under Review', color: 'border-blue-500/30 bg-blue-950/20' },
  { key: 'Shortlisted', title: 'Shortlisted', color: 'border-cyan-500/30 bg-cyan-950/20' },
  { key: 'Interview Scheduled', title: 'Interview', color: 'border-purple-500/30 bg-purple-950/20' },
  { key: 'Offered', title: 'Offered / Hired', color: 'border-emerald-500/30 bg-emerald-950/20' },
  { key: 'Rejected', title: 'Rejected', color: 'border-rose-500/30 bg-rose-950/20' },
];

export const RecruiterPipelinePage = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const jobsRes = await api.get('/jobs');
      const fetchedJobs = jobsRes.data?.data?.items || jobsRes.data?.data || [];
      setJobs(fetchedJobs);

      if (fetchedJobs.length > 0) {
        const jobId = selectedJob || fetchedJobs[0]._id;
        if (!selectedJob) setSelectedJob(jobId);

        const appsRes = await api.get(`/jobs/${jobId}/applications`);
        setApplications(appsRes.data?.data?.items || appsRes.data?.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch pipeline applications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedJob]);

  const handleStageAdvance = async (appId, currentStatus) => {
    const stageKeys = STAGES.map((s) => s.key);
    const currentIndex = stageKeys.indexOf(currentStatus);
    const nextStatus = stageKeys[Math.min(stageKeys.length - 2, currentIndex + 1)];

    if (!nextStatus || nextStatus === currentStatus) return;

    try {
      setUpdatingId(appId);
      await api.patch(`/applications/${appId}/status`, { status: nextStatus });
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: nextStatus } : a))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update pipeline stage');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <span className="text-sm text-slate-400 font-medium">Loading Hiring Pipeline...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <GitPullRequest className="w-6 h-6 text-purple-400" /> Visual Hiring Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track candidates visually through every stage of your recruitment pipeline.
          </p>
        </div>

        {jobs.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-semibold">Select Job:</label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
            >
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Kanban Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageApps = applications.filter((app) => {
            if (stage.key === 'Interview Scheduled') {
              return ['Interview Scheduled', 'Technical Round', 'HR Round'].includes(app.status);
            }
            return app.status === stage.key;
          });

          return (
            <div key={stage.key} className={`p-4 rounded-2xl border ${stage.color} space-y-3 flex flex-col justify-between min-h-[400px]`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="font-bold text-xs text-white uppercase tracking-wider">{stage.title}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                    {stageApps.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {stageApps.map((app) => (
                    <div key={app._id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                      <div className="font-bold text-slate-200 truncate">
                        {app.user ? `${app.user.firstName || ''} ${app.user.lastName || ''}`.trim() : 'Candidate'}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{app.user?.email || 'N/A'}</div>

                      {stage.key !== 'Offered' && stage.key !== 'Rejected' && (
                        <button
                          disabled={updatingId === app._id}
                          onClick={() => handleStageAdvance(app._id, app.status)}
                          className="w-full mt-2 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-[11px] font-semibold border border-indigo-500/30 transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <span>Advance</span> <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecruiterPipelinePage;
