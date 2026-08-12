import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Sparkles, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


export const ResumeOverviewPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Resumes"
        description="Manage your uploaded resume documents and view ATS analysis history."
        action={
          <Button variant="primary" size="sm" onClick={() => navigate('/resume/analysis')} leftIcon={<Sparkles className="w-4 h-4" />}>
            View ATS Analysis Report
          </Button>
        }
      />

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Active Document</CardTitle>
          <CardDescription>Primary candidate resume parsed for ATS scoring.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-indigo-400 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-slate-200">resume_active_2026.pdf</h4>
                <p className="text-xs text-slate-400">PDF Document • 1.2 MB</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/resume/analysis')}>
              Analyze ATS Score
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeOverviewPage;
