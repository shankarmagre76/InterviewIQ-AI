import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Bookmark } from 'lucide-react';

export const SavedJobsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved Jobs"
        description="Bookmarked job listings saved for future application."
      />

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Bookmarked Positions</CardTitle>
          <CardDescription>Your saved job postings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bookmark className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Staff Backend Engineer</h4>
                <p className="text-xs text-slate-400">DataFlow Systems • Remote</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SavedJobsPage;
