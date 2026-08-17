import React, { useState, useEffect, useCallback } from 'react';
import { Briefcase } from 'lucide-react';
import { JobList } from '../jobs/JobList';
import { companyService } from '../../services/companyService';
import { jobService } from '../../services/jobService';
import { parseApiError } from '../../utils/helpers';

export const CompanyJobs = ({ companyId, companyName = 'Company', className = '' }) => {
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompanyJobs = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await companyService.getCompanyJobs(companyId);
      const jobsList = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setJobs(jobsList);

      // Fetch saved jobs for bookmark status indicators
      try {
        const savedRes = await jobService.getSavedJobs();
        const list = Array.isArray(savedRes.data) ? savedRes.data : Array.isArray(savedRes) ? savedRes : [];
        const ids = new Set(list.map((item) => String(item.job?._id || item.job || item._id)));
        setSavedJobIds(ids);
      } catch {
        // Non-critical if user is unauthenticated
      }
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchCompanyJobs();
  }, [fetchCompanyJobs]);

  const handleSaveToggle = async (jobId) => {
    const isSaved = savedJobIds.has(String(jobId));
    try {
      if (isSaved) {
        await jobService.unsaveJob(jobId);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(String(jobId));
          return next;
        });
      } else {
        await jobService.saveJob(jobId);
        setSavedJobIds((prev) => new Set(prev).add(String(jobId)));
      }
    } catch {
      // Toast notification is handled in service
    }
  };

  return (
    <div className={`space-y-4 ${className}`.trim()}>
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
        <Briefcase className="w-5 h-5 text-indigo-400" />
        <h3 className="font-bold text-base text-slate-100">
          Open Positions at {companyName} ({jobs.length})
        </h3>
      </div>

      <JobList
        jobs={jobs}
        savedJobIds={savedJobIds}
        onSaveToggle={handleSaveToggle}
        loading={loading}
        error={error}
        onRetry={fetchCompanyJobs}
      />
    </div>
  );
};

export default CompanyJobs;
