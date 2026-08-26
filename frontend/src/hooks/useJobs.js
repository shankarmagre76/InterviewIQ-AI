import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { parseApiError } from '../utils/helpers';
import { useToast } from './useToast';

/**
 * Custom React Hook for Managing Job Search, Filtering, Sorting, URL Query Sync & Bookmark Interactivity
 */
export const useJobs = (defaultLimit = 9) => {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract filter parameters directly from URL search parameters
  const currentFilters = useMemo(() => {
    return {
      search: searchParams.get('search') || searchParams.get('keyword') || '',
      location: searchParams.get('location') || '',
      workMode: searchParams.get('workMode') || '',
      employmentType: searchParams.get('employmentType') || '',
      skills: searchParams.get('skills') || '',
      minExp: searchParams.get('minExp') || '',
      maxExp: searchParams.get('maxExp') || '',
      minSalary: searchParams.get('minSalary') || '',
      sort: searchParams.get('sort') || 'newest',
      page: parseInt(searchParams.get('page') || '1', 10),
    };
  }, [searchParams]);

  const [pagination, setPagination] = useState({
    page: currentFilters.page,
    limit: defaultLimit,
    total: 0,
    totalPages: 1,
  });

  /**
   * Main API fetcher based on current URL query filters
   */
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        limit: defaultLimit,
        page: currentFilters.page,
        sort: currentFilters.sort,
      };

      if (currentFilters.search) queryParams.search = currentFilters.search;
      if (currentFilters.location) queryParams.location = currentFilters.location;
      if (currentFilters.workMode) queryParams.workMode = currentFilters.workMode;
      if (currentFilters.employmentType) queryParams.employmentType = currentFilters.employmentType;
      if (currentFilters.skills) queryParams.skills = currentFilters.skills;
      if (currentFilters.minExp) queryParams.minExp = currentFilters.minExp;
      if (currentFilters.maxExp) queryParams.maxExp = currentFilters.maxExp;
      if (currentFilters.minSalary) queryParams.minSalary = currentFilters.minSalary;

      const response = await jobService.searchJobs(queryParams);
      const jobsList = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      setJobs(jobsList);
      setPagination({
        page: response.pagination?.page || currentFilters.page,
        limit: defaultLimit,
        total: response.pagination?.total || jobsList.length,
        totalPages: response.pagination?.totalPages || 1,
      });
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [currentFilters, defaultLimit]);

  /**
   * Fetch candidate's saved job IDs
   */
  const fetchSavedJobs = useCallback(async () => {
    try {
      const res = await jobService.getSavedJobs();
      const list = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      const ids = new Set(list.map((item) => String(item.job?._id || item.job || item._id)));
      setSavedJobIds(ids);
    } catch {
      // Non-critical if user is unauthenticated
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
  }, [fetchJobs, fetchSavedJobs]);

  /**
   * Update URL Query Parameters helper
   */
  const updateQueryParams = (newParams) => {
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim() !== '') {
          updated.set(key, String(value));
        } else {
          updated.delete(key);
        }
      });
      return updated;
    });
  };

  /**
   * Handle Search Keyword submit/update
   */
  const handleSearch = (query) => {
    updateQueryParams({ search: query, page: 1 });
  };

  /**
   * Handle individual filter updates
   */
  const handleFilterChange = (key, value) => {
    updateQueryParams({ [key]: value, page: 1 });
  };

  /**
   * Handle sorting change
   */
  const handleSortChange = (newSort) => {
    updateQueryParams({ sort: newSort, page: 1 });
  };

  /**
   * Handle clear all active filters
   */
  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  /**
   * Handle Page Change
   */
  const handlePageChange = (newPage) => {
    updateQueryParams({ page: newPage });
  };

  /**
   * Toggle Save / Unsave bookmark
   */
  const toggleSaveJob = async (jobId) => {
    const isCurrentlySaved = savedJobIds.has(String(jobId));
    try {
      if (isCurrentlySaved) {
        await jobService.unsaveJob(jobId);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(String(jobId));
          return next;
        });
        toast.success('Job removed from saved bookmarks.');
      } else {
        await jobService.saveJob(jobId);
        setSavedJobIds((prev) => new Set(prev).add(String(jobId)));
        toast.success('Job saved to your bookmarks!');
      }
    } catch (err) {
      toast.error(parseApiError(err));
    }
  };

  return {
    jobs,
    savedJobIds,
    loading,
    error,
    filters: currentFilters,
    pagination,
    toggleSaveJob,
    handleSearch,
    handleFilterChange,
    handleSortChange,
    handleClearFilters,
    handlePageChange,
    refetch: fetchJobs,
  };
};

export default useJobs;
