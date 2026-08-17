import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  GraduationCap,
  Briefcase,
  Code2,
  FolderGit2,
  Award,
  Share2,
  FileText,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const ProfileCompletionCard = ({
  completion = 0,
  profile = null,
  onNavigateSection,
  compact = false,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, completion));

  // Evaluate section completion state based on backend profile object
  const photoFilled = Boolean(profile?.profileImage && profile.profileImage.trim());
  const skillsFilled = Boolean(profile?.skills && profile.skills.length > 0);
  const projectsFilled = Boolean(profile?.projects && profile.projects.length > 0);
  const experienceFilled = Boolean(profile?.experience && profile.experience.length > 0);
  const educationFilled = Boolean(profile?.education && profile.education.length > 0);
  const certificationsFilled = Boolean(profile?.certifications && profile.certifications.length > 0);
  const socialFilled = Boolean(
    profile?.socialLinks &&
      Object.values(profile.socialLinks).some((l) => Boolean(l && String(l).trim()))
  );
  const resumeFilled = Boolean(
    profile?.resume && (profile.resume.url || profile.resume.resumeUrl)
  );

  // Recommendations for incomplete profile sections only
  const allRecommendations = [
    {
      id: 'photo',
      label: 'Add profile photo',
      sectionKey: 'personal-info',
      filled: photoFilled,
      icon: User,
      benefit: 'Increases profile authenticity',
    },
    {
      id: 'skills',
      label: 'Add technical skills',
      sectionKey: 'skills',
      filled: skillsFilled,
      icon: Code2,
      benefit: 'Unlocks AI skill gap analysis',
    },
    {
      id: 'projects',
      label: 'Add software projects',
      sectionKey: 'projects',
      filled: projectsFilled,
      icon: FolderGit2,
      benefit: 'Enhances AI technical interview score',
    },
    {
      id: 'experience',
      label: 'Add work experience',
      sectionKey: 'experience',
      filled: experienceFilled,
      icon: Briefcase,
      benefit: 'Powers role readiness evaluation',
    },
    {
      id: 'education',
      label: 'Add education background',
      sectionKey: 'education',
      filled: educationFilled,
      icon: GraduationCap,
      benefit: 'Verifies academic qualification',
    },
    {
      id: 'certifications',
      label: 'Add certifications',
      sectionKey: 'certifications',
      filled: certificationsFilled,
      icon: Award,
      benefit: 'Adds verified cloud/tech credentials',
    },
    {
      id: 'social',
      label: 'Add social & coding links',
      sectionKey: 'certifications',
      filled: socialFilled,
      icon: Share2,
      benefit: 'Links GitHub & LeetCode profiles',
    },
    {
      id: 'resume',
      label: 'Upload resume document',
      sectionKey: 'resume',
      filled: resumeFilled,
      icon: FileText,
      benefit: 'Enables instant AI Resume Parsing',
    },
  ];

  // Filter recommendations: DO NOT show already completed sections
  const missingRecommendations = allRecommendations.filter((item) => !item.filled);
  const completedCount = allRecommendations.filter((item) => item.filled).length;

  const getVariant = (val) => {
    if (val >= 80) return 'success';
    if (val >= 50) return 'primary';
    return 'warning';
  };

  const variant = getVariant(percentage);

  return (
    <Card variant="glass" className={`border-slate-800 relative overflow-hidden ${className}`.trim()}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Profile Completion</span>
          </CardTitle>
          <span className="text-xl sm:text-2xl font-black text-indigo-300 font-mono">
            {percentage}%
          </span>
        </div>
        <CardDescription>
          Backend verified candidate score. Complete missing sections for higher AI match accuracy.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Progress Bar with Accessibility Attributes */}
        <div className="space-y-2">
          <ProgressBar
            value={percentage}
            variant={variant}
            size="lg"
            animated
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Candidate Profile Completion Percentage"
          />

          <div className="flex justify-between items-center text-xs font-medium text-slate-400">
            <span>
              {percentage === 100
                ? '🎉 100% Fully Completed Profile'
                : `${completedCount} of ${allRecommendations.length} sections completed`}
            </span>
            <span className="text-slate-500 font-mono">
              {percentage < 100 ? `${100 - percentage}% remaining` : 'Ready for AI Interviews'}
            </span>
          </div>
        </div>

        {/* Missing Recommendations Section */}
        {missingRecommendations.length > 0 ? (
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Recommended Next Steps ({missingRecommendations.length})</span>
              <Badge variant="warning" style="soft" size="xs">
                Incomplete
              </Badge>
            </h4>

            <div className="space-y-2">
              {missingRecommendations.slice(0, compact ? 3 : 6).map((item) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigateSection && onNavigateSection(item.sectionKey)}
                    className="w-full text-left p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 hover:bg-indigo-600/10 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-slate-200 block group-hover:text-indigo-200 transition-colors">
                          {item.label}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate block">
                          {item.benefit}
                        </span>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
            <div className="inline-flex p-2 rounded-full bg-emerald-500/20 text-emerald-400 mb-1">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-emerald-300">Profile Complete!</h4>
            <p className="text-xs text-slate-300">
              All candidate profile sections, experience, skills, and links are active.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionCard;
