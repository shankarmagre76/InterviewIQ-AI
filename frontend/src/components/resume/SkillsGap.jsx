import React from 'react';
import { Code2, AlertTriangle, Sparkles, Plus, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const SkillsGap = ({
  missingSkills = [],
  recommendedSkills = [],
  className = '',
}) => {
  const hasMissing = Array.isArray(missingSkills) && missingSkills.length > 0;
  const hasRecommended = Array.isArray(recommendedSkills) && recommendedSkills.length > 0;

  if (!hasMissing && !hasRecommended) return null;

  return (
    <Card variant="glass" className={`border-slate-800 ${className}`.trim()}>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Code2 className="w-5 h-5 text-indigo-400" />
          <span>Technical Skills Gap & Recommendations</span>
        </CardTitle>
        <CardDescription>
          Identify missing tech stack keywords and recommended skills for target software roles.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Missing Skills Grid */}
        {hasMissing && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Missing High-Priority ATS Skills ({missingSkills.length})</span>
            </h4>

            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="danger"
                  style="soft"
                  size="sm"
                  className="font-mono"
                >
                  + {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Skills Grid */}
        {hasRecommended && (
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Recommended Skills to Add ({recommendedSkills.length})</span>
            </h4>

            <div className="flex flex-wrap gap-2">
              {recommendedSkills.map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="primary"
                  style="soft"
                  size="sm"
                  className="font-mono"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillsGap;
