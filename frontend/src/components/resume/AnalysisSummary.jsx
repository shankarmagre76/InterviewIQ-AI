import { Sparkles, Bot } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const AnalysisSummary = ({
  summary = '',
  aiProvider = 'Gemini',
  aiModel = 'gemini-1.5-pro',
  analyzedAt = null,
  className = '',
}) => {
  if (!summary) return null;

  const formattedDate = analyzedAt
    ? new Date(analyzedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recent';

  return (
    <Card variant="glass" className={`border-slate-800 ${className}`.trim()}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>AI Executive Summary</span>
          </CardTitle>

          <Badge variant="neutral" style="soft" size="xs" leftIcon={<Bot className="w-3 h-3 text-cyan-400" />}>
            {aiProvider} • {aiModel}
          </Badge>
        </div>
        <CardDescription>
          Synthesized ATS analysis generated on {formattedDate}.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans shadow-inner space-y-2">
          <p>{summary}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisSummary;
