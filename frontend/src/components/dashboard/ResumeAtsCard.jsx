import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, TrendingUp, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const ResumeAtsCard = ({ resume = {} }) => {
  const navigate = useNavigate();

  const hasResume = resume?.hasResume || false;
  const score = resume?.latestATSScore ?? 0;
  const previousScore = resume?.previousATSScore ?? 0;
  const improvement = resume?.scoreImprovement ?? (score > 0 && previousScore > 0 ? score - previousScore : 0);
  const count = resume?.analysisCount ?? 0;

  return (
    <Card variant="glass" className="w-full flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle as="h3" className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Resume ATS Score
          </CardTitle>
          <Badge
            variant={hasResume ? 'success' : 'neutral'}
            style="soft"
            size="sm"
          >
            {hasResume ? 'Active' : 'No Resume'}
          </Badge>
        </div>
        <CardDescription>AI keyword matching & format analysis.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {score}
            </span>
            <span className="text-sm text-slate-400 font-medium ml-1.5">/ 100</span>
          </div>

          {improvement !== 0 && (
            <Badge
              variant={improvement > 0 ? 'success' : 'danger'}
              style="soft"
              size="sm"
              icon={<TrendingUp className="w-3 h-3" />}
            >
              {improvement > 0 ? `+${improvement}%` : `${improvement}%`} vs last
            </Badge>
          )}
        </div>

        <div className="space-y-2 pt-1 text-xs text-slate-300">
          <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400">Analyses Conducted</span>
            <span className="font-semibold text-white">{count} scans</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400">ATS Parsing Engine</span>
            <span className="font-semibold text-indigo-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Gemini AI
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={() => navigate('/resumes')}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {hasResume ? 'View ATS Breakdown' : 'Upload Resume'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResumeAtsCard;
