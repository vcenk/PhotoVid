"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Facebook } from 'lucide-react';

const FOOTER_LINKS = [
  {
    title: "Platform",
    links: [
      { label: "AI Studio", href: "/studio" },
      { label: "Workflow Canvas", href: "/studio/workflow" },
      { label: "Listing Creator", href: "/studio/listing" },
      { label: "Video Editor", href: "/studio/real-estate/video-builder" },
      { label: "Pricing Plans", href: "/#pricing" },
    ]
  },
  {
    title: "Real Estate",
    links: [
      { label: "Virtual Staging", href: "/studio/real-estate/virtual-staging" },
      { label: "Sky Replacement", href: "/studio/real-estate/sky-replacement" },
      { label: "Day to Twilight", href: "/studio/real-estate/twilight" },
      { label: "Photo Enhancement", href: "/studio/real-estate/photo-enhancement" },
      { label: "Item Removal", href: "/studio/real-estate/item-removal" },
    ]
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Tutorials", href: "/tutorials" },
      { label: "Blog", href: "/blog" },
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/privacy#cookies" },
      { label: "Support", href: "mailto:support@photovid.studio" },
    ]
  }
];

export const Footer = () => {
  return (
    <footer className="relative bg-black pt-28 pb-16 border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        {/* Top Section: Logo & Grid */}
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-32 mb-24">

          {/* Brand Column */}
          <div className="flex-shrink-0 lg:w-72 space-y-8">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Photovid" className="h-10 w-auto" />
              <span className="text-2xl font-bold text-white tracking-tighter uppercase">Photovid</span>
            </div>
            <p className="text-zinc-500 text-base leading-relaxed font-sans max-w-sm">
              The next-generation AI studio for real estate visual marketing.
            </p>
            <div className="flex gap-5">
              <a href="https://www.facebook.com/photovidstudio" target="_blank" rel="noopener noreferrer" className="p-3 rounded-2xl bg-white/5 text-zinc-500 hover:bg-teal-600 hover:text-white transition-all duration-300">
                <Facebook size={20} />
              </a>
              <a href="https://www.instagram.com/photovid.studio/" target="_blank" rel="noopener noreferrer" className="p-3 rounded-2xl bg-white/5 text-zinc-500 hover:bg-teal-600 hover:text-white transition-all duration-300">
                <Instagram size={20} />
              </a>
              <a href="https://x.com/photovid_studio" target="_blank" rel="noopener noreferrer" className="p-3 rounded-2xl bg-white/5 text-zinc-500 hover:bg-teal-600 hover:text-white transition-all duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://www.linkedin.com/company/photovidstudio" target="_blank" rel="noopener noreferrer" className="p-3 rounded-2xl bg-white/5 text-zinc-500 hover:bg-teal-600 hover:text-white transition-all duration-300">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-12">
            {FOOTER_LINKS.map((column) => (
              <div key={column.title} className="space-y-6">
                <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.25em]">
                  {column.title}
                </h4>
                <ul className="space-y-4">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith('/') || link.href.startsWith('#') ? (
                        <Link
                          to={link.href}
                          className="text-[14px] md:text-base text-zinc-500 hover:text-teal-400 transition-all duration-200 font-medium hover:pl-1.5 block"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="text-[14px] md:text-base text-zinc-500 hover:text-teal-400 transition-all duration-200 font-medium hover:pl-1.5 block"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="relative border-t border-white/10 py-12 flex flex-col items-center gap-6">
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
            <p className="opacity-50 order-2 md:order-1">&copy; {new Date().getFullYear()} Photovid Inc. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 order-1 md:order-2">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/privacy#cookies" className="hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Mark: Centered and elevated */}
      <div className="relative w-full mt-16 pb-10 pointer-events-none select-none overflow-hidden">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="text-center text-[20vw] leading-[0.8] font-black tracking-tighter text-white/90"
        >
          photovid
        </motion.h1>
      </div>
    </footer>
  );
};
