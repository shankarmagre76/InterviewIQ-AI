import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Briefcase, ArrowLeft, Send } from 'lucide-react';

export const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`Job Details (ID: ${id})`}
        description="Detailed requirements and ATS keyword match breakdown."
        action={
          <Button variant="outline" size="sm" onClick={() => navigate('/jobs')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Jobs
          </Button>
        }
      />

      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>Senior Full Stack Engineer</CardTitle>
              <CardDescription>TechCorp Solutions • San Francisco, CA (Remote)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            Requirements: React 19, Node.js, Express, MongoDB, Redis, Distributed Systems design.
          </div>
          <Button variant="primary" size="md" leftIcon={<Send className="w-4 h-4" />}>
            Submit Customized Application
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobDetailsPage;
