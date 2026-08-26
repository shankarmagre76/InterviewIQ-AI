import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, Eye, EyeOff } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useAuth } from '../../hooks/useAuth';
import { parseApiError } from '../../utils/helpers';


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

import { useToast } from '../../hooks/useToast';

export const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Student');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const passwordStrength = calculatePasswordStrength(password);

  const validate = () => {
    const errors = {};
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFirst) {
      errors.firstName = 'First name is required.';
    } else if (trimmedFirst.length < 2) {
      errors.firstName = 'First name must be at least 2 characters.';
    }

    if (!trimmedLast) {
      errors.lastName = 'Last name is required.';
    } else if (trimmedLast.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters.';
    }

    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'Passwords do not match.';
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
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role,
      });

      toast.success('Account Created!', `Welcome to InterviewIQ AI, ${firstName.trim()}!`);

      const targetPath = role === 'Recruiter' ? '/recruiter/dashboard' : '/dashboard';
      navigate(targetPath, { replace: true });
    } catch (err) {
      const parsedErr = parseApiError(err);
      setApiError(parsedErr);
      toast.error('Registration Failed', parsedErr);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card variant="glass" className="w-full max-w-lg mx-auto my-6">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Join InterviewIQ AI to accelerate your technical career.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-4">
          {apiError && (
            <Alert variant="danger" title="Registration Error" onClose={() => setApiError('')}>
              {apiError}
            </Alert>
          )}

          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="First Name"
              placeholder="Jane"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (fieldErrors.firstName) setFieldErrors((prev) => ({ ...prev, firstName: null }));
              }}
              leftIcon={<User className="w-4 h-4" />}
              error={fieldErrors.firstName}
              required
              autoComplete="given-name"
            />
            <Input
              label="Last Name"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (fieldErrors.lastName) setFieldErrors((prev) => ({ ...prev, lastName: null }));
              }}
              error={fieldErrors.lastName}
              required
              autoComplete="family-name"
            />
          </div>

          {/* Email Address */}
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

          {/* Account Role Selection */}
          <Select
            label="Account Type"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="Student">Candidate / Student</option>
            <option value="Recruiter">Recruiter / Employer</option>
          </Select>

          {/* Password */}
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
            autoComplete="new-password"
          />

          {/* Password Strength Indicator */}
          {password && (
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
            label="Confirm Password"
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
            disabled={isSubmitting}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Create Account & Get Started
          </Button>


          <p className="text-xs text-slate-400 text-center">
            Already registered?{' '}
            <Link
              to="/login"
              className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RegisterPage;
