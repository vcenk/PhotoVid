import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, Image as ImageIcon, Video, Dices } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useDashboardStore } from '../../../lib/store/dashboard';
import { quickPrompts } from '../../../lib/data/dashboard';

export function HeroComposer() {
  const navigate = useNavigate();
  const {
    promptDraft,
    selectedMode,
    activeIndustry,
    setPromptDraft,
    setSelectedMode
  } = useDashboardStore();

  const handleGenerate = () => {
    if (promptDraft.trim().length < 3) {
      return;
    }

    const params = new URLSearchParams({
      mode: selectedMode,
      industry: activeIndustry,
      prompt: promptDraft,
    });

    navigate(`/dashboard/studio?${params.toString()}`);
  };

  const handleRandomPrompt = () => {
    const random = quickPrompts[Math.floor(Math.random() * quickPrompts.length)];
    setPromptDraft(random);
  };

  return (
    <section className="relative w-full flex flex-col items-center justify-center bg-white dark:bg-[#09090b] px-6 py-20 md:py-32">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-50 dark:bg-indigo-950/30 rounded-full blur-[100px] pointer-events-none opacity-40" />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center text-center space-y-12">

        {/* Headlines */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white">
            What do you want to create?
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 dark:text-zinc-500 font-medium max-w-2xl mx-auto">
            Type your prompt — turn ideas into stunning AI visuals instantly.
          </p>
        </div>

        {/* The Input Card */}
        <div className="w-full max-w-6xl bg-white dark:bg-zinc-950 rounded-[2.5rem] shadow-[0_30px_70px_-10px_rgba(0,0,0,0.06)] dark:shadow-[0_30px_70px_-10px_rgba(0,0,0,0.4)] border border-zinc-100 dark:border-zinc-800 p-2 md:p-3 relative group focus-within:ring-4 focus-within:ring-indigo-50 dark:focus-within:ring-indigo-950/50 transition-all text-left">
          {/* Text Area */}
          <div className="relative px-6 pt-5 pb-16 md:pb-20">
            <textarea
              value={promptDraft}
              onChange={(e) => setPromptDraft(e.target.value)}
              placeholder="Write what you want to create..."
              className="w-full h-28 md:h-36 bg-transparent text-xl md:text-2xl text-zinc-800 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-600 resize-none outline-none font-medium leading-relaxed scrollbar-hide"
            />
          </div>

          {/* Bottom Controls Bar */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            
            {/* Left: Toggles & Random */}
            <div className="flex items-center gap-2">
              {/* Mode Toggle Group */}
              <div className="flex bg-zinc-50 dark:bg-zinc-900 p-1.5 rounded-full border border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => setSelectedMode('image')}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2",
                    selectedMode === 'image'
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-700/50"
                      : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                  )}
                >
                  <ImageIcon size={14} /> Image
                </button>
                <button
                  onClick={() => setSelectedMode('video')}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2",
                    selectedMode === 'video'
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-700/50"
                      : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                  )}
                >
                  <Video size={14} /> Video
                </button>
              </div>

              {/* Random Button */}
              <button
                onClick={handleRandomPrompt}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-zinc-800 hover:border-indigo-100 dark:hover:border-indigo-800 transition-all active:scale-90"
                title="Random Prompt"
              >
                <Dices size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Right: Submit Action */}
            <button
              onClick={handleGenerate}
              disabled={!promptDraft.trim()}
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
                promptDraft.trim()
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-indigo-950/50 hover:scale-105 hover:bg-indigo-700"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 cursor-not-allowed"
              )}
            >
              <ArrowUp size={28} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
