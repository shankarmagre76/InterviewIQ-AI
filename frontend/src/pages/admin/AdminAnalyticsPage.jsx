import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { AnalyticsOverviewCards } from '../../components/admin/AnalyticsOverviewCards.jsx';
import { AnalyticsCharts } from '../../components/admin/AnalyticsCharts.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { adminService } from '../../services/adminService.js';
import { Calendar, RefreshCw } from 'lucide-react';

const TIME_RANGES = [
  { label: '30 Days', value: 30 },
  { label: '60 Days', value: 60 },
  { label: '90 Days', value: 90 },
];

/**
 * AdminAnalyticsPage Component (F10.9)
 * Admin Platform Analytics & AI Telemetry dashboard at /admin/analytics.
 * Features:
 * - Real backend time-series growth curves (Recharts AreaChart & BarChart)
 * - Supported date range controls (30, 60, 90 days)
 * - Platform KPI summary cards & work mode / employment type distributions
 * - Gemini AI token telemetry & consumption analytics
 * - Zero fabricated data (backend source of truth)
 */
export const AdminAnalyticsPage = () => {
  const [selectedDays, setSelectedDays] = useState(30);

  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [jobAnalytics, setJobAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [dashRes, userRes, jobRes] = await Promise.all([
        adminService.getDashboardOverview(),
        adminService.getUserAnalytics({ days: selectedDays }),
        adminService.getJobAnalytics(),
      ]);

      if (dashRes?.success && dashRes?.data) {
        setDashboardSummary(dashRes.data);
      }
      if (userRes?.success && userRes?.data) {
        setUserAnalytics(userRes.data);
      }
      if (jobRes?.success && jobRes?.data) {
        setJobAnalytics(jobRes.data);
      }
    } catch (err) {
      console.error('[AdminAnalyticsPage] Error fetching analytics data:', err);
      setError("Couldn't load platform analytics.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDays]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return (
    <div className="space-y-6">
      {/* Page Header with Refresh Action & Date Range Controls */}
      <PageHeader
        title="Platform Analytics & AI Telemetry"
        description="Monitor user registration growth curves, job posting trends, work mode distributions, and Gemini AI consumption."
        action={
          <div className="flex items-center gap-2">
            {/* Time Range Selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
              {TIME_RANGES.map((tr) => (
                <button
                  key={tr.value}
                  type="button"
                  onClick={() => setSelectedDays(tr.value)}
                  className={`
                    px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer
                    ${selectedDays === tr.value
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }
                  `.trim()}
                >
                  {tr.label}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnalyticsData}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
              className="border-slate-800 text-slate-300"
            >
              Refresh Analytics
            </Button>
          </div>
        }
      />

      {/* Error State Handler */}
      {error ? (
        <ErrorState
          title="Couldn't load platform analytics."
          message="An error occurred while querying database aggregations and AI telemetry. Please check your connection and try again."
          onRetry={fetchAnalyticsData}
          className="my-6"
        />
      ) : (
        <>
          {/* Summary KPI Metric Cards */}
          <AnalyticsOverviewCards summary={dashboardSummary} isLoading={isLoading} />

          {/* Recharts Time-Series & Distribution Charts */}
          <AnalyticsCharts
            userAnalytics={userAnalytics}
            jobAnalytics={jobAnalytics}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;
