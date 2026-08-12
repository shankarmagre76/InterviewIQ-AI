import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';

export const AdminApplicationsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Application Monitoring"
        description="Monitor system-wide candidate job application pipelines."
      />
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Application Pipeline</CardTitle>
          <CardDescription>Platform application metrics.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-400">Application monitoring grid.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminApplicationsPage;
