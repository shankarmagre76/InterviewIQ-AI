import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';

export const ResumeAnalysisPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="ATS Resume Scoring"
        description="Upload your resume to get instant ATS keyword analysis, formatting checks, and action verb fixes."
        action={
          <Button variant="primary" size="sm" leftIcon={<Upload className="w-4 h-4" />}>
            Upload New Resume
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="glass" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>ATS Analysis Overview</CardTitle>
            <CardDescription>Target Role: Senior Fullstack Engineer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <FileText className="w-8 h-8 text-indigo-400 shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-200">resume_john_doe_2026.pdf</h4>
                <p className="text-xs text-slate-400">Parsed on Aug 12, 2026 • PDF document</p>
              </div>
              <span className="text-xl font-bold text-emerald-400">88% Match</span>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle>Action Items</CardTitle>
            <CardDescription>Recommendations to reach 95%+ match score.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Add metrics to Project Achievements</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Include GraphQL in Skills section</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResumeAnalysisPage;
