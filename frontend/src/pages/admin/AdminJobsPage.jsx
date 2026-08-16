import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/admin/StatCard.jsx';
import { AdminJobTable } from '../../components/admin/AdminJobTable.jsx';
import { JobForm } from '../../components/admin/JobForm.jsx';
import { UserPagination } from '../../components/admin/UserPagination.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { adminService } from '../../services/adminService.js';
import { Briefcase, Plus, Search, RefreshCw, AlertCircle, RotateCcw } from 'lucide-react';

const WORK_MODES = ['Remote', 'On-site', 'Hybrid'];
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
const JOB_STATUSES = ['Active', 'Draft', 'Paused', 'Closed', 'Expired'];

/**
 * AdminJobsPage Component (F10.7)
 * Admin Job Management page at /admin/jobs.
 * Features:
 * - Real backend paginated job listing with search, status, workMode, and employmentType filters
 * - Post new job & edit existing job modal (JobForm)
 * - Quick status modification (Active, Draft, Paused, Closed)
 * - Delete job posting with safety confirmation modal
 * - URL parameter synchronization (useSearchParams)
 * - Loading skeletons & design system ErrorState
 */
export const AdminJobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const workMode = searchParams.get('workMode') || '';
  const employmentType = searchParams.get('employmentType') || '';

  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const updateQueryParams = (newParams) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === undefined || val === null || val === '') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(val));
      }
    });
    setSearchParams(nextParams);
  };

  // Fetch jobs list
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setActionError(null);

    try {
      const [jobsRes, companiesRes] = await Promise.all([
        adminService.listJobs({
          page,
          limit: 10,
          search: search.trim() || undefined,
          status: status || undefined,
          workMode: workMode || undefined,
          employmentType: employmentType || undefined,
        }),
        adminService.listCompanies({ limit: 100 }).catch(() => null),
      ]);

      if (jobsRes?.success && jobsRes?.data) {
        setJobs(jobsRes.data.jobs || []);
        setPagination(jobsRes.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      } else {
        setJobs([]);
      }

      if (companiesRes?.success && companiesRes?.data) {
        setCompanies(companiesRes.data.companies || []);
      }
    } catch (err) {
      console.error('[AdminJobsPage] Error fetching jobs:', err);
      setError("Couldn't load job postings.");
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status, workMode, employmentType]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Actions
  const handleFormSubmit = async (formData) => {
    setActionError(null);
    try {
      if (editingJob) {
        await adminService.updateJob(editingJob._id, formData);
      } else {
        await adminService.createJob(formData);
      }
      fetchJobs();
    } catch (err) {
      console.error('Failed to submit job posting:', err);
      const msg = err.response?.data?.message || 'Failed to save job posting.';
      setActionError(msg);
      throw err;
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    setActionError(null);
    try {
      await adminService.updateJobStatus(jobId, { status: newStatus });
      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j))
      );
    } catch (err) {
      console.error('Failed to update job status:', err);
      setActionError('Failed to update job status.');
      fetchJobs();
    }
  };

  const handleDeleteJob = async (jobId) => {
    setActionError(null);
    try {
      await adminService.deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    } catch (err) {
      console.error('Failed to delete job posting:', err);
      const msg = err.response?.data?.message || 'Failed to delete job posting.';
      setActionError(msg);
      fetchJobs();
    }
  };

  const handleOpenCreate = () => {
    setEditingJob(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setIsFormOpen(true);
  };

  const handleSearchChange = (val) => {
    updateQueryParams({ search: val, page: 1 });
  };

  const handleStatusFilterChange = (val) => {
    updateQueryParams({ status: val, page: 1 });
  };

  const handleWorkModeFilterChange = (val) => {
    updateQueryParams({ workMode: val, page: 1 });
  };

  const handleEmploymentTypeFilterChange = (val) => {
    updateQueryParams({ employmentType: val, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    updateQueryParams({ page: newPage });
  };

  const activeCount = jobs.filter((j) => j.status === 'Active').length;
  const draftCount = jobs.filter((j) => j.status === 'Draft').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Job Openings & Postings Management"
        description="Create, review, publish, pause, and moderate platform job opportunities across hiring companies."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchJobs}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
              className="border-slate-800 text-slate-300"
            >
              Refresh Jobs
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Post New Job
            </Button>
          </div>
        }
      />

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Job Openings"
          value={pagination.total ?? jobs.length}
          subtitle="Platform job database"
          icon={<Briefcase className="w-5 h-5" />}
          variant="primary"
          isLoading={isLoading}
        />
        <StatCard
          title="Active Postings"
          value={activeCount}
          subtitle="Currently accepting applications"
          icon={<Briefcase className="w-5 h-5" />}
          variant="success"
          isLoading={isLoading}
        />
        <StatCard
          title="Draft Openings"
          value={draftCount}
          subtitle="Pending publication"
          icon={<Briefcase className="w-5 h-5" />}
          variant="warning"
          isLoading={isLoading}
        />
        <StatCard
          title="Employer Companies"
          value={companies.length}
          subtitle="Companies with profile records"
          icon={<Briefcase className="w-5 h-5" />}
          variant="neutral"
          isLoading={isLoading}
        />
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800/80 bg-slate-950/80 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1 min-w-[240px]">
            <Input
              type="text"
              placeholder="Search jobs by title, skills, or location..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              size="sm"
              className="w-full bg-slate-900 border-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <Select
              value={status}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              size="sm"
              className="bg-slate-900 border-slate-800 text-xs min-w-[130px]"
            >
              <option value="">All Statuses</option>
              {JOB_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </Select>

            <Select
              value={workMode}
              onChange={(e) => handleWorkModeFilterChange(e.target.value)}
              size="sm"
              className="bg-slate-900 border-slate-800 text-xs min-w-[130px]"
            >
              <option value="">All Work Modes</option>
              {WORK_MODES.map((wm) => (
                <option key={wm} value={wm}>
                  {wm}
                </option>
              ))}
            </Select>

            <Select
              value={employmentType}
              onChange={(e) => handleEmploymentTypeFilterChange(e.target.value)}
              size="sm"
              className="bg-slate-900 border-slate-800 text-xs min-w-[140px]"
            >
              <option value="">All Types</option>
              {EMPLOYMENT_TYPES.map((et) => (
                <option key={et} value={et}>
                  {et}
                </option>
              ))}
            </Select>

            {(search || status || workMode || employmentType) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                title="Reset filters"
                className="p-2 text-slate-400 hover:text-slate-100"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <p className="flex-1">{actionError}</p>
          <Button variant="ghost" size="sm" onClick={fetchJobs} className="text-xs text-rose-300 hover:underline">
            Retry
          </Button>
        </div>
      )}

      {/* Error State Handler */}
      {error ? (
        <ErrorState
          title="Couldn't load job postings."
          message="An error occurred while querying job postings. Please check your connection and try again."
          onRetry={fetchJobs}
          className="my-6"
        />
      ) : (
        <>
          {/* Admin Job Table */}
          <AdminJobTable
            jobs={jobs}
            isLoading={isLoading}
            onEdit={handleOpenEdit}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteJob}
          />

          {/* Pagination Toolbar */}
          <UserPagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Job Create / Edit Form Modal */}
      <JobForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        job={editingJob}
        companies={companies}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default AdminJobsPage;
