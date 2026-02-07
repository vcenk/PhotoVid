import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Building2, Sparkles } from 'lucide-react';
import { useDashboardStore } from '../../../lib/store/dashboard';

export function HeroComposer() {
  const navigate = useNavigate();
  const { promptDraft, setPromptDraft } = useDashboardStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptDraft.trim().length < 3) return;
    const params = new URLSearchParams({ prompt: promptDraft });
    navigate(`/studio/image?${params.toString()}`);
  };

  return (
    <section className="px-6 pt-6 pb-2">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 py-10 px-8">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3" />
          </div>

          <div className="relative z-10 space-y-5">
            {/* Headlines */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 size={20} className="text-white/80" />
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Real Estate AI Tools
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-white/60" />
                <p className="text-sm md:text-base text-white/70">
                  Transform listings with virtual staging, photo enhancement, and video tours
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-2xl">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={promptDraft}
                  onChange={(e) => setPromptDraft(e.target.value)}
                  placeholder="Search real estate tools or describe what you need..."
                  className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/40 rounded-xl border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/10 text-sm"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 bg-white text-teal-700 font-semibold rounded-xl hover:bg-white/90 transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
              >
                Go
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
