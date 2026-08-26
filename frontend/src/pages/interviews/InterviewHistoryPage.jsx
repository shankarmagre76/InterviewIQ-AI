import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  Award,
  Plus
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { SkeletonCard } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { interviewService } from '../../services/interviewService';
import { InterviewCard, InterviewHistoryTable } from '../../components/interviews';

export const InterviewHistoryPage = () => {
  const navigate = useNavigate();

  // State
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Fetch History from Backend
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await interviewService.getInterviewHistory();

      const rawList = res?.data || [];
      const historyList = Array.isArray(rawList)
        ? rawList
        : Array.isArray(rawList.interviews)
        ? rawList.interviews
        : Array.isArray(rawList.data)
        ? rawList.data
        : [];

      setInterviews(historyList);
    } catch (err) {
      console.error('Error fetching interview history:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to load interview history.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Derived Filtered List
  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      // Role search filter
      const matchesSearch =
        !searchQuery.trim() ||
        (item.role || '').toLowerCase().includes(searchQuery.toLowerCase().trim());

      // Type filter
      const matchesType =
        selectedType === 'All' ||
        (item.interviewType || '').toLowerCase() === selectedType.toLowerCase();

      // Difficulty filter
      const matchesDifficulty =
        selectedDifficulty === 'All' ||
        (item.difficulty || '').toLowerCase() === selectedDifficulty.toLowerCase();

      // Status filter
      const matchesStatus =
        selectedStatus === 'All' ||
        (item.status || '').toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesType && matchesDifficulty && matchesStatus;
    });
  }, [interviews, searchQuery, selectedType, selectedDifficulty, selectedStatus]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredInterviews.length / ITEMS_PER_PAGE));
  const paginatedInterviews = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInterviews.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredInterviews, currentPage]);

  // Statistics Summary
  const stats = useMemo(() => {
    const total = interviews.length;
    const completed = interviews.filter((i) => i.status === 'Completed').length;
    const inProgress = interviews.filter((i) => i.status === 'In Progress' || i.status === 'Pending').length;
    const scores = interviews
      .filter((i) => i.status === 'Completed' && (i.overallScore || i.score))
      .map((i) => i.overallScore || i.score);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    return { total, completed, inProgress, avgScore };
  }, [interviews]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-16">
        <div className="w-full h-24 rounded-2xl animate-pulse bg-slate-900/80 border border-slate-800" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error && interviews.length === 0) {
    return (
      <div className="py-12 max-w-3xl mx-auto space-y-6">
        <ErrorState
          title="Failed to Load History"
          message={error}
          onRetry={fetchHistory}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      
      {/* Header & Main CTA */}
      <PageHeader
        title="Mock Interview History"
        description="Review your past candidate performance, resume in-progress sessions, or start a new technical drill."
        action={
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/interviews/setup')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Start AI Mock Interview
          </Button>
        }
      />

      {/* Top Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold">Total Sessions</div>
          <div className="text-2xl font-black text-white">{stats.total}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Completed
          </div>
          <div className="text-2xl font-black text-emerald-400">{stats.completed}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> In Progress
          </div>
          <div className="text-2xl font-black text-cyan-400">{stats.inProgress}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-indigo-400" /> Average Score
          </div>
          <div className="text-2xl font-black text-indigo-400">{stats.avgScore > 0 ? `${stats.avgScore}/100` : 'N/A'}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-5 backdrop-blur-xl shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search Input */}
          <div className="sm:col-span-4">
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by target role..."
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="bg-slate-950/80"
            />
          </div>

          {/* Type Select */}
          <div className="sm:col-span-2">
            <Select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'All', label: 'All Types' },
                { value: 'Technical', label: 'Technical' },
                { value: 'HR', label: 'HR' },
                { value: 'Behavioral', label: 'Behavioral' },
                { value: 'Mixed', label: 'Mixed' },
              ]}
              className="bg-slate-950/80"
            />
          </div>

          {/* Difficulty Select */}
          <div className="sm:col-span-2">
            <Select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'All', label: 'All Levels' },
                { value: 'Beginner', label: 'Beginner' },
                { value: 'Intermediate', label: 'Intermediate' },
                { value: 'Advanced', label: 'Advanced' },
              ]}
              className="bg-slate-950/80"
            />
          </div>

          {/* Status Select */}
          <div className="sm:col-span-2">
            <Select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Completed', label: 'Completed' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Cancelled', label: 'Cancelled' },
              ]}
              className="bg-slate-950/80"
            />
          </div>

          {/* View Mode Switcher */}
          <div className="sm:col-span-2 flex items-center justify-end gap-1 bg-slate-950/60 border border-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'table' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Table
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredInterviews.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-10 h-10 text-indigo-400" />}
          title={interviews.length === 0 ? 'No Mock Interviews Yet' : 'No Matching Sessions'}
          description={
            interviews.length === 0
              ? 'Start your first AI mock interview session to practice questions and receive detailed evaluation feedback.'
              : 'Try clearing your search query or filters to view other interview sessions.'
          }
          primaryAction={{
            label: 'Start AI Mock Interview',
            icon: <Plus className="w-4 h-4" />,
            onClick: () => navigate('/interviews/setup'),
          }}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedInterviews.map((item) => (
            <InterviewCard key={item._id || item.id} interview={item} />
          ))}
        </div>
      ) : (
        <InterviewHistoryTable interviews={paginatedInterviews} />
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Showing Page <span className="text-white font-bold">{currentPage}</span> of{' '}
            <span className="text-white font-bold">{totalPages}</span> ({filteredInterviews.length} total sessions)
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewHistoryPage;
