import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Edit2,
  Trash2,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { JobStatusBadge } from './JobStatusBadge.jsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { formatFullDate } from '../notifications/NotificationCard.jsx';

/**
 * AdminJobTable Component (F10.7)
 * Professional Job Management table displaying platform-wide job postings with mobile card fallback.
 *
 * @param {Object} props
 * @param {Array<Object>} props.jobs - Array of job posting documents
 * @param {boolean} [props.isLoading=false] - Loading state flag
 * @param {Function} props.onEdit - Callback to edit job posting
 * @param {Function} props.onStatusChange - Callback to update job status
 * @param {Function} props.onDelete - Callback to delete job posting
 */
export const AdminJobTable = ({
  jobs = [],
  isLoading = false,
  onEdit,
  onStatusChange,
  onDelete,
}) => {
  const [targetDeleteJob, setTargetDeleteJob] = useState(null);
  const [actionMap, setActionMap] = useState({});

  const setActionLoading = (id, isUpdating) => {
    setActionMap((prev) => ({ ...prev, [id]: isUpdating }));
  };

  const handleStatusChangeSubmit = async (job, newStatus) => {
    if (!onStatusChange || actionMap[job._id]) return;
    setActionLoading(job._id, true);
    try {
      await onStatusChange(job._id, newStatus);
    } finally {
      setActionLoading(job._id, false);
    }
  };

  const confirmDeleteSubmit = async () => {
    if (!targetDeleteJob || !onDelete) return;
    const jid = targetDeleteJob._id;
    setTargetDeleteJob(null);
    setActionLoading(jid, true);
    try {
      await onDelete(jid);
    } finally {
      setActionLoading(jid, false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 my-4">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 animate-pulse flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 shrink-0" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-800 rounded w-44" />
                <div className="h-3 bg-slate-800/60 rounded w-28" />
              </div>
            </div>
            <div className="h-6 bg-slate-800 rounded w-24 hidden sm:block" />
          </div>
        ))}
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="p-10 text-center rounded-2xl glass-panel border border-slate-800 my-4 flex flex-col items-center justify-center gap-2">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <Briefcase className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-200 mt-2">No Job Postings Found</h4>
        <p className="text-xs text-slate-400 max-w-sm">
          No job postings matched your search or filter parameters. Try adjusting filters above or post a new job.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 my-4">
      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl glass-panel border border-slate-800 shadow-xl custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3.5 px-4">Job Title</th>
              <th className="py-3.5 px-4">Company</th>
              <th className="py-3.5 px-4">Location & Mode</th>
              <th className="py-3.5 px-4">Employment Type</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Created Date</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {jobs.map((job) => {
              const companyName = typeof job.company === 'object' ? job.company?.companyName : 'Company';
              const isActionLoading = actionMap[job._id];

              return (
                <tr
                  key={job._id}
                  className="hover:bg-slate-900/50 transition-colors group text-slate-300"
                >
                  {/* Job Title */}
                  <td className="py-3.5 px-4">
                    <div className="min-w-[180px]">
                      <p className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors truncate">
                        {job.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {job.openings ? `${job.openings} opening(s)` : '1 opening'}
                      </p>
                    </div>
                  </td>

                  {/* Company */}
                  <td className="py-3.5 px-4 font-medium text-slate-300">
                    <div className="flex items-center gap-1.5 min-w-[140px]">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{companyName}</span>
                    </div>
                  </td>

                  {/* Location & Work Mode */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{job.location}</span>
                      {job.workMode && (
                        <Badge variant="primary" style="soft" size="sm" className="text-[9px] py-0 px-1">
                          {job.workMode}
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* Employment Type */}
                  <td className="py-3.5 px-4 font-medium text-slate-300">
                    {job.employmentType || 'Full-time'}
                  </td>

                  {/* Status & Status Dropdown Selector */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <JobStatusBadge status={job.status} />

                      <select
                        value={job.status || 'Active'}
                        onChange={(e) => handleStatusChangeSubmit(job, e.target.value)}
                        disabled={isActionLoading}
                        className="bg-slate-900 border border-slate-800 text-[10px] text-slate-300 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                      >
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                        <option value="Paused">Paused</option>
                        <option value="Closed">Closed</option>
                        <option value="Expired">Expired</option>
                      </select>
                    </div>
                  </td>

                  {/* Created Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatFullDate(job.createdAt)}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {isActionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => onEdit(job)}
                            title="Edit job posting"
                            className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setTargetDeleteJob(job)}
                            title="Delete job posting"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="sm:hidden space-y-3">
        {jobs.map((job) => {
          const companyName = typeof job.company === 'object' ? job.company?.companyName : 'Company';
          const isActionLoading = actionMap[job._id];

          return (
            <div
              key={job._id}
              className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{job.title}</h4>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    <span>{companyName}</span>
                  </p>
                </div>

                <JobStatusBadge status={job.status} />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{job.location} ({job.workMode})</span>
                </span>
                <span>{job.employmentType}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                {isActionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onEdit(job)}
                      className="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-300 text-xs font-medium border border-indigo-500/20 cursor-pointer"
                    >
                      Edit Job
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetDeleteJob(job)}
                      className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      {targetDeleteJob && (
        <ConfirmDialog
          isOpen={Boolean(targetDeleteJob)}
          title="Delete Job Posting"
          message={`Are you sure you want to permanently delete job posting "${targetDeleteJob.title}"?`}
          confirmText="Delete Job"
          cancelText="Cancel"
          variant="danger"
          onConfirm={confirmDeleteSubmit}
          onClose={() => setTargetDeleteJob(null)}
        />
      )}
    </div>
  );
};

export default AdminJobTable;
