import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Navbar } from '../layout/Navbar';
import { Footer } from '../landing/Footer';
import { BLOG_POSTS } from '@/lib/data/blog-posts';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Bookmark,
  ChevronRight,
  Sparkles,
  Quote,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const post = BLOG_POSTS.find(p => p.id === Number(id));
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!post) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
        <p className="text-zinc-400 mb-8">The blog post you're looking for doesn't exist.</p>
        <Link to="/blog" className="px-6 py-3 bg-teal-500 rounded-xl font-bold hover:bg-teal-600 transition-all">
          Back to Blog
        </Link>
      </div>
    );
  }

  const relatedPosts = BLOG_POSTS.filter(p => p.id !== post.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-[Space_Grotesk]">
      <Navbar />

      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-teal-500 origin-left z-[110]"
        style={{ scaleX }}
      />

      <main className="pt-32 pb-24">
        <article>
          {/* Header Section */}
          <header className="max-w-4xl mx-auto px-6 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-zinc-500 hover:text-teal-400 transition-colors mb-8 group"
              >
                <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                Back to all articles
              </Link>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-3 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-black uppercase tracking-widest">
                  {post.category}
                </span>
              </div>

              <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-8 leading-[1.05] bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-6 py-8 border-y border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-teal-500/20">
                    {post.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">{post.author}</p>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Calendar size={14} className="text-teal-500" /> {post.date}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14} className="text-teal-500" /> {post.readTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all text-sm font-bold">
                    <Share2 size={18} /> Share
                  </button>
                  <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-teal-400 hover:bg-white/10 transition-all">
                    <Bookmark size={20} />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Featured Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="relative aspect-[21/9] rounded-[48px] overflow-hidden border border-white/10 shadow-2xl shadow-teal-500/5 group"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
            </motion.div>
          </header>

          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Sidebar / Takeaways */}
            <aside className="lg:col-span-4 order-2 lg:order-1">
              <div className="sticky top-32 space-y-8">
                {/* Key Takeaways Box */}
                <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 relative overflow-hidden group">
                  <div className="absolute -top-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Sparkles size={120} className="text-teal-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <CheckCircle2 className="text-teal-500" size={20} />
                    Key Takeaways
                  </h3>
                  <ul className="space-y-4">
                    {post.tags.map((tag, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-400 leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 shrink-0" />
                        <span>Focused on <strong>{tag}</strong> strategies for better conversion.</span>
                      </li>
                    ))}
                    <li className="flex items-start gap-3 text-sm text-zinc-400 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 shrink-0" />
                      <span>Actionable insights to implement in your next listing.</span>
                    </li>
                  </ul>
                </div>

                {/* Tags */}
                <div className="px-4">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <span key={tag} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 text-xs font-bold hover:text-teal-400 hover:border-teal-500/30 cursor-default transition-colors">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Newsletter Small */}
                <div className="p-8 rounded-[32px] bg-teal-500 text-white">
                  <h4 className="text-xl font-black tracking-tight mb-2">Weekly Insights</h4>
                  <p className="text-teal-100 text-sm mb-6 opacity-80">Join 12k+ agents getting AI marketing tips.</p>
                  <div className="relative">
                    <input 
                      type="email" 
                      placeholder="Email address" 
                      className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-sm placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-white text-teal-600">
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Article Content */}
            <div className="lg:col-span-8 order-1 lg:order-2">
              <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              <style>{`
                .blog-content p {
                  color: #a1a1aa;
                  font-size: 1.125rem;
                  line-height: 1.9;
                  margin-bottom: 1.75rem;
                }
                .blog-content p.lead {
                  font-size: 1.35rem;
                  color: #d4d4d8;
                  line-height: 1.8;
                  margin-bottom: 2.5rem;
                }
                .blog-content strong {
                  color: white;
                  font-weight: 700;
                }
                .blog-content h2 {
                  color: white;
                  font-size: 2rem;
                  font-weight: 900;
                  letter-spacing: -0.025em;
                  margin-top: 3.5rem;
                  margin-bottom: 1.5rem;
                  line-height: 1.2;
                }
                .blog-content h3 {
                  color: white;
                  font-size: 1.5rem;
                  font-weight: 800;
                  letter-spacing: -0.025em;
                  margin-top: 2.5rem;
                  margin-bottom: 1rem;
                  line-height: 1.3;
                }
                .blog-content blockquote {
                  border-left: 4px solid #14b8a6;
                  background: rgba(255,255,255,0.03);
                  padding: 1.75rem 2rem;
                  margin: 2.5rem 0;
                  border-radius: 0 1.5rem 1.5rem 0;
                  font-style: italic;
                  color: #d4d4d8;
                  font-size: 1.2rem;
                  line-height: 1.7;
                }
                .blog-content blockquote p {
                  margin: 0;
                  color: inherit;
                  font-size: inherit;
                }
                .blog-content ul {
                  margin: 2rem 0;
                  padding-left: 0;
                  list-style: none;
                }
                .blog-content ul li {
                  color: #a1a1aa;
                  margin-bottom: 1rem;
                  padding-left: 1.75rem;
                  position: relative;
                  font-size: 1.05rem;
                  line-height: 1.7;
                }
                .blog-content ul li::before {
                  content: '';
                  position: absolute;
                  left: 0;
                  top: 0.6rem;
                  width: 6px;
                  height: 6px;
                  background: #14b8a6;
                  border-radius: 50%;
                }
                .blog-content ul li strong {
                  color: white;
                }
              `}</style>

              {/* Share Bottom */}
              <div className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between">
                <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Share this article</p>
                <div className="flex gap-4">
                  {['Twitter', 'LinkedIn', 'Facebook'].map(platform => (
                    <button key={platform} className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              {/* Author Bio Section */}
              <div className="mt-20 p-10 rounded-[40px] bg-white/5 border border-white/10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                <div className="w-24 h-24 rounded-3xl bg-teal-500/20 flex items-center justify-center text-teal-400 text-3xl font-black shrink-0">
                  {post.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-2xl font-bold mb-2">About {post.author}</h4>
                  <p className="text-zinc-400 leading-relaxed mb-6">
                    A seasoned real estate marketing expert with over a decade of experience in visual technology. {post.author.split(' ')[0]} specializes in helping agents bridge the gap between traditional sales and modern AI-driven digital presence.
                  </p>
                  <div className="flex gap-4 justify-center md:justify-start">
                    <button className="text-teal-400 font-bold text-sm hover:underline">Follow on Twitter</button>
                    <button className="text-teal-400 font-bold text-sm hover:underline">View Portfolio</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        <section className="max-w-7xl mx-auto px-6 mt-40">
          <div className="flex items-end justify-between mb-16">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.3em] text-teal-500 mb-4 block">Keep Reading</span>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Related <span className="text-zinc-500">Articles.</span></h2>
            </div>
            <Link to="/blog" className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 text-sm font-bold hover:bg-white/5 transition-all group">
              Explore All <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map((related) => (
              <Link 
                key={related.id} 
                to={`/blog/${related.id}`}
                className="group block"
              >
                <div className="aspect-[16/10] rounded-[32px] overflow-hidden border border-white/10 mb-6 relative">
                  <img
                    src={related.image}
                    alt={related.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors" />
                </div>
                <h4 className="text-xl font-bold mb-4 leading-tight group-hover:text-teal-400 transition-colors">
                  {related.title}
                </h4>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{related.date}</span>
                  <div className="w-1 h-1 rounded-full bg-zinc-800" />
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{related.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Big CTA */}
        <section className="max-w-7xl mx-auto px-6 mt-40">
           <div className="relative group rounded-[60px] overflow-hidden p-12 md:p-24 text-center border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-900/50">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[150px] pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-[0.9] mb-10">
                Ready to transform <br />
                <span className="text-zinc-500">your business?</span>
              </h2>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-12 py-5 rounded-full bg-teal-500 text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/40 transition-all"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPostPage;
