import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from '../components/ui/LoadingState';

const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/auth/login', '/auth/register', '/auth/forgot-password'];



export const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    const rawFrom = location.state?.from?.pathname;
    const isAuthPath = rawFrom && AUTH_PATHS.some((p) => rawFrom.toLowerCase().startsWith(p));
    const targetPath = rawFrom && !isAuthPath ? rawFrom : '/dashboard';

    return <Navigate to={targetPath} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
