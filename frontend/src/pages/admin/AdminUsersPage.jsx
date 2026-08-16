import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/admin/StatCard.jsx';
import { UserTable } from '../../components/admin/UserTable.jsx';
import { UserFilters } from '../../components/admin/UserFilters.jsx';
import { UserPagination } from '../../components/admin/UserPagination.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { parseApiError } from '../../utils/helpers.js';
import { Users, UserCheck, ShieldAlert, RefreshCw, AlertCircle } from 'lucide-react';

/**
 * AdminUsersPage Component (F10.4)
 * Professional candidate & user account management interface at /admin/users.
 * Features:
 * - Real backend paginated user listing with search, role/status filtering, and sorting
 * - User activation/deactivation toggles
 * - User role modifications
 * - User account deletion with confirmation dialog
 * - URL parameter synchronization (useSearchParams)
 * - Error states & responsive card fallback
 */
export const AdminUsersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract filters from URL query string
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || '';
  const status = searchParams.get('status') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt:desc';

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Helper to update URL search params
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

  // Fetch users list from backend
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setActionError(null);

    const [sortField, sortOrderStr] = sortBy.split(':');
    const sortOrder = sortOrderStr === 'asc' ? '1' : '-1';

    try {
      const res = await adminService.listUsers({
        page,
        limit: 10,
        search: search.trim() || undefined,
        role: role || undefined,
        status: status || undefined,
        sortBy: sortField || 'createdAt',
        sortOrder,
      });

      if (res?.success && res?.data) {
        setUsers(res.data.users || []);
        setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('[AdminUsersPage] Error listing users:', err);
      setError("Couldn't load user registry.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, role, status, sortBy]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Action: Toggle user status (Active / Deactivated)
  const handleStatusToggle = async (userId, newIsActive) => {
    setActionError(null);
    try {
      await adminService.updateUserStatus(userId, { isActive: newIsActive });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: newIsActive } : u))
      );
    } catch (err) {
      console.error('Failed to update user status:', err);
      setActionError(parseApiError(err));
      fetchUsers();
    }
  };

  // Action: Change user role
  const handleRoleChange = async (userId, newRole) => {
    setActionError(null);
    try {
      await adminService.updateUserRole(userId, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error('Failed to update user role:', err);
      setActionError(parseApiError(err));
      fetchUsers();
    }
  };

  // Action: Delete user account
  const handleDeleteUser = async (userId) => {
    setActionError(null);
    try {
      await adminService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    } catch (err) {
      console.error('Failed to delete user:', err);
      setActionError(parseApiError(err));
      fetchUsers();
    }
  };

  // Filter change handlers
  const handleSearchChange = (newSearch) => {
    updateQueryParams({ search: newSearch, page: 1 });
  };

  const handleRoleChangeFilter = (newRole) => {
    updateQueryParams({ role: newRole, page: 1 });
  };

  const handleStatusChangeFilter = (newStatus) => {
    updateQueryParams({ status: newStatus, page: 1 });
  };

  const handleSortChangeFilter = (newSortBy) => {
    updateQueryParams({ sortBy: newSortBy, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    updateQueryParams({ page: newPage });
  };

  // Summary counts from current page list
  const activeCount = users.filter((u) => u.isActive).length;
  const studentCount = users.filter((u) => String(u.role).toLowerCase() === 'student' || String(u.role).toLowerCase() === 'candidate').length;
  const recruiterCount = users.filter((u) => String(u.role).toLowerCase() === 'recruiter').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="User & Candidate Management"
        description="View registered accounts, modify administrative authorization roles, toggle activations, and audit user registries."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            className="border-slate-800 hover:border-slate-700 text-slate-300"
          >
            Refresh Registry
          </Button>
        }
      />

      {/* Quick Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total User Accounts"
          value={pagination.total ?? users.length}
          subtitle="Registered in database"
          icon={<Users className="w-5 h-5" />}
          variant="primary"
          isLoading={isLoading}
        />
        <StatCard
          title="Active Users"
          value={activeCount}
          subtitle="Currently active"
          icon={<UserCheck className="w-5 h-5" />}
          variant="success"
          isLoading={isLoading}
        />
        <StatCard
          title="Students & Candidates"
          value={studentCount}
          subtitle="Candidate accounts"
          icon={<Users className="w-5 h-5" />}
          variant="primary"
          isLoading={isLoading}
        />
        <StatCard
          title="Recruiters & Admins"
          value={recruiterCount}
          subtitle="Employer / Staff accounts"
          icon={<ShieldAlert className="w-5 h-5" />}
          variant="warning"
          isLoading={isLoading}
        />
      </div>

      {/* Filter Toolbar */}
      <UserFilters
        search={search}
        onSearchChange={handleSearchChange}
        role={role}
        onRoleChange={handleRoleChangeFilter}
        status={status}
        onStatusChange={handleStatusChangeFilter}
        sortBy={sortBy}
        onSortChange={handleSortChangeFilter}
        onReset={handleResetFilters}
      />

      {/* Action Error Banner */}
      {actionError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <p className="flex-1">{actionError}</p>
          <Button variant="ghost" size="sm" onClick={fetchUsers} className="text-xs text-rose-300 hover:underline">
            Retry
          </Button>
        </div>
      )}

      {/* Error State Handler */}
      {error ? (
        <ErrorState
          title="Couldn't load user registry."
          message="An error occurred while querying candidate and recruiter accounts. Please check your connection and try again."
          onRetry={fetchUsers}
          className="my-6"
        />
      ) : (
        <>
          {/* User Table Component */}
          <UserTable
            users={users}
            isLoading={isLoading}
            onStatusToggle={handleStatusToggle}
            onRoleChange={handleRoleChange}
            onDeleteUser={handleDeleteUser}
          />

          {/* User Pagination Bar */}
          <UserPagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default AdminUsersPage;
