import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Cpu, Zap, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-12 relative overflow-hidden">
      {/* Background Decorative Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="flex justify-between items-center z-10 max-w-6xl mx-auto w-full border-b border-slate-800/80 pb-4 sm:pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold text-white tracking-tight">
            InterviewIQ <span className="text-indigo-400">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/login">
            <Button variant="ghost" size="xs" className="sm:text-xs sm:px-3 sm:py-1.5">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="xs" className="sm:text-xs sm:px-3.5 sm:py-1.5">Get Started</Button>
          </Link>
        </div>
      </header>


      {/* Main Hero */}
      <main className="my-auto z-10 max-w-4xl mx-auto text-center py-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-indigo-300 text-xs font-medium mb-6 border border-indigo-500/20">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Next-Gen AI Tech Career Acceleration
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Master Technical Interviews & Boost Your <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">ATS Score</span>
        </h1>

        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Real-time Gemini voice mock interviews, automated resume keyword scoring, and adaptive learning roadmaps tailored to your target engineering role.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <Link to="/register">
            <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Start Free Trial
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline">
              Sign In to Candidate Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <Cpu className="w-8 h-8 text-indigo-400 mb-3" />
            <h3 className="text-white font-bold mb-1 text-base">AI Mock Interviews</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Dynamic question sets & real-time multi-dimensional Gemini evaluation.</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <Sparkles className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-white font-bold mb-1 text-base">ATS Resume Analysis</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Instant keyword density checks, action verb fixes, and formatting audits.</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mb-3" />
            <h3 className="text-white font-bold mb-1 text-base">Adaptive Roadmaps</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Personalized career milestone tasks tailored to fill your skill gaps.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="z-10 text-center text-xs text-slate-500 border-t border-slate-800/80 pt-6 max-w-6xl mx-auto w-full">
        InterviewIQ AI © {new Date().getFullYear()} • Powered by Gemini AI
      </footer>
    </div>
  );
};

export default LandingPage;
