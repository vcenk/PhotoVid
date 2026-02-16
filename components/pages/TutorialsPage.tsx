import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from '../layout/Navbar';
import { Footer } from '../landing/Footer';
import { TUTORIALS, Tutorial } from '@/lib/data/tutorials';
import { 
  Play, 
  Clock, 
  BarChart, 
  Search, 
  ChevronRight, 
  Sparkles,
  CheckCircle2,
  X,
  PlayCircle
} from 'lucide-react';

export const TutorialsPage: React.FC = () => {
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [filter, setFilter] = useState('All');

  const filteredTutorials = filter === 'All' 
    ? TUTORIALS 
    : TUTORIALS.filter(t => t.category === filter);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-[Space_Grotesk]">
      <Navbar />

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6 inline-block"
              >
                Learning Center
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-black tracking-tighter mb-6"
              >
                Master the <span className="text-zinc-500 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Studio.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-zinc-400 text-lg leading-relaxed"
              >
                Step-by-step guides to help you create cinematic property listings using Photovid's AI creative suite.
              </motion.p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                placeholder="Search tutorials..."
                className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-3 mb-12">
            {['All', 'Basics', 'Editing', 'Video', 'Advanced'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
                  filter === cat 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tutorial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredTutorials.map((tutorial, index) => (
              <motion.div
                key={tutorial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white/5 border border-white/10 rounded-[40px] overflow-hidden hover:border-emerald-500/40 transition-all duration-500"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Thumbnail */}
                  <div className="lg:w-2/5 relative aspect-square lg:aspect-auto overflow-hidden">
                    <img
                      src={tutorial.thumbnail}
                      alt={tutorial.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <button 
                        onClick={() => setSelectedTutorial(tutorial)}
                        className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transform transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:border-emerald-400 shadow-xl"
                      >
                        <Play size={28} fill="currentColor" />
                      </button>
                    </div>
                    <div className="absolute top-6 left-6">
                      <span className="px-3 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest">
                        {tutorial.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:w-3/5 p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        <span className="flex items-center gap-1.5"><Clock size={14} /> {tutorial.duration}</span>
                        <span className="flex items-center gap-1.5"><BarChart size={14} /> {tutorial.level}</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-4 group-hover:text-emerald-400 transition-colors">
                        {tutorial.title}
                      </h3>
                      <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                        {tutorial.description}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedTutorial(tutorial)}
                      className="flex items-center gap-2 text-sm font-bold text-white hover:text-emerald-400 transition-colors group/btn"
                    >
                      Start Lesson <ChevronRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Tutorial Modal Experience */}
      <AnimatePresence>
        {selectedTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-zinc-900 border border-white/10 rounded-[48px] overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[80vh]"
            >
              <button 
                onClick={() => setSelectedTutorial(null)}
                className="absolute top-8 right-8 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition-all shadow-2xl"
              >
                <X size={24} />
              </button>

              {/* Video/Image Placeholder Area */}
              <div className="md:w-3/5 bg-black relative">
                <img
                  src={selectedTutorial.thumbnail}
                  alt={selectedTutorial.title}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-12 text-center">
                  <PlayCircle size={80} className="text-emerald-500 animate-pulse" />
                  <h2 className="text-3xl font-black tracking-tighter">{selectedTutorial.title}</h2>
                  <p className="text-zinc-400 max-w-md">Streaming lesson... Mastering {selectedTutorial.category.toLowerCase()} techniques.</p>
                </div>
              </div>

              {/* Sidebar: Steps */}
              <div className="md:w-2/5 p-12 overflow-y-auto border-l border-white/5">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500 mb-6 block">Course Curriculum</span>
                <h3 className="text-xl font-bold mb-10">Step-by-Step Guide</h3>
                
                <div className="space-y-10">
                  {selectedTutorial.steps.map((step, i) => (
                    <div key={i} className="relative pl-10">
                      <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-emerald-500/30">
                        {i + 1}
                      </div>
                      <h4 className="text-lg font-bold mb-2">{step.title}</h4>
                      <p className="text-zinc-500 text-sm leading-relaxed">{step.content}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-16 pt-10 border-t border-white/5">
                  <button className="w-full py-5 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2">
                    <Sparkles size={18} /> Open Studio to Start
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default TutorialsPage;
