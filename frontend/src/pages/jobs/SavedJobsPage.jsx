import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, RefreshCw, Compass } from 'lucide-react';

import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { JobList } from '../../components/jobs/JobList';
import { jobService } from '../../services/jobService';
import { parseApiError } from '../../utils/helpers';
import { useToast } from '../../hooks/useToast';

export const SavedJobsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 1,
  });

  const fetchSavedJobs = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await jobService.getSavedJobs({ page, limit: pagination.limit });
      const items = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      setSavedItems(items);
      setPagination((prev) => ({
        ...prev,
        page: response.pagination?.page || page,
        total: response.pagination?.total || items.length,
        totalPages: response.pagination?.totalPages || 1,
      }));
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchSavedJobs(1);
  }, [fetchSavedJobs]);

  /**
   * Optimistic Unsave toggle with rollback on API error
   */
  const handleSaveToggle = async (jobId) => {
    const previousItems = [...savedItems];

    // Optimistically remove from state
    setSavedItems((prev) =>
      prev.filter((item) => {
        const id = item.job?._id || item.job || item._id;
        return String(id) !== String(jobId);
      })
    );

    try {
      await jobService.unsaveJob(jobId);
      toast.success('Job removed from saved bookmarks.');
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
    } catch (err) {
      // Rollback UI state on failure
      setSavedItems(previousItems);
      toast.error(parseApiError(err));
    }
  };

  const handlePageChange = (newPage) => {
    fetchSavedJobs(newPage);
  };

  // Map savedItems to job objects for JobList component
  const jobsList = savedItems
    .map((item) => (item.job && typeof item.job === 'object' ? item.job : item))
    .filter((j) => Boolean(j && j._id));

  const savedJobIdsSet = new Set(jobsList.map((j) => String(j._id)));

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* 1. Page Header */}
      <PageHeader
        title="Saved Jobs"
        description="Bookmarked job listings saved for future application."
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchSavedJobs(pagination.page)}
              isLoading={loading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/jobs')}
              leftIcon={<Compass className="w-4 h-4" />}
            >
              Explore Jobs
            </Button>
          </div>
        }
      />

      {/* 2. Main Saved Jobs Content */}
      {!loading && !error && jobsList.length === 0 ? (
        <div className="py-12 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center">
          <EmptyState
            icon={<Bookmark className="w-8 h-8 text-indigo-400" />}
            title="No Saved Jobs Yet"
            description="Bookmark target engineering positions to review application deadlines, track salary benchmarks, and submit tailored applications when ready."
            primaryAction={{
              label: 'Explore Open Jobs',
              icon: <Compass className="w-4 h-4" />,
              onClick: () => navigate('/jobs'),
            }}
          />

        </div>
      ) : (
        <JobList
          jobs={jobsList}
          savedJobIds={savedJobIdsSet}
          onSaveToggle={handleSaveToggle}
          loading={loading}
          error={error}
          onRetry={() => fetchSavedJobs(1)}
          pagination={{
            page: pagination.page,
            totalPages: pagination.totalPages,
            total: pagination.total,
            onPageChange: handlePageChange,
          }}
        />
      )}
    </div>
  );
};

export default SavedJobsPage;
