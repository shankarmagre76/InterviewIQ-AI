import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/admin/StatCard.jsx';
import { AdminCompanyTable } from '../../components/admin/AdminCompanyTable.jsx';
import { CompanyForm } from '../../components/admin/CompanyForm.jsx';
import { CompanyDetails } from '../../components/admin/CompanyDetails.jsx';
import { UserPagination } from '../../components/admin/UserPagination.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { adminService } from '../../services/adminService.js';
import { Building2, Plus, Search, RefreshCw, AlertCircle, RotateCcw } from 'lucide-react';

const INDUSTRIES = [
  'Information Technology',
  'Software Development',
  'Finance',
  'Healthcare',
  'E-commerce',
  'EdTech',
  'AI/ML',
  'Cybersecurity',
  'Fintech',
  'Telecommunications',
  'Other',
];

const HIRING_STATUSES = ['Actively Hiring', 'Hiring Freeze', 'Not Hiring', 'Closed'];

/**
 * AdminCompaniesPage Component (F10.6)
 * Admin Company Management page at /admin/companies.
 * Features:
 * - Search, industry, and hiring status filters with URL parameter synchronization
 * - Create, Edit, View Details, Update Hiring Status, and Delete company operations
 * - Responsive table layout with mobile card fallback
 * - Loading state, empty state, and error handling
 */
export const AdminCompaniesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const industry = searchParams.get('industry') || '';
  const hiringStatus = searchParams.get('hiringStatus') || '';

  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [inspectCompany, setInspectCompany] = useState(null);

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

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setActionError(null);

    try {
      const res = await adminService.listCompanies({
        page,
        limit: 10,
        search: search.trim() || undefined,
        industry: industry || undefined,
        hiringStatus: hiringStatus || undefined,
      });

      if (res?.success && res?.data) {
        setCompanies(res.data.companies || []);
        setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      } else {
        setCompanies([]);
      }
    } catch (err) {
      console.error('[AdminCompaniesPage] Error fetching companies:', err);
      setError("Couldn't load company directory.");
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, industry, hiringStatus]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Actions
  const handleCreateSubmit = async (formData) => {
    setActionError(null);
    try {
      if (editingCompany) {
        await adminService.updateCompany(editingCompany._id, formData);
      } else {
        await adminService.createCompany(formData);
      }
      fetchCompanies();
    } catch (err) {
      console.error('Failed to submit company:', err);
      const msg = err.response?.data?.message || 'Failed to save company profile.';
      setActionError(msg);
      throw err;
    }
  };

  const handleStatusChange = async (companyId, newStatus) => {
    setActionError(null);
    try {
      await adminService.updateCompanyStatus(companyId, { hiringStatus: newStatus });
      setCompanies((prev) =>
        prev.map((c) => (c._id === companyId ? { ...c, hiringStatus: newStatus } : c))
      );
    } catch (err) {
      console.error('Failed to update company status:', err);
      setActionError('Failed to update company hiring status.');
      fetchCompanies();
    }
  };

  const handleDeleteCompany = async (companyId) => {
    setActionError(null);
    try {
      await adminService.deleteCompany(companyId);
      setCompanies((prev) => prev.filter((c) => c._id !== companyId));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    } catch (err) {
      console.error('Failed to delete company:', err);
      const msg = err.response?.data?.message || 'Failed to delete company profile.';
      setActionError(msg);
      fetchCompanies();
    }
  };

  const handleOpenCreate = () => {
    setEditingCompany(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (comp) => {
    setEditingCompany(comp);
    setIsFormOpen(true);
  };

  const handleOpenDetails = (comp) => {
    setInspectCompany(comp);
    setIsDetailsOpen(true);
  };

  const handleSearchChange = (val) => {
    updateQueryParams({ search: val, page: 1 });
  };

  const handleIndustryChange = (val) => {
    updateQueryParams({ industry: val, page: 1 });
  };

  const handleHiringStatusChange = (val) => {
    updateQueryParams({ hiringStatus: val, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    updateQueryParams({ page: newPage });
  };

  const activelyHiringCount = companies.filter((c) => c.hiringStatus === 'Actively Hiring').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Company & Employer Management"
        description="Create, review, approve, and manage hiring company profiles and employer directory listings."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCompanies}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
              className="border-slate-800 text-slate-300"
            >
              Refresh Directory
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Company
            </Button>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Companies"
          value={pagination.total ?? companies.length}
          subtitle="Registered employer profiles"
          icon={<Building2 className="w-5 h-5" />}
          variant="primary"
          isLoading={isLoading}
        />
        <StatCard
          title="Actively Hiring"
          value={activelyHiringCount}
          subtitle="Companies with active recruitment"
          icon={<Building2 className="w-5 h-5" />}
          variant="success"
          isLoading={isLoading}
        />
        <StatCard
          title="Industries Covered"
          value={INDUSTRIES.length}
          subtitle="Supported business categories"
          icon={<Building2 className="w-5 h-5" />}
          variant="warning"
          isLoading={isLoading}
        />
        <StatCard
          title="Directory Status"
          value="100% Operational"
          subtitle="Backend database connected"
          icon={<Building2 className="w-5 h-5" />}
          variant="neutral"
          isLoading={isLoading}
        />
      </div>

      {/* Filter Control Toolbar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800/80 bg-slate-950/80 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1 min-w-[240px]">
            <Input
              type="text"
              placeholder="Search companies by name or location..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              size="sm"
              className="w-full bg-slate-900 border-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <Select
              value={industry}
              onChange={(e) => handleIndustryChange(e.target.value)}
              size="sm"
              className="bg-slate-900 border-slate-800 text-xs min-w-[150px]"
            >
              <option value="">All Industries</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </Select>

            <Select
              value={hiringStatus}
              onChange={(e) => handleHiringStatusChange(e.target.value)}
              size="sm"
              className="bg-slate-900 border-slate-800 text-xs min-w-[140px]"
            >
              <option value="">All Hiring Statuses</option>
              {HIRING_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </Select>

            {(search || industry || hiringStatus) && (
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
          <Button variant="ghost" size="sm" onClick={fetchCompanies} className="text-xs text-rose-300 hover:underline">
            Retry
          </Button>
        </div>
      )}

      {/* Error State Handler */}
      {error ? (
        <ErrorState
          title="Couldn't load company directory."
          message="An error occurred while querying company profiles. Please check your connection and try again."
          onRetry={fetchCompanies}
          className="my-6"
        />
      ) : (
        <>
          {/* Company Table Component */}
          <AdminCompanyTable
            companies={companies}
            isLoading={isLoading}
            onViewDetails={handleOpenDetails}
            onEdit={handleOpenEdit}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteCompany}
          />

          {/* Pagination Toolbar */}
          <UserPagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Company Create / Edit Form Modal */}
      <CompanyForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        company={editingCompany}
        onSubmit={handleCreateSubmit}
      />

      {/* Company Details Modal */}
      <CompanyDetails
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        company={inspectCompany}
        onEdit={(comp) => handleOpenEdit(comp)}
      />
    </div>
  );
};

export default AdminCompaniesPage;
