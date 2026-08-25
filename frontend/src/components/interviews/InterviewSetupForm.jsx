import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Target,
  BarChart3,
  Clock,
  Layers,
  Play,
  Cpu,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Alert } from '../ui/Alert';
import { interviewService } from '../../services/interviewService';

// Backend supported enum constants
const INTERVIEW_TYPES = [
  {
    value: 'Technical',
    label: 'Technical',
    description: 'Coding, Data Structures, System Design, and Core Architecture',
    badge: 'Popular',
    color: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30 text-indigo-400',
  },
  {
    value: 'HR',
    label: 'HR & Cultural',
    description: 'Career background, motivation, soft skills, and workplace fit',
    badge: 'Essential',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
  },
  {
    value: 'Behavioral',
    label: 'Behavioral',
    description: 'STAR methodology, situational challenges, and leadership principles',
    badge: 'Recommended',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
  },
  {
    value: 'Mixed',
    label: 'Mixed / Hybrid',
    description: 'Comprehensive evaluation combining Technical, HR, and Behavioral scenarios',
    badge: 'Full Suite',
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
  },
];

const DIFFICULTY_LEVELS = [
  {
    value: 'Beginner',
    label: 'Beginner (Easy)',
    description: 'Foundational concepts, junior role questions, and basic syntax/principles',
    icon: '🌱',
  },
  {
    value: 'Intermediate',
    label: 'Intermediate (Medium)',
    description: 'Practical problem-solving, mid-level engineering, and optimization scenarios',
    icon: '⚡',
  },
  {
    value: 'Advanced',
    label: 'Advanced (Hard)',
    description: 'Deep system design, architectural trade-offs, edge cases, and senior-level challenges',
    icon: '🔥',
  },
];

const COMMON_ROLES = [
  'Software Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Engineer',
  'DevOps & Cloud Engineer',
  'Mobile Developer (iOS/Android)',
  'Data Engineer / Data Scientist',
  'Product Manager',
  'System Architect',
  'Custom Role',
];

const QUESTION_COUNT_PRESETS = [3, 5, 10, 15, 20];

