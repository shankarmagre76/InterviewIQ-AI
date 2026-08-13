import React from 'react';
import { CheckCircle2, Circle, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';

export const ProfileCompletionCard = ({
  completion = 0,
  profile,
  onEditProfile,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, completion));

  // Determine section completion statuses based on profile fields
  const basicInfoFilled = Boolean(
    profile?.firstName &&
    profile?.lastName &&
    (profile?.headline || profile?.bio)
  );
  const photoFilled = Boolean(profile?.profileImage && profile.profileImage.trim());
  const skillsFilled = Boolean(profile?.skills && profile.skills.length > 0);
  const educationFilled = Boolean(profile?.education && profile.education.length > 0);
  const experienceFilled = Boolean(profile?.experience && profile.experience.length > 0);
  const resumeFilled = Boolean(profile?.resume && (profile.resume.url || profile.resume.resumeUrl));
  const socialFilled = Boolean(
    profile?.socialLinks &&
    Object.values(profile.socialLinks).some((l) => Boolean(l && l.trim()))
  );

  const sections = [
    { label: 'Basic Information & Headline', filled: basicInfoFilled, weight: '20%' },
    { label: 'Profile Photo', filled: photoFilled, weight: '15%' },
    { label: 'Technical Skills', filled: skillsFilled, weight: '15%' },
    { label: 'Education Records', filled: educationFilled, weight: '15%' },
    { label: 'Work Experience', filled: experienceFilled, weight: '15%' },
    { label: 'Resume File Upload', filled: resumeFilled, weight: '10%' },
    { label: 'Social & Professional Links', filled: socialFilled, weight: '10%' },
  ];

  const getVariantByPercentage = (val) => {
    if (val >= 80) return 'success';
    if (val >= 50) return 'warning';
    return 'danger';
  };

  const progressVariant = getVariantByPercentage(percentage);

  return (
    <Card variant="glass" className={`border-slate-800 relative overflow-hidden ${className}`.trim()}>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Profile Completion</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-indigo-300">{percentage}%</span>
        </CardTitle>
        <CardDescription>
          Completing your career profile improves ATS match precision and AI interview feedback.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <ProgressBar value={percentage} variant={progressVariant} size="lg" animated />
          <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
            <span>{percentage === 100 ? '🎉 Fully Completed' : 'Profile Status'}</span>
            <span>{percentage < 100 ? `${100 - percentage}% remaining` : 'Ready for Applications'}</span>
          </div>
        </div>

        {/* Section Checklist */}
        <div className="space-y-2.5 pt-2">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                section.filled
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-200'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                {section.filled ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span className={section.filled ? 'font-semibold text-slate-200' : 'font-normal'}>
                  {section.label}
                </span>
              </div>

              <span className="text-[11px] font-mono text-slate-500 shrink-0 ml-2">
                +{section.weight}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        {percentage < 100 && onEditProfile && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEditProfile}
              className="w-full justify-between group"
              rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            >
              Complete Missing Profile Sections
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionCard;
