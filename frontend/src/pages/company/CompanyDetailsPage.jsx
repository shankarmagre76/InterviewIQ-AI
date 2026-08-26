import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companyService } from '../../services/companyService';
import { parseApiError } from '../../utils/helpers';
import { SkeletonCard } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { CompanyHeader } from '../../components/company/CompanyHeader';
import { CompanyOverview } from '../../components/company/CompanyOverview';
import { CompanyJobs } from '../../components/company/CompanyJobs';

export const CompanyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompanyDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await companyService.getCompanyDetails(id);
      const data = response?.data || response;
      setCompany(data);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCompanyDetails();
  }, [fetchCompanyDetails]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        <SkeletonCard className="h-48" />
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-80" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="py-12 max-w-2xl mx-auto">
        <ErrorState
          title="Company Profile Unavailable"
          message={error || 'The requested company profile could not be found or has been removed.'}
          onRetry={() => navigate('/companies')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      {/* 1. Company Hero Header */}
      <CompanyHeader company={company} />

      {/* 2. Company Overview & Metadata Sidebar */}
      <CompanyOverview company={company} />

      {/* 3. Open Position Listings */}
      <CompanyJobs companyId={company._id} companyName={company.companyName} />
    </div>
  );
};

export default CompanyDetailsPage;
