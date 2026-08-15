import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  SlidersHorizontal,
  X,
  ArrowUpDown,
} from 'lucide-react';

import { PageHeader } from '../../components/common/PageHeader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { JobList } from '../../components/jobs/JobList';
import { JobFilters } from '../../components/jobs/JobFilters';
import { useJobs } from '../../hooks/useJobs';

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Postings' },
  { value: 'oldest', label: 'Oldest Postings' },
  { value: 'highest_salary', label: 'Highest Salary' },
  { value: 'lowest_salary', label: 'Lowest Salary' },
];

export const JobsPage = () => {
  const {
    jobs,
    savedJobIds,
    loading,
    error,
    filters,
    pagination,
    toggleSaveJob,
    handleSearch,
    handleFilterChange,
    handleSortChange,
    handleClearFilters,
    handlePageChange,
    refetch,
  } = useJobs(9);

  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Sync search input state when URL filter changes
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    handleSearch('');
  };

  // Determine active filter badges for quick removal
  const activeBadges = [];
  if (filters.search) activeBadges.push({ key: 'search', label: `Search: "${filters.search}"` });
  if (filters.location) activeBadges.push({ key: 'location', label: `Location: ${filters.location}` });
  if (filters.workMode) activeBadges.push({ key: 'workMode', label: `Mode: ${filters.workMode}` });
  if (filters.employmentType) activeBadges.push({ key: 'employmentType', label: `Type: ${filters.employmentType}` });
  if (filters.skills) activeBadges.push({ key: 'skills', label: `Skills: ${filters.skills}` });
  if (filters.minExp) activeBadges.push({ key: 'minExp', label: `Min Exp: ${filters.minExp} yrs` });
  if (filters.maxExp) activeBadges.push({ key: 'maxExp', label: `Max Exp: ${filters.maxExp} yrs` });
  if (filters.minSalary) activeBadges.push({ key: 'minSalary', label: `Min Salary: $${filters.minSalary}` });

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* 1. Page Header */}
      <PageHeader
        title="Jobs Marketplace"
        description="Find your next career opportunity matched with your skills, experience, and target roles."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        }
      />

      {/* 2. Top Search Bar & Controls */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <form onSubmit={onSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search jobs by title, company, or required skills (e.g. React, Python)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="w-full bg-slate-950/80 border-slate-800 focus:border-indigo-500 text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Search className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Search
            </Button>

            {searchInput && (
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={handleClearSearch}
                className="text-slate-400 hover:text-slate-200"
              >
                Clear
              </Button>
            )}

            {/* Mobile Filter Toggle Button */}
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setMobileDrawerOpen(true)}
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
              className="md:hidden text-indigo-300 border-indigo-500/30"
            >
              Filters
            </Button>
          </div>
        </form>

        {/* Sorting Dropdown & Active Badges Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
          {/* Active Filter Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {activeBadges.length > 0 ? (
              <>
                <span className="text-slate-400 font-semibold">Active:</span>
                {activeBadges.map((badge) => (
                  <button
                    key={badge.key}
                    type="button"
                    onClick={() => handleFilterChange(badge.key, '')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-300 transition-colors cursor-pointer text-[11px]"
                  >
                    <span>{badge.label}</span>
                    <X className="w-3 h-3" />
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-slate-400 hover:text-rose-400 underline font-medium ml-1 cursor-pointer text-[11px]"
                >
                  Reset All
                </button>
              </>
            ) : (
              <span className="text-slate-400 italic">No filters applied. Showing all active job postings.</span>
            )}
          </div>

          {/* Sort Selector Dropdown */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Sort by:</span>
            <select
              value={filters.sort || 'newest'}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 outline-none cursor-pointer font-sans"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Main Content Area (Desktop Sidebar Filter + Job List Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Desktop Sidebar Filter Panel */}
        <Card variant="glass" className="hidden md:block md:col-span-1 border-slate-800 p-5 sticky top-20">
          <JobFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </Card>

        {/* Job Listings Grid */}
        <div className="md:col-span-3">
          <JobList
            jobs={jobs}
            savedJobIds={savedJobIds}
            onSaveToggle={toggleSaveJob}
            loading={loading}
            error={error}
            onRetry={refetch}
            pagination={{
              page: pagination.page,
              totalPages: pagination.totalPages,
              total: pagination.total,
              onPageChange: handlePageChange,
            }}
          />
        </div>
      </div>

      {/* 4. Mobile Filter Modal Drawer */}
      <Modal
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        title="Filter Job Listings"
        size="md"
      >
        <div className="p-2">
          <JobFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
          />

          <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setMobileDrawerOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobsPage;
