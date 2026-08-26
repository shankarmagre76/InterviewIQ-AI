import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { ActivityItem } from './ActivityItem';

/**
 * RecentActivity Component
 * Renders paginated or dashboard-limited stream of candidate activities.
 */
export const RecentActivity = ({
  activities = [],
  limit = 5,
  showFooter = true,
  className = '',
}) => {
  const navigate = useNavigate();

  // Limit display to reasonable number for dashboard views
  const displayActivities = activities && Array.isArray(activities)
    ? activities.slice(0, limit)
    : [];

  return (
    <Card variant="glass" className={`w-full flex flex-col justify-between ${className}`.trim()}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle as="h3" className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Recent Activity Stream
          </CardTitle>
          <Badge variant="neutral" style="soft" size="sm">
            Live Stream
          </Badge>
        </div>
        <CardDescription>Latest resume scans, mock interview ratings, and job application events.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {displayActivities.length > 0 ? (
          <div className="space-y-2.5" role="list" aria-label="Recent Candidate Activity Stream">
            {displayActivities.map((act, idx) => (
              <ActivityItem
                key={act.id || act._id || idx}
                activity={act}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Sparkles className="w-8 h-8 text-indigo-400" />}
            title="No Recent Activity Recorded"
            description="Start by scanning your resume or launching an AI mock interview session to populate your stream."
            className="py-8"
          />
        )}
      </CardContent>

      {showFooter && displayActivities.length > 0 && (
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
      )}
    </Card>
  );
};

export default RecentActivity;
