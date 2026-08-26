import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Users, Globe, ArrowRight, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const CompanyCard = ({ company, className = '' }) => {
  const navigate = useNavigate();

  if (!company) return null;

  const companyName = company.companyName || 'Company';
  const logoUrl = company.logoUrl || company.companyLogo || null;
  const initials = companyName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleCardClick = () => {
    navigate(`/companies/${company._id}`);
  };

  return (
    <Card
      variant="glass"
      className={`
        border-slate-800 hover:border-indigo-500/50 transition-all duration-300
        flex flex-col justify-between cursor-pointer group hover:shadow-lg hover:shadow-indigo-500/5
        ${className}
      `.trim()}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 overflow-hidden">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-800 bg-slate-900 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-bold font-mono text-sm flex items-center justify-center shrink-0">
                {initials || <Building2 className="w-5 h-5" />}
              </div>
            )}

            <div className="overflow-hidden">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block truncate">
                {company.industry || 'Technology'}
              </span>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
                {companyName}
              </CardTitle>
            </div>
          </div>

          {company.hiringStatus && (
            <Badge
              variant={company.hiringStatus === 'Actively Hiring' ? 'success' : 'neutral'}
              style="soft"
              size="xs"
              className="shrink-0"
            >
              {company.hiringStatus}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location & Size Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
          {company.headquarters && (
            <span className="flex items-center gap-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{company.headquarters}</span>
            </span>
          )}

          {company.companySize && (
            <span className="flex items-center gap-1 text-slate-400 font-mono">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{company.companySize}</span>
            </span>
          )}
        </div>

        {/* Description Snippet */}
        {company.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {company.description}
          </p>
        )}

        {/* Bottom Action Footer */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          {company.websiteUrl ? (
            <a
              href={company.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Website</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          ) : (
            <span className="text-slate-500 italic">No website provided</span>
          )}

          <Button
            size="xs"
            variant="ghost"
            className="text-indigo-300 group-hover:text-indigo-200 group-hover:translate-x-0.5 transition-transform"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyCard;
