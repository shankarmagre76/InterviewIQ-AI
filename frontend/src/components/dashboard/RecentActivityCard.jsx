import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Video, FileText, Briefcase, User, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

const getActivityIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'interview':
    case 'interviews':
      return <Video className="w-4 h-4 text-cyan-400" />;
    case 'resume':
    case 'resumes':
      return <FileText className="w-4 h-4 text-indigo-400" />;
    case 'application':
    case 'applications':
    case 'job':
      return <Briefcase className="w-4 h-4 text-emerald-400" />;
    case 'profile':
      return <User className="w-4 h-4 text-amber-400" />;
    default:
      return <Activity className="w-4 h-4 text-purple-400" />;
  }
};

const formatTimestamp = (rawDate) => {
  if (!rawDate) return 'Just now';
  try {
    const date = new Date(rawDate);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Recently';
  }
};

export const RecentActivityCard = ({ recentActivity = [] }) => {
  const navigate = useNavigate();

  return (
    <Card variant="glass" className="w-full flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle as="h3" className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Recent Activity
          </CardTitle>
          <Badge variant="neutral" style="soft" size="sm">
            Live Stream
          </Badge>
        </div>
        <CardDescription>Latest candidate evaluations, uploads & applications.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {recentActivity && recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((activity, idx) => (
              <div
                key={activity.id || activity._id || idx}
                className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-850 border border-slate-750 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                  {getActivityIcon(activity.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold text-slate-200 truncate">
                      {activity.title || activity.action || 'Activity Event'}
                    </h4>
                    {activity.score !== undefined && (
                      <Badge variant="success" size="sm">
                        {activity.score}%
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {activity.description || activity.details || 'Candidate action recorded'}
                  </p>

                  <span className="text-[11px] text-slate-400 block mt-1">
                    {formatTimestamp(activity.createdAt || activity.timestamp || activity.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Sparkles className="w-8 h-8 text-indigo-400" />}
            title="No Recent Activity Yet"
            description="Start by scanning your resume or practicing a mock interview session."
            className="py-6"
          />
        )}
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={() => navigate('/interviews')}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          View Activity History
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecentActivityCard;
