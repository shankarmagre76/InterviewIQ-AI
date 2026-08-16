import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/admin/StatCard.jsx';
import { AdminApplicationTable } from '../../components/admin/AdminApplicationTable.jsx';
import { ApplicationFilters } from '../../components/admin/ApplicationFilters.jsx';
import { ApplicationDetails } from '../../components/admin/ApplicationDetails.jsx';
import { UserPagination } from '../../components/admin/UserPagination.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { adminService } from '../../services/adminService.js';
import { FileCheck, ShieldCheck, RefreshCw } from 'lucide-react';

/**
 * AdminApplicationsPage Component (F10.8)
 * Read-only administrative monitoring view for platform-wide candidate job applications at /admin/applications.
 * Features:
 * - Application listing with search, status, and company filtering
 * - Platform conversion statistics (Interview Conv. %, Offer Conv. %)
 * - Candidate application details inspection modal
 * - Protected candidate information compliance
 * - URL search parameter synchronization
 * - Loading skeletons & design system ErrorState
 */
export const AdminApplicationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const companyId = searchParams.get('companyId') || '';

  const [applications, setApplications] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Details modal state
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [inspectApp, setInspectApp] = useState(null);

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

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [appsRes, statsRes, compRes] = await Promise.all([
        adminService.listApplications({
          page,
          limit: 10,
          search: search.trim() || undefined,
          status: status || undefined,
          company: companyId || undefined,
        }),
        adminService.getApplicationStatistics().catch(() => null),
        adminService.listCompanies({ limit: 100 }).catch(() => null),
      ]);

      if (appsRes?.success && appsRes?.data) {
        setApplications(appsRes.data.applications || []);
        setPagination(appsRes.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      } else {
        setApplications([]);
      }

      if (statsRes?.success && statsRes?.data) {
        setStatistics(statsRes.data);
      }

      if (compRes?.success && compRes?.data) {
        setCompanies(compRes.data.companies || []);
      }
    } catch (err) {
      console.error('[AdminApplicationsPage] Error fetching applications:', err);
      setError("Couldn't load application records.");
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status, companyId]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleOpenDetails = (app) => {
    setInspectApp(app);
    setIsDetailsOpen(true);
  };

  const handleSearchChange = (val) => {
    updateQueryParams({ search: val, page: 1 });
  };

  const handleStatusFilterChange = (val) => {
    updateQueryParams({ status: val, page: 1 });
  };

  const handleCompanyFilterChange = (val) => {
    updateQueryParams({ companyId: val, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    updateQueryParams({ page: newPage });
  };

  const activeApplications = applications.filter(
    (a) => a.status === 'Submitted' || a.status === 'Under Review' || a.status === 'Shortlisted'
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Application Monitoring & Analytics"
        description="Monitor system-wide candidate job applications, conversion ratios, and recruitment pipelines."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchApplications}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            className="border-slate-800 text-slate-300"
          >
            Refresh Records
          </Button>
        }
      />

      {/* Security Compliance Banner */}
      <div className="p-3.5 rounded-2xl glass-panel border border-emerald-500/20 bg-emerald-950/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-emerald-300 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Read-Only Compliance: Candidate privacy & data safety policies active</span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Backend RBAC Security Enforced
        </span>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Applications"
          value={pagination.total ?? applications.length}
          subtitle="Platform candidate applications"
          icon={<FileCheck className="w-5 h-5" />}
          variant="primary"
          isLoading={isLoading}
        />
        <StatCard
          title="Active Applications"
          value={activeApplications}
          subtitle="Submitted / Under Review"
          icon={<FileCheck className="w-5 h-5" />}
          variant="warning"
          isLoading={isLoading}
        />
        <StatCard
          title="Interview Conv. Rate"
          value={`${statistics?.conversionMetrics?.interviewConversionRatePercent ?? 0}%`}
          subtitle="Submitted → Interviewed ratio"
          icon={<FileCheck className="w-5 h-5" />}
          variant="success"
          isLoading={isLoading}
        />
        <StatCard
          title="Offer Conv. Rate"
          value={`${statistics?.conversionMetrics?.offerConversionRatePercent ?? 0}%`}
          subtitle="Submitted → Offered ratio"
          icon={<FileCheck className="w-5 h-5" />}
          variant="neutral"
          isLoading={isLoading}
        />
      </div>

      {/* Filter Control Toolbar */}
      <ApplicationFilters
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusFilterChange}
        companyId={companyId}
        onCompanyChange={handleCompanyFilterChange}
        companies={companies}
        onReset={handleResetFilters}
      />

      {/* Error State Handler */}
      {error ? (
        <ErrorState
          title="Couldn't load application records."
          message="An error occurred while querying candidate job applications. Please check your connection and try again."
          onRetry={fetchApplications}
          className="my-6"
        />
      ) : (
        <>
          {/* Admin Application Table */}
          <AdminApplicationTable
            applications={applications}
            isLoading={isLoading}
            onViewDetails={handleOpenDetails}
          />

          {/* Pagination Toolbar */}
          <UserPagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Application Details Modal */}
      <ApplicationDetails
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        application={inspectApp}
      />
    </div>
  );
};

export default AdminApplicationsPage;
