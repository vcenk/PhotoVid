import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createClient } from '@/lib/database/client';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      const supabase = createClient();

      if (!supabase) {
        setStatus('error');
        setMessage('Authentication is not configured');
        return;
      }

      try {
        // Check URL for errors first
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          setStatus('error');
          setMessage(errorDescription || error);
          return;
        }

        // First, check if we already have a valid session
        // (Supabase's onAuthStateChange may have already processed the callback)
        const { data: { session: existingSession } } = await supabase.auth.getSession();

        if (existingSession) {
          // Already authenticated - redirect immediately
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          setTimeout(() => navigate('/studio'), 1000);
          return;
        }

        // If no session, try to exchange the code
        const code = searchParams.get('code');

        if (code) {
          const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

          if (sessionError) {
            // PKCE error often means the session was already exchanged
            // Check again for an existing session
            if (sessionError.message.includes('PKCE') || sessionError.message.includes('code verifier')) {
              // Wait a bit for auth state to propagate
              await new Promise(resolve => setTimeout(resolve, 500));

              const { data: { session: retrySession } } = await supabase.auth.getSession();

              if (retrySession) {
                setStatus('success');
                setMessage('Authentication successful! Redirecting...');
                setTimeout(() => navigate('/studio'), 1000);
                return;
              }
            }

            setStatus('error');
            setMessage(sessionError.message);
            return;
          }
        }

        // Final check for session
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession();

        if (getSessionError) {
          setStatus('error');
          setMessage(getSessionError.message);
          return;
        }

        if (session) {
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          setTimeout(() => navigate('/studio'), 1000);
        } else {
          setStatus('error');
          setMessage('No session found. Please try signing in again.');
        }
      } catch (err: any) {
        // Handle PKCE errors gracefully
        if (err?.message?.includes('PKCE') || err?.message?.includes('code verifier')) {
          // Check for session one more time
          const supabase = createClient();
          if (supabase) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              setStatus('success');
              setMessage('Authentication successful! Redirecting...');
              setTimeout(() => navigate('/studio'), 1000);
              return;
            }
          }
        }

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
            <Loader2 size={48} className="text-emerald-500 animate-spin mx-auto mb-4" />
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
              onClick={async () => {
                // Check if session actually exists despite the error
                const supabase = createClient();
                if (supabase) {
                  const { data: { session } } = await supabase.auth.getSession();
                  if (session) {
                    navigate('/studio');
                    return;
                  }
                }
                navigate('/auth');
              }}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};
