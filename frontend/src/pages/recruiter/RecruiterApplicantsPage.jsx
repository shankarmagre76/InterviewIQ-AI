import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, CheckCircle2, XCircle, Clock, ExternalLink, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { Spinner } from '../../components/ui/LoadingState';
import { Badge } from '../../components/ui/Badge';

export const RecruiterApplicantsPage = () => {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
      console.error('Failed to fetch applicants', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedJob]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setUpdatingId(appId);
      await api.patch(`/applications/${appId}/status`, { status: newStatus });
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update application status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (!search) return true;
    const name = `${app.user?.firstName || ''} ${app.user?.lastName || ''}`.toLowerCase();
    const email = (app.user?.email || '').toLowerCase();
    return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <span className="text-sm text-slate-400 font-medium">Loading Applicant Records...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" /> Applicant Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review candidate applications, examine permitted resumes, shortlist qualified candidates, and manage hiring stages.
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

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search candidate by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="text-xs text-slate-400">
          Showing <span className="font-bold text-white">{filteredApps.length}</span> applicant(s)
        </div>
      </div>

      {/* Applicants List */}
      {filteredApps.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No applicants found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No candidates have submitted applications for the selected job matching your filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <div key={app._id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white font-bold flex items-center justify-center text-sm shrink-0">
                    {app.user?.firstName ? app.user.firstName.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      {app.user ? `${app.user.firstName || ''} ${app.user.lastName || ''}`.trim() : 'Candidate Applicant'}
                    </h3>
                    <p className="text-xs text-slate-400">{app.user?.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="primary" style="soft" size="sm">
                    {app.status || 'Applied'}
                  </Badge>

                  {/* Quick Action Buttons */}
                  <button
                    disabled={updatingId === app._id}
                    onClick={() => handleStatusChange(app._id, 'Shortlisted')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/20 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Shortlist
                  </button>
                  <button
                    disabled={updatingId === app._id}
                    onClick={() => handleStatusChange(app._id, 'Rejected')}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/20 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>

              {/* Application Details */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2">
                <div className="flex flex-wrap gap-4 text-slate-400">
                  <span>Applied Date: <strong className="text-slate-200">{new Date(app.createdAt || app.appliedAt).toLocaleDateString()}</strong></span>
                  {app.coverLetter && <span>Cover Letter Provided</span>}
                </div>

                {app.resume && (
                  <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                    <span className="text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Submitted Candidate Resume
                    </span>
                    {app.resume.url ? (
                      <a
                        href={app.resume.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                      >
                        View Permitted Resume <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-500">Resume File Attached</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterApplicantsPage;
