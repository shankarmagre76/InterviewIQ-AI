import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Globe,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { formatFullDate } from '../notifications/NotificationCard.jsx';

/**
 * AdminCompanyTable Component (F10.6)
 * Professional company management table with mobile card fallback.
 *
 * @param {Object} props
 * @param {Array<Object>} props.companies - Array of company documents
 * @param {boolean} [props.isLoading=false] - Loading state flag
 * @param {Function} props.onViewDetails - Callback to inspect company details
 * @param {Function} props.onEdit - Callback to edit company profile
 * @param {Function} props.onStatusChange - Callback to update hiring status
 * @param {Function} props.onDelete - Callback to delete company profile
 */
export const AdminCompanyTable = ({
  companies = [],
  isLoading = false,
  onViewDetails,
  onEdit,
  onStatusChange,
  onDelete,
}) => {
  const [targetDeleteCompany, setTargetDeleteCompany] = useState(null);
  const [actionMap, setActionMap] = useState({});

  const setActionLoading = (id, isUpdating) => {
    setActionMap((prev) => ({ ...prev, [id]: isUpdating }));
  };

  const handleStatusChangeSubmit = async (company, newStatus) => {
    if (!onStatusChange || actionMap[company._id]) return;
    setActionLoading(company._id, true);
    try {
      await onStatusChange(company._id, newStatus);
    } finally {
      setActionLoading(company._id, false);
    }
  };

  const confirmDeleteSubmit = async () => {
    if (!targetDeleteCompany || !onDelete) return;
    const cid = targetDeleteCompany._id;
    setTargetDeleteCompany(null);
    setActionLoading(cid, true);
    try {
      await onDelete(cid);
    } finally {
      setActionLoading(cid, false);
    }
  };

  const getHiringBadgeVariant = (st) => {
    switch (st) {
      case 'Actively Hiring':
        return 'success';
      case 'Hiring Freeze':
        return 'warning';
      case 'Not Hiring':
      case 'Closed':
      default:
        return 'neutral';
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
                <div className="h-4 bg-slate-800 rounded w-40" />
                <div className="h-3 bg-slate-800/60 rounded w-24" />
              </div>
            </div>
            <div className="h-6 bg-slate-800 rounded w-24 hidden sm:block" />
          </div>
        ))}
      </div>
    );
  }

  if (!companies || companies.length === 0) {
    return (
      <div className="p-10 text-center rounded-2xl glass-panel border border-slate-800 my-4 flex flex-col items-center justify-center gap-2">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <Building2 className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-200 mt-2">No Companies Found</h4>
        <p className="text-xs text-slate-400 max-w-sm">
          No company profiles matched your search or filter criteria. Try adjusting filters or create a new company profile.
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
              <th className="py-3.5 px-4">Company Name</th>
              <th className="py-3.5 px-4">Industry</th>
              <th className="py-3.5 px-4">Headquarters</th>
              <th className="py-3.5 px-4">Hiring Status</th>
              <th className="py-3.5 px-4">Created Date</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {companies.map((comp) => {
              const isActionLoading = actionMap[comp._id];

              return (
                <tr
                  key={comp._id}
                  className="hover:bg-slate-900/50 transition-colors group text-slate-300"
                >
                  {/* Company Name & Logo */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3 min-w-[180px]">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0 shadow-sm">
                        {comp.companyLogo ? (
                          <img src={comp.companyLogo} alt={comp.companyName} className="w-full h-full object-contain rounded-xl" />
                        ) : (
                          comp.companyName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-100 truncate">{comp.companyName}</p>
                        {comp.website && (
                          <a
                            href={comp.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 truncate"
                          >
                            <span>{comp.website.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Industry */}
                  <td className="py-3.5 px-4 font-medium text-slate-300">
                    {comp.industry || 'Other'}
                  </td>

                  {/* Headquarters */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{comp.headquarters || 'Location N/A'}</span>
                    </div>
                  </td>

                  {/* Status & Status Selector */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={getHiringBadgeVariant(comp.hiringStatus)} style="soft" size="sm" className="text-[10px]">
                        {comp.hiringStatus || 'Actively Hiring'}
                      </Badge>

                      <select
                        value={comp.hiringStatus || 'Actively Hiring'}
                        onChange={(e) => handleStatusChangeSubmit(comp, e.target.value)}
                        disabled={isActionLoading}
                        className="bg-slate-900 border border-slate-800 text-[10px] text-slate-300 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                      >
                        <option value="Actively Hiring">Actively Hiring</option>
                        <option value="Hiring Freeze">Hiring Freeze</option>
                        <option value="Not Hiring">Not Hiring</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </td>

                  {/* Created Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatFullDate(comp.createdAt)}</span>
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {isActionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => onViewDetails(comp)}
                            title="View details"
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-800 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onEdit(comp)}
                            title="Edit company profile"
                            className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setTargetDeleteCompany(comp)}
                            title="Delete company profile"
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
        {companies.map((comp) => {
          const isActionLoading = actionMap[comp._id];

          return (
            <div
              key={comp._id}
              className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
                    {comp.companyName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{comp.companyName}</h4>
                    <p className="text-[11px] text-slate-400">{comp.industry || 'Other'}</p>
                  </div>
                </div>

                <Badge variant={getHiringBadgeVariant(comp.hiringStatus)} style="soft" size="sm">
                  {comp.hiringStatus || 'Actively Hiring'}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{comp.headquarters || 'Location N/A'}</span>
                </span>
                <span>{formatFullDate(comp.createdAt)}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                {isActionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onViewDetails(comp)}
                      className="px-2.5 py-1 rounded-xl bg-slate-900 text-slate-300 text-xs font-medium border border-slate-800 cursor-pointer"
                    >
                      Details
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit(comp)}
                      className="px-2.5 py-1 rounded-xl bg-indigo-500/10 text-indigo-300 text-xs font-medium border border-indigo-500/20 cursor-pointer"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetDeleteCompany(comp)}
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
      {targetDeleteCompany && (
        <ConfirmDialog
          isOpen={Boolean(targetDeleteCompany)}
          title="Delete Company Profile"
          message={`Are you sure you want to permanently delete company profile "${targetDeleteCompany.companyName}"?`}
          confirmText="Delete Company"
          cancelText="Cancel"
          variant="danger"
          onConfirm={confirmDeleteSubmit}
          onClose={() => setTargetDeleteCompany(null)}
        />
      )}
    </div>
  );
};

export default AdminCompanyTable;
