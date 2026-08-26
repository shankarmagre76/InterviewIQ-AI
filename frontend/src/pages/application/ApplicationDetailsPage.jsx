import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  FileText,
  ExternalLink,
  MessageSquare,
  Award,
  Globe,
  XCircle,
  RefreshCw,
  MapPin,
  Briefcase,
} from 'lucide-react';

import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { ApplicationStatusTimeline } from '../../components/applications/ApplicationStatusTimeline';
import { getStatusBadgeVariant } from '../../components/applications/ApplicationListTable';
import { applicationService } from '../../services/applicationService';
import { parseApiError } from '../../utils/helpers';
import { useToast } from '../../hooks/useToast';

export const ApplicationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await applicationService.getApplicationDetails(id);
      const data = response?.data || response;
      setApplication(data);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleWithdraw = async () => {
    if (!application) return;
    try {
      await applicationService.updateApplicationStatus(application._id, { status: 'Withdrawn' });
      toast.success('Application withdrawn successfully.');
      fetchDetails();
    } catch (err) {
      toast.error(parseApiError(err));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        <SkeletonCard className="h-48" />
        <SkeletonCard className="h-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonCard className="lg:col-span-2 h-96" />
          <SkeletonCard className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="py-12 max-w-2xl mx-auto">
        <ErrorState
          title="Application Details Unavailable"
          message={error || 'The requested job application could not be found or you are not authorized to view it.'}
          onRetry={() => navigate('/applications')}
        />
      </div>
    );
  }

  const company = application.company || {};
  const job = application.job || {};
  const resume = application.resume || {};
  const statusInfo = getStatusBadgeVariant(application.status);

  const companyName = company.companyName || application.companyName || 'Company';
  const companyLogo = company.logoUrl || null;
  const companyInitials = companyName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const appliedDate = application.appliedAt || application.createdAt;
  const updatedDate = application.updatedAt || application.appliedAt;
  const interviewDate = application.interviewDate ? new Date(application.interviewDate) : null;

  const canWithdraw = application.status === 'Applied' || application.status === 'Under Review';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* 1. Page Header & Actions */}
      <PageHeader
        title="Application Details"
        description={`Application tracking for ${job.title || 'Position'} at ${companyName}`}
        action={
          <div className="flex items-center gap-3">
            <Button
              size="xs"
              variant="outline"
              onClick={() => navigate('/applications')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Applications
            </Button>

            <Button
              size="xs"
              variant="outline"
              onClick={fetchDetails}
              isLoading={loading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* 2. Hero Application Summary Card */}
      <Card variant="glass" className="border-slate-800 space-y-4">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={companyName}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-800 bg-slate-900 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-bold font-mono text-xl flex items-center justify-center shrink-0">
                  {companyInitials || <Building2 className="w-7 h-7" />}
                </div>
              )}

              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                  {companyName}
                </span>
                <CardTitle className="text-xl sm:text-2xl font-black text-slate-100">
                  {job.title || 'Job Position'}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Applied {appliedDate ? new Date(appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Updated {updatedDate ? new Date(updatedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2 shrink-0">
              <Badge variant={statusInfo.variant} style="soft" size="md">
                {statusInfo.label}
              </Badge>

              {canWithdraw && (
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleWithdraw}
                  className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                  leftIcon={<XCircle className="w-3.5 h-3.5" />}
                >
                  Withdraw Application
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 3. Visual Status Timeline */}
      <ApplicationStatusTimeline status={application.status} />

      {/* 4. Details Grid (Job Specs + Resume & Cover Letter + Company Overview) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scheduled Interview Card */}
          {interviewDate && (
            <Card variant="glass" className="border-indigo-500/30 bg-indigo-500/5">
              <CardHeader>
                <CardTitle className="text-base text-indigo-300 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <span>Scheduled Interview Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs sm:text-sm text-slate-200">
                <p className="font-mono text-base font-bold text-slate-100">
                  {interviewDate.toLocaleString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-slate-400 text-xs">
                  Stage: <strong className="text-indigo-300">{application.status}</strong>
                </p>
              </CardContent>
            </Card>
          )}

          {/* Attached Resume */}
          <Card variant="glass" className="border-slate-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>Submitted Resume Document</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="font-bold text-slate-100 block truncate">
                      {resume.originalName || resume.fileName || 'Candidate_Resume.pdf'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono block">
                      Uploaded candidate PDF document
                    </span>
                  </div>
                </div>

                {(resume.url || resume.fileUrl || resume.resumeUrl) && (
                  <a
                    href={resume.url || resume.fileUrl || resume.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <span>View Document</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cover Letter */}
          {application.coverLetter && (
            <Card variant="glass" className="border-slate-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                  <span>Cover Letter / Recruiter Note</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                  "{application.coverLetter}"
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recruiter Notes / Feedback */}
          {(application.recruiterNotes || application.feedback?.comments) && (
            <Card variant="glass" className="border-slate-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>Recruiter Feedback & Notes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs sm:text-sm">
                {application.recruiterNotes && (
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Notes
                    </span>
                    <p className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                      {application.recruiterNotes}
                    </p>
                  </div>
                )}

                {application.feedback?.comments && (
                  <div className="space-y-1 pt-2 border-t border-slate-800">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      Interview Rating: {application.feedback.rating || 'N/A'} / 5 Stars
                    </span>
                    <p className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-slate-300">
                      {application.feedback.comments}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Column (Job Specs & Company Metadata) */}
        <div className="space-y-6">
          {/* Target Position Specs */}
          <Card variant="glass" className="border-slate-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>Job Position Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 text-[11px] block">Position Title</span>
                <span className="font-bold text-slate-100 text-sm block">{job.title || 'N/A'}</span>
              </div>

              {job.location && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-slate-300">
                  <span className="text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Location
                  </span>
                  <span className="font-medium text-slate-200">{job.location}</span>
                </div>
              )}

              {job.workMode && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-slate-300">
                  <span className="text-slate-400">Work Mode</span>
                  <Badge variant="info" style="soft" size="xs">
                    {job.workMode}
                  </Badge>
                </div>
              )}

              {job._id && (
                <div className="pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/jobs/${job._id}`)}
                    leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    className="w-full text-indigo-300 border-indigo-500/30"
                  >
                    View Full Job Posting
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company Details */}
          <Card variant="glass" className="border-slate-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>Company Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                {company.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt={companyName}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-800 bg-slate-900 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{companyName}</h4>
                  <p className="text-slate-400">{company.industry || 'Technology'}</p>
                </div>
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
                    <span>Visit Company Website</span>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsPage;
