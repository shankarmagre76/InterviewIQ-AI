import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  RefreshCw,
  Search,
  Filter,
  Compass,
  Briefcase,
  Clock,
  Video,
  Award,
  XCircle,
} from 'lucide-react';

import { PageHeader } from '../../components/common/PageHeader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { SkeletonCard } from '../../components/ui/LoadingState';
import { ApplicationListTable } from '../../components/applications/ApplicationListTable';
import { ApplicationDetailsModal } from '../../components/applications/ApplicationDetailsModal';
import { ConfirmWithdrawModal } from '../../components/applications/ConfirmWithdrawModal';
import { applicationService } from '../../services/applicationService';
import { APPLICATION_STATUSES } from '../../constants/appConstants';
import { parseApiError } from '../../utils/helpers';
import { useToast } from '../../hooks/useToast';

export const ApplicationsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [appToWithdraw, setAppToWithdraw] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  /**
   * Fetch candidate applications list from backend
   */
  const fetchApplications = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: pagination.limit,
        ...(statusFilter ? { status: statusFilter } : {}),
      };

      const response = await applicationService.getCandidateApplications(params);
      const appsList = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      setApplications(appsList);
      setPagination((prev) => ({
        ...prev,
        page: response.pagination?.page || page,
        total: response.pagination?.total || appsList.length,
        totalPages: response.pagination?.totalPages || 1,
      }));
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, pagination.limit]);

  useEffect(() => {
    fetchApplications(1);
  }, [fetchApplications]);

  /**
   * Trigger withdrawal confirmation dialog
   */
  const handlePromptWithdraw = (applicationId) => {
    const targetApp = applications.find((a) => String(a._id) === String(applicationId));
    setAppToWithdraw(targetApp || { _id: applicationId });
    setWithdrawModalOpen(true);
  };

  /**
   * Confirm application withdrawal execution
   */
  const handleConfirmWithdraw = async () => {
    if (!appToWithdraw) return;
    try {
      await applicationService.updateApplicationStatus(appToWithdraw._id, { status: 'Withdrawn' });
      toast.success('Application withdrawn successfully.');
      fetchApplications(pagination.page);
    } catch (err) {
      toast.error(parseApiError(err));
    }
  };

  /**
   * Filter applications on frontend by title or company keyword search
   */
  const filteredApplications = applications.filter((app) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const company = (app.company?.companyName || app.companyName || '').toLowerCase();
    const job = (app.job?.title || app.jobTitle || '').toLowerCase();
    return company.includes(q) || job.includes(q);
  });

  // Calculate Metrics Summary Counts across fetched items / backend response
  const metrics = {
    total: pagination.total || applications.length,
    applied: applications.filter((a) => a.status === 'Applied').length,
    underReview: applications.filter((a) => a.status === 'Under Review').length,
    interview: applications.filter((a) =>
      ['Interview Scheduled', 'Technical Round', 'HR Round'].includes(a.status)
    ).length,
    offered: applications.filter((a) => a.status === 'Offered').length,
    rejected: applications.filter((a) => a.status === 'Rejected').length,
    withdrawn: applications.filter((a) => a.status === 'Withdrawn').length,
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* 1. Page Header */}
      <PageHeader
        title="Applications Tracker"
        description="Track your submitted job applications, interview stages, and recruiter responses."
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchApplications(pagination.page)}
              isLoading={loading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/jobs')}
              leftIcon={<Compass className="w-4 h-4" />}
            >
              Find Jobs
            </Button>
          </div>
        }
      />

      {/* 2. Metrics Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total */}
        <Card variant="glass" className="border-slate-800 p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-slate-100 font-mono">{metrics.total}</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
        </Card>

        {/* Applied */}
        <Card variant="glass" className="border-slate-800 p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Applied
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-slate-200 font-mono">{metrics.applied}</span>
            <Briefcase className="w-4 h-4 text-slate-400" />
          </div>
        </Card>

        {/* Under Review */}
        <Card variant="glass" className="border-slate-800 p-4 space-y-1">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
            Under Review
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-cyan-300 font-mono">{metrics.underReview}</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
        </Card>

        {/* Interview */}
        <Card variant="glass" className="border-slate-800 p-4 space-y-1">
          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
            Interview
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-indigo-300 font-mono">{metrics.interview}</span>
            <Video className="w-4 h-4 text-indigo-400" />
          </div>
        </Card>

        {/* Offered */}
        <Card variant="glass" className="border-slate-800 p-4 space-y-1">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
            Offered
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-emerald-300 font-mono">{metrics.offered}</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
        </Card>

        {/* Rejected / Withdrawn */}
        <Card variant="glass" className="border-slate-800 p-4 space-y-1">
          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
            Rejected / Closed
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-rose-300 font-mono">
              {metrics.rejected + metrics.withdrawn}
            </span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
        </Card>
      </div>

      {/* 3. Search & Status Filter Controls */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="relative flex-1 w-full">
          <Input
            type="text"
            placeholder="Search applications by job title or company name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            className="bg-slate-950/80 border-slate-800 text-xs sm:text-sm w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none cursor-pointer w-full sm:w-auto"
          >
            <option value="">All Statuses</option>
            {(APPLICATION_STATUSES || []).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Applications Data Table & Mobile Cards */}
      {loading && applications.length === 0 ? (
        <div className="space-y-3">
          <SkeletonCard className="h-20" />
          <SkeletonCard className="h-20" />
          <SkeletonCard className="h-20" />
        </div>
      ) : error && applications.length === 0 ? (
        <div className="py-8">
          <ErrorState
            title="Unable to Load Applications"
            message={error}
            onRetry={() => fetchApplications(1)}
          />
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="py-12 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center">
          <EmptyState
            icon={FileText}
            title="No applications found"
            description="You haven't submitted any job applications matching your selected search or status filter."
            actionLabel="Find Jobs"
            onAction={() => navigate('/jobs')}
          />
        </div>
      ) : (
        <ApplicationListTable
          applications={filteredApplications}
          onViewDetails={(app) => {
            setSelectedApp(app);
            setDetailsModalOpen(true);
          }}
          onWithdraw={handlePromptWithdraw}
          pagination={{
            page: pagination.page,
            totalPages: pagination.totalPages,
            total: pagination.total,
            onPageChange: (newPage) => fetchApplications(newPage),
          }}
        />
      )}

      {/* 5. Application Details Modal */}
      <ApplicationDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        application={selectedApp}
        onWithdraw={handlePromptWithdraw}
      />

      {/* 6. Confirm Withdrawal Modal */}
      <ConfirmWithdrawModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        onConfirm={handleConfirmWithdraw}
        applicationTitle={appToWithdraw?.job?.title || appToWithdraw?.jobTitle || 'this job application'}
      />
    </div>
  );
};

export default ApplicationsPage;
