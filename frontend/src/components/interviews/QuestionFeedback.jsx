import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Bot, Check, X, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const QuestionFeedback = ({ questions = [] }) => {
  const [expandedIndex, setExpandedIndex] = useState(0);

  if (!questions || questions.length === 0) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-400" /> Question-by-Question AI Analysis
          </h3>
          <p className="text-xs text-slate-400">Detailed breakdown of answers, scores, and Gemini AI feedback</p>
        </div>
        <Badge variant="outline" size="sm" className="border-indigo-500/30 text-indigo-300">
          {questions.length} Questions Evaluated
        </Badge>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => {
          const isExpanded = expandedIndex === idx;
          const score = q.score || 0;
          const feedback = q.aiFeedback || {};
          const covered = feedback.keyPointsCovered || [];
          const missed = feedback.keyPointsMissed || [];

          return (
            <div
              key={q._id || idx}
              className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden transition-all duration-200"
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-slate-900/60 transition-colors"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <span className="w-7 h-7 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 text-xs font-bold font-mono">
                    #{q.sequenceNumber || idx + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                      {q.question}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      Candidate answer: "{q.answer || 'No response provided'}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={score >= 75 ? 'success' : score >= 50 ? 'warning' : 'danger'} size="sm">
                    {score}/100
                  </Badge>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {/* Accordion Body */}
              {isExpanded && (
                <div className="p-4 sm:p-6 border-t border-slate-800/80 bg-slate-900/30 space-y-5 text-xs text-slate-300">
                  
                  {/* Full Candidate Answer */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Your Technical Answer
                    </label>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed font-mono text-xs">
                      {q.answer || 'No answer submitted.'}
                    </div>
                  </div>

                  {/* AI Feedback Comments */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-indigo-400" /> AI Evaluation Feedback
                    </label>
                    <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-indigo-200 leading-relaxed">
                      {feedback.comments || 'Evaluated successfully by Gemini AI.'}
                    </div>
                  </div>

                  {/* Covered vs Missed Key Points */}
                  {(covered.length > 0 || missed.length > 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {covered.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Covered Concepts
                          </span>
                          <div className="space-y-1">
                            {covered.map((item, i) => (
                              <div key={i} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 text-[11px]">
                                • {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {missed.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase text-rose-400 flex items-center gap-1">
                            <X className="w-3.5 h-3.5" /> Missed Concepts
                          </span>
                          <div className="space-y-1">
                            {missed.map((item, i) => (
                              <div key={i} className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-300 text-[11px]">
                                • {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reference Expected Answer */}
                  {q.expectedAnswer && (
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Benchmark Reference Answer
                      </label>
                      <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-cyan-200 leading-relaxed font-mono text-[11px]">
                        {q.expectedAnswer}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionFeedback;
