import { User, FileText, Globe, ExternalLink, Award, Code } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';

export const ProfileSummary = ({ profile, user, className = '' }) => {
  const bio = profile?.bio || 'No candidate bio provided yet. Add a short bio to highlight your background and skills.';
  const gender = profile?.gender || 'Not specified';
  const dateOfBirth = profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not specified';
  const socialLinks = profile?.socialLinks || {};
  const resume = profile?.resume || {};

  const hasSocialLinks = Object.values(socialLinks).some((link) => Boolean(link && link.trim()));
  const hasResume = Boolean(resume.url || resume.resumeUrl);

  const socialPlatforms = [
    { key: 'github', name: 'GitHub', icon: Code, color: 'hover:text-slate-100 hover:border-slate-600' },
    { key: 'linkedin', name: 'LinkedIn', icon: ExternalLink, color: 'hover:text-sky-400 hover:border-sky-500/40' },
    { key: 'portfolio', name: 'Portfolio', icon: Globe, color: 'hover:text-indigo-400 hover:border-indigo-500/40' },
    { key: 'leetcode', name: 'LeetCode', icon: Code, color: 'hover:text-amber-400 hover:border-amber-500/40' },
    { key: 'hackerrank', name: 'HackerRank', icon: Award, color: 'hover:text-emerald-400 hover:border-emerald-500/40' },
    { key: 'codechef', name: 'CodeChef', icon: Award, color: 'hover:text-rose-400 hover:border-rose-500/40' },
  ];

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${className}`.trim()}>
      {/* Main Bio & Personal Info (2 Cols) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Bio Section */}
        <Card variant="glass" className="border-slate-800">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" />
                <span>About & Bio</span>
              </div>
            </CardTitle>
            <CardDescription>Candidate career overview and summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {bio}
            </p>
          </CardContent>
        </Card>

        {/* Detailed Personal Information Card */}
        <Card variant="glass" className="border-slate-800">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Personal Details</CardTitle>
            <CardDescription>Basic contact and profile attributes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Full Name</span>
                <p className="font-semibold text-white">
                  {profile?.fullName || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || user?.name || 'N/A'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Email Address</span>
                <p className="font-semibold text-white truncate">{user?.email || profile?.user?.email || 'N/A'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Phone Number</span>
                <p className="font-semibold text-white">{profile?.phone || 'Not provided'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Gender</span>
                <p className="font-semibold text-white">{gender}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Date of Birth</span>
                <p className="font-semibold text-white">{dateOfBirth}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Current Location</span>
                <p className="font-semibold text-white">{profile?.currentLocation || 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Side Column: Resume & Social Links (1 Col) */}
      <div className="space-y-6">
        {/* Active Resume Card */}
        <Card variant="glass" className="border-slate-800">
          <CardHeader>
            <CardTitle className="text-base">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Uploaded Resume</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {hasResume ? (
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs font-bold text-white truncate">
                      {resume.originalFileName || 'Candidate_Resume.pdf'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {resume.uploadedAt || resume.uploadedDate
                        ? `Uploaded ${new Date(resume.uploadedAt || resume.uploadedDate).toLocaleDateString()}`
                        : 'Resume document uploaded'}
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  <a
                    href={resume.url || resume.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center"
                  >
                    <Button variant="outline" size="xs" className="w-full" leftIcon={<ExternalLink className="w-3 h-3" />}>
                      View Resume Document
                    </Button>
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-400">No resume attached to profile yet.</p>
                <a href="/resume" className="inline-block">
                  <Button variant="outline" size="xs">
                    Upload Resume
                  </Button>
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social & Professional Links */}
        <Card variant="glass" className="border-slate-800">
          <CardHeader>
            <CardTitle className="text-base">Social Links</CardTitle>
            <CardDescription>Online profiles and code repositories</CardDescription>
          </CardHeader>
          <CardContent>
            {hasSocialLinks ? (
              <div className="space-y-2.5">
                {socialPlatforms.map(({ key, name, icon: IconSymbol, color }) => {
                  const url = socialLinks[key];
                  if (!url || !url.trim()) return null;

                  return (
                    <a
                      key={key}
                      href={url.startsWith('http') ? url : `https://${url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 transition-all ${color}`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <IconSymbol className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-200">{name}</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-3">
                No social links added yet. Add GitHub, LinkedIn, or Portfolio to boost candidate score.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSummary;
