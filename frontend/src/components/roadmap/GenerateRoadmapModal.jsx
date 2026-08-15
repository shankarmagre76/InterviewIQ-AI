import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  User,
  Target,
  BrainCircuit,
  FileText,
  Video,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { roadmapService } from '../../services/roadmapService';
import { parseApiError } from '../../utils/helpers';

/**
 * GenerateRoadmapModal Component
 * Interactive modal that explains candidate data analyzed by Gemini AI,
 * displays step-by-step progress during AI generation, and handles
 * rate limiting / server errors gracefully.
 */
export const GenerateRoadmapModal = ({
  isOpen = false,
  onClose = () => {},
  onSuccess = () => {},
  defaultRole = 'Java Full Stack Developer',
  activeRoadmap = null,
}) => {
  const [targetRole, setTargetRole] = useState(defaultRole);
  const [generating, setGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState(null);

  // Sync default target role on open
  useEffect(() => {
    if (isOpen) {
      setTargetRole(activeRoadmap?.targetRole || defaultRole || 'Java Full Stack Developer');
      setError(null);
      setGenerating(false);
      setStepIndex(0);
    }
  }, [isOpen, defaultRole, activeRoadmap]);

  // Handle generation submission
  const handleGenerate = async (e) => {
    if (e) e.preventDefault();

    if (!targetRole.trim()) {
      setError('Please enter a target role to generate your roadmap.');
      return;
    }

    setGenerating(true);
    setError(null);
    setStepIndex(1); // Step 1: Analyzing profile...

    // Timer sequence for step-by-step processing indicators
    const step2Timer = setTimeout(() => setStepIndex(2), 1500); // Step 2: Identifying skill gaps...
    const step3Timer = setTimeout(() => setStepIndex(3), 3000); // Step 3: Building learning path...

    try {
      const response = await roadmapService.generateRoadmap({
        targetRole: targetRole.trim(),
        forceRegenerate: true,
      });

      clearTimeout(step2Timer);
      clearTimeout(step3Timer);

      onSuccess(response?.data || response);
      onClose();
    } catch (err) {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);

      console.error('AI Roadmap Generation Error:', err);
      const is429 = err?.response?.status === 429;
      const parsedMsg = parseApiError(err);

      if (is429) {
        setError('AI Generation Rate Limit Exceeded (10 requests/hour limit). Please wait a few minutes before retrying.');
      } else {
        setError(parsedMsg || 'Failed to generate AI roadmap. Please try again later.');
      }
    } finally {
      setGenerating(false);
      setStepIndex(0);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={generating ? () => {} : onClose}
      title="Generate Your Personalized AI Roadmap"
      size="md"
    >
      <div className="space-y-6">
        
        {/* Intro Subtitle */}
        <p className="text-xs text-slate-400 leading-relaxed">
          AI will analyze your career profile and identify the skills you should focus on next to achieve your target job role.
        </p>

        {/* AI Context Sources Explanation Grid */}
        {!generating && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block">
              What Gemini AI Will Analyze:
            </span>

            <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <User className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="truncate">Career Profile & Level</span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <Target className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">Target Job Role</span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <BrainCircuit className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">Verified Skills</span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">ATS Resume Analysis</span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <Video className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="truncate">Interview Performance</span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="truncate">Identified Skill Gaps</span>
              </div>
            </div>
          </div>
        )}

        {/* Existing Roadmap Archive Warning */}
        {activeRoadmap && !generating && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Archiving Active Roadmap</span>
              Generating a new roadmap will archive your current active roadmap ("{activeRoadmap.title}"). Your progress history will be preserved.
            </div>
          </div>
        )}

        {/* Processing Indicator State */}
        {generating && (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white">Generating AI Learning Curriculum</h4>
              
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className={`flex items-center justify-center gap-2 ${stepIndex >= 1 ? 'text-indigo-300 font-semibold' : 'text-slate-500'}`}>
                  {stepIndex > 1 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Analyzing your profile & interview performance...
                </div>

                <div className={`flex items-center justify-center gap-2 ${stepIndex >= 2 ? 'text-indigo-300 font-semibold' : 'text-slate-500'}`}>
                  {stepIndex > 2 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : stepIndex === 2 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <div className="w-3.5 h-3.5" />}
                  Identifying skill gaps & career milestones...
                </div>

                <div className={`flex items-center justify-center gap-2 ${stepIndex >= 3 ? 'text-indigo-300 font-semibold' : 'text-slate-500'}`}>
                  {stepIndex === 3 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <div className="w-3.5 h-3.5" />}
                  Building your learning path with Gemini AI...
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Inputs */}
        {!generating && (
          <form onSubmit={handleGenerate} className="space-y-4">
            <Input
              label="Target Job Role"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Java Full Stack Developer, Senior Backend Engineer"
              error={error}
              autoFocus
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={generating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={generating}
                leftIcon={<Sparkles className="w-4 h-4" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Generate Roadmap
              </Button>
            </div>
          </form>
        )}

      </div>
    </Modal>
  );
};

export default GenerateRoadmapModal;
