import React from 'react';
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
  Palette,
  Bookmark,
  Sparkles,
  Settings,
  GitPullRequest,
  Calendar,
} from 'lucide-react';
import {
  CANDIDATE_NAV_ITEMS,
  RECRUITER_NAV_ITEMS,
  ADMIN_NAV_ITEMS,
} from '../../constants/navigation';
import { useAuth } from '../../hooks/useAuth';

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
  Palette,
  Bookmark,
  Sparkles,
  Settings,
  GitPullRequest,
  Calendar,
};

export const Sidebar = ({ isAdminMode = false }) => {
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase();
  const isAdminUser = userRole === 'admin';
  const isRecruiterUser = userRole === 'recruiter';

  let navItems = CANDIDATE_NAV_ITEMS;
  let portalTitle = 'Candidate Portal';

  if (isAdminMode) {
    navItems = ADMIN_NAV_ITEMS;
    portalTitle = 'Admin Management';
  } else if (isRecruiterUser) {
    navItems = RECRUITER_NAV_ITEMS;
    portalTitle = 'Recruiter Portal';
  }

  return (
    <aside className="hidden lg:flex w-64 bg-slate-950 border-r border-slate-800/80 flex-col justify-between shrink-0 p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            {portalTitle}
          </h3>
          <nav className="space-y-1" aria-label="Sidebar main navigation">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin' || item.path === '/dashboard'}
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
          </nav>
        </div>

        {/* Admin Navigation Switcher (Visible to Admin Users on Candidate View) */}
        {!isAdminMode && isAdminUser && (
          <div className="pt-2 border-t border-slate-800/60">
            <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> Administrator Mode
            </h3>
            <NavLink
              to="/admin"
              className={({ isActive }) => `
                flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-rose-300 hover:bg-rose-500/10 border border-rose-500/20
                ${isActive ? 'bg-rose-500/20 border-rose-500/40' : ''}
              `.trim()}
            >
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Switch to Admin Portal</span>
            </NavLink>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-800/60">
        <div className="p-3.5 rounded-xl glass-panel text-xs space-y-1">
          <p className="font-semibold text-slate-200">InterviewIQ AI Engine</p>
          <p className="text-[11px] text-slate-400">Gemini 1.5 Pro Active</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
