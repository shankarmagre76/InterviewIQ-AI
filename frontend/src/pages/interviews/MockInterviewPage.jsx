import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Sparkles, Video, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MockInterviewPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Mock Interviews"
        description="Select interview domain, customize difficulty, and launch real-time Gemini voice sessions."
        action={
          <Button variant="primary" size="sm" onClick={() => navigate('/interviews/live')} leftIcon={<Play className="w-4 h-4" />}>
            Start New Session
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="interactive" onClick={() => navigate('/interviews/live')}>
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2 border border-indigo-500/20">
              <Video className="w-5 h-5" />
            </div>
            <CardTitle>System Design Interview</CardTitle>
            <CardDescription>Scalability, microservices, load balancing, and database partitioning.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="primary" size="sm" fullWidth leftIcon={<Sparkles className="w-4 h-4" />}>
              Launch Session
            </Button>
          </CardContent>
        </Card>

        <Card variant="interactive" onClick={() => navigate('/interviews/live')}>
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2 border border-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <CardTitle>React & Frontend Deep Dive</CardTitle>
            <CardDescription>State management, rendering performance, SSR, and web security.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" size="sm" fullWidth leftIcon={<Sparkles className="w-4 h-4" />}>
              Launch Session
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MockInterviewPage;
