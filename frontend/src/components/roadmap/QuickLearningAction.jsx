import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Sparkles, ArrowRight, Play } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

/**
 * QuickLearningAction Component
 * Compact dashboard widget providing a direct "Continue Learning" or "Generate Roadmap" CTA button.
 */
export const QuickLearningAction = ({
  roadmap = null,
  progress = 0,
  className = '',
}) => {
  const navigate = useNavigate();
  const hasRoadmap = Boolean(roadmap);

  return (
    <Card variant="glass" className={`w-full overflow-hidden ${className}`.trim()}>
      <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
            {hasRoadmap ? <Compass className="w-6 h-6" /> : <Sparkles className="w-6 h-6 text-cyan-400" />}
          </div>

          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-white">
              {hasRoadmap ? 'Active AI Learning Roadmap' : 'Generate AI Learning Roadmap'}
            </h4>
            <p className="text-xs text-slate-400">
              {hasRoadmap
                ? `${progress}% Completed • Keep your daily learning streak active`
                : 'Get a personalized step-by-step skill roadmap for your target role'}
            </p>
          </div>
        </div>

        <Button
          variant={hasRoadmap ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => navigate('/roadmap')}
          leftIcon={hasRoadmap ? <Play className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          className="shrink-0 w-full sm:w-auto"
        >
          {hasRoadmap ? 'Continue Learning' : 'Generate Roadmap'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickLearningAction;
