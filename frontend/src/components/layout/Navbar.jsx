import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Bell, Menu, User, LogOut, Settings } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { Dropdown } from '../ui/Dropdown';
import { Badge } from '../ui/Badge';
import { notificationService } from '../../services/notificationService';

export const Navbar = ({ onMobileToggle }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      if (isAuthenticated) {
        try {
          const res = await notificationService.getUnreadNotifications();
          const count = res?.data?.count || res?.count || (Array.isArray(res?.data) ? res.data.length : 0);
          if (isMounted) setUnreadCount(count);
        } catch {
          // Gracefully fallback if notifications API is not populated yet
          if (isMounted) setUnreadCount(0);
        }
      }
    };

    fetchUnread();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Brand Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileToggle}
          aria-label="Open mobile navigation"
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight hidden sm:inline-block">
            InterviewIQ <span className="text-indigo-400 font-semibold">AI</span>
          </span>
        </Link>
      </div>

      {/* Right: Notifications & User Profile Menu */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell */}
        {isAuthenticated && (
          <Link
            to="/notifications"
            aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
            className="relative p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        )}

        {/* User Profile Dropdown */}
        {isAuthenticated && user ? (
          <Dropdown
            align="right"
            trigger={
              <button
                type="button"
                aria-label="User account menu"
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-900/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer text-left"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white font-bold flex items-center justify-center text-xs shadow-md border border-indigo-400/30">
                  {userInitial}
                </div>
                <div className="hidden md:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-200 leading-none">{user.name}</span>
                    <Badge variant={user.role?.toLowerCase() === 'admin' ? 'danger' : 'primary'} style="soft" size="sm">
                      {user.role || 'Student'}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-none mt-1">{user.email}</p>
                </div>
              </button>
            }
            items={[
              { label: 'Profile Settings', icon: <User className="w-4 h-4" />, onClick: () => navigate('/profile') },
              { label: 'System Settings', icon: <Settings className="w-4 h-4" />, onClick: () => navigate('/settings') },
              { divider: true },
              { label: 'Sign Out', icon: <LogOut className="w-4 h-4" />, danger: true, onClick: logout },
            ]}
          />
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors">
              Log In
            </Link>
            <Link to="/register" className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md shadow-indigo-500/20">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
