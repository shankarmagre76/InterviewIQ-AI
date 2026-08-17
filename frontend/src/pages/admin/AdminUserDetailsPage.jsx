import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { adminService } from '../../services/adminService.js';
import { formatFullDate } from '../../components/notifications/NotificationCard.jsx';
import {
  User,
  Mail,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Trash2,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

/**
 * AdminUserDetailsPage Component (F10.5)
 * Dedicated user details inspection & management view at /admin/users/:id.
 * Displays user identity, authorization roles, account status, and registration metadata.
 * Enables backend-supported mutations (Activate, Deactivate, Change Role, Delete Account).
 */
export const AdminUserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const [selectedRole, setSelectedRole] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch user details from backend GET /api/v1/admin/users/:id
  const fetchUserDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setActionError(null);
    try {
      const res = await adminService.getUserById(id);
      if (res?.success && res?.data) {
        setUser(res.data);
        setSelectedRole(res.data.role || 'Student');
      } else {
        setUser(null);
        setError('User not found or unavailable.');
      }
    } catch (err) {
      console.error('[AdminUserDetailsPage] Error fetching user details:', err);
      const status = err.response?.status;
      if (status === 404) {
        setError('User account not found (404). It may have been deleted.');
      } else if (status === 403) {
        setError('Forbidden (403): You do not have permission to view this user.');
      } else {
        setError("Couldn't load user details. Please check your connection.");
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  // Action: Toggle Account Activation Status (Activate / Deactivate)
  const handleToggleStatus = async () => {
    if (!user || isMutating) return;
    setIsMutating(true);
    setActionError(null);
    setActionSuccess(null);

    const targetIsActive = !user.isActive;
    try {
      const res = await adminService.updateUserStatus(user._id, { isActive: targetIsActive });
      if (res?.success) {
        setActionSuccess(`User account status successfully updated to ${targetIsActive ? 'Active' : 'Deactivated'}.`);
        await fetchUserDetails();
      }
    } catch (err) {
      console.error('Failed to update user status:', err);
      const msg = err.response?.data?.message || 'Failed to update user status.';
      setActionError(msg);
    } finally {
      setIsMutating(false);
    }
  };

  // Action: Modify User Authorization Role
  const handleRoleChangeSubmit = async () => {
    if (!user || isMutating || selectedRole === user.role) return;
    setIsMutating(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await adminService.updateUserRole(user._id, { role: selectedRole });
      if (res?.success) {
        setActionSuccess(`User role successfully changed from '${user.role}' to '${selectedRole}'.`);
        await fetchUserDetails();
      }
    } catch (err) {
      console.error('Failed to update user role:', err);
      const msg = err.response?.data?.message || 'Failed to update user role.';
      setActionError(msg);
    } finally {
      setIsMutating(false);
    }
  };

  // Action: Delete User Account
  const handleConfirmDelete = async () => {
    if (!user || isMutating) return;
    setShowDeleteModal(false);
    setIsMutating(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await adminService.deleteUser(user._id);
      if (res?.success) {
        navigate('/admin/users', { replace: true });
      }
    } catch (err) {
      console.error('Failed to delete user account:', err);
      const msg = err.response?.data?.message || 'Failed to delete user account.';
      setActionError(msg);
      setIsMutating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-800 animate-pulse" />
          <div className="h-6 bg-slate-800 rounded w-1/3 animate-pulse" />
        </div>
        <Card variant="glass" className="p-8 animate-pulse space-y-4">
          <div className="h-4 bg-slate-800 rounded w-1/4" />
          <div className="h-20 bg-slate-800/60 rounded" />
        </Card>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <Link
          to="/admin/users"
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to User Management
        </Link>
        <ErrorState
          title="Couldn't load user details."
          message={error || 'The requested user account was not found.'}
          onRetry={fetchUserDetails}
          className="my-6"
        />
      </div>
    );
  }

  const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User Account';

  return (
    <div className="space-y-6">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/users"
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to User Registry
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchUserDetails}
          disabled={isMutating}
          leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          className="border-slate-800 text-xs text-slate-300"
        >
          Refresh User Data
        </Button>
      </div>

      {/* Page Header */}
      <PageHeader
        title={displayName}
        description={`User Account ID: ${user._id}`}
      />

      {/* Action Notification Banners */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="flex-1">{actionSuccess}</p>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <p className="flex-1">{actionError}</p>
        </div>
      )}

      {/* User Overview Profile Banner */}
      <Card variant="glass" className="p-6">
        <CardContent className="p-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold flex items-center justify-center text-xl shadow-lg shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{displayName}</span>
                <Badge
                  variant={user.isActive ? 'success' : 'neutral'}
                  style="soft"
                  size="sm"
                  className="text-[10px]"
                >
                  {user.isActive ? 'Active' : 'Deactivated'}
                </Badge>
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{user.email}</span>
                {user.isEmailVerified && (
                  <Badge variant="success" style="soft" size="sm" className="text-[9px] py-0 px-1">
                    Verified
                  </Badge>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <Button
              variant={user.isActive ? 'outline' : 'primary'}
              size="sm"
              onClick={handleToggleStatus}
              disabled={isMutating}
              leftIcon={
                isMutating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : user.isActive ? (
                  <UserX className="w-4 h-4 text-amber-400" />
                ) : (
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                )
              }
              className={user.isActive ? 'border-amber-500/30 text-amber-300 hover:bg-amber-500/10' : ''}
            >
              {user.isActive ? 'Deactivate Account' : 'Activate Account'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Basic Information & Timestamps */}
        <Card variant="glass">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <CardTitle className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span>Account Specifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Database ObjectId:</span>
              <span className="font-mono text-slate-200">{user._id}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Authorization Role:</span>
              <Badge variant="primary" style="soft" size="sm" className="text-[10px] uppercase font-bold">
                {user.role || 'Student'}
              </Badge>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Account Status:</span>
              <span className={user.isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 font-semibold'}>
                {user.isActive ? 'Active' : 'Deactivated'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Registration Date:
              </span>
              <span className="text-slate-200">{formatFullDate(user.createdAt)}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> Last Login:
              </span>
              <span className="text-slate-200">{user.lastLogin ? formatFullDate(user.lastLogin) : 'Never'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Role Management Controls */}
        <Card variant="glass">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <CardTitle className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Role Authorization Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <p className="text-slate-400 leading-relaxed">
              Modify the administrative role assigned to this account. Role changes immediately update backend permissions.
            </p>

            <div className="space-y-2">
              <label className="text-slate-300 font-semibold block">Select Authorization Role:</label>
              <div className="flex items-center gap-3">
                <Select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  disabled={isMutating}
                  className="bg-slate-900 border-slate-800 text-xs flex-1"
                >
                  <option value="Student">Student (Candidate Portal)</option>
                  <option value="Candidate">Candidate</option>
                  <option value="Recruiter">Recruiter (Employer Portal)</option>
                  <option value="Admin">Admin (Administrator Control Center)</option>
                </Select>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleRoleChangeSubmit}
                  disabled={isMutating || selectedRole === user.role}
                  leftIcon={isMutating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
                >
                  Update Role
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 3: Destructive Actions Zone */}
      <Card variant="glass" className="border-rose-500/30 bg-rose-950/10 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Danger Zone: Delete User Account</span>
            </h4>
            <p className="text-xs text-slate-400 max-w-xl">
              Permanently remove this user account from the platform database. This action cannot be undone.
            </p>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            disabled={isMutating}
            leftIcon={<Trash2 className="w-4 h-4" />}
            className="shrink-0"
          >
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Delete User Modal Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        title="Delete User Account Permanently"
        message={`Are you sure you want to permanently delete user account "${user.email}" (${user._id})? All associated session records will be removed.`}
        confirmText="Permanently Delete User"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default AdminUserDetailsPage;
