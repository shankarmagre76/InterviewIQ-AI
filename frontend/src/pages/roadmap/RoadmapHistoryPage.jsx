import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  History,
  Target,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { SkeletonCard } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { roadmapService } from '../../services/roadmapService';
import { GenerateRoadmapModal } from '../../components/roadmap/GenerateRoadmapModal';
import { formatDate, parseApiError } from '../../utils/helpers';

export const RoadmapHistoryPage = () => {
  const navigate = useNavigate();

  const [roadmaps, setRoadmaps] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate Modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedRoleForRegen, setSelectedRoleForRegen] = useState('Java Full Stack Developer');

  // Fetch History List
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      const response = await roadmapService.getRoadmapHistory(params);
      const resData = response?.data || response;

      const list = resData?.roadmaps || (Array.isArray(resData) ? resData : []);
      const pag = resData?.pagination || { page: 1, limit: 9, total: list.length, totalPages: 1 };

      setRoadmaps(list);
      setPagination(pag);
    } catch (err) {
      console.error('Error fetching roadmap history:', err);
      const msg = parseApiError(err) || 'Failed to load roadmap history.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Handle Regenerate CTA for Archived Roadmap
  const handleRegenerate = (role) => {
    setSelectedRoleForRegen(role || 'Java Full Stack Developer');
    setShowGenerateModal(true);
  };

  // Client-side search filtering
  const filteredRoadmaps = roadmaps.filter((rm) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = (rm.title || '').toLowerCase().includes(q);
    const roleMatch = (rm.targetRole || '').toLowerCase().includes(q);
    return titleMatch || roleMatch;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      {/* Back Link */}
      <div>
        <Link
          to="/roadmap"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Active Roadmap
        </Link>
      </div>

      {/* Page Header */}
      <PageHeader
        title="Learning Roadmap History"
        description="Review all historical AI-generated roadmaps, archived versions, and previous career milestone progress."
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleRegenerate('Java Full Stack Developer')}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Generate New Roadmap
          </Button>
        }
      />

      {/* Filter & Search Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or target role..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-indigo-400" /> Filter Status:
          </span>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-3 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="ARCHIVED">ARCHIVED</option>
            <option value="DRAFT">DRAFT</option>
          </select>
        </div>

      </div>

      {/* Loading Skeleton Grid */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <ErrorState
          title="Roadmap History Unavailable"
          message={error}
          onRetry={fetchHistory}
        />
      )}

      {/* Empty State */}
      {!loading && !error && filteredRoadmaps.length === 0 && (
        <EmptyState
          icon={<History className="w-12 h-12 text-slate-500" />}
          title="No Roadmap History Found"
          description="You do not have any saved roadmap history matching your current filter criteria."
          primaryAction={{
            label: 'Generate AI Roadmap',
            icon: <Sparkles className="w-4 h-4" />,
            onClick: () => handleRegenerate('Java Full Stack Developer'),
          }}
        />
      )}

      {/* History Grid List */}
      {!loading && !error && filteredRoadmaps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoadmaps.map((rm) => {
            const rmId = rm._id || rm.id;
            const progressVal = rm.overallProgress || 0;
            const phasesCount = rm.phases?.length || 0;
            const statusStr = String(rm.status || 'ACTIVE').toUpperCase();
            const isActive = statusStr === 'ACTIVE';

            return (
              <div
                key={rmId}
                className={`p-6 rounded-3xl border flex flex-col justify-between space-y-5 transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-900/90 border-indigo-500/40 shadow-xl shadow-indigo-500/10'
                    : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  
                  {/* Top Role & Version Row */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="success" size="sm" icon={<Target className="w-3.5 h-3.5" />}>
                      {rm.targetRole || 'Software Engineer'}
                    </Badge>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                        v{rm.version || 1}.0
                      </span>
                      <Badge variant={isActive ? 'primary' : 'outline'} size="sm">
                        {statusStr}
                      </Badge>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h4 className="text-base font-bold text-white line-clamp-1">
                    {rm.title || 'Learning Roadmap'}
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {rm.description || 'Personalized career roadmap curriculum.'}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Completion</span>
                      <span className="text-indigo-400 font-bold">{progressVal}%</span>
                    </div>
                    <ProgressBar
                      value={progressVal}
                      max={100}
                      showPercentage={false}
                      color={isActive ? 'indigo' : 'slate'}
                      size="sm"
                    />
                  </div>

                  {/* Meta Information */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" /> {phasesCount} Phases
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 truncate">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> {formatDate(rm.createdAt || rm.generatedAt)}
                    </span>
                  </div>

                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => navigate(`/roadmap/${rmId}`)}
                    rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    View Curriculum
                  </Button>

                  {!isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRegenerate(rm.targetRole)}
                      leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                      className="text-xs text-amber-300 hover:text-white shrink-0"
                    >
                      Regenerate
                    </Button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total roadmaps)
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* AI Roadmap Regeneration Modal */}
      <GenerateRoadmapModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onSuccess={() => {
          setShowGenerateModal(false);
          navigate('/roadmap');
        }}
        defaultRole={selectedRoleForRegen}
      />

    </div>
  );
};

export default RoadmapHistoryPage;
