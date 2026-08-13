import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, RefreshCw } from 'lucide-react';

import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useResumeAnalysis } from '../../hooks/useResumeAnalysis';
import {
  ATSScoreDashboard,
  ResumeInsights,
  ResumeRecommendations,
  AnalysisHistory,
} from '../../components/resume';

export const ResumeAnalysisPage = () => {
  const location = useLocation();

  const targetResumeId = location.state?.resumeId || null;

  const {
    analysis,
    history,
    loading,
    analyzing,
    progressStage,
    error,
    analyzeResume,
    deleteAnalysis,
    refetch,
  } = useResumeAnalysis({ autoFetch: true });

  const handleRunAnalysis = () => {
    analyzeResume({ resumeId: targetResumeId });
  };

  if (loading && !analysis) {
    return (
      <div className="space-y-6">
        <div className="w-full h-24 rounded-2xl animate-pulse bg-slate-900/80 border border-slate-800" />
        <div className="grid grid-cols-1 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error && !analysis && !analyzing) {
    return (
      <div className="py-8">
        <ErrorState
          title="Resume Analysis Report Unavailable"
          message={error}
          onRetry={refetch}
        />
      </div>
    );
  }

  const missingSkills = analysis?.missingSkills || [];
  const recommendedSkills = analysis?.recommendedSkills || [];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      <PageHeader
        title="ATS Resume Analysis Dashboard"
        description="Google Gemini AI powered ATS evaluation, keyword matching benchmarks, and career recommendations."
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              isLoading={loading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleRunAnalysis}
              isLoading={analyzing}
              leftIcon={<Sparkles className="w-4 h-4 text-cyan-300" />}
            >
              {analysis ? 'Re-Analyze with Gemini AI' : 'Run Gemini AI Analysis'}
            </Button>
          </div>
        }
      />

      {/* 1. Main ATS Score Hero Dashboard & Trend Breakdown */}
      <ATSScoreDashboard
        analysis={analysis}
        history={history}
        onAnalyze={handleRunAnalysis}
        isAnalyzing={analyzing}
        progressStage={progressStage}
      />

      {/* 2. Actionable Step-by-Step Improvements */}
      {analysis && (
        <ResumeRecommendations
          analysis={analysis}
          onReanalyze={handleRunAnalysis}
          isAnalyzing={analyzing}
        />
      )}

      {/* 3. Detailed Skills Gap & AI Recommendations */}
      {analysis && (
        <div className="w-full pt-4 border-t border-slate-800">
          <ResumeInsights
            missingSkills={missingSkills}
            recommendedSkills={recommendedSkills}
            latestAnalysisBreakdown={analysis}
          />
        </div>
      )}

      {/* 4. Complete Time-Series Analysis History & Side-by-Side Comparison */}
      <div className="w-full pt-4 border-t border-slate-800">
        <AnalysisHistory
          history={history}
          loading={loading}
          onReanalyze={handleRunAnalysis}
          onDeleteReport={deleteAnalysis}
        />
      </div>
    </div>
  );
};

export default ResumeAnalysisPage;
