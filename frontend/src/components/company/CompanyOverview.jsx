import React from 'react';
import { Building2, Globe, ExternalLink, Users, MapPin, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const CompanyOverview = ({ company, className = '' }) => {
  if (!company) return null;

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${className}`.trim()}>
      {/* Main Column: Company Description */}
      <div className="lg:col-span-2 space-y-6">
        <Card variant="glass" className="border-slate-800">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <span>About {company.companyName}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            {company.description ? (
              company.description.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))
            ) : (
              <p className="italic text-slate-500">No company description provided.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Column: Company Specs */}
      <div className="space-y-6">
        <Card variant="glass" className="border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Company Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs text-slate-300">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Industry</span>
              <span className="font-medium text-slate-200">{company.industry || 'Technology'}</span>
            </div>

            {company.headquarters && (
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Headquarters
                </span>
                <span className="font-medium text-slate-200">{company.headquarters}</span>
              </div>
            )}

            {company.companySize && (
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-mono">
                <span className="text-slate-400 flex items-center gap-1 font-sans">
                  <Users className="w-3.5 h-3.5" /> Employee Count
                </span>
                <span className="font-medium text-slate-200">{company.companySize}</span>
              </div>
            )}

            {company.hiringStatus && (
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Hiring Status</span>
                <Badge
                  variant={company.hiringStatus === 'Actively Hiring' ? 'success' : 'neutral'}
                  style="soft"
                  size="xs"
                >
                  {company.hiringStatus}
                </Badge>
              </div>
            )}

            {company.websiteUrl && (
              <div className="pt-2">
                <a
                  href={company.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-indigo-300 hover:text-indigo-200 flex items-center justify-center gap-1.5 font-semibold transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Visit Official Website</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyOverview;
