import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Globe, ExternalLink, ArrowLeft, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const CompanyHeader = ({ company, className = '' }) => {
  const navigate = useNavigate();

  if (!company) return null;

  const companyName = company.companyName || 'Company Profile';
  const logoUrl = company.logoUrl || company.companyLogo || null;
  const initials = companyName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <Card variant="glass" className={`border-slate-800 space-y-4 ${className}`.trim()}>
      <CardHeader className="pb-4">
        {/* Navigation & Action Header Bar */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <Button
            size="xs"
            variant="ghost"
            onClick={() => navigate('/companies')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="text-slate-400 hover:text-slate-200"
          >
            Back to Companies
          </Button>

          {company.websiteUrl && (
            <a
              href={company.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-indigo-300 hover:text-indigo-200 font-semibold text-xs flex items-center gap-1.5 transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Visit Website</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}
        </div>

        {/* Hero Branding Info */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-800 bg-slate-900 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-bold font-mono text-xl flex items-center justify-center shrink-0">
                {initials || <Building2 className="w-7 h-7" />}
              </div>
            )}

            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                {company.industry || 'Technology'}
              </span>
              <CardTitle className="text-xl sm:text-2xl font-black text-slate-100">
                {companyName}
              </CardTitle>
              {company.headquarters && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{company.headquarters}</span>
                </div>
              )}
            </div>
          </div>

          {company.hiringStatus && (
            <div className="self-start sm:self-center shrink-0">
              <Badge
                variant={company.hiringStatus === 'Actively Hiring' ? 'success' : 'neutral'}
                style="soft"
                size="md"
              >
                {company.hiringStatus}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Meta Stats Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Industry</span>
            <span className="font-bold text-slate-200 block">{company.industry || 'Not specified'}</span>
          </div>

          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Headquarters</span>
            <span className="font-bold text-slate-200 block">{company.headquarters || 'Not specified'}</span>
          </div>

          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Company Size</span>
            <span className="font-bold text-slate-200 block flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {company.companySize || 'Not specified'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyHeader;
