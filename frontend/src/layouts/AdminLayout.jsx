import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Menu, LogOut, UserCheck } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { MobileNavigation } from '../components/layout/MobileNavigation';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';
import { Badge } from '../components/ui/Badge';

/**
 * AdminLayout Component (F10.2)
 * Dedicated layout for Administrator Portal navigation and management.
 * Features:
 * - Admin-only navigation sidebar & mobile drawer (Dashboard, Users, Companies, Jobs, Applications, Analytics, Audit Logs, Announcements)
 * - Admin identity display (Name, Email, Role Badge)
 * - Quick "Exit Admin" and "Sign Out" actions
 * - Dynamic breadcrumb trail
 * - Integrated with AdminRoute guard (Frontend UX boundary)
 */
export const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      {/* Admin Top Header Bar */}
      <header className="h-16 border-b border-rose-500/30 bg-slate-950/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-lg shadow-rose-950/20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open mobile admin navigation drawer"
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-md">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-white text-base sm:text-lg tracking-tight block leading-none">
                InterviewIQ AI
              </span>
              <span className="text-[10px] font-semibold text-rose-400 tracking-wider uppercase">
                Administrator Portal
              </span>
            </div>
          </div>
        </div>

        {/* Admin User Identity & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {user && (
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-right leading-tight">
                <p className="text-xs font-bold text-slate-200 truncate max-w-[160px]">{user.name || user.email}</p>
                <span className="text-[10px] text-slate-400">{user.email}</span>
              </div>
              <Badge variant="danger" style="soft" size="sm" className="ml-1 text-[9px] uppercase">
                {user.role || 'Admin'}
              </Badge>
            </div>
          )}

          <Link
            to="/dashboard"
            title="Exit to Candidate Portal"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Exit Admin</span>
          </Link>

          <button
            type="button"
            onClick={logout}
            title="Sign out of administrative session"
            aria-label="Sign out of administrative session"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Admin Sidebar */}
        <Sidebar isAdminMode={true} />

        {/* Mobile Admin Navigation Drawer */}
        <MobileNavigation
          isOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          isAdminMode={true}
        />

        {/* Dynamic Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full space-y-4">
            <Breadcrumbs />
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
