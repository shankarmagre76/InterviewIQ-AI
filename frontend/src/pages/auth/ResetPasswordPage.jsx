import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { authService } from '../../services/authService';

const calculatePasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: 'rose' };
  let score = 0;
  if (pwd.length >= 6) score += 1;
  if (pwd.length >= 8) score += 1;
  if (/[0-9]/.test(pwd) && /[a-zA-Z]/.test(pwd)) score += 1;
  if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;

  if (score <= 1) return { score: 25, label: 'Weak', color: 'rose' };
  if (score === 2) return { score: 50, label: 'Fair', color: 'amber' };
  if (score === 3) return { score: 75, label: 'Strong', color: 'cyan' };
  return { score: 100, label: 'Excellent', color: 'emerald' };
};

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordStrength = calculatePasswordStrength(newPassword);

  const validate = () => {
    const errors = {};

    if (!newPassword) {
      errors.newPassword = 'New password is required.';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters long.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password.';
    } else if (confirmPassword !== newPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!token) {
      setApiError('Missing password reset token. Please request a new link.');
      return;
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword({ token, newPassword });
      setIsSuccess(true);
    } catch (err) {
      const errorMessage = err?.message || '';
      if (errorMessage.includes('Network Error') || err?.code === 'ERR_NETWORK') {
        setApiError('Unable to connect to authentication server. Please check your internet connection.');
      } else {
        setApiError('Invalid or expired password reset token. Please request a new link.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Missing or Invalid Token View
  if (!token && !isSuccess) {
    return (
      <Card variant="glass" className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-rose-300">Invalid Reset Link</CardTitle>
          <CardDescription>
            No valid password reset token was provided in the URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="danger" title="Missing Reset Token">
            This password reset link is invalid or incomplete. Please request a new password reset email.
          </Alert>
        </CardContent>
        <CardFooter>
          <Link to="/forgot-password" className="w-full">
            <Button variant="primary" fullWidth leftIcon={<KeyRound className="w-4 h-4" />}>
              Request New Reset Link
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Set New Password</CardTitle>
        <CardDescription>
          Enter your new password below to update your account credentials.
        </CardDescription>
      </CardHeader>

      {isSuccess ? (
        <CardContent className="space-y-5">
          <Alert variant="success" title="Password Reset Successful">
            Your account password has been updated successfully! You can now log in using your new password.
          </Alert>

          <div className="pt-2">
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate('/login', { replace: true })}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Sign In with New Password
            </Button>
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-4">
            {apiError && (
              <Alert variant="danger" title="Reset Failed" onClose={() => setApiError('')}>
                {apiError}
              </Alert>
            )}

            {/* New Password */}
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (fieldErrors.newPassword) setFieldErrors((prev) => ({ ...prev, newPassword: null }));
              }}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-slate-400 hover:text-slate-100 transition-colors p-1 cursor-pointer focus-visible:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={fieldErrors.newPassword}
              required
              autoComplete="new-password"
            />

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-1 pt-1">
                <ProgressBar
                  value={passwordStrength.score}
                  color={passwordStrength.color}
                  size="sm"
                  showPercentage={false}
                />
                <p className="text-[11px] text-slate-400 flex justify-between font-medium">
                  <span>Password Strength:</span>
                  <span className="font-bold text-slate-200">{passwordStrength.label}</span>
                </p>
              </div>
            )}

            {/* Confirm Password */}
            <Input
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: null }));
              }}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="text-slate-400 hover:text-slate-100 transition-colors p-1 cursor-pointer focus-visible:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={fieldErrors.confirmPassword}
              required
              autoComplete="new-password"
            />
          </CardContent>

          <CardFooter className="flex-col gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isSubmitting}
              leftIcon={<KeyRound className="w-4 h-4" />}
            >
              Update Password
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

export default ResetPasswordPage;
