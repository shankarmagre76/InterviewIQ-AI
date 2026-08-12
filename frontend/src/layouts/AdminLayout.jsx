import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Menu } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { MobileNavigation } from '../components/layout/MobileNavigation';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';

export const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      {/* Admin Top Header Bar */}
      <header className="h-16 border-b border-rose-500/30 bg-slate-950/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open mobile admin menu"
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <span className="font-bold text-white text-lg tracking-tight">InterviewIQ Admin Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 hidden sm:inline-block">Logged in as {user?.email}</span>
          <Link
            to="/dashboard"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Exit Admin
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (Admin Mode) */}
        <Sidebar isAdminMode={true} />

        {/* Mobile Navigation Drawer (Admin Mode) */}
        <MobileNavigation
          isOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          isAdminMode={true}
        />

        {/* Page View Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
          <div className="max-w-7xl mx-auto w-full">
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
