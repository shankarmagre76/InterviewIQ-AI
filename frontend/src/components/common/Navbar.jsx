import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, LogOut, User, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Dropdown } from '../ui/Dropdown';
import { Badge } from '../ui/Badge';

export const Navbar = ({ onMobileMenuToggle }) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight hidden sm:inline-block">
            InterviewIQ <span className="text-indigo-400 font-semibold">AI</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant="primary" style="soft" size="sm" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
          AI Connected
        </Badge>

        {isAuthenticated && user ? (
          <Dropdown
            align="right"
            trigger={
              <button className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-900 transition-colors cursor-pointer text-left">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white font-bold flex items-center justify-center text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-semibold text-slate-200 leading-none">{user.name || 'User'}</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-1">{user.email || ''}</p>
                </div>
              </button>
            }
            items={[
              { label: 'Profile Settings', icon: <User className="w-4 h-4" /> },
              { divider: true },
              { label: 'Sign Out', icon: <LogOut className="w-4 h-4" />, danger: true, onClick: logout },
            ]}
          />
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/auth/login" className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors">
              Log In
            </Link>
            <Link to="/auth/register" className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
