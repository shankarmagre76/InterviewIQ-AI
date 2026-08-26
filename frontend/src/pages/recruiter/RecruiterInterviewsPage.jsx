import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Briefcase, Mail, MessageSquare, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { Spinner } from '../../components/ui/LoadingState';
import { Badge } from '../../components/ui/Badge';

export const RecruiterInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        let scheduled = [];

        // Primary: Fetch all recruiter applications via /jobs/all/applications
        try {
          const res = await api.get('/jobs/all/applications');
          const apps = res.data?.data?.items || res.data?.data || [];
          scheduled = apps.filter((a) =>
            ['Interview Scheduled', 'Technical Round', 'HR Round'].includes(a.status)
          );
        } catch (_err) {
          // Fallback: Query recruiter jobs and fetch per-job applications
          let jobs = [];
          try {
            const myJobsRes = await api.get('/jobs/my-jobs');
            jobs = myJobsRes.data?.data?.items || myJobsRes.data?.data?.jobs || myJobsRes.data?.data || [];
          } catch (_e) {
            const jobsRes = await api.get('/jobs');
            jobs = jobsRes.data?.data?.items || jobsRes.data?.data || [];
          }

          if (jobs.length > 0) {
            const appPromises = jobs.map((j) => api.get(`/jobs/${j._id}/applications`));
            const appResponses = await Promise.all(appPromises);
            appResponses.forEach((r) => {
              const items = r.data?.data?.items || r.data?.data || [];
              const interviewApps = items.filter((a) =>
                ['Interview Scheduled', 'Technical Round', 'HR Round'].includes(a.status)
              );
              scheduled = [...scheduled, ...interviewApps];
            });
          }
        }

        setInterviews(scheduled);
      } catch (err) {
        console.error('Failed to fetch candidate interviews', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <span className="text-sm text-slate-400 font-medium">Loading Candidate Interview Schedule...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-purple-400" /> Candidate Interview Schedule
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage upcoming candidate interviews, technical evaluation rounds, and HR interviews across all active job postings.
        </p>
      </div>

      {interviews.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No scheduled candidate interviews</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When candidate application status is updated to Interview Scheduled, Technical Round, or HR Round on the Applicants page, their interview details will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map((app) => {
            const candidateName =
              typeof app.user === 'object' && app.user
                ? (`${app.user.firstName || ''} ${app.user.lastName || ''}`.trim() || app.user.email || 'Candidate')
                : 'Candidate';

            const candidateEmail = typeof app.user === 'object' ? app.user?.email : 'N/A';

            return (
              <div key={app._id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold flex items-center justify-center text-sm shrink-0">
                      {candidateName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{candidateName}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500" />
                        {candidateEmail}
                      </p>
                    </div>
                  </div>
                  <Badge variant="primary" style="soft" size="sm">
                    {app.status}
                  </Badge>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2">
                  {app.job && (
                    <div className="flex items-center gap-1.5 text-indigo-400 font-medium">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Applied Job: <strong className="text-slate-200">{app.job.title}</strong></span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>Scheduled Date: <strong className="text-purple-300">{app.interviewDate ? new Date(app.interviewDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Date TBD'}</strong></span>
                  </div>

                  {app.recruiterNotes && (
                    <div className="text-slate-400 text-[11px] pt-1 flex items-start gap-1.5 border-t border-slate-800/50">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span>Notes: <em className="text-slate-300">{app.recruiterNotes}</em></span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecruiterInterviewsPage;
