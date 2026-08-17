import React from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Badge } from '../ui/Badge.jsx';
import { formatFullDate } from '../notifications/NotificationCard.jsx';
import { User, Briefcase, Building2, Calendar, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';

/**
 * ApplicationDetails Component (F10.8)
 * Read-only modal displaying candidate application metadata, job requirements, and status progression timeline.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close callback
 * @param {Object|null} props.application - Application document
 */
export const ApplicationDetails = ({
  isOpen,
  onClose,
  application,
}) => {
  if (!application) return null;

  const candidate = application.candidate || application.applicant || application.user || {};
  const job = application.job || {};
  const company = application.company || job.company || {};

  const candidateName = candidate.name || `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate Account';
  const jobTitle = job.title || 'Job Opening';
  const companyName = company.companyName || 'Company';

  const getStatusBadgeVariant = (st) => {
    switch (st) {
      case 'Offered':
        return 'success';
      case 'Rejected':
      case 'Withdrawn':
        return 'danger';
      case 'Interview Scheduled':
      case 'Technical Round':
      case 'HR Round':
        return 'primary';
      case 'Submitted':
      case 'Under Review':
      case 'Shortlisted':
      default:
        return 'warning';
    }
  };

  const statusHistory = application.statusHistory || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Application Details: ${candidateName}`}
      size="lg"
    >
      <div className="space-y-6 pt-2 text-xs">
        {/* Banner Header */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">{jobTitle}</h3>
              <Badge variant={getStatusBadgeVariant(application.status)} style="soft" size="sm">
                {application.status || 'Submitted'}
              </Badge>
            </div>
            <p className="text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{companyName}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Read-Only Administrative View</span>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Candidate Card */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <p className="text-slate-400 font-semibold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" /> Applicant Candidate:
            </p>
            <p className="text-slate-200 font-bold text-sm">{candidateName}</p>
            <p className="text-slate-400 text-[11px]">{candidate.email || 'Email Protected'}</p>
          </div>

          {/* Job Details Card */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <p className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Opening Details:
            </p>
            <p className="text-slate-200 font-bold">{jobTitle}</p>
            <p className="text-slate-400 text-[11px]">
              {job.location ? `${job.location} (${job.workMode || 'Remote'})` : 'Location N/A'}
            </p>
          </div>

          {/* Applied Date */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <p className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Submission Date:
            </p>
            <p className="text-slate-200 font-medium">{formatFullDate(application.createdAt)}</p>
          </div>

          {/* Last Updated */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <p className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Last Updated:
            </p>
            <p className="text-slate-200 font-medium">{formatFullDate(application.updatedAt)}</p>
          </div>
        </div>

        {/* Status History Timeline */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-300">Status History Timeline:</h4>
          {statusHistory.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-center">
              No previous status transition records found.
            </div>
          ) : (
            <div className="space-y-2 relative border-l border-slate-800 pl-4 ml-2">
              {statusHistory.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-slate-950" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{item.status || 'Updated'}</span>
                    <span className="text-slate-500 text-[11px]">{formatFullDate(item.updatedAt || item.date)}</span>
                  </div>
                  {item.note && <p className="text-[11px] text-slate-400 mt-0.5">{item.note}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ApplicationDetails;
