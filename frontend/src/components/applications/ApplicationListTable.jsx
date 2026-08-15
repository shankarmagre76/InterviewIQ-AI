import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  XCircle,
} from 'lucide-react';

import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'Offered':
      return { variant: 'success', label: 'Offered' };
    case 'Interview Scheduled':
    case 'Technical Round':
    case 'HR Round':
      return { variant: 'info', label: status };
    case 'Under Review':
      return { variant: 'primary', label: 'Under Review' };
    case 'Applied':
      return { variant: 'neutral', label: 'Applied' };
    case 'Rejected':
      return { variant: 'danger', label: 'Rejected' };
    case 'Withdrawn':
      return { variant: 'secondary', label: 'Withdrawn' };
    default:
      return { variant: 'neutral', label: status || 'Applied' };
  }
};

export const ApplicationListTable = ({
  applications = [],
  onViewDetails,
  onWithdraw,
  pagination = null,
  className = '',
}) => {
  const navigate = useNavigate();

  if (!applications || applications.length === 0) return null;

  return (
    <div className={`space-y-4 ${className}`.trim()}>
      {/* 1. Desktop & Tablet Responsive Table */}
      <div className="hidden md:block overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-4 px-5">Company</th>
              <th className="py-4 px-5">Job Title</th>
              <th className="py-4 px-5">Applied Date</th>
              <th className="py-4 px-5">Status</th>
              <th className="py-4 px-5">Last Updated</th>
              <th className="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {applications.map((app) => {
              const companyName = app.company?.companyName || app.companyName || 'Company';
              const companyLogo = app.company?.logoUrl || null;
              const jobTitle = app.job?.title || app.jobTitle || 'Job Position';
              const jobId = app.job?._id || app.job;
              const statusInfo = getStatusBadgeVariant(app.status);

              const appliedDate = app.appliedAt || app.createdAt;
              const updatedDate = app.updatedAt || app.appliedAt;

              const canWithdraw = app.status === 'Applied' || app.status === 'Under Review';

              return (
                <tr
                  key={app._id}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => onViewDetails && onViewDetails(app)}
                >
                  {/* Company */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      {companyLogo ? (
                        <img
                          src={companyLogo}
                          alt={companyName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-800 bg-slate-900 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-slate-200 block group-hover:text-indigo-300 transition-colors">
                          {companyName}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          {app.company?.industry || 'Technology'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Job Title */}
                  <td className="py-4 px-5">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-100 block">{jobTitle}</span>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        {app.job?.location || 'Remote'} • {app.job?.workMode || 'Full-time'}
                      </span>
                    </div>
                  </td>

                  {/* Applied Date */}
                  <td className="py-4 px-5 text-slate-300 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {appliedDate
                          ? new Date(appliedDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-5">
                    <Badge variant={statusInfo.variant} style="soft" size="sm">
                      {statusInfo.label}
                    </Badge>
                  </td>

                  {/* Last Updated */}
                  <td className="py-4 px-5 text-slate-400 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {updatedDate
                          ? new Date(updatedDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => onViewDetails && onViewDetails(app)}
                        leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-400" />}
                      >
                        View
                      </Button>

                      {jobId && (
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => navigate(`/jobs/${jobId}`)}
                          leftIcon={<ExternalLink className="w-3.5 h-3.5 text-slate-400" />}
                        >
                          Job
                        </Button>
                      )}

                      {canWithdraw && onWithdraw && (
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => onWithdraw(app._id)}
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                          leftIcon={<XCircle className="w-3.5 h-3.5" />}
                        >
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Cards Layout */}
      <div className="md:hidden space-y-4">
        {applications.map((app) => {
          const companyName = app.company?.companyName || app.companyName || 'Company';
          const companyLogo = app.company?.logoUrl || null;
          const jobTitle = app.job?.title || app.jobTitle || 'Job Position';
          const jobId = app.job?._id || app.job;
          const statusInfo = getStatusBadgeVariant(app.status);

          const appliedDate = app.appliedAt || app.createdAt;
          const canWithdraw = app.status === 'Applied' || app.status === 'Under Review';

          return (
            <div
              key={app._id}
              onClick={() => onViewDetails && onViewDetails(app)}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-md cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {companyLogo ? (
                    <img
                      src={companyLogo}
                      alt={companyName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-800 bg-slate-900 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block">
                      {companyName}
                    </span>
                    <h4 className="font-bold text-slate-100 text-sm">{jobTitle}</h4>
                  </div>
                </div>

                <Badge variant={statusInfo.variant} style="soft" size="xs">
                  {statusInfo.label}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Applied {appliedDate ? new Date(appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                </span>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => onViewDetails && onViewDetails(app)}
                    leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-400" />}
                  >
                    Details
                  </Button>

                  {canWithdraw && onWithdraw && (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => onWithdraw(app._id)}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Pagination Bar */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs">
          <span className="font-mono text-slate-400">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total applications)
          </span>

          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              onClick={() => pagination.onPageChange && pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            <Button
              size="xs"
              variant="outline"
              onClick={() => pagination.onPageChange && pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationListTable;
