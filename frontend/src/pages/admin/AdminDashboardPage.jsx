import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { AdminOverview } from '../../components/admin/AdminOverview.jsx';
import { PlatformActivity } from '../../components/admin/PlatformActivity.jsx';
import { adminService } from '../../services/adminService.js';
import { RefreshCw, ShieldCheck } from 'lucide-react';

/**
 * AdminDashboardPage Component (F10.3)
 * Renders platform-wide administrative statistics, summary KPIs, and activity distributions.
 * All metrics are fetched dynamically from backend GET /api/v1/admin/dashboard.
 */
export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminService.getDashboardOverview();
      if (res?.success && res?.data) {
        setData(res.data);
      } else {
        setData(null);
      }
    } catch (err) {
      console.error('[AdminDashboardPage] Error fetching dashboard data:', err);
      setError("Couldn't load admin dashboard metrics.");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-6">
      {/* Page Header with Refresh Action */}
      <PageHeader
        title="Admin Control Center"
        description="Monitor real-time platform metrics, active candidate sessions, job postings, and AI consumption."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            className="border-slate-800 hover:border-slate-700 text-slate-300"
          >
            Refresh Metrics
          </Button>
        }
      />

      {/* Admin Authorization Status Banner */}
      <div className="p-3.5 rounded-2xl glass-panel border border-emerald-500/20 bg-emerald-950/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-emerald-300 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>System Status: All Administrative Endpoints Operational</span>
        </div>
        {data?.timestamp && (
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Last Synced: {new Date(data.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
      </div>

      {/* Error State Handler */}
      {error ? (
        <ErrorState
          title="Couldn't load admin dashboard metrics."
          message="An unexpected issue occurred while querying platform statistics. Please check your connection and try again."
          onRetry={fetchDashboardData}
          className="my-6"
        />
      ) : (
        <>
          {/* Summary KPI Overview Grid */}
          <AdminOverview data={data} isLoading={isLoading} />

          {/* Activity & Breakdown Distributions */}
          <PlatformActivity data={data} isLoading={isLoading} />
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
