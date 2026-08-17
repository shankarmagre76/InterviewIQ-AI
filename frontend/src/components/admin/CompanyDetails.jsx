import React from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Button } from '../ui/Button.jsx';
import { formatFullDate } from '../notifications/NotificationCard.jsx';
import { Building2, Globe, Mail, MapPin, Calendar, Users, ExternalLink } from 'lucide-react';

/**
 * CompanyDetails Component (F10.6)
 * Modal inspecting full company profile details.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close callback
 * @param {Object|null} props.company - Company document
 * @param {Function} [props.onEdit] - Edit callback trigger
 */
export const CompanyDetails = ({
  isOpen,
  onClose,
  company,
  onEdit,
}) => {
  if (!company) return null;

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Company Profile: ${company.companyName}`}
      size="lg"
    >
      <div className="space-y-6 pt-2 text-xs">
        {/* Banner Header */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 font-bold text-lg shrink-0 shadow-md">
              {company.companyLogo ? (
                <img src={company.companyLogo} alt={company.companyName} className="w-full h-full object-contain rounded-2xl" />
              ) : (
                company.companyName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{company.companyName}</span>
                <Badge variant={getHiringBadgeVariant(company.hiringStatus)} style="soft" size="sm">
                  {company.hiringStatus}
                </Badge>
              </h3>
              <p className="text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{company.headquarters || 'Location N/A'}</span>
              </p>
            </div>
          </div>

          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
            >
              <span>Visit Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <p className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Industry:
            </p>
            <p className="text-slate-200 font-bold">{company.industry || 'Other'}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <p className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" /> Company Size:
            </p>
            <p className="text-slate-200 font-bold">{company.companySize || '1-10'} employees</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <p className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Founded Year:
            </p>
            <p className="text-slate-200 font-bold">{company.foundedYear || 'N/A'}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <p className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" /> Contact Email:
            </p>
            <p className="text-slate-200 font-bold truncate">{company.email || 'N/A'}</p>
          </div>
        </div>

        {/* Full Description */}
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-300">Company Overview & Description:</h4>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-line">
            {company.description || 'No description provided.'}
          </div>
        </div>

        {/* Registration Timestamp */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-slate-500">
          <span>Registered: {formatFullDate(company.createdAt)}</span>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(company);
              }}
            >
              Edit Profile
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CompanyDetails;
