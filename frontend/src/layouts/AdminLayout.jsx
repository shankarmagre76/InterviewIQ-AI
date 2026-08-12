import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      <header className="h-16 border-b border-rose-500/30 bg-slate-950/90 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-rose-400" />
          <span className="font-bold text-white text-lg tracking-tight">InterviewIQ Admin Portal</span>
        </div>
        <Link to="/dashboard" className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </header>

      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};
