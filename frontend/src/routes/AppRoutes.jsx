import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { AdminLayout } from '../layouts/AdminLayout';


// Guards
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { PublicRoute } from './PublicRoute';

// Public Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';


// Protected Candidate Pages
import DashboardPage from '../pages/dashboard/DashboardPage';
import ProfilePage from '../pages/profile/ProfilePage';
import ResumeOverviewPage from '../pages/resume/ResumeOverviewPage';
import ResumeAnalysisPage from '../pages/resume/ResumeAnalysisPage';
import CompaniesPage from '../pages/company/CompaniesPage';
import JobsPage from '../pages/jobs/JobsPage';
import JobDetailsPage from '../pages/jobs/JobDetailsPage';
import ApplicationsPage from '../pages/application/ApplicationsPage';
import SavedJobsPage from '../pages/jobs/SavedJobsPage';
import MockInterviewPage from '../pages/interviews/MockInterviewPage';
import InterviewSessionPage from '../pages/interviews/InterviewSessionPage';
import InterviewResultPage from '../pages/interviews/InterviewResultPage';
import RoadmapPage from '../pages/roadmap/RoadmapPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import SettingsPage from '../pages/settings/SettingsPage';
import DesignSystemPage from '../pages/DesignSystemPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminCompaniesPage from '../pages/admin/AdminCompaniesPage';
import AdminJobsPage from '../pages/admin/AdminJobsPage';
import AdminApplicationsPage from '../pages/admin/AdminApplicationsPage';
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage';

// 404 Page
import NotFoundPage from '../pages/NotFoundPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Auth Routes (Redirects authenticated candidates away to dashboard) */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/login" element={<LoginPage />} />

          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
      </Route>

      {/* Protected User Candidate Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/resume" element={<ResumeOverviewPage />} />
          <Route path="/resume/analysis" element={<ResumeAnalysisPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/saved-jobs" element={<SavedJobsPage />} />
          <Route path="/interviews" element={<MockInterviewPage />} />
          <Route path="/interviews/:id" element={<InterviewSessionPage />} />
          <Route path="/interviews/:id/result" element={<InterviewResultPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/design-system" element={<DesignSystemPage />} />
        </Route>
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/companies" element={<AdminCompaniesPage />} />
          <Route path="/admin/jobs" element={<AdminJobsPage />} />
          <Route path="/admin/applications" element={<AdminApplicationsPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        </Route>
      </Route>

      {/* Catch-all 404 Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
