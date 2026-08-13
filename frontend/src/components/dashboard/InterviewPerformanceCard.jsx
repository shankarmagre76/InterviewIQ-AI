import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Award, ArrowRight, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const InterviewPerformanceCard = ({ interviews = {} }) => {
  const navigate = useNavigate();

  const total = interviews?.total ?? 0;
  const completed = interviews?.completed ?? 0;
  const avgScore = interviews?.averageScore ?? 0;
  const bestScore = interviews?.bestScore ?? 0;
  const latestScore = interviews?.latestScore ?? 0;

  return (
    <Card variant="glass" className="w-full flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle as="h3" className="flex items-center gap-2">
            <Video className="w-5 h-5 text-cyan-400" />
            Interview Performance
          </CardTitle>
          <Badge variant="info" style="soft" size="sm">
            {completed} Completed
          </Badge>
        </div>
        <CardDescription>AI mock technical & behavioral evaluations.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {avgScore}
            </span>
            <span className="text-sm text-slate-400 font-medium ml-1.5">Avg Score</span>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-400 block">Best Score</span>
            <span className="text-base font-bold text-emerald-400 flex items-center justify-end gap-1">
              <Award className="w-4 h-4" /> {bestScore}
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-1 text-xs text-slate-300">
          <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400">Latest Session Score</span>
            <span className="font-semibold text-white">{latestScore > 0 ? `${latestScore}%` : 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400">Total Practice Sessions</span>
            <span className="font-semibold text-cyan-300 flex items-center gap-1">
              <Zap className="w-3 h-3" /> {total} total
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={() => navigate('/interviews')}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {completed > 0 ? 'Practice New Session' : 'Start First Session'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InterviewPerformanceCard;
