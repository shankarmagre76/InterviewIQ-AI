import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Users, Video, FileText } from 'lucide-react';


export const AdminDashboardPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Control Center"
        description="Monitor system analytics, active candidate sessions, and platform usage."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card variant="glass">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Registered Candidates</p>
              <h3 className="text-2xl font-bold text-white">1,248</h3>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Mock Sessions</p>
              <h3 className="text-2xl font-bold text-white">4,892</h3>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Resumes Processed</p>
              <h3 className="text-2xl font-bold text-white">3,120</h3>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
