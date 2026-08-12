import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>Enter your email to receive a password reset link.</CardDescription>
      </CardHeader>
      {submitted ? (
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-emerald-400">If an account exists for {email}, a reset link has been sent!</p>
          <Link to="/auth/login" className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button type="submit" variant="primary" fullWidth>
              Send Reset Instructions
            </Button>
            <Link to="/auth/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </CardFooter>
        </form>
      )}
    </Card>
  );
};

export default ForgotPasswordPage;
