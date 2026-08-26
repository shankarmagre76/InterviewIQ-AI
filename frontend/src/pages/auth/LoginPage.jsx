import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { useAuth } from '../../hooks/useAuth';
import { parseApiError } from '../../utils/helpers';


import { useToast } from '../../hooks/useToast';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const validate = () => {
    const errors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login({ email: email.trim(), password });
      const loggedInUser = res?.user || res;

      toast.success('Welcome Back!', `Signed in successfully as ${loggedInUser?.email || email}`);

      const userRole = loggedInUser?.role?.toLowerCase();
      const defaultPath = userRole === 'admin' ? '/admin' : userRole === 'recruiter' ? '/recruiter/dashboard' : '/dashboard';
      const redirectPath = from || defaultPath;
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const parsedErr = parseApiError(err);
      setApiError(parsedErr);
      toast.error('Authentication Failed', parsedErr);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card variant="glass" className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Sign in to your InterviewIQ AI account to continue.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-4">
          {apiError && (
            <Alert variant="danger" title="Authentication Error" onClose={() => setApiError('')}>
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
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
            }}
            leftIcon={<Mail className="w-4 h-4" />}
            error={fieldErrors.email}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
            }}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="text-slate-400 hover:text-slate-100 transition-colors p-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

            }
            error={fieldErrors.password}
            required
            autoComplete="current-password"
          />

          <div className="flex justify-end pt-1">
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm"
            >
              Forgot Password?
            </Link>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
            disabled={isSubmitting}
            leftIcon={<LogIn className="w-4 h-4" />}
          >
            Sign In
          </Button>


          <p className="text-xs text-slate-400 text-center">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm"
            >
              Create free account
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginPage;
