import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Compass,
  Target,
  Layers,
  CheckCircle2,
  CircleDot,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
  Tag,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { SkeletonCard } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { roadmapService } from '../../services/roadmapService';
import { LearningTaskCard } from '../../components/roadmap/LearningTaskCard';
import { parseApiError } from '../../utils/helpers';

export const RoadmapDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Expanded Phase IDs state for collapse/expand toggle
  const [expandedPhases, setExpandedPhases] = useState({});

  // Fetch Roadmap Details by ID
  const fetchRoadmapDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const response = await roadmapService.getRoadmapById(id);
      const resData = response?.data || response;

      const roadmapObj = resData?.roadmap || resData;
      const tasksList = resData?.tasks || [];

      setRoadmap(roadmapObj);
      setTasks(tasksList);

      // Auto expand first phase by default
      if (roadmapObj?.phases && roadmapObj.phases.length > 0) {
        const firstPhaseId = roadmapObj.phases[0]._id || roadmapObj.phases[0].id || 'phase-0';
        setExpandedPhases({ [firstPhaseId]: true });
      }
    } catch (err) {
      console.error('Error fetching roadmap details:', err);
      const msg = parseApiError(err) || 'Learning roadmap not found or access denied.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRoadmapDetails();
  }, [fetchRoadmapDetails]);

  // Toggle Phase Expansion
  const togglePhase = (phaseId) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  // Expand All / Collapse All
  const toggleAllPhases = (expand = true) => {
    if (!roadmap?.phases) return;
    const newState = {};
    roadmap.phases.forEach((p, idx) => {
      const pId = p._id || p.id || `phase-${idx}`;
      newState[pId] = expand;
    });
    setExpandedPhases(newState);
  };

  // Task Updated Local Handler
  const handleTaskUpdated = (updatedTask) => {
    if (!updatedTask) return;
    setTasks((prevTasks) =>
      prevTasks.map((t) => ((t._id || t.id) === (updatedTask._id || updatedTask.id) ? updatedTask : t))
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16">
        <div className="w-48 h-8 rounded-xl animate-pulse bg-slate-900" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="py-12 max-w-3xl mx-auto space-y-6">
        <ErrorState
          title="Roadmap Not Found"
          message={error || 'The requested learning roadmap does not exist or has been deleted.'}
          onRetry={fetchRoadmapDetails}
        />
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={() => navigate('/roadmap')}>
            ← Back to Active Roadmap
          </Button>
        </div>
      </div>
    );
  }

  // Derived Properties
  const title = roadmap.title || 'Learning Roadmap';
  const description = roadmap.description || 'Structured AI Learning Curriculum';
  const targetRole = roadmap.targetRole || 'Software Engineer';
  const overallProgress = roadmap.overallProgress || 0;
  const status = String(roadmap.status || 'ACTIVE').toUpperCase();
  const isArchived = status === 'ARCHIVED';
  const phases = roadmap.phases || [];
  const skillGaps = roadmap.skillGaps || [];

  const allExpanded = phases.length > 0 && phases.every((p, idx) => expandedPhases[p._id || p.id || `phase-${idx}`]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      {/* Top Navigation Link */}
      <div>
        <Link
          to="/roadmap"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Overview
        </Link>
      </div>

      {/* Header */}
      <PageHeader
        title={title}
        description={`Detailed curriculum view for ${targetRole}`}
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRoadmapDetails}
              isLoading={loading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh Details
            </Button>
          </div>
        }
      />

      {/* Archived Notice Banner */}
      {isArchived && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-sm block">Archived Learning Roadmap</span>
            <p className="text-amber-200/80 leading-relaxed">
              This roadmap has been archived because a newer version was generated. Progress data is preserved for your historical reference.
            </p>
          </div>
        </div>
      )}

      {/* Hero Overview Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> Detailed Curriculum
              </span>
              <Badge variant="success" size="sm" icon={<Target className="w-3.5 h-3.5" />}>
                {targetRole}
              </Badge>
              <Badge variant={isArchived ? 'warning' : 'primary'} size="sm">
                {status}
              </Badge>
            </div>
            <h1 className="text-2xl font-extrabold text-white">{title}</h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">{description}</p>
          </div>

          <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col items-center justify-center text-indigo-400 shrink-0">
            <span className="text-3xl font-black">{overallProgress}%</span>
            <span className="text-[9px] uppercase font-bold text-indigo-300">Complete</span>
          </div>
        </div>

        <ProgressBar value={overallProgress} max={100} showPercentage={false} color="indigo" size="lg" />

        {/* Skill Gaps Section */}
        {skillGaps.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Targeted Skill Gaps ({skillGaps.length})
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {skillGaps.map((gap, gIdx) => (
                <span
                  key={gIdx}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300 flex items-center gap-1.5"
                >
                  <Tag className="w-3 h-3 text-indigo-400" /> {gap}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Curriculum Phases Header & Toggle All Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" /> Roadmap Phases ({phases.length})
        </h3>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleAllPhases(!allExpanded)}
          className="text-xs text-indigo-300 hover:text-white"
        >
          {allExpanded ? 'Collapse All Phases' : 'Expand All Phases'}
        </Button>
      </div>

      {/* Connected Component Hierarchy Tree (Roadmap -> Phase -> Task -> Resource) */}
      <div className="space-y-6">
        {phases.map((phase, index) => {
          const phaseId = phase._id || phase.id || `phase-${index}`;
          const isCompleted = phase.status === 'COMPLETED' || phase.progress === 100;
          const isInProgress = phase.status === 'IN_PROGRESS' || (phase.progress > 0 && !isCompleted);
          const isExpanded = Boolean(expandedPhases[phaseId]);

          // Filter tasks belonging to this phase
          const phaseTasks = tasks.filter(
            (t) => String(t.phaseId || t.phase) === String(phase._id || phase.id)
          );

          return (
            <div
              key={phaseId}
              className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                isCompleted
                  ? 'bg-slate-900/80 border-emerald-500/30'
                  : isInProgress
                  ? 'bg-slate-900/90 border-indigo-500/40 shadow-xl shadow-indigo-500/10'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              {/* Phase Header Accordion Trigger */}
              <div
                className="p-6 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-900/40 transition-colors"
                onClick={() => togglePhase(phaseId)}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 mt-0.5">
                    {isCompleted ? (
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    ) : isInProgress ? (
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-300">
                        <CircleDot className="w-5 h-5 text-indigo-400" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                        <Circle className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                        Phase {phase.order || index + 1}
                      </span>
                      <h4 className="text-lg font-bold text-white">{phase.title}</h4>
                      <Badge variant={isCompleted ? 'success' : isInProgress ? 'primary' : 'outline'} size="sm">
                        {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started'}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{phase.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-extrabold text-indigo-400 font-mono">
                    {phase.progress || 0}%
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expandable Phase Tasks & Resources Container */}
              {isExpanded && (
                <div className="p-6 pt-2 border-t border-slate-800/80 bg-slate-950/60 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" /> Phase Tasks ({phaseTasks.length})
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" /> ~{phase.estimatedDays || 7} Days Duration
                    </span>
                  </div>

                  {phaseTasks.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">No learning tasks assigned to this phase.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {phaseTasks.map((task) => (
                        <LearningTaskCard
                          key={task._id || task.id}
                          task={task}
                          onTaskUpdated={handleTaskUpdated}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default RoadmapDetailsPage;
