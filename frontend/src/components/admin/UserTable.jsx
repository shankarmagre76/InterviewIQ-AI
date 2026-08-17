import React, { useState } from 'react';
import {
  User,
  ShieldAlert,
  UserCheck,
  UserX,
  Trash2,
  Calendar,
  Clock,
  Loader2,
  MoreVertical,
  Check,
} from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { formatFullDate } from '../notifications/NotificationCard.jsx';

/**
 * UserRoleBadge Helper
 */
const UserRoleBadge = ({ role }) => {
  const roleStr = String(role || 'Student');
  const normalized = roleStr.toLowerCase();

  let variant = 'primary';
  if (normalized === 'admin') variant = 'danger';
  if (normalized === 'recruiter') variant = 'warning';

  return (
    <Badge variant={variant} style="soft" size="sm" className="text-[10px] uppercase font-bold">
      {roleStr}
    </Badge>
  );
};

/**
 * UserTable Component (F10.4)
 * Professional responsive user management table with mobile card fallback.
 *
 * @param {Object} props
 * @param {Array<Object>} props.users - Array of user documents
 * @param {boolean} [props.isLoading=false] - Loading state flag
 * @param {Function} props.onStatusToggle - Callback for activating/deactivating user
 * @param {Function} props.onRoleChange - Callback for changing user role
 * @param {Function} props.onDeleteUser - Callback for deleting user account
 */
export const UserTable = ({
  users = [],
  isLoading = false,
  onStatusToggle,
  onRoleChange,
  onDeleteUser,
}) => {
  const [targetDeleteUser, setTargetDeleteUser] = useState(null);
  const [actionUserMap, setActionUserMap] = useState({});

  const setActionLoading = (userId, isUpdating) => {
    setActionUserMap((prev) => ({ ...prev, [userId]: isUpdating }));
  };

  const handleToggleStatus = async (user) => {
    if (!onStatusToggle || actionUserMap[user._id]) return;
    setActionLoading(user._id, true);
    try {
      await onStatusToggle(user._id, !user.isActive);
    } finally {
      setActionLoading(user._id, false);
    }
  };

  const handleChangeRole = async (user, newRole) => {
    if (!onRoleChange || actionUserMap[user._id]) return;
    setActionLoading(user._id, true);
    try {
      await onRoleChange(user._id, newRole);
    } finally {
      setActionLoading(user._id, false);
    }
  };

  const confirmDelete = async () => {
    if (!targetDeleteUser || !onDeleteUser) return;
    const uid = targetDeleteUser._id;
    setTargetDeleteUser(null);
    setActionLoading(uid, true);
    try {
      await onDeleteUser(uid);
    } finally {
      setActionLoading(uid, false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 my-4">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 animate-pulse flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 shrink-0" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-800 rounded w-36" />
                <div className="h-3 bg-slate-800/60 rounded w-48" />
              </div>
            </div>
            <div className="h-6 bg-slate-800 rounded w-20 hidden sm:block" />
          </div>
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="p-10 text-center rounded-2xl glass-panel border border-slate-800 my-4 flex flex-col items-center justify-center gap-2">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <User className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-200 mt-2">No Registered Users Found</h4>
        <p className="text-xs text-slate-400 max-w-sm">
          No user accounts matched your search or filter parameters. Try adjusting filters above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 my-4">
      {/* Desktop Table View (Hidden on mobile < sm) */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl glass-panel border border-slate-800 shadow-xl custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Registered Date</th>
              <th className="py-3.5 px-4">Last Activity</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {users.map((user) => {
              const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User Account';
              const isActionLoading = actionUserMap[user._id];

              return (
                <tr
                  key={user._id}
                  className="hover:bg-slate-900/50 transition-colors group text-slate-300"
                >
                  {/* User Name & Email */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-100 truncate">{displayName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <UserRoleBadge role={user.role} />
                      {/* Role Selector Quick Dropdown */}
                      <select
                        value={user.role || 'Student'}
                        onChange={(e) => handleChangeRole(user, e.target.value)}
                        disabled={isActionLoading}
                        className="bg-slate-900 border border-slate-800 text-[10px] text-slate-300 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                      >
                        <option value="Student">Student</option>
                        <option value="Candidate">Candidate</option>
                        <option value="Recruiter">Recruiter</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {user.isActive ? (
                      <Badge variant="success" style="soft" size="sm" className="text-[10px]">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="neutral" style="soft" size="sm" className="text-[10px] text-slate-400">
                        Deactivated
                      </Badge>
                    )}
                  </td>

                  {/* Registered Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatFullDate(user.createdAt)}</span>
                    </div>
                  </td>

                  {/* Last Activity */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{user.lastLogin ? formatFullDate(user.lastLogin) : 'Never'}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {isActionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user)}
                            title={user.isActive ? 'Deactivate user' : 'Activate user'}
                            className={`
                              p-1.5 rounded-lg border transition-colors cursor-pointer text-xs flex items-center gap-1
                              ${user.isActive
                                ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20'
                              }
                            `.trim()}
                          >
                            {user.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            <span>{user.isActive ? 'Deactivate' : 'Activate'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setTargetDeleteUser(user)}
                            title="Delete user account"
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout (Visible on mobile < sm) */}
      <div className="sm:hidden space-y-3">
        {users.map((user) => {
          const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User Account';
          const isActionLoading = actionUserMap[user._id];

          return (
            <div
              key={user._id}
              className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{displayName}</h4>
                    <p className="text-[11px] text-slate-400">{user.email}</p>
                  </div>
                </div>

                <UserRoleBadge role={user.role} />
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60 text-slate-400">
                <span>Status:</span>
                {user.isActive ? (
                  <Badge variant="success" style="soft" size="sm" className="text-[10px]">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="neutral" style="soft" size="sm" className="text-[10px]">
                    Deactivated
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Registered:</span>
                <span>{formatFullDate(user.createdAt)}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                {isActionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(user)}
                      className={`
                        px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer
                        ${user.isActive
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        }
                      `.trim()}
                    >
                      {user.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      <span>{user.isActive ? 'Deactivate' : 'Activate'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetDeleteUser(user)}
                      className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete User Modal Confirmation */}
      {targetDeleteUser && (
        <ConfirmDialog
          isOpen={Boolean(targetDeleteUser)}
          title="Delete User Account"
          message={`Are you sure you want to permanently delete user account "${targetDeleteUser.email}"? This action cannot be undone.`}
          confirmText="Delete Account"
          cancelText="Cancel"
          variant="danger"
          onConfirm={confirmDelete}
          onClose={() => setTargetDeleteUser(null)}
        />
      )}
    </div>
  );
};

export default UserTable;
