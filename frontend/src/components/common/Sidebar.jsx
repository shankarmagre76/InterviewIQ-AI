import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Video,
  Map,
  Briefcase,
  Bell,
  User,
  Palette,
  ShieldAlert,
  X,
  LogOut,
} from 'lucide-react';
import { NAV_ITEMS } from '../../constants/navigation';
import { useAuth } from '../../hooks/useAuth';
import { ConfirmDialog } from '../ui/ConfirmDialog';

const iconMap = {
  LayoutDashboard,
  FileText,
  Video,
  Map,
  Briefcase,
  Bell,
  User,
  Palette,
  ShieldAlert,
};

export const Sidebar = ({ isOpen, onClose }) => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
      if (onClose) onClose();
      navigate('/login', { replace: true });
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static top-0 left-0 bottom-0 z-50 w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `.trim()}
      >
        <div className="p-4">
          <div className="flex items-center justify-between lg:hidden mb-6 px-2">
            <span className="text-sm font-bold text-slate-200">Navigation Menu</span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer
                    ${isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-md shadow-indigo-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                    }
                  `.trim()}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800/60 space-y-3">
          <div className="glass-panel p-3.5 rounded-xl text-xs space-y-1">
            <p className="font-semibold text-slate-200">InterviewIQ Engine</p>
            <p className="text-[11px] text-slate-400">Gemini 1.5 Pro Active</p>
          </div>

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Sign Out of InterviewIQ AI"
        description="Are you sure you want to end your candidate session? You will need to log back in to access mock interviews and resume tools."
        confirmText="Sign Out"
        variant="danger"
        isLoading={isLoggingOut}
      />
    </>
  );
};

export default Sidebar;
