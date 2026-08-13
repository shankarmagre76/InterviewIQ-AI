import React from 'react';
import { AnalysisSummary } from './AnalysisSummary';
import { StrengthsList } from './StrengthsList';
import { WeaknessesList } from './WeaknessesList';
import { SkillsGap } from './SkillsGap';
import { KeywordAnalysis } from './KeywordAnalysis';
import { SectionFeedback } from './SectionFeedback';

export const ResumeInsights = ({
  missingSkills = [],
  recommendedSkills = [],
  latestAnalysisBreakdown = null,
  className = '',
}) => {
  const analysis = latestAnalysisBreakdown || {};

  return (
    <div className={`space-y-6 ${className}`.trim()}>
      {/* 1. AI Executive Summary */}
      {analysis.summary && (
        <AnalysisSummary
          summary={analysis.summary}
          aiProvider={analysis.aiProvider}
          aiModel={analysis.aiModel}
          analyzedAt={analysis.analyzedAt}
        />
      )}

      {/* 2. Strengths & Weaknesses 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StrengthsList strengths={analysis.strengths || []} />
        <WeaknessesList
          weaknesses={analysis.weaknesses || []}
          recommendations={analysis.recommendations || []}
        />
      </div>

      {/* 3. Technical Skills Gap */}
      <SkillsGap
        missingSkills={missingSkills.length > 0 ? missingSkills : analysis.missingSkills || []}
        recommendedSkills={recommendedSkills.length > 0 ? recommendedSkills : analysis.recommendedSkills || []}
      />

      {/* 4. Keyword & Formatting Feedback */}
      <KeywordAnalysis
        keywordFeedback={analysis.keywordFeedback || []}
        grammarFeedback={analysis.grammarFeedback || []}
        formattingFeedback={analysis.formattingFeedback || []}
      />

      {/* 5. Section-by-Section Collapsible Accordion Feedback */}
      {analysis.sectionFeedback && (
        <SectionFeedback sectionFeedback={analysis.sectionFeedback} />
      )}
    </div>
  );
};

export default ResumeInsights;
