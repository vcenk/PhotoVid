import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Link2 } from 'lucide-react';
import { useSocialIntegrations } from '@/lib/store/contexts/SocialIntegrationsContext';

type CallbackStatus = 'processing' | 'success' | 'error';

export function SocialCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { completeOAuth } = useSocialIntegrations();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Check for Facebook error response
      if (error) {
        setStatus('error');
        setErrorMessage(errorDescription || 'Authorization was denied or failed');
        return;
      }

      // Validate required parameters
      if (!code || !state) {
        setStatus('error');
        setErrorMessage('Invalid callback parameters');
        return;
      }

      // Complete the OAuth flow
      const success = await completeOAuth(code, state);

      if (success) {
        setStatus('success');
        // Redirect to integrations page after brief success message
        setTimeout(() => {
          navigate('/studio/integrations', { replace: true });
        }, 2000);
      } else {
        setStatus('error');
        setErrorMessage('Failed to connect your account. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams, completeOAuth, navigate]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full mx-4"
      >
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 text-center">
          {/* Icon */}
          <div className="mb-6">
            {status === 'processing' && (
              <div className="w-16 h-16 mx-auto rounded-full bg-violet-500/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center"
              >
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </motion.div>
            )}
            {status === 'error' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center"
              >
                <XCircle className="w-8 h-8 text-red-500" />
              </motion.div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
            {status === 'processing' && 'Connecting Your Account'}
            {status === 'success' && 'Successfully Connected!'}
            {status === 'error' && 'Connection Failed'}
          </h1>

          {/* Description */}
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
            {status === 'processing' &&
              'Please wait while we finish setting up your social media connection...'}
            {status === 'success' &&
              'Your Facebook and Instagram accounts have been connected. Redirecting...'}
            {status === 'error' && (errorMessage || 'Something went wrong. Please try again.')}
          </p>

          {/* Actions */}
          {status === 'error' && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/studio/integrations')}
                className="w-full px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors"
              >
                Back to Integrations
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-3 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-center gap-2 text-zinc-400 text-xs">
              <Link2 size={14} />
              <span>Secure connection via Facebook Login</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default SocialCallbackPage;
