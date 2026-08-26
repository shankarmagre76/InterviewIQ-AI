import React from 'react';
import { Code2, GraduationCap, Briefcase, FolderGit2, Award } from 'lucide-react';
import { StatCard } from '../ui/StatCard';

export const ProfileStats = ({
  profile,
  resumeAnalytics,
  onSectionClick,
  className = '',
}) => {
  const skillsCount = profile?.skills?.length || 0;
  const educationCount = profile?.education?.length || 0;
  const experienceCount = profile?.experience?.length || 0;

  // Projects and Certifications counts (from profile extensions or resume breakdown fallback)
  const projectsCount =
    profile?.projects?.length ||
    resumeAnalytics?.latestAnalysisBreakdown?.sectionScores?.projects > 0
      ? 1
      : 0;

  const certificationsCount =
    profile?.certifications?.length ||
    (profile?.socialLinks?.leetcode || profile?.socialLinks?.hackerrank ? 1 : 0);

  const stats = [
    {
      title: 'Skills Listed',
      value: skillsCount,
      subtext: `${skillsCount > 0 ? 'Active competencies' : 'No skills added'}`,
      icon: <Code2 className="w-6 h-6 text-indigo-400" />,
      sectionKey: 'skills',
    },
    {
      title: 'Education',
      value: educationCount,
      subtext: `${educationCount > 0 ? 'Academic degrees' : 'No records yet'}`,
      icon: <GraduationCap className="w-6 h-6 text-cyan-400" />,
      sectionKey: 'education',
    },
    {
      title: 'Work Experience',
      value: experienceCount,
      subtext: `${experienceCount > 0 ? 'Professional roles' : 'No experience added'}`,
      icon: <Briefcase className="w-6 h-6 text-emerald-400" />,
      sectionKey: 'experience',
    },
    {
      title: 'Projects',
      value: projectsCount,
      subtext: `${projectsCount > 0 ? 'Highlighted projects' : 'Add key projects'}`,
      icon: <FolderGit2 className="w-6 h-6 text-amber-400" />,
      sectionKey: 'projects',
    },
    {
      title: 'Certifications',
      value: certificationsCount,
      subtext: `${certificationsCount > 0 ? 'Verified credentials' : 'No certifications'}`,
      icon: <Award className="w-6 h-6 text-rose-400" />,
      sectionKey: 'certifications',
    },
  ];

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 ${className}`.trim()}>
      {stats.map((stat, idx) => (
        <div
          key={idx}
          onClick={() => onSectionClick && onSectionClick(stat.sectionKey)}
          className={onSectionClick ? 'cursor-pointer transition-transform hover:-translate-y-0.5' : ''}
        >
          <StatCard
            title={stat.title}
            value={stat.value}
            subtext={stat.subtext}
            icon={stat.icon}
            variant="glass"
            className="h-full border-slate-800/80 hover:border-indigo-500/40 transition-colors"
          />
        </div>
      ))}
    </div>
  );
};

export default ProfileStats;
