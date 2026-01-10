
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createClient } from '../../lib/database/client';
import { Sparkles, Mail, Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Background } from '../../components/layout/Background';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) {
      setMessage({ 
        type: 'warning', 
        text: 'Authentication is currently disabled. Check configuration.' 
      });
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setIsLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Check your email for the link!' });
    }
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-50">
      <Background />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-12 text-sm font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className="p-10 rounded-[40px] border border-zinc-200 bg-white shadow-2xl shadow-zinc-200">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2 font-serif italic text-zinc-500">Welcome back.</h1>
            <p className="text-zinc-500 text-sm">Enter your email to receive a secure magic link.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                <input
                  type="email"
                  required
                  disabled={!supabase}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 text-zinc-900 focus:outline-none focus:border-indigo-600 transition-all font-sans disabled:opacity-50"
                />
              </div>
            </div>

            <button
              disabled={isLoading || !supabase}
              type="submit"
              className="w-full py-4 rounded-2xl bg-zinc-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-zinc-200"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <><Sparkles size={16} /> Send Magic Link</>}
            </button>
          </form>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-xl text-xs font-bold text-center ${
                message.type === 'success' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 
                message.type === 'warning' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                'bg-red-50 text-red-600 border border-red-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {message.type === 'warning' && <AlertTriangle size={14} />}
                {message.text}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
