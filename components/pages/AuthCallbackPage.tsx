import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createClient } from '@/lib/database/client';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();

      if (!supabase) {
        setStatus('error');
        setMessage('Authentication is not configured');
        return;
      }

      try {
        // Get the code from the URL (for OAuth or magic link)
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          setStatus('error');
          setMessage(errorDescription || error);
          return;
        }

        if (code) {
          // Exchange the code for a session
          const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

          if (sessionError) {
            setStatus('error');
            setMessage(sessionError.message);
            return;
          }
        }

        // Check if we have a valid session
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession();

        if (getSessionError) {
          setStatus('error');
          setMessage(getSessionError.message);
          return;
        }

        if (session) {
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');

          // Redirect to studio after a short delay
          setTimeout(() => {
            navigate('/studio');
          }, 1500);
        } else {
          setStatus('error');
          setMessage('No session found. Please try signing in again.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('An unexpected error occurred during authentication');
        console.error('Auth callback error:', err);
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <Loader2 size={48} className="text-violet-500 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-white mb-2">Processing...</h1>
            <p className="text-zinc-400 text-sm">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Success!</h1>
            <p className="text-zinc-400 text-sm">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Authentication Failed</h1>
            <p className="text-zinc-400 text-sm mb-6">{message}</p>
            <button
              onClick={() => navigate('/auth')}
              className="px-6 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};
