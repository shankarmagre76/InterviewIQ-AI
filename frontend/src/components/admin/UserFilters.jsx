import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { Button } from '../ui/Button.jsx';

/**
 * UserFilters Component (F10.4)
 * Search, filter, and sorting toolbar for Admin User Management.
 *
 * @param {Object} props
 * @param {string} props.search - Search string
 * @param {Function} props.onSearchChange - Search handler
 * @param {string} props.role - Role filter value
 * @param {Function} props.onRoleChange - Role filter handler
 * @param {string} props.status - Status filter value
 * @param {Function} props.onStatusChange - Status filter handler
 * @param {string} props.sortBy - Sort parameter
 * @param {Function} props.onSortChange - Sort handler
 * @param {Function} props.onReset - Reset filters callback
 */
export const UserFilters = ({
  search = '',
  onSearchChange,
  role = '',
  onRoleChange,
  status = '',
  onStatusChange,
  sortBy = 'createdAt:desc',
  onSortChange,
  onReset,
}) => {
  const hasActiveFilters = Boolean(search || role || status || sortBy !== 'createdAt:desc');

  return (
    <div className="p-4 rounded-2xl glass-panel border border-slate-800/80 bg-slate-950/80 space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="flex-1 min-w-[240px]">
          <Input
            type="text"
            placeholder="Search by name or email address..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            size="sm"
            className="w-full bg-slate-900 border-slate-800 focus:border-indigo-500"
          />
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Role Filter */}
          <Select
            value={role}
            onChange={(e) => onRoleChange(e.target.value)}
            size="sm"
            className="bg-slate-900 border-slate-800 text-xs min-w-[130px]"
          >
            <option value="">All Roles</option>
            <option value="Student">Student</option>
            <option value="Candidate">Candidate</option>
            <option value="Recruiter">Recruiter</option>
            <option value="Admin">Admin</option>
          </Select>

          {/* Status Filter */}
          <Select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            size="sm"
            className="bg-slate-900 border-slate-800 text-xs min-w-[130px]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="deactivated">Deactivated</option>
          </Select>

          {/* Sort By Dropdown */}
          <Select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            size="sm"
            className="bg-slate-900 border-slate-800 text-xs min-w-[150px]"
          >
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
            <option value="email:asc">Email (A-Z)</option>
            <option value="firstName:asc">Name (A-Z)</option>
          </Select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              title="Reset all filters"
              className="p-2 text-slate-400 hover:text-slate-100 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserFilters;
