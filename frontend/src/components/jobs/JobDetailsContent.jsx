import React from 'react';
import {
  FileText,
  CheckCircle2,
  Code2,
  Sparkles,
  Building2,
  Globe,
  Users,
  ExternalLink,
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const JobDetailsContent = ({ job, className = '' }) => {
  if (!job) return null;

  const company = job.company || {};
  const requiredSkills = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
  const preferredSkills = Array.isArray(job.preferredSkills) ? job.preferredSkills : [];
  const responsibilities = Array.isArray(job.responsibilities) ? job.responsibilities : [];

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${className}`.trim()}>
      {/* Main Column: Job Description & Responsibilities */}
      <div className="lg:col-span-2 space-y-6">
        {/* Description Section */}
        <Card variant="glass" className="border-slate-800">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>Job Description</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            {job.description ? (
              job.description.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))
            ) : (
              <p className="italic text-slate-500">No detailed description provided.</p>
            )}
          </CardContent>
        </Card>

        {/* Responsibilities Section */}
        {responsibilities.length > 0 && (
          <Card variant="glass" className="border-slate-800">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Key Responsibilities</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {responsibilities.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Technical Skills Section */}
        <Card variant="glass" className="border-slate-800">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Code2 className="w-5 h-5 text-cyan-400" />
              <span>Technical Skills & Tools</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Required Skills */}
            {requiredSkills.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 block">
                  Must-Have Required Skills ({requiredSkills.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {requiredSkills.map((skill, idx) => (
                    <Badge key={idx} variant="info" style="soft" size="sm" className="font-mono">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Preferred Skills */}
            {preferredSkills.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Nice-to-Have Preferred Skills ({preferredSkills.length})</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {preferredSkills.map((skill, idx) => (
                    <Badge key={idx} variant="primary" style="soft" size="sm" className="font-mono">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Column: Company Information */}
      <div className="space-y-6">
        <Card variant="glass" className="border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>About the Company</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center gap-3">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.companyName}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-800 bg-slate-900 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-bold font-mono text-sm flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
              )}
              <div>
                <h4 className="font-bold text-slate-100 text-sm">{company.companyName || 'Company'}</h4>
                <p className="text-slate-400">{company.industry || 'Technology'}</p>
              </div>
            </div>

            {company.description && (
              <p className="text-slate-300 line-clamp-4 leading-relaxed">
                {company.description}
              </p>
            )}

            <div className="space-y-2 pt-3 border-t border-slate-800 text-slate-300">
              {company.headquarters && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Headquarters</span>
                  <span className="font-medium text-slate-200">{company.headquarters}</span>
                </div>
              )}

              {company.companySize && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Company Size</span>
                  <span className="font-medium text-slate-200 flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" /> {company.companySize}
                  </span>
                </div>
              )}

              {company.hiringStatus && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Hiring Status</span>
                  <Badge variant={company.hiringStatus === 'Actively Hiring' ? 'success' : 'neutral'} style="soft" size="xs">
                    {company.hiringStatus}
                  </Badge>
                </div>
              )}
            </div>

            {company.websiteUrl && (
              <div className="pt-2">
                <a
                  href={company.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-300 hover:text-indigo-200 flex items-center justify-center gap-1.5 font-semibold transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Visit Website</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobDetailsContent;
