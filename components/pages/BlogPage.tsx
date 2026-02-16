import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from '../layout/Navbar';
import { Footer } from '../landing/Footer';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';
import { BLOG_POSTS } from '@/lib/data/blog-posts';

export const BlogPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-[Space_Grotesk]">
      <Navbar />

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-widest mb-6 inline-block"
            >
              Resources & Insights
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tighter mb-6"
            >
              Photovid <span className="text-zinc-500">Blog.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-400 max-w-2xl mx-auto text-lg"
            >
              The latest in real estate AI, visual marketing strategies, and product updates from the Photovid team.
            </motion.p>
          </div>

          {/* Search/Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16 p-2 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex flex-wrap gap-2 px-4">
              {['All', 'Virtual Staging', 'Editing', 'Marketing', 'Photography'].map((cat) => (
                <button
                  key={cat}
                  className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-80 px-2">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full pl-12 pr-6 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BLOG_POSTS.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group flex flex-col bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-teal-500/50 transition-all duration-500"
              >
                <Link to={`/blog/${post.id}`} className="block">
                  {/* Image Container */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest text-teal-400">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4 font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Calendar size={14} /> {post.date}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14} /> {post.readTime}</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 leading-tight group-hover:text-teal-400 transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-zinc-400 text-sm leading-relaxed mb-8 flex-1">
                      {post.excerpt}
                    </p>

                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 text-[10px] font-bold">
                          {post.author.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-xs font-bold text-zinc-300">{post.author}</span>
                      </div>
                      <div
                        className="p-2 rounded-full bg-white/5 text-zinc-400 group-hover:bg-teal-500 group-hover:text-white transition-all"
                      >
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          {/* Pagination Placeholder */}
          <div className="mt-20 flex justify-center items-center gap-4">
            <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-zinc-400 hover:text-white transition-all">
              Previous
            </button>
            <div className="flex gap-2">
              {[1, 2, 3].map(n => (
                <button
                  key={n}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold border transition-all ${
                    n === 1 ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-zinc-400 hover:text-white transition-all">
              Next
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPage;
