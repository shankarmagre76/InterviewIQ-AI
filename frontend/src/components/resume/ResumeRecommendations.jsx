import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  RefreshCw,
  FileText,
  Briefcase,
  Code2,
  FolderGit2,
  GraduationCap,
  Lightbulb,
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const ResumeRecommendations = ({
  analysis = null,
  onReanalyze,
  isAnalyzing = false,
  className = '',
}) => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');

  /**
   * Helper to normalize raw backend recommendation strings & section suggestions
   * into structured actionable recommendation items.
   */
  const recommendationsList = useMemo(() => {
    if (!analysis) return [];

    const items = [];
    let counter = 1;

    // 1. Process Main AI Recommendations
    const rawRecs = Array.isArray(analysis.recommendations) ? analysis.recommendations : [];
    rawRecs.forEach((text, idx) => {
      const lower = text.toLowerCase();
      let priority = 'High';
      let sectionKey = 'experience';
      let sectionLabel = 'Work Experience Section';

      if (lower.includes('skill') || lower.includes('keyword') || lower.includes('technology')) {
        sectionKey = 'skills';
        sectionLabel = 'Technical Skills';
        priority = idx === 0 ? 'Critical' : 'High';
      } else if (lower.includes('project') || lower.includes('github') || lower.includes('portfolio')) {
        sectionKey = 'projects';
        sectionLabel = 'Software Projects';
        priority = 'Medium';
      } else if (lower.includes('summary') || lower.includes('headline') || lower.includes('bio')) {
        sectionKey = 'personal-info';
        sectionLabel = 'Profile & Summary';
        priority = 'Medium';
      } else if (lower.includes('education') || lower.includes('degree') || lower.includes('gpa')) {
        sectionKey = 'education';
        sectionLabel = 'Education Section';
        priority = 'Low';
      } else if (idx === 0) {
        priority = 'Critical';
      }

      items.push({
        id: `rec-${counter++}`,
        title: text.split('.')[0] || text,
        problem: text,
        suggestion: lower.includes('quantify') || lower.includes('metric')
          ? 'Example: "Optimized REST API database queries, improving endpoint response latency by 35%."'
          : lower.includes('skill')
          ? 'Example: Add missing keywords like Docker, TypeScript, and AWS directly to your skills section.'
          : 'Example: Structure bullet points starting with strong action verbs (e.g. Engineered, Architected, Spearheaded).',
        sectionKey,
        sectionLabel,
        priority,
      });
    });

    // 2. Process Section Feedback Suggestions
    if (analysis.sectionFeedback && typeof analysis.sectionFeedback === 'object') {
      Object.entries(analysis.sectionFeedback).forEach(([secKey, secData]) => {
        if (secData && Array.isArray(secData.suggestions)) {
          secData.suggestions.forEach((sug) => {
            // Avoid exact duplicate text
            if (!items.some((it) => it.problem.toLowerCase() === sug.toLowerCase())) {
              items.push({
                id: `sec-${counter++}`,
                title: sug.split('.')[0] || sug,
                problem: sug,
                suggestion: `Enhance your ${secKey} section to increase ATS keyword matching density.`,
                sectionKey: secKey === 'summary' ? 'personal-info' : secKey,
                sectionLabel: `${secKey.charAt(0).toUpperCase() + secKey.slice(1)} Section`,
                priority: secData.score < 60 ? 'High' : 'Medium',
              });
            }
          });
        }
      });
    }

    return items;
  }, [analysis]);

  // Filter recommendations based on selected tab
  const filteredItems = useMemo(() => {
    if (selectedFilter === 'critical') {
      return recommendationsList.filter(
        (it) => it.priority === 'Critical' || it.priority === 'High'
      );
    }
    return recommendationsList;
  }, [recommendationsList, selectedFilter]);

  if (!analysis || recommendationsList.length === 0) return null;

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical':
        return (
          <Badge variant="danger" style="soft" size="xs">
            🔴 Critical Priority
          </Badge>
        );
      case 'High':
        return (
          <Badge variant="warning" style="soft" size="xs">
            ⚠️ High Priority
          </Badge>
        );
      case 'Medium':
        return (
          <Badge variant="primary" style="soft" size="xs">
            🔹 Medium Priority
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" style="soft" size="xs">
            ⚪ Low Priority
          </Badge>
        );
    }
  };

  const getSectionIcon = (sectionKey) => {
    switch (sectionKey) {
      case 'skills':
        return Code2;
      case 'projects':
        return FolderGit2;
      case 'education':
        return GraduationCap;
      case 'personal-info':
        return FileText;
      default:
        return Briefcase;
    }
  };

  const handleNavigateSection = (sectionKey) => {
    navigate('/profile', { state: { activeTab: sectionKey } });
  };

  return (
    <Card variant="glass" className={`border-slate-800 ${className}`.trim()}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <span>Actionable Resume Improvements ({recommendationsList.length})</span>
          </CardTitle>

          {/* Filter Action Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({recommendationsList.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('critical')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedFilter === 'critical'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              High & Critical
            </button>
          </div>
        </div>
        <CardDescription>
          Clear step-by-step enhancements converted from your backend Google Gemini AI analysis.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Recommendation Cards List */}
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const IconComp = getSectionIcon(item.sectionKey);

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 transition-all space-y-3"
              >
                {/* Card Top Header: Priority Badge & Related Section */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {getPriorityBadge(item.priority)}

                  <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <IconComp className="w-3 h-3 text-indigo-400" />
                    <span>{item.sectionLabel}</span>
                  </span>
                </div>

                {/* Problem & Impact Description */}
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.problem}</p>
                </div>

                {/* Suggested Concrete Example */}
                {item.suggestion && (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
                    <span className="text-[11px] font-bold text-indigo-400 block uppercase">
                      Suggested Fix / Example:
                    </span>
                    <p className="text-slate-300 italic">{item.suggestion}</p>
                  </div>
                )}

                {/* Action Link to Profile Section */}
                <div className="flex items-center justify-end pt-1">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => handleNavigateSection(item.sectionKey)}
                    className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 group"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />}
                  >
                    Update in Profile
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA: Re-Analyze Resume */}
        {onReanalyze && (
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              Updated your profile or resume? Re-run AI evaluation to calculate your new ATS score.
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={onReanalyze}
              isLoading={isAnalyzing}
              leftIcon={<RefreshCw className="w-4 h-4 text-cyan-300" />}
              className="shrink-0"
            >
              Re-Analyze Resume
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeRecommendations;
