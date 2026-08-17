import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NotFoundState } from '../components/ui/ErrorState';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <NotFoundState
        title="404 — Page Not Found"
        message="The requested route or view does not exist or has been relocated."
        onGoHome={() => navigate('/dashboard')}
      />
    </div>
  );
};

export default NotFoundPage;

