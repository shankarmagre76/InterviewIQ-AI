import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Eye,
  Briefcase,
  Calendar,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { Spinner } from '../../components/ui/LoadingState';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';

const ALL_STATUSES = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview Scheduled',
  'Technical Round',
  'HR Round',
  'Offered',
  'Rejected',
  'Withdrawn',
];

export const RecruiterApplicantsPage = () => {
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [previewResume, setPreviewResume] = useState(null);

  // Interview Schedule Modal state
  const [scheduleModalApp, setScheduleModalApp] = useState(null); // { appId, targetStatus, candidateName }
  const [interviewDateInput, setInterviewDateInput] = useState('');
  const [recruiterNotesInput, setRecruiterNotesInput] = useState('');
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let fetchedJobs = [];
      try {
        const myJobsRes = await api.get('/jobs/my-jobs');
        fetchedJobs = myJobsRes.data?.data?.items || myJobsRes.data?.data?.jobs || myJobsRes.data?.data || [];
      } catch (_err) {
        const jobsRes = await api.get('/jobs');
        fetchedJobs = jobsRes.data?.data?.items || jobsRes.data?.data || [];
      }
      setJobs(fetchedJobs);

      const targetJobId = selectedJob || 'all';
      const params = {};
      if (selectedStatus && selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      const appsRes = await api.get(`/jobs/${targetJobId}/applications`, { params });
      setApplications(appsRes.data?.data?.items || appsRes.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch applicants', err);
    } finally {
      setLoading(false);
    }
  }, [selectedJob, selectedStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (appId, newStatus, extraData = {}) => {
    try {
      setUpdatingId(appId);
      const payload = { status: newStatus, ...extraData };
      const response = await api.patch(`/applications/${appId}/status`, payload);
      const updatedApp = response.data?.data;

      setApplications((prev) =>
        prev.map((a) => {
          if (a._id !== appId) return a;
          const userObj = (updatedApp?.user && typeof updatedApp.user === 'object') ? updatedApp.user : a.user;
          const jobObj = (updatedApp?.job && typeof updatedApp.job === 'object') ? updatedApp.job : a.job;
          const resumeObj = (updatedApp?.resume && typeof updatedApp.resume === 'object') ? updatedApp.resume : a.resume;
          return {
            ...a,
            ...(updatedApp || payload),
            user: userObj,
            job: jobObj,
            resume: resumeObj,
          };
        })
      );

      toast.success('Candidate Status Updated', `Status updated to "${newStatus}"`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update application status';
      toast.error('Status Update Failed', msg);
      throw err;
    } finally {
      setUpdatingId(null);
    }
  };

  const openScheduleModal = (app, targetStatus) => {
    const candidateName = app.user ? `${app.user.firstName || ''} ${app.user.lastName || ''}`.trim() : 'Candidate';
    setScheduleModalApp({ appId: app._id, targetStatus, candidateName });
    const existingDate = app.interviewDate ? new Date(app.interviewDate).toISOString().slice(0, 16) : '';
    setInterviewDateInput(existingDate);
    setRecruiterNotesInput(app.recruiterNotes || '');
    setScheduleError('');
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!interviewDateInput) {
      setScheduleError('Please select a valid interview date and time');
      return;
    }

    try {
      setIsSubmittingSchedule(true);
      setScheduleError('');
      await handleStatusChange(scheduleModalApp.appId, scheduleModalApp.targetStatus, {
        interviewDate: new Date(interviewDateInput).toISOString(),
        recruiterNotes: recruiterNotesInput,
      });
      setScheduleModalApp(null);
    } catch (err) {
      setScheduleError(err.response?.data?.message || 'Failed to schedule interview round');
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Shortlisted':
      case 'Offered':
        return { variant: 'success', bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' };
      case 'Rejected':
      case 'Withdrawn':
        return { variant: 'danger', bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30' };
      case 'Interview Scheduled':
      case 'Technical Round':
      case 'HR Round':
        return { variant: 'primary', bg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' };
      case 'Under Review':
        return { variant: 'warning', bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
      case 'Applied':
      default:
        return { variant: 'info', bg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' };
    }
  };

  const getResumeObject = (app) => {
    if (!app) return null;
    if (app.resume && typeof app.resume === 'object') {
      return {
        _id: app.resume._id,
        originalName: app.resume.originalName || app.resume.fileName || 'Candidate_Resume.pdf',
        url: app.resume.url || app.resume.fileUrl || app.resume.resumeUrl || '',
        fileSize: app.resume.fileSize,
        mimeType: app.resume.mimeType || 'application/pdf',
        createdAt: app.resume.createdAt || app.createdAt,
      };
    }
    if (typeof app.resume === 'string' && (app.resume.startsWith('http') || app.resume.startsWith('/'))) {
      return {
        originalName: 'Candidate_Resume.pdf',
        url: app.resume,
        createdAt: app.createdAt,
      };
    }
    if (app.user?.resume) {
      if (typeof app.user.resume === 'object') {
        return {
          ...app.user.resume,
          originalName: app.user.resume.originalName || app.user.resume.originalFileName || 'Candidate_Resume.pdf',
          url: app.user.resume.url || app.user.resume.resumeUrl || '',
        };
      }
      if (typeof app.user.resume === 'string' && (app.user.resume.startsWith('http') || app.user.resume.startsWith('/'))) {
        return {
          originalName: 'Candidate_Resume.pdf',
          url: app.user.resume,
        };
      }
    }
    return null;
  };

  const filteredApps = applications.filter((app) => {
    if (!search) return true;
    const name = `${app.user?.firstName || ''} ${app.user?.lastName || ''}`.toLowerCase();
    const email = (app.user?.email || '').toLowerCase();
    const jobTitle = (app.job?.title || '').toLowerCase();
    const status = (app.status || '').toLowerCase();
    const s = search.toLowerCase();
    return name.includes(s) || email.includes(s) || jobTitle.includes(s) || status.includes(s);
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
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" /> Applicant Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review candidate applications, examine resumes, shortlist qualified talent, schedule interviews, and update application pipeline statuses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Job Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-semibold">Job:</label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Applications</option>
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-semibold">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by candidate name, email, status, or job..."
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
            No candidates have submitted applications matching your selected job or status filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const badgeStyle = getStatusBadgeStyle(app.status);
            return (
              <div key={app._id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white font-bold flex items-center justify-center text-sm shrink-0">
                      {typeof app.user === 'object' && app.user?.firstName ? app.user.firstName.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">
                        {typeof app.user === 'object' && app.user
                          ? (`${app.user.firstName || ''} ${app.user.lastName || ''}`.trim() || app.user.email || 'Candidate Applicant')
                          : 'Candidate Applicant'}
                      </h3>
                      <p className="text-xs text-slate-400">{typeof app.user === 'object' ? (app.user?.email || 'N/A') : 'N/A'}</p>
                    </div>
                  </div>

                  {/* Status Dropdown & Badge */}
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${badgeStyle.bg}`}>
                      {app.status || 'Applied'}
                    </span>

                    {/* Interactive Update Status Select */}
                    <div className="flex items-center gap-1.5">
                      <label className="text-[11px] text-slate-400 font-medium hidden sm:inline">Update:</label>
                      <select
                        disabled={updatingId === app._id}
                        value={app.status || 'Applied'}
                        onChange={(e) => {
                          const newSt = e.target.value;
                          if (['Interview Scheduled', 'Technical Round', 'HR Round'].includes(newSt)) {
                            openScheduleModal(app, newSt);
                          } else {
                            handleStatusChange(app._id, newSt);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Application Details */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-4 text-slate-400">
                    <div className="flex items-center gap-4">
                      <span>Applied Date: <strong className="text-slate-200">{new Date(app.createdAt || app.appliedAt).toLocaleDateString()}</strong></span>
                      {app.coverLetter && <span className="text-cyan-400 font-medium">Cover Letter Provided</span>}
                      {app.interviewDate && (
                        <span className="text-indigo-400 flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5" /> Interview: {new Date(app.interviewDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      )}
                    </div>
                    {app.job && (
                      <div className="flex items-center gap-1.5 text-indigo-400 font-medium bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>{app.job.title}</span>
                      </div>
                    )}
                  </div>

                  {app.recruiterNotes && (
                    <div className="text-slate-400 text-[11px] pt-1 flex items-start gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span>Recruiter Note: <em className="text-slate-300">{app.recruiterNotes}</em></span>
                    </div>
                  )}

                  {(() => {
                    const resumeObj = getResumeObject(app);
                    return (
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-800/60">
                        <span className="text-slate-400 flex items-center gap-1.5 font-medium truncate">
                          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span className="text-slate-400">Submitted Candidate Resume:</span>
                          <strong className="text-slate-200 truncate max-w-[200px]">
                            {resumeObj?.originalName || 'Candidate_Resume.pdf'}
                          </strong>
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          {resumeObj ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setPreviewResume(resumeObj)}
                                className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-indigo-400" /> View Resume
                              </button>
                              {resumeObj.url && (
                                <a
                                  href={resumeObj.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1"
                                  title="Open resume link in new tab"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </>
                          ) : (
                            <span className="text-slate-500 text-xs">No Resume Document Attached</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interview Scheduling Modal */}
      <Modal
        isOpen={!!scheduleModalApp}
        onClose={() => setScheduleModalApp(null)}
        title={
          <div className="flex items-center gap-2 text-slate-100">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <span>Schedule {scheduleModalApp?.targetStatus}</span>
          </div>
        }
        size="md"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <p className="text-xs text-slate-400">
            Scheduling <strong>{scheduleModalApp?.targetStatus}</strong> for candidate <strong>{scheduleModalApp?.candidateName}</strong>.
          </p>

          {scheduleError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{scheduleError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Interview Date & Time <span className="text-rose-400">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={interviewDateInput}
              onChange={(e) => setInterviewDateInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Recruiter Notes / Instructions (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add internal notes or instructions for the candidate..."
              value={recruiterNotesInput}
              onChange={(e) => setRecruiterNotesInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setScheduleModalApp(null)}
              disabled={isSubmittingSchedule}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingSchedule}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Update Status
            </Button>
          </div>
        </form>
      </Modal>

      {/* Resume Preview Modal */}
      <ResumePreviewModal
        isOpen={!!previewResume}
        onClose={() => setPreviewResume(null)}
        resume={previewResume}
      />
    </div>
  );
};

export default RecruiterApplicantsPage;
