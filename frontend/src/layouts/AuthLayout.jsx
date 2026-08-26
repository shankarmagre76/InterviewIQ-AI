import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Branding */}
      <header className="z-10 max-w-md mx-auto w-full pt-4 text-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            InterviewIQ <span className="text-indigo-400">AI</span>
          </span>
        </Link>
      </header>

      {/* Auth Card Outlet */}
      <main className="z-10 max-w-md w-full mx-auto my-auto py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="z-10 text-center text-xs text-slate-500 pb-4">
        InterviewIQ AI © {new Date().getFullYear()} • Secure Authentication
      </footer>
    </div>
  );
};
