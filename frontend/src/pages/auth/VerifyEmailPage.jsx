import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, AlertOctagon, ArrowRight } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/LoadingState';
import { Alert } from '../../components/ui/Alert';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';

export const VerifyEmailPage = () => {
  const { token: pathToken } = useParams();
  const [searchParams] = useSearchParams();
  const queryToken = searchParams.get('token');
  const token = pathToken || queryToken;

  const navigate = useNavigate();
  const { isAuthenticated, refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const performVerification = async () => {
      if (!token) {
        if (isMounted) {
          setErrorMessage('Missing email verification token. Please check your verification link.');
          setLoading(false);
        }
        return;
      }

      try {
        await authService.verifyEmail(token);
        if (isMounted) {
          setSuccess(true);
          if (isAuthenticated) {
            refreshUser();
          }
        }
      } catch (err) {
        if (isMounted) {
          const msg = err?.response?.data?.message || err?.message;
          if (msg?.includes('Network Error') || err?.code === 'ERR_NETWORK') {
            setErrorMessage('Unable to connect to authentication server. Please check your internet connection.');
          } else {
            setErrorMessage('Invalid or expired email verification token. Links expire after 24 hours.');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [token, isAuthenticated, refreshUser]);

  // Loading View
  if (loading) {
    return (
      <Card variant="glass" className="w-full max-w-md mx-auto text-center py-8">
        <CardContent className="flex flex-col items-center justify-center gap-4">
          <Spinner size="lg" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-100">Verifying Email Address</h3>
            <p className="text-xs text-slate-400">Communicating with authentication service...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success View
  if (success) {
    return (
      <Card variant="glass" className="w-full max-w-md mx-auto text-center">
        <CardHeader className="items-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <CardTitle className="text-emerald-300">Email Address Verified!</CardTitle>
          <CardDescription>
            Your candidate profile is now fully verified and activated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="success" title="Profile Activated">
            You now have complete access to AI mock interviews, ATS resume scoring, and custom roadmaps.
          </Alert>
        </CardContent>
        <CardFooter>
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login', { replace: true })}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {isAuthenticated ? 'Continue to Dashboard' : 'Proceed to Sign In'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Failure / Invalid Token View
  return (
    <Card variant="glass" className="w-full max-w-md mx-auto text-center">
      <CardHeader className="items-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-2 border border-rose-500/20 shadow-lg shadow-rose-500/10">
          <AlertOctagon className="w-8 h-8" />
        </div>
        <CardTitle className="text-rose-300">Verification Failed</CardTitle>
        <CardDescription>
          We were unable to verify your email address.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="danger" title="Verification Error">
          {errorMessage || 'Invalid or expired email verification token.'}
        </Alert>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Link to={isAuthenticated ? '/dashboard' : '/login'} className="w-full">
          <Button variant="outline" fullWidth>
            {isAuthenticated ? 'Return to Dashboard' : 'Back to Sign In'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default VerifyEmailPage;
