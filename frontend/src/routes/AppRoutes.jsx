import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { RootLayout } from '../layouts/RootLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { AdminLayout } from '../layouts/AdminLayout';

import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';

import DashboardPage from '../pages/dashboard/DashboardPage';
import ProfilePage from '../pages/profile/ProfilePage';
import ResumeAnalysisPage from '../pages/resume/ResumeAnalysisPage';
import JobsPage from '../pages/jobs/JobsPage';
import MockInterviewPage from '../pages/interviews/MockInterviewPage';
import InterviewSessionPage from '../pages/interviews/InterviewSessionPage';
import RoadmapPage from '../pages/roadmap/RoadmapPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import DesignSystemPage from '../pages/DesignSystemPage';
import NotFoundPage from '../pages/NotFoundPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Auth Routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Main Authenticated App Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RootLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/resume" element={<ResumeAnalysisPage />} />
          <Route path="/interviews" element={<MockInterviewPage />} />
          <Route path="/interviews/live" element={<InterviewSessionPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/design-system" element={<DesignSystemPage />} />
        </Route>
      </Route>


      {/* Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
        </Route>
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
