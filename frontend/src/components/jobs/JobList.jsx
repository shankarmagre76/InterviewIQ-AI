import React from 'react';
import { Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { JobCard } from './JobCard';
import { JobListSkeleton } from './JobListSkeleton';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { Button } from '../ui/Button';

export const JobList = ({
  jobs = [],
  savedJobIds = new Set(),
  onSaveToggle,
  loading = false,
  error = null,
  onRetry,
  pagination = null,
  className = '',
}) => {
  if (loading && jobs.length === 0) {
    return <JobListSkeleton count={6} className={className} />;
  }

  if (error && jobs.length === 0) {
    return (
      <div className={`py-8 ${className}`.trim()}>
        <ErrorState
          title="Unable to Load Job Listings"
          message={error}
          onRetry={onRetry}
        />
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className={`py-8 ${className}`.trim()}>
        <EmptyState
          icon={Briefcase}
          title="No Job Listings Found"
          description="No job postings match your current search query or filter options. Try clearing filters or searching for different keywords."
        />
      </div>
    );
  }

  const savedSet = savedJobIds instanceof Set ? savedJobIds : new Set(savedJobIds || []);

  return (
    <div className={`space-y-8 ${className}`.trim()}>
      {/* Job Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => {
          const isSaved = savedSet.has(String(job._id));
          return (
            <JobCard
              key={job._id}
              job={job}
              isSaved={isSaved}
              onSaveToggle={onSaveToggle}
            />
          );
        })}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-800/80">
          <span className="text-xs font-mono text-slate-400">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total jobs)
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

export default JobList;
