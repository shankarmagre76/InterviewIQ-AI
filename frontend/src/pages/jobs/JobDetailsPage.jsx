import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { parseApiError } from '../../utils/helpers';
import { SkeletonCard } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { JobDetailsHeader } from '../../components/jobs/JobDetailsHeader';
import { JobDetailsContent } from '../../components/jobs/JobDetailsContent';
import { JobApplyModal } from '../../components/jobs/JobApplyModal';

export const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const fetchJobDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Job details by ID
      const jobResponse = await jobService.getJobDetails(id);
      const jobData = jobResponse?.data || jobResponse;
      setJob(jobData);

      // 2. Parallel check for saved status and existing user application
      try {
        const [savedRes, appsRes] = await Promise.allSettled([
          jobService.checkIsJobSaved(id),
          applicationService.getCandidateApplications({ limit: 100 }),
        ]);

        if (savedRes.status === 'fulfilled') {
          const isSavedVal = Boolean(savedRes.value?.data?.isSaved || savedRes.value?.isSaved);
          setIsSaved(isSavedVal);
        }

        if (appsRes.status === 'fulfilled') {
          const appsList = Array.isArray(appsRes.value?.data)
            ? appsRes.value.data
            : Array.isArray(appsRes.value)
            ? appsRes.value
            : [];

          const existingApp = appsList.find((app) => {
            const appId = app.job?._id || app.job;
            return String(appId) === String(id);
          });

          setExistingApplication(existingApp || null);
        }
      } catch {
        // Non-critical check for unauthenticated users
      }
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  const handleSaveToggle = async (jobId) => {
    try {
      if (isSaved) {
        await jobService.unsaveJob(jobId);
        setIsSaved(false);
      } else {
        await jobService.saveJob(jobId);
        setIsSaved(true);
      }
    } catch (err) {
      // Toast notification is handled in service/hook
    }
  };

  const handleApplicationSubmitted = () => {
    fetchJobDetails();
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        <SkeletonCard className="h-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonCard className="lg:col-span-2 h-96" />
          <SkeletonCard className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="py-12 max-w-2xl mx-auto">
        <ErrorState
          title="Job Posting Unavailable"
          message={error || 'The requested job posting could not be found or has expired.'}
          onRetry={() => navigate('/jobs')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* 1. Hero Job Details Header */}
      <JobDetailsHeader
        job={job}
        isSaved={isSaved}
        existingApplication={existingApplication}
        onSaveToggle={handleSaveToggle}
        onOpenApplyModal={() => setApplyModalOpen(true)}
      />

      {/* 2. Main Job Details Content & Company Sidebar */}
      <JobDetailsContent job={job} />

      {/* 3. Job Application Submission Modal */}
      <JobApplyModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        job={job}
        onSuccess={handleApplicationSubmitted}
      />
    </div>
  );
};

export default JobDetailsPage;
