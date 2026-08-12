import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ScoreChart } from '../../components/charts/ScoreChart';
import { Sparkles, FileText, Video, Map, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Candidate Dashboard"
        description="Overview of your ATS resume scores, mock interview performance, and learning roadmaps."
        action={
          <Button variant="primary" size="sm" onClick={() => navigate('/interviews')} leftIcon={<Sparkles className="w-4 h-4" />}>
            Start AI Interview
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card variant="glass">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">ATS Resume Score</p>
              <h3 className="text-2xl font-bold text-white">88 <span className="text-xs text-slate-500 font-normal">/ 100</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Completed Interviews</p>
              <h3 className="text-2xl font-bold text-white">6 <span className="text-xs text-slate-500 font-normal">sessions</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Roadmap Progress</p>
              <h3 className="text-2xl font-bold text-white">72% <span className="text-xs text-slate-500 font-normal">completed</span></h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="glass" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Skill Breakdown Analytics</CardTitle>
            <CardDescription>Multi-dimensional score breakdown across recent interview questions.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScoreChart />
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest milestones & AI feedback.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">System Design Session</span>
                <Badge variant="success" size="sm">90%</Badge>
              </div>
              <p className="text-xs text-slate-400">Evaluated 2 hours ago by Gemini 1.5 Pro</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">Resume Uploaded</span>
                <Badge variant="primary" size="sm">ATS Parsed</Badge>
              </div>
              <p className="text-xs text-slate-400">Senior Full Stack Engineer Role</p>
            </div>

            <Button variant="outline" size="sm" fullWidth onClick={() => navigate('/interviews')} rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All Activity
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
