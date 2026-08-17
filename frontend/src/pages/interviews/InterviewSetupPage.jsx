import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { InterviewSetupForm } from '../../components/interviews/InterviewSetupForm';

export const InterviewSetupPage = () => {
  const navigate = useNavigate();

  const handleCreatedSuccess = (session) => {
    const interviewId = session?._id || session?.id;
    if (interviewId) {
      navigate(`/interviews/${interviewId}`);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 max-w-5xl mx-auto">
      <PageHeader
        title="Setup AI Mock Interview"
        description="Select your target role, interview type, and difficulty to generate custom domain questions evaluated by Gemini AI."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/interviews')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Dashboard
          </Button>
        }
      />

      <InterviewSetupForm onCreatedSuccess={handleCreatedSuccess} />
    </div>
  );
};

export default InterviewSetupPage;
