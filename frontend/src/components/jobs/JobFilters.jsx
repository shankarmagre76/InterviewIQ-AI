import React from 'react';
import {
  Filter,
  X,
  RotateCcw,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Code2,
} from 'lucide-react';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const WORK_MODE_OPTIONS = [
  { id: 'Remote', label: 'Remote' },
  { id: 'Hybrid', label: 'Hybrid' },
  { id: 'On-site', label: 'On-site' },
];

export const EMPLOYMENT_TYPE_OPTIONS = [
  { id: 'Full-time', label: 'Full-time' },
  { id: 'Part-time', label: 'Part-time' },
  { id: 'Contract', label: 'Contract' },
  { id: 'Internship', label: 'Internship' },
  { id: 'Freelance', label: 'Freelance' },
];

export const JobFilters = ({
  filters = {},
  onFilterChange,
  onClearFilters,
  onCloseMobileDrawer,
  className = '',
}) => {
  const handleWorkModeToggle = (modeId) => {
    const currentModes = Array.isArray(filters.workMode)
      ? filters.workMode
      : filters.workMode
      ? filters.workMode.split(',').filter(Boolean)
      : [];

    const nextModes = currentModes.includes(modeId)
      ? currentModes.filter((m) => m !== modeId)
      : [...currentModes, modeId];

    onFilterChange('workMode', nextModes.join(','));
  };

  const handleEmploymentTypeToggle = (typeId) => {
    const currentTypes = Array.isArray(filters.employmentType)
      ? filters.employmentType
      : filters.employmentType
      ? filters.employmentType.split(',').filter(Boolean)
      : [];

    const nextTypes = currentTypes.includes(typeId)
      ? currentTypes.filter((t) => t !== typeId)
      : [...currentTypes, typeId];

    onFilterChange('employmentType', nextTypes.join(','));
  };

  const activeWorkModes = Array.isArray(filters.workMode)
    ? filters.workMode
    : (filters.workMode || '').split(',').filter(Boolean);

  const activeEmpTypes = Array.isArray(filters.employmentType)
    ? filters.employmentType
    : (filters.employmentType || '').split(',').filter(Boolean);

  return (
    <div className={`space-y-6 text-xs ${className}`.trim()}>
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-sm text-slate-100">Filter Jobs</h3>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="ghost"
            onClick={onClearFilters}
            leftIcon={<RotateCcw className="w-3 h-3 text-slate-400" />}
            className="text-slate-400 hover:text-rose-400"
          >
            Clear All
          </Button>

          {onCloseMobileDrawer && (
            <button
              type="button"
              onClick={onCloseMobileDrawer}
              className="p-1 rounded-lg text-slate-400 hover:text-white md:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 1. Work Mode Filter */}
      <div className="space-y-2.5">
        <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          Work Mode
        </h4>

        <div className="flex flex-wrap gap-2">
          {WORK_MODE_OPTIONS.map((mode) => {
            const isSelected = activeWorkModes.includes(mode.id);
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleWorkModeToggle(mode.id)}
                className={`
                  px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer text-xs
                  ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }
                `.trim()}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Employment Type Filter */}
      <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
        <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
          Employment Type
        </h4>

        <div className="flex flex-wrap gap-2">
          {EMPLOYMENT_TYPE_OPTIONS.map((emp) => {
            const isSelected = activeEmpTypes.includes(emp.id);
            return (
              <button
                key={emp.id}
                type="button"
                onClick={() => handleEmploymentTypeToggle(emp.id)}
                className={`
                  px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer text-xs
                  ${
                    isSelected
                      ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }
                `.trim()}
              >
                {emp.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Location Filter */}
      <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
        <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          Location
        </h4>

        <Input
          type="text"
          placeholder="e.g. San Francisco, Pune, Remote"
          value={filters.location || ''}
          onChange={(e) => onFilterChange('location', e.target.value)}
          leftIcon={<MapPin className="w-3.5 h-3.5 text-slate-500" />}
          className="bg-slate-950/80 border-slate-800 text-xs"
        />
      </div>

      {/* 4. Required Skills Filter */}
      <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
        <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5 text-amber-400" />
          Required Skills
        </h4>

        <Input
          type="text"
          placeholder="e.g. React, Node.js, Python"
          value={filters.skills || ''}
          onChange={(e) => onFilterChange('skills', e.target.value)}
          leftIcon={<Code2 className="w-3.5 h-3.5 text-slate-500" />}
          className="bg-slate-950/80 border-slate-800 text-xs"
        />
      </div>

      {/* 5. Experience Range Filter */}
      <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
        <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-purple-400" />
          Experience (Years)
        </h4>

        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            min="0"
            max="30"
            placeholder="Min Yrs"
            value={filters.minExp || ''}
            onChange={(e) => onFilterChange('minExp', e.target.value)}
            className="bg-slate-950/80 border-slate-800 text-xs"
          />

          <Input
            type="number"
            min="0"
            max="30"
            placeholder="Max Yrs"
            value={filters.maxExp || ''}
            onChange={(e) => onFilterChange('maxExp', e.target.value)}
            className="bg-slate-950/80 border-slate-800 text-xs"
          />
        </div>
      </div>

      {/* 6. Salary Range Filter */}
      <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
        <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          Minimum Salary ($ / yr)
        </h4>

        <Input
          type="number"
          step="5000"
          placeholder="e.g. 80000"
          value={filters.minSalary || ''}
          onChange={(e) => onFilterChange('minSalary', e.target.value)}
          leftIcon={<DollarSign className="w-3.5 h-3.5 text-slate-500" />}
          className="bg-slate-950/80 border-slate-800 text-xs"
        />
      </div>
    </div>
  );
};

export default JobFilters;
