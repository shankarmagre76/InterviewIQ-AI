import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Mic, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


export const InterviewSessionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Live AI Mock Session"
        description="Gemini 1.5 Pro Interviewer is active."
        action={
          <Button variant="danger" size="sm" onClick={() => navigate('/interviews')}>
            End Session
          </Button>
        }
      />

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Question 1 of 5</CardTitle>
          <CardDescription>Topic: System Design & Rate Limiting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-100 text-sm leading-relaxed">
            "How would you design a distributed rate limiter for an API handling 100,000 requests per second across multiple data centers?"
          </div>

          <Textarea
            label="Your Technical Response"
            rows={5}
            placeholder="Describe your algorithm choice (e.g. Token Bucket, Sliding Window Log), Redis cache storage, and concurrency handling..."
          />

          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" leftIcon={<Mic className="w-4 h-4 text-rose-400 animate-pulse" />}>
              Voice Input Active
            </Button>
            <Button variant="primary" size="sm" rightIcon={<Send className="w-4 h-4" />}>
              Submit Answer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewSessionPage;
