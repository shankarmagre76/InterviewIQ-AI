import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';

export const AdminUsersPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin User Management"
        description="Manage candidate accounts, recruiters, roles, and status activations."
      />
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
          <CardDescription>System candidate registry.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-400">User management administration table.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
