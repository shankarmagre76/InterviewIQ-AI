import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  FileCheck,
  Video,
  Map,
  Bell,
  Users,
  Building2,
  BarChart3,
  ShieldAlert,
  X,
  LogOut,
} from 'lucide-react';
import { MAIN_NAV_ITEMS, ADMIN_NAV_ITEMS } from '../../constants/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../ui/Badge';

const iconMap = {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  FileCheck,
  Video,
  Map,
  Bell,
  Users,
  Building2,
  BarChart3,
  ShieldAlert,
};

export const MobileNavigation = ({ isOpen, onClose, isAdminMode = false }) => {
  const { user, logout } = useAuth();
  const isAdminUser = user?.role?.toLowerCase() === 'admin';
  const navItems = isAdminMode ? ADMIN_NAV_ITEMS : MAIN_NAV_ITEMS;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Content */}
      <div className="relative w-72 max-w-[80vw] bg-slate-950 border-r border-slate-800 z-10 flex flex-col justify-between p-4 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {isAdminMode ? 'Admin Portal' : 'Navigation Menu'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          {user && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                <Badge variant={isAdminUser ? 'danger' : 'primary'} style="soft" size="sm" className="mt-1">
                  {user.role || 'Student'}
                </Badge>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Mobile navigation">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin' || item.path === '/dashboard'}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${isAdminMode ? 'focus-visible:ring-rose-500' : 'focus-visible:ring-indigo-500'}
                    ${isActive
                      ? isAdminMode
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-md shadow-rose-500/10 font-bold'
                        : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-md shadow-indigo-500/10 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                    }
                  `.trim()}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>

              );
            })}

            {!isAdminMode && isAdminUser && (
              <NavLink
                to="/admin"
                onClick={onClose}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 mt-4"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Switch to Admin Portal</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 text-xs font-semibold border border-rose-500/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;
