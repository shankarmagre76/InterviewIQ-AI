import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Clock,
  FileText,
  ExternalLink,
  MessageSquare,
  Award,
  XCircle,
} from 'lucide-react';

import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { getStatusBadgeVariant } from './ApplicationListTable';

export const ApplicationDetailsModal = ({
  isOpen = false,
  onClose,
  application = null,
  onWithdraw,
}) => {
  const navigate = useNavigate();

  if (!application) return null;

  const companyName = application.company?.companyName || application.companyName || 'Company';
  const companyLogo = application.company?.logoUrl || null;
  const jobTitle = application.job?.title || application.jobTitle || 'Job Position';
  const jobId = application.job?._id || application.job;
  const statusInfo = getStatusBadgeVariant(application.status);

  const appliedDate = application.appliedAt || application.createdAt;
  const updatedDate = application.updatedAt || application.appliedAt;
  const interviewDate = application.interviewDate ? new Date(application.interviewDate) : null;

  const canWithdraw = application.status === 'Applied' || application.status === 'Under Review';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Application Details"
      size="md"
    >
      <div className="space-y-6 text-xs sm:text-sm">
        {/* Header Hero Section */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={companyName}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-800 bg-slate-900 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-bold font-mono text-sm flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
              )}

              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                  {companyName}
                </span>
                <h4 className="font-bold text-slate-100 text-base">{jobTitle}</h4>
              </div>
            </div>

            <Badge variant={statusInfo.variant} style="soft" size="md">
              {statusInfo.label}
            </Badge>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Applied on {appliedDate ? new Date(appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
            </span>

            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Updated {updatedDate ? new Date(updatedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
            </span>
          </div>
        </div>

        {/* Scheduled Interview Section */}
        {interviewDate && (
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 space-y-1">
            <h5 className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Scheduled Interview Date
            </h5>
            <p className="font-mono text-sm font-bold text-slate-100">
              {interviewDate.toLocaleString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        )}

        {/* Attached Resume */}
        <div className="space-y-2">
          <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            Attached Resume Document
          </h5>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-mono text-slate-200 text-xs truncate">
              {application.resume?.fileName || 'Candidate_Resume.pdf'}
            </span>
          </div>
        </div>

        {/* Cover Letter */}
        {application.coverLetter && (
          <div className="space-y-2">
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Cover Letter / Message
            </h5>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 italic leading-relaxed">
              "{application.coverLetter}"
            </div>
          </div>
        )}

        {/* Recruiter Notes / Feedback */}
        {application.recruiterNotes && (
          <div className="space-y-2">
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              Recruiter Notes
            </h5>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              {application.recruiterNotes}
            </div>
          </div>
        )}

        {/* Recruiter Rating / Comments Feedback */}
        {application.feedback?.comments && (
          <div className="space-y-2">
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Interview Feedback
            </h5>
            <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-300 space-y-1">
              {application.feedback.rating && (
                <div className="font-mono text-amber-400 font-bold">
                  Rating: {application.feedback.rating} / 5 Stars
                </div>
              )}
              <p className="text-slate-300">{application.feedback.comments}</p>
            </div>
          </div>
        )}

        {/* Modal Bottom Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <div>
            {canWithdraw && onWithdraw && (
              <Button
                size="xs"
                variant="outline"
                onClick={() => {
                  onClose();
                  onWithdraw(application._id);
                }}
                className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                leftIcon={<XCircle className="w-3.5 h-3.5" />}
              >
                Withdraw Application
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {jobId && (
              <Button
                size="xs"
                variant="outline"
                onClick={() => {
                  onClose();
                  navigate(`/jobs/${jobId}`);
                }}
                leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                View Job Posting
              </Button>
            )}

            <Button size="xs" variant="primary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ApplicationDetailsModal;
