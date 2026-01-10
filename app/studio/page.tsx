
import { redirect } from 'next/navigation'
import { createClient } from '../../lib/database/server'
import { Background } from '../../components/layout/Background'
import { Navbar } from '../../components/layout/Navbar'
import { Sparkles, Layout, Play, History, Settings, LogOut } from 'lucide-react'

export default async function StudioPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="relative min-h-screen bg-[#09090b] text-white overflow-hidden">
      <Background />
      <Navbar />

      <main className="relative z-10 pt-32 px-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2 block">Creative Suite</span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter font-serif italic">Your Studio.</h1>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 rounded-xl bg-zinc-900 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2">
              <History size={14} /> My History
            </button>
            <button className="px-8 py-3 rounded-xl bg-violet-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-violet-500 transition-all flex items-center gap-2 shadow-lg shadow-violet-600/20">
              <Sparkles size={14} /> New Project
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar / Tools */}
          <div className="lg:col-span-3 space-y-4">
            {[
              { label: 'Project Assets', icon: Layout },
              { label: 'Motion Presets', icon: Play },
              { label: 'Settings', icon: Settings },
            ].map((tool) => (
              <button key={tool.label} className="w-full p-6 rounded-2xl bg-zinc-900/40 border border-white/5 flex items-center gap-4 text-zinc-400 hover:text-white hover:border-white/20 transition-all text-left group">
                <tool.icon size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">{tool.label}</span>
              </button>
            ))}
          </div>

          {/* Main Stage */}
          <div className="lg:col-span-9">
            <div className="aspect-video w-full rounded-[48px] bg-zinc-950 border border-white/5 flex flex-col items-center justify-center text-center p-12 border-dashed">
              <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-700 mb-6">
                <Play size={32} />
              </div>
              <h2 className="text-xl font-bold text-zinc-400 mb-2 tracking-tight">Stage is empty.</h2>
              <p className="text-zinc-600 text-sm max-w-xs mx-auto">Upload a reference image or start typing a prompt to generate cinematic motion.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
