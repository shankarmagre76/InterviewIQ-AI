import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, CheckCircle, Flame, ArrowRight, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';

export const LearningProgressCard = ({ profile = {} }) => {
  const navigate = useNavigate();
  const skillsCount = profile?.skillsCount || 0;
  
  // Default estimated roadmap progress based on skills & profile completion
  const completionPercentage = profile?.completionPercentage ?? 0;
  const roadmapProgress = Math.min(100, Math.round(completionPercentage * 0.85 + (skillsCount > 0 ? 15 : 0)));

  return (
    <Card variant="glass" className="w-full flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle as="h3" className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            Learning Progress
          </CardTitle>
          <Badge variant="warning" style="soft" size="sm">
            Active Track
          </Badge>
        </div>
        <CardDescription>Personalized AI skill roadmap & study goals.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Role Mastery Roadmap</span>
            <span className="text-xs font-bold text-amber-300">{roadmapProgress}% Completed</span>
          </div>

          <ProgressBar
            value={roadmapProgress}
            showPercentage={false}
            color="amber"
            size="md"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
            <span className="text-slate-400 block flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Profile Skills
            </span>
            <span className="text-base font-bold text-white block">{skillsCount} added</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
            <span className="text-slate-400 block flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Practice Streak
            </span>
            <span className="text-base font-bold text-orange-300 block">3 Days</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={() => navigate('/roadmaps')}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Continue Learning Roadmap
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LearningProgressCard;
