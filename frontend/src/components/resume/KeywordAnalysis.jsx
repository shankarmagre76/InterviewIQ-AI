import React from 'react';
import { Search, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';

export const KeywordAnalysis = ({
  keywordFeedback = [],
  grammarFeedback = [],
  formattingFeedback = [],
  className = '',
}) => {
  const hasKeyword = Array.isArray(keywordFeedback) && keywordFeedback.length > 0;
  const hasFormatting = Array.isArray(formattingFeedback) && formattingFeedback.length > 0;
  const hasGrammar = Array.isArray(grammarFeedback) && grammarFeedback.length > 0;

  if (!hasKeyword && !hasFormatting && !hasGrammar) return null;

  return (
    <Card variant="glass" className={`border-slate-800 ${className}`.trim()}>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Search className="w-5 h-5 text-cyan-400" />
          <span>ATS Keyword & Formatting Analysis</span>
        </CardTitle>
        <CardDescription>
          Detailed feedback on keyword placement, resume formatting, and grammatical consistency.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Keyword Feedback Section */}
        {hasKeyword && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Keyword Optimization Feedback
            </h4>
            <div className="space-y-2">
              {keywordFeedback.map((fb, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs sm:text-sm text-cyan-200 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{fb}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formatting & Layout Feedback Section */}
        {hasFormatting && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Formatting & Document Layout
            </h4>
            <div className="space-y-2">
              {formattingFeedback.map((fb, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs sm:text-sm text-slate-300 flex items-start gap-2.5"
                >
                  <Layers className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{fb}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grammar Feedback Section */}
        {hasGrammar && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Grammar & Style Adjustments
            </h4>
            <div className="space-y-2">
              {grammarFeedback.map((fb, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs sm:text-sm text-amber-200 flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{fb}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KeywordAnalysis;
