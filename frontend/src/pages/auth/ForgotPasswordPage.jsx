import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, KeyRound } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { authService } from '../../services/authService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [devResetToken, setDevResetToken] = useState(null);

  const validate = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setFieldError('Email address is required.');
      return false;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setFieldError('Please enter a valid email address.');
      return false;
    }
    setFieldError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      const resData = res?.data || res;

      setIsSubmitted(true);

      // In local dev/test mode, backend may return simulated token for local testing
      if (resData?.devResetToken) {
        setDevResetToken(resData.devResetToken);
      }
    } catch (err) {
      const errorMessage = err?.message || '';
      if (errorMessage.includes('Network Error') || err?.code === 'ERR_NETWORK') {
        setApiError('Unable to connect to authentication server. Please check your internet connection.');
      } else {
        // Generic response messaging to prevent account enumeration
        setIsSubmitted(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card variant="glass" className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Reset Your Password</CardTitle>
        <CardDescription>
          Enter your candidate email address and we'll send you a password reset link.
        </CardDescription>
      </CardHeader>

      {isSubmitted ? (
        <CardContent className="space-y-5">
          <Alert variant="success" title="Check Your Email Inbox">
            If an account with that email address exists, a password reset link has been sent to your email. Please check your inbox and follow the instructions.
          </Alert>

          {devResetToken && (
            <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 space-y-2 text-xs">
              <p className="font-bold text-indigo-300 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4" /> Local Development Testing Quick Link:
              </p>
              <Link
                to={`/reset-password?token=${devResetToken}`}
                className="text-indigo-400 font-mono hover:underline block truncate"
              >
                /reset-password?token={devResetToken.substring(0, 16)}...
              </Link>
            </div>
          )}

          <div className="pt-2">
            <Link to="/login" className="w-full block">
              <Button variant="outline" fullWidth leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Return to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-4">
            {apiError && (
              <Alert variant="danger" title="Request Failed" onClose={() => setApiError('')}>
                {apiError}
              </Alert>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="candidate@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldError) setFieldError('');
              }}
              leftIcon={<Mail className="w-4 h-4" />}
              error={fieldError}
              required
              autoComplete="email"
            />
          </CardContent>

          <CardFooter className="flex-col gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Send Reset Link
            </Button>

            <Link
              to="/login"
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </CardFooter>
        </form>
      )}
    </Card>
  );
};

export default ForgotPasswordPage;
