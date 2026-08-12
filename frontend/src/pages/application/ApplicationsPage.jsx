import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { FileCheck } from 'lucide-react';

export const ApplicationsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Job Applications"
        description="Track all submitted job applications and recruiter interview stages."
      />

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Submitted Applications</CardTitle>
          <CardDescription>Status tracker across target employers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Senior Fullstack Developer</h4>
                <p className="text-xs text-slate-400">TechCorp Solutions • Submitted Aug 10, 2026</p>
              </div>
            </div>
            <Badge variant="success" style="soft">In Review</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationsPage;
