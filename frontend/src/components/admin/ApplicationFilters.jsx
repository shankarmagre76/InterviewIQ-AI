import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { Button } from '../ui/Button.jsx';

const APPLICATION_STATUSES = [
  'Submitted',
  'Under Review',
  'Shortlisted',
  'Interview Scheduled',
  'Technical Round',
  'HR Round',
  'Offered',
  'Rejected',
  'Withdrawn',
];

/**
 * ApplicationFilters Component (F10.8)
 * Search and filter controls for Admin Application Monitoring.
 *
 * @param {Object} props
 * @param {string} props.search - Search string
 * @param {Function} props.onSearchChange - Search handler
 * @param {string} props.status - Status filter value
 * @param {Function} props.onStatusChange - Status filter handler
 * @param {string} props.companyId - Company filter value
 * @param {Function} props.onCompanyChange - Company filter handler
 * @param {Array<Object>} [props.companies=[]] - Companies list for filter dropdown
 * @param {Function} props.onReset - Reset filters callback
 */
export const ApplicationFilters = ({
  search = '',
  onSearchChange,
  status = '',
  onStatusChange,
  companyId = '',
  onCompanyChange,
  companies = [],
  onReset,
}) => {
  const hasActiveFilters = Boolean(search || status || companyId);

  return (
    <div className="p-4 rounded-2xl glass-panel border border-slate-800/80 bg-slate-950/80 space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="flex-1 min-w-[240px]">
          <Input
            type="text"
            placeholder="Search candidates, job titles, or candidate emails..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            size="sm"
            className="w-full bg-slate-900 border-slate-800"
          />
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Status Filter */}
          <Select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            size="sm"
            className="bg-slate-900 border-slate-800 text-xs min-w-[150px]"
          >
            <option value="">All Statuses</option>
            {APPLICATION_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </Select>

          {/* Company Filter */}
          <Select
            value={companyId}
            onChange={(e) => onCompanyChange(e.target.value)}
            size="sm"
            className="bg-slate-900 border-slate-800 text-xs min-w-[160px]"
          >
            <option value="">All Companies</option>
            {companies.map((comp) => (
              <option key={comp._id} value={comp._id}>
                {comp.companyName}
              </option>
            ))}
          </Select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              title="Reset all filters"
              className="p-2 text-slate-400 hover:text-slate-100"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationFilters;
