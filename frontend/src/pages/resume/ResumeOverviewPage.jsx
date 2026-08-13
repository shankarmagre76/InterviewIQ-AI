import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { ResumeManagementSection } from '../../components/resume';

export const ResumeOverviewPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      <PageHeader
        title="My Resume Management"
        description="Upload, manage, and inspect your software engineering PDF resume documents."
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/resume/analysis')}
            leftIcon={<Sparkles className="w-4 h-4 text-cyan-300" />}
          >
            View ATS Analysis Report
          </Button>
        }
      />

      {/* Main Resume Management Section */}
      <ResumeManagementSection />
    </div>
  );
};

export default ResumeOverviewPage;
