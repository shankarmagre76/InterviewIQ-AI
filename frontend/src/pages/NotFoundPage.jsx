import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/ui/EmptyState';
import { AlertCircle, Home } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <EmptyState
        icon={<AlertCircle className="w-10 h-10 text-rose-400" />}
        title="404 — Page Not Found"
        description="The requested view does not exist or has been moved."
        primaryAction={{
          label: 'Back to Dashboard',
          icon: <Home className="w-4 h-4" />,
          onClick: () => navigate('/dashboard'),
        }}
      />
    </div>
  );
};

export default NotFoundPage;
