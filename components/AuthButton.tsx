
"use client";

import React from 'react';
import { createClient } from '../lib/supabase/client';
import { LogOut, Layout, User } from 'lucide-react';

interface AuthButtonProps {
  user: any;
  isScrolled?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ user, isScrolled }) => {
  const supabase = createClient();

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.reload();
    window.location.href = '/';
  };

  if (!user) {
    return (
      <button 
        onClick={() => window.location.href = '/login'}
        className={`
          hidden sm:flex items-center gap-3 rounded-full font-black text-xs uppercase tracking-[0.15em] transition-all active:scale-95 px-10 py-4 shadow-lg
          ${isScrolled 
            ? "bg-white text-black hover:bg-zinc-200" 
            : "bg-zinc-950 text-white hover:bg-black"
          }
        `}
      >
        <User size={16} /> Log In
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <button 
        onClick={() => window.location.href = '/studio'}
        className={`
          hidden sm:flex items-center gap-3 rounded-full font-black text-xs uppercase tracking-[0.15em] transition-all active:scale-95 px-10 py-4 shadow-lg
          ${isScrolled 
            ? "bg-white text-black hover:bg-zinc-200" 
            : "bg-zinc-950 text-white hover:bg-black"
          }
        `}
      >
        <Layout size={16} /> Studio
      </button>
      <button 
        onClick={handleSignOut}
        title="Sign Out"
        className={`
          p-4 rounded-full border transition-all active:scale-90 shadow-sm
          ${isScrolled 
            ? "bg-zinc-900 border-white/10 text-zinc-500 hover:text-red-400 hover:border-red-500/30" 
            : "bg-white border-stone-200 text-zinc-400 hover:text-red-500 hover:border-red-200"
          }
        `}
      >
        <LogOut size={18} />
      </button>
    </div>
  );
};
