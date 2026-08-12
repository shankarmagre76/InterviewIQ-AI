import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';

export const SettingsPage = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Account & System Settings"
        description="Configure notifications, security credentials, and AI preference controls."
      />

      <Card variant="glass">
        <CardHeader>
          <CardTitle>System Preferences</CardTitle>
          <CardDescription>Manage security and alert preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span>Email Notifications on Interview Reports</span>
            <span className="text-emerald-400 font-semibold">Enabled</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