export const InterviewSetupForm = ({ onCreatedSuccess }) => {
  const navigate = useNavigate();

  // Form State initialized with sensible backend-compatible defaults
  const [rolePreset, setRolePreset] = useState('Software Engineer');
  const [customRole, setCustomRole] = useState('');
  const [interviewType, setInterviewType] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [estimatedDuration, setEstimatedDuration] = useState(30);
  const [mode] = useState('Text');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  // Compute actual role string
  const activeRole = rolePreset === 'Custom Role' ? customRole.trim() : rolePreset;

  // Handle Question Count change and auto-adjust estimated duration
  const handleQuestionCountChange = (count) => {
    const num = Math.max(1, Math.min(50, Number(count) || 1));
    setTotalQuestions(num);
    // Sensible duration calculation: ~5-6 minutes per question
    setEstimatedDuration(Math.max(5, Math.min(180, num * 6)));
    if (errors.totalQuestions) {
      setErrors((prev) => ({ ...prev, totalQuestions: null }));
    }
  };

  // Client-side Validation
  const validateForm = () => {
    const newErrors = {};

    if (!activeRole) {
      newErrors.role = 'Target role is required';
    } else if (activeRole.length > 100) {
      newErrors.role = 'Role name cannot exceed 100 characters';
    }

    if (!['Technical', 'HR', 'Behavioral', 'Mixed'].includes(interviewType)) {
      newErrors.interviewType = 'Please select a valid interview type';
    }

    if (!['Beginner', 'Intermediate', 'Advanced'].includes(difficulty)) {
      newErrors.difficulty = 'Please select a valid difficulty level';
    }

    if (!totalQuestions || totalQuestions < 1 || totalQuestions > 50) {
      newErrors.totalQuestions = 'Number of questions must be between 1 and 50';
    }

    if (!estimatedDuration || estimatedDuration < 1 || estimatedDuration > 180) {
      newErrors.estimatedDuration = 'Estimated duration must be between 1 and 180 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        role: activeRole,
        interviewType,
        difficulty,
        totalQuestions: Number(totalQuestions),
        estimatedDuration: Number(estimatedDuration),
        mode,
      };

      const response = await interviewService.startInterview(payload);
      const sessionData = response?.data?.interview || response?.data;
      const interviewId = sessionData?._id || sessionData?.id;

      if (interviewId) {
        if (onCreatedSuccess) {
          onCreatedSuccess(sessionData);
        } else {
          navigate(`/interviews/${interviewId}`);
        }
      } else {
        throw new Error('Interview session created but no ID was returned by backend.');
      }
    } catch (err) {
      console.error('Failed to create interview session:', err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to start AI interview. Please check your configuration and try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {/* Top Banner Error Alert */}
      {apiError && (
        <Alert
          variant="danger"
          title="Interview Generation Failed"
          message={apiError}
          onClose={() => setApiError(null)}
        />
      )}

      {/* Card Wrapper */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-8">
        
        {/* Header Title & Subtitle */}
        <div className="flex items-start justify-between border-b border-slate-800/80 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Start AI Mock Interview
              </h2>
            </div>
            <p className="text-sm text-slate-400 pl-12">
              Configure your interview parameters. Gemini AI will construct custom domain questions tailored to your role and difficulty.
            </p>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Powered by Gemini AI
          </span>
        </div>

        {/* Form Grid */}
        <div className="space-y-8">
          
          {/* Section 1: Target Role */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="target-role-select" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" /> Target Role
              </label>
              <span className="text-xs text-slate-500">e.g. Full Stack Engineer</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                id="target-role-select"
                label=""
                value={rolePreset}
                onChange={(e) => {
                  setRolePreset(e.target.value);
                  if (errors.role) setErrors((prev) => ({ ...prev, role: null }));
                }}
                disabled={loading}
                error={errors.role && rolePreset !== 'Custom Role' ? errors.role : undefined}
                options={COMMON_ROLES.map((r) => ({ label: r, value: r }))}
              />

              {rolePreset === 'Custom Role' ? (
                <Input
                  id="custom-role-input"
                  placeholder="Enter custom job title..."
                  value={customRole}
                  onChange={(e) => {
                    setCustomRole(e.target.value);
                    if (errors.role) setErrors((prev) => ({ ...prev, role: null }));
                  }}
                  disabled={loading}
                  error={errors.role}
                  autoFocus
                />
              ) : (
                <div className="flex items-center px-4 py-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
                  Targeting <strong className="text-slate-200 ml-1">{activeRole}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Interview Type Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" /> Interview Type
              </label>
              {errors.interviewType && (
                <span className="text-xs text-rose-400 font-medium">{errors.interviewType}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {INTERVIEW_TYPES.map((type) => {
                const isSelected = interviewType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setInterviewType(type.value);
                      if (errors.interviewType) setErrors((prev) => ({ ...prev, interviewType: null }));
                    }}
                    className={`
                      relative flex flex-col justify-between p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/50
                      ${
                        isSelected
                          ? 'bg-slate-800/90 border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }
                      ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border bg-gradient-to-r ${type.color}`}>
                          {type.badge}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-700'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-100">{type.label}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{type.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Difficulty & Mode */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Difficulty Cards */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" /> Difficulty Level
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                {DIFFICULTY_LEVELS.map((lvl) => {
                  const isSelected = difficulty === lvl.value;
                  return (
                    <button
                      key={lvl.value}
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setDifficulty(lvl.value);
                        if (errors.difficulty) setErrors((prev) => ({ ...prev, difficulty: null }));
                      }}
                      className={`
                        flex items-start justify-between p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer outline-none
                        ${
                          isSelected
                            ? 'bg-slate-800/90 border-indigo-500 ring-1 ring-indigo-500/50'
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                        }
                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg">{lvl.icon}</span>
                        <div>
                          <div className="text-xs font-semibold text-slate-100">{lvl.label}</div>
                          <div className="text-[11px] text-slate-400">{lvl.description}</div>
                        </div>
                      </div>

                      <div
                        className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${
                          isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-700'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Questions & Duration */}
            <div className="space-y-6 flex flex-col justify-between">
              
              {/* Question Count Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="question-count-input" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-400" /> Number of Questions
                  </label>
                  <span className="text-xs font-semibold text-indigo-400">{totalQuestions} Questions</span>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-2">
                  {QUESTION_COUNT_PRESETS.map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      disabled={loading}
                      onClick={() => handleQuestionCountChange(cnt)}
                      className={`
                        px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer
                        ${
                          totalQuestions === cnt
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                            : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                        }
                      `}
                    >
                      {cnt} Qs
                    </button>
                  ))}
                </div>

                <Input
                  id="question-count-input"
                  type="number"
                  min="1"
                  max="50"
                  value={totalQuestions}
                  onChange={(e) => handleQuestionCountChange(e.target.value)}
                  disabled={loading}
                  error={errors.totalQuestions}
                  helperText="Select preset or enter custom question count (1 to 50)"
                />
              </div>

              {/* Estimated Duration */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Estimated Duration</div>
                    <div className="text-[11px] text-slate-400">Calculated based on question depth</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold text-white">{estimatedDuration} mins</div>
                  <div className="text-[10px] text-slate-500">~{Math.round(estimatedDuration / totalQuestions)} mins / Q</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-slate-800/80 pt-6 flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/interviews')}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            disabled={loading}
            leftIcon={<Play className="w-5 h-5 fill-current" />}
            className="px-8 shadow-indigo-500/30"
          >
            {loading ? 'Generating AI Questions...' : 'Start Interview'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default InterviewSetupForm;
