import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Briefcase,
  GraduationCap,
  Code2,
  FolderGit2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export const SectionFeedback = ({ sectionFeedback = {}, className = '' }) => {
  const [openSections, setOpenSections] = useState({
    summary: true,
    experience: true,
    skills: false,
    education: false,
    projects: false,
  });

  if (!sectionFeedback || typeof sectionFeedback !== 'object') return null;

  const sectionConfigs = [
    { key: 'summary', title: 'Professional Summary', icon: FileText },
    { key: 'experience', title: 'Work Experience', icon: Briefcase },
    { key: 'skills', title: 'Technical Skills', icon: Code2 },
    { key: 'projects', title: 'Software Projects', icon: FolderGit2 },
    { key: 'education', title: 'Education & Academics', icon: GraduationCap },
  ];

  // Filter sections that actually exist in sectionFeedback
  const availableSections = sectionConfigs.filter((cfg) => {
    const data = sectionFeedback[cfg.key];
    return data && (typeof data.score === 'number' || (Array.isArray(data.feedback) && data.feedback.length > 0));
  });

  if (availableSections.length === 0) return null;

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card variant="glass" className={`border-slate-800 ${className}`.trim()}>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <span>Section-by-Section AI Feedback</span>
        </CardTitle>
        <CardDescription>
          Detailed score breakdowns and tailored enhancement suggestions for each section.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {availableSections.map((cfg) => {
          const detail = sectionFeedback[cfg.key] || {};
          const score = typeof detail.score === 'number' ? Math.min(100, Math.max(0, detail.score)) : 0;
          const feedbackList = Array.isArray(detail.feedback) ? detail.feedback : [];
          const suggestionsList = Array.isArray(detail.suggestions) ? detail.suggestions : [];
          const isOpen = Boolean(openSections[cfg.key]);
          const IconComp = cfg.icon;

          return (
            <div
              key={cfg.key}
              className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden transition-colors"
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleSection(cfg.key)}
                className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-900/90 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-sm font-bold text-slate-100 block">
                      {cfg.title}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Score: {score}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-24 hidden sm:block">
                    <ProgressBar
                      value={score}
                      variant={score >= 75 ? 'success' : score >= 50 ? 'primary' : 'warning'}
                      size="sm"
                    />
                  </div>

                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Accordion Content */}
              {isOpen && (
                <div className="p-4 pt-1 border-t border-slate-800/80 space-y-4 bg-slate-950/40">
                  {/* Feedback Points */}
                  {feedbackList.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                        Observations & Strengths
                      </span>
                      <div className="space-y-1.5">
                        {feedbackList.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Concrete Suggestions */}
                  {suggestionsList.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-800/60">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block">
                        Recommended Enhancements
                      </span>
                      <div className="space-y-1.5">
                        {suggestionsList.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-indigo-200 bg-indigo-500/5 border border-indigo-500/10 p-2.5 rounded-xl">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default SectionFeedback;
