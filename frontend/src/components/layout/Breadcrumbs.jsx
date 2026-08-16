import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const segmentLabels = {
  dashboard: 'Dashboard',
  profile: 'Profile',
  resume: 'Resume',
  analysis: 'ATS Analysis',
  companies: 'Companies',
  jobs: 'Jobs',
  applications: 'Applications',
  'saved-jobs': 'Saved Jobs',
  interviews: 'Mock Interviews',
  setup: 'Interview Setup',
  lobby: 'Session Lobby',
  live: 'Live Session',
  result: 'Evaluation Result',
  history: 'History & Analytics',
  start: 'Start Interview',
  roadmap: 'Learning Roadmap',
  notifications: 'Notifications',
  settings: 'Settings',
  onboarding: 'Candidate Onboarding',
  'design-system': 'Design System',
  admin: 'Admin Portal',
  users: 'Users',
  analytics: 'Analytics',
};


export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  if (pathnames.length === 0 || location.pathname === '/dashboard') {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-slate-400">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const formattedLabel = segmentLabels[value.toLowerCase()] || (value.length > 15 ? `${value.substring(0, 12)}...` : value);

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-200" aria-current="page">
                {formattedLabel}
              </span>
            ) : (
              <Link
                to={to}
                className="text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm"
              >
                {formattedLabel}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
