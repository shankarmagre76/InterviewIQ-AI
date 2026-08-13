import React from 'react';
import { AlertCircle, Sparkles, CheckCircle2, PlusCircle, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

/**
 * ResumeInsights Component
 * Renders AI-extracted missing skills, recommended skills to add,
 * and section-by-section ATS score breakdown.
 */
export const ResumeInsights = ({
  missingSkills = [],
  recommendedSkills = [],
  latestAnalysisBreakdown = null,
  className = '',
}) => {
  const sectionScores = latestAnalysisBreakdown?.sectionScores;
  const hasMissing = missingSkills && missingSkills.length > 0;
  const hasRecommended = recommendedSkills && recommendedSkills.length > 0;

  return (
    <Card variant="glass" className={`w-full flex flex-col justify-between ${className}`.trim()}>
      <CardHeader className="pb-4">
        <CardTitle as="h3" className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          ATS AI Resume Insights
        </CardTitle>
        <CardDescription>Targeted skill gaps & recommendations to maximize ATS pass rate.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Section Breakdown Progress Bars (Summary, Experience, Education, Skills, Projects) */}
        {sectionScores && (
          <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Section ATS Breakdown
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(sectionScores).map(([section, score]) => (
                <ProgressBar
                  key={section}
                  value={score}
                  label={section.charAt(0).toUpperCase() + section.slice(1)}
                  color={score >= 80 ? 'emerald' : score >= 60 ? 'indigo' : 'amber'}
                  size="sm"
                />
              ))}
            </div>
          </div>
        )}

        {/* Missing Skills Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Missing Technical Keywords ({missingSkills.length})
            </h4>
          </div>

          {hasMissing ? (
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="danger"
                  style="soft"
                  size="sm"
                  icon={<AlertCircle className="w-3 h-3" />}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic p-3 rounded-xl bg-slate-900/30 border border-slate-800">
              No critical technical keywords missing from your active resume. Great job!
            </p>
          )}
        </div>

        {/* Recommended Skills Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5" />
              Recommended Keywords to Add ({recommendedSkills.length})
            </h4>
          </div>

          {hasRecommended ? (
            <div className="flex flex-wrap gap-2">
              {recommendedSkills.map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="info"
                  style="soft"
                  size="sm"
                  icon={<CheckCircle2 className="w-3 h-3" />}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic p-3 rounded-xl bg-slate-900/30 border border-slate-800">
              All recommended industry keywords are present in your resume.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeInsights;
