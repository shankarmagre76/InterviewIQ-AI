import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Building2 } from 'lucide-react';

export const CompaniesPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Hiring Companies"
        description="Browse partner companies actively hiring technical candidates."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="glass">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2 border border-indigo-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <CardTitle>TechCorp Solutions</CardTitle>
            <CardDescription>Software & Cloud Infrastructure • Remote</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400">12 Active Technical Postings</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompaniesPage;
