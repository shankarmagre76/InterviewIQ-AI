import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Bell } from 'lucide-react';

export const NotificationsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay updated with interview feedback, ATS score reports, and system alerts."
      />

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>Your latest system updates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <Bell className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-200">ATS Score Report Generated</p>
              <p className="text-[11px] text-slate-400">Your resume matched 88% of target keywords for Senior Full Stack Engineer.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
