import React from 'react';
import {
  FileCheck,
  User,
  Building2,
  Calendar,
  Clock,
  Eye,
} from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { formatFullDate } from '../notifications/NotificationCard.jsx';

/**
 * AdminApplicationTable Component (F10.8)
 * Professional table displaying candidate job application pipelines with mobile card fallback.
 * Read-only layout matching backend permissions.
 *
 * @param {Object} props
 * @param {Array<Object>} props.applications - Array of application documents
 * @param {boolean} [props.isLoading=false] - Loading state flag
 * @param {Function} props.onViewDetails - Callback to view application details
 */
export const AdminApplicationTable = ({
  applications = [],
  isLoading = false,
  onViewDetails,
}) => {
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

  if (isLoading) {
    return (
      <div className="space-y-3 my-4">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 animate-pulse flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 shrink-0" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-800 rounded w-44" />
                <div className="h-3 bg-slate-800/60 rounded w-32" />
              </div>
            </div>
            <div className="h-6 bg-slate-800 rounded w-24 hidden sm:block" />
          </div>
        ))}
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="p-10 text-center rounded-2xl glass-panel border border-slate-800 my-4 flex flex-col items-center justify-center gap-2">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <FileCheck className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-200 mt-2">No Applications Found</h4>
        <p className="text-xs text-slate-400 max-w-sm">
          No job application records matched your search or filter parameters. Try adjusting filters above.
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
              <th className="py-3.5 px-4">Candidate</th>
              <th className="py-3.5 px-4">Job & Company</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Applied Date</th>
              <th className="py-3.5 px-4">Last Updated</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {applications.map((app) => {
              const candidate = app.candidate || app.applicant || app.user || {};
              const job = app.job || {};
              const company = app.company || job.company || {};

              const candidateName = candidate.name || `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate Account';
              const jobTitle = job.title || 'Job Opening';
              const companyName = company.companyName || 'Company';

              return (
                <tr
                  key={app._id}
                  className="hover:bg-slate-900/50 transition-colors group text-slate-300"
                >
                  {/* Candidate */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3 min-w-[180px]">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                        {candidateName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-100 truncate">{candidateName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{candidate.email || 'Email Protected'}</p>
                      </div>
                    </div>
                  </td>

                  {/* Job & Company */}
                  <td className="py-3.5 px-4">
                    <div className="min-w-[180px]">
                      <p className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors truncate">
                        {jobTitle}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{companyName}</span>
                      </p>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <Badge variant={getStatusBadgeVariant(app.status)} style="soft" size="sm" className="text-[10px]">
                      {app.status || 'Submitted'}
                    </Badge>
                  </td>

                  {/* Applied Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatFullDate(app.createdAt)}</span>
                    </div>
                  </td>

                  {/* Last Updated */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatFullDate(app.updatedAt)}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onViewDetails(app)}
                      title="View application details"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-800 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="sm:hidden space-y-3">
        {applications.map((app) => {
          const candidate = app.candidate || app.applicant || app.user || {};
          const job = app.job || {};
          const company = app.company || job.company || {};

          const candidateName = candidate.name || `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate Account';
          const jobTitle = job.title || 'Job Opening';
          const companyName = company.companyName || 'Company';

          return (
            <div
              key={app._id}
              className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{candidateName}</h4>
                  <p className="text-[11px] text-slate-400">{candidate.email}</p>
                </div>

                <Badge variant={getStatusBadgeVariant(app.status)} style="soft" size="sm">
                  {app.status || 'Submitted'}
                </Badge>
              </div>

              <div className="pt-2 border-t border-slate-800/60 text-xs space-y-1">
                <p className="font-semibold text-slate-200">{jobTitle}</p>
                <p className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-500" />
                  <span>{companyName}</span>
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                <span>Applied: {formatFullDate(app.createdAt)}</span>
                <button
                  type="button"
                  onClick={() => onViewDetails(app)}
                  className="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-300 text-xs font-medium border border-indigo-500/20 cursor-pointer"
                >
                  View Record
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminApplicationTable;
