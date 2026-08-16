import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Guards
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { PublicRoute } from './PublicRoute';

// UI Fallback
import { PageLoader } from '../components/ui/LoadingState';


// Public Pages (Lazy Loaded)
const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('../pages/auth/VerifyEmailPage'));
const OnboardingPage = lazy(() => import('../pages/onboarding/OnboardingPage'));

// Protected Candidate Pages (Lazy Loaded)
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
const ResumeOverviewPage = lazy(() => import('../pages/resume/ResumeOverviewPage'));
const ResumeAnalysisPage = lazy(() => import('../pages/resume/ResumeAnalysisPage'));
const CompaniesPage = lazy(() => import('../pages/company/CompaniesPage'));
const CompanyDetailsPage = lazy(() => import('../pages/company/CompanyDetailsPage'));
const JobsPage = lazy(() => import('../pages/jobs/JobsPage'));
const JobDetailsPage = lazy(() => import('../pages/jobs/JobDetailsPage'));
const ApplicationsPage = lazy(() => import('../pages/application/ApplicationsPage'));
const ApplicationDetailsPage = lazy(() => import('../pages/application/ApplicationDetailsPage'));
const SavedJobsPage = lazy(() => import('../pages/jobs/SavedJobsPage'));
const InterviewHistoryPage = lazy(() => import('../pages/interviews/InterviewHistoryPage'));
const MockInterviewPage = lazy(() => import('../pages/interviews/MockInterviewPage'));
const InterviewSetupPage = lazy(() => import('../pages/interviews/InterviewSetupPage'));
const InterviewLobbyPage = lazy(() => import('../pages/interviews/InterviewLobbyPage'));
const InterviewSessionPage = lazy(() => import('../pages/interviews/InterviewSessionPage'));
const InterviewResultPage = lazy(() => import('../pages/interviews/InterviewResultPage'));
const RoadmapPage = lazy(() => import('../pages/roadmap/RoadmapPage'));
const RoadmapDetailsPage = lazy(() => import('../pages/roadmap/RoadmapDetailsPage'));
const RoadmapHistoryPage = lazy(() => import('../pages/roadmap/RoadmapHistoryPage'));
const NotificationsPage = lazy(() => import('../pages/notifications/NotificationsPage'));
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'));
const DesignSystemPage = lazy(() => import('../pages/DesignSystemPage'));

// Admin Pages (Lazy Loaded)
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminUserDetailsPage = lazy(() => import('../pages/admin/AdminUserDetailsPage'));
const AdminCompaniesPage = lazy(() => import('../pages/admin/AdminCompaniesPage'));
const AdminJobsPage = lazy(() => import('../pages/admin/AdminJobsPage'));
const AdminApplicationsPage = lazy(() => import('../pages/admin/AdminApplicationsPage'));
const AdminAnalyticsPage = lazy(() => import('../pages/admin/AdminAnalyticsPage'));

// 404 Page (Lazy Loaded)
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>

      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Auth Routes */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
        </Route>

        {/* Protected User Candidate Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/resume" element={<ResumeOverviewPage />} />
            <Route path="/resume/analysis" element={<ResumeAnalysisPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/companies/:id" element={<CompanyDetailsPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/applications/:id" element={<ApplicationDetailsPage />} />
            <Route path="/saved-jobs" element={<SavedJobsPage />} />
            <Route path="/interviews" element={<InterviewHistoryPage />} />
            <Route path="/interviews/analytics" element={<MockInterviewPage />} />
            <Route path="/interviews/setup" element={<InterviewSetupPage />} />
            <Route path="/interviews/start" element={<InterviewSetupPage />} />
            <Route path="/interviews/:id/lobby" element={<InterviewLobbyPage />} />
            <Route path="/interviews/:id" element={<InterviewSessionPage />} />
            <Route path="/interviews/:id/result" element={<InterviewResultPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/roadmap/history" element={<RoadmapHistoryPage />} />
            <Route path="/roadmap/:id" element={<RoadmapDetailsPage />} />
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
            <Route path="/admin/users/:id" element={<AdminUserDetailsPage />} />
            <Route path="/admin/companies" element={<AdminCompaniesPage />} />
            <Route path="/admin/jobs" element={<AdminJobsPage />} />
            <Route path="/admin/applications" element={<AdminApplicationsPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          </Route>
        </Route>

        {/* Catch-all 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

