import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Briefcase } from 'lucide-react';

export const JobsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Application Tracker"
        description="Track target companies, interview stages, and customized ATS resumes."
        action={
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Add Application
          </Button>
        }
      />

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Active Applications</CardTitle>
          <CardDescription>Target positions currently in interview stage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Senior Frontend Engineer</h4>
                <p className="text-xs text-slate-400">TechCorp Inc. • Remote</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-cyan-400 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              Technical Round
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobsPage;
