import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, RefreshCw, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { SkeletonCard } from '../../components/ui/LoadingState';
import { CompanyCard } from '../../components/company/CompanyCard';
import { companyService } from '../../services/companyService';
import { parseApiError } from '../../utils/helpers';

export const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hiringFilter, setHiringFilter] = useState('');

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 1,
  });

  const fetchCompanies = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: pagination.limit,
        ...(searchQuery ? { search: searchQuery.trim() } : {}),
        ...(hiringFilter ? { hiringStatus: hiringFilter } : {}),
      };

      const response = await companyService.listCompanies(params);
      const list = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      setCompanies(list);
      setPagination((prev) => ({
        ...prev,
        page: response.pagination?.page || page,
        total: response.pagination?.total || list.length,
        totalPages: response.pagination?.totalPages || 1,
      }));
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [searchQuery, hiringFilter, pagination.limit]);

  useEffect(() => {
    fetchCompanies(1);
  }, [fetchCompanies]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* 1. Page Header */}
      <PageHeader
        title="Hiring Companies"
        description="Browse partner companies actively hiring engineering and technical candidates."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchCompanies(pagination.page)}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        }
      />

      {/* 2. Search & Filter Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <form onSubmit={onSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search companies by name or industry (e.g. Fintech, Cloud)..."
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
          </div>
        </form>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400 font-medium">Hiring Status:</span>
            <select
              value={hiringFilter}
              onChange={(e) => setHiringFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="">All Companies</option>
              <option value="Actively Hiring">Actively Hiring</option>
              <option value="Not Hiring">Not Hiring</option>
            </select>
          </div>

          {pagination.total > 0 && (
            <span className="font-mono text-indigo-300 text-[11px]">
              Showing {companies.length} of {pagination.total} companies
            </span>
          )}
        </div>
      </div>

      {/* 3. Companies Grid */}
      {loading && companies.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard className="h-56" />
          <SkeletonCard className="h-56" />
          <SkeletonCard className="h-56" />
        </div>
      ) : error && companies.length === 0 ? (
        <div className="py-8">
          <ErrorState
            title="Unable to Load Companies"
            message={error}
            onRetry={() => fetchCompanies(1)}
          />
        </div>
      ) : companies.length === 0 ? (
        <div className="py-12 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center">
          <EmptyState
            icon={Building2}
            title="No companies found"
            description="No company profiles match your current search query or hiring filter."
          />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((comp) => (
              <CompanyCard key={comp._id} company={comp} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-800/80 text-xs">
              <span className="font-mono text-slate-400">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total companies)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => fetchCompanies(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>

                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => fetchCompanies(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;
