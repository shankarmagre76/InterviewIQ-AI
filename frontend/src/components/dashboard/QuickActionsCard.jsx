import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Video, Briefcase, Compass, ArrowUpRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';

const ACTIONS = [
  {
    id: 'analyze-resume',
    title: 'Analyze Resume',
    description: 'Scan & score resume against job description',
    icon: FileText,
    path: '/resumes',
    accentColor: 'indigo',
    iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20',
  },
  {
    id: 'start-interview',
    title: 'Start Mock Interview',
    description: 'Practice real-time technical & HR sessions',
    icon: Video,
    path: '/interviews',
    accentColor: 'cyan',
    iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20',
  },
  {
    id: 'browse-jobs',
    title: 'Browse Jobs',
    description: 'Search tailored tech jobs & apply directly',
    icon: Briefcase,
    path: '/jobs',
    accentColor: 'emerald',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
  },
  {
    id: 'continue-learning',
    title: 'Continue Learning',
    description: 'Follow personalized AI career skill roadmap',
    icon: Compass,
    path: '/roadmaps',
    accentColor: 'amber',
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
  },
];

export const QuickActionsCard = () => {
  const navigate = useNavigate();

  return (
    <Card variant="glass" className="w-full">
      <CardHeader className="pb-4">
        <CardTitle as="h2">Quick Actions</CardTitle>
        <CardDescription>Launch key candidate tools to accelerate your interview preparation.</CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => navigate(action.path)}
                className="group relative flex flex-col justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-850 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <div className="flex items-start justify-between w-full mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-200 ${action.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {action.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
