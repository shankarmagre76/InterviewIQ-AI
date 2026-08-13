import React, { useState } from 'react';
import {
  Share2,
  Link2,
  GitBranch,
  Globe,
  Code2,
  Terminal,
  Code,
  Edit3,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { Alert } from '../ui/Alert';
import { useToast } from '../../hooks/useToast';
import { SocialLinksForm } from './SocialLinksForm';

const PLATFORM_CONFIGS = [
  {
    key: 'linkedin',
    name: 'LinkedIn',
    icon: Link2,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    key: 'github',
    name: 'GitHub',
    icon: GitBranch,
    color: 'text-slate-200 bg-slate-800/60 border-slate-700/60',
  },
  {
    key: 'portfolio',
    name: 'Portfolio',
    icon: Globe,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    key: 'leetcode',
    name: 'LeetCode',
    icon: Code2,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    key: 'hackerrank',
    name: 'HackerRank',
    icon: Terminal,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    key: 'codechef',
    name: 'CodeChef',
    icon: Code,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  },
];

export const SocialLinksSection = ({
  socialLinks = {},
  onUpdateSocialLinks,
  loading = false,
  error = null,
  className = '',
}) => {
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const activeLinks = PLATFORM_CONFIGS.filter(
    (cfg) => socialLinks && socialLinks[cfg.key] && socialLinks[cfg.key].trim() !== ''
  );

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setFormError('');
    try {
      if (onUpdateSocialLinks) {
        await onUpdateSocialLinks(formData);
      }
      toast.success('Social profiles & links updated successfully!');
      setIsModalOpen(false);
    } catch (err) {
      const msg = err?.message || 'Failed to update social links.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card variant="glass" className={`border-slate-800 ${className}`.trim()}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-400" />
              <span>Social Links & Coding Profiles</span>
              <Badge variant="neutral" size="xs" className="ml-1">
                {activeLinks.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Connect your LinkedIn, GitHub, LeetCode, and technical portfolio.
            </CardDescription>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Edit3 className="w-4 h-4 text-blue-400" />}
          >
            Edit Links
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="danger" title="Error Loading Social Links">
            {error}
          </Alert>
        )}

        {activeLinks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeLinks.map((cfg) => {
              const url = socialLinks[cfg.key];
              const safeUrl = url.startsWith('http') ? url : `https://${url}`;
              const IconComp = cfg.icon;

              return (
                <a
                  key={cfg.key}
                  href={safeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${cfg.name} profile in new tab`}
                  className={`
                    p-3 rounded-xl border ${cfg.color}
                    hover:scale-[1.02] transition-all flex items-center justify-between gap-3 group
                  `.trim()}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <IconComp className="w-4 h-4 shrink-0" />
                    <div className="overflow-hidden">
                      <span className="text-xs font-bold block text-slate-100">{cfg.name}</span>
                      <span className="text-[11px] text-slate-400 truncate block font-mono">
                        {url.replace(/^https?:\/\/(www\.)?/, '')}
                      </span>
                    </div>
                  </div>

                  <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
                </a>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Share2 className="w-10 h-10 text-blue-400" />}
            title="No Social Profiles Added Yet"
            description="Add your LinkedIn, GitHub, LeetCode, and HackerRank handles to allow recruiters and AI analysis to verify your coding experience."
            primaryAction={{
              label: 'Add Social Links',
              onClick: () => setIsModalOpen(true),
              icon: <Edit3 className="w-4 h-4" />,
            }}
          />
        )}
      </CardContent>

      {/* Edit Social Links Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Social Profiles & Coding Links"
        description="Provide your public profile URLs to link your career background."
        size="lg"
      >
        {formError && (
          <Alert variant="danger" title="Form Error" className="mb-4" onClose={() => setFormError('')}>
            {formError}
          </Alert>
        )}

        <SocialLinksForm
          initialValues={socialLinks}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </Card>
  );
};

export default SocialLinksSection;
