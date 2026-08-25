import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Briefcase, CheckCircle2 } from 'lucide-react';
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
        const res = await api.get('/jobs');
        const jobs = res.data?.data?.items || res.data?.data || [];
        if (jobs.length > 0) {
          const appPromises = jobs.map((j) => api.get(`/jobs/${j._id}/applications`));
          const appResponses = await Promise.all(appPromises);
          let scheduled = [];
          appResponses.forEach((res) => {
            const apps = res.data?.data?.items || res.data?.data || [];
            const interviewApps = apps.filter((a) =>
              ['Interview Scheduled', 'Technical Round', 'HR Round'].includes(a.status)
            );
            scheduled = [...scheduled, ...interviewApps];
          });
          setInterviews(scheduled);
        }
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
        <span className="text-sm text-slate-400 font-medium">Loading Interview Schedule...</span>
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
          Manage upcoming candidate interviews, technical evaluation rounds, and HR interviews.
        </p>
      </div>

      {interviews.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No scheduled candidate interviews</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When candidate application status is advanced to an interview round, their schedule will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map((app) => (
            <div key={app._id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">
                  {app.user ? `${app.user.firstName || ''} ${app.user.lastName || ''}`.trim() : 'Candidate'}
                </span>
                <Badge variant="purple" style="soft" size="sm">
                  {app.status}
                </Badge>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <div>Email: <strong className="text-slate-300">{app.user?.email}</strong></div>
                <div>Scheduled Date: <strong className="text-slate-300">{app.interviewDate ? new Date(app.interviewDate).toLocaleString() : 'TBD'}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterInterviewsPage;
