import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';

export const AdminCompaniesPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Company Management"
        description="Approve and manage hiring company profiles."
      />
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Company Registrations</CardTitle>
          <CardDescription>System hiring companies.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-400">Company administration grid.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCompaniesPage;
