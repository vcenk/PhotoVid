"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { label: "Login", href: "/login" },
      { label: "Studio", href: "/studio" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Enterprise", href: "#" },
    ]
  },
  {
    title: "AI Tools",
    links: [
      { label: "Virtual Staging", href: "/studio/real-estate/virtual-staging" },
      { label: "Sky Replacement", href: "/studio/real-estate/sky-replacement" },
      { label: "Photo Enhancement", href: "/studio/real-estate/photo-enhancement" },
      { label: "Item Removal", href: "/studio/real-estate/item-removal" },
      { label: "Twilight Conversion", href: "/studio/real-estate/twilight" },
    ]
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "#" },
      { label: "API Documentation", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Changelog", href: "#" },
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Contact", href: "#" },
    ]
  }
];

export const Footer = () => {
  return (
    <footer className="relative bg-black pt-24 pb-12 border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        {/* Top Section: Logo & Grid */}
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-32 mb-32">

          {/* Brand Column */}
          <div className="flex-shrink-0 w-64 space-y-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Photovid" className="h-10 w-auto" />
              <span className="text-xl font-bold text-white">Photovid</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed font-sans">
              AI-powered photo editing for real estate professionals. Transform listing photos in seconds.
            </p>
            <div className="flex gap-4">
              {[Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-full bg-white/5 text-zinc-500 hover:bg-teal-600 hover:text-white transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-10">
            {FOOTER_LINKS.map((column) => (
              <div key={column.title} className="space-y-6">
                <h4 className="text-sm font-bold text-white uppercase tracking-widest">
                  {column.title}
                </h4>
                <ul className="space-y-4">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith('/') ? (
                        <Link
                          to={link.href}
                          className="text-sm text-zinc-500 hover:text-teal-400 transition-colors font-medium"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="text-sm text-zinc-500 hover:text-teal-400 transition-colors font-medium"
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

        {/* Bottom Section */}
        <div className="relative border-t border-white/10 pt-12 flex flex-col items-center">

          {/* Copyright Row */}
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-12">
            <p>&copy; {new Date().getFullYear()} Photovid Inc.</p>
            <div className="flex gap-8">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>

          {/* Big Statement Type */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full text-center text-[18vw] leading-[0.8] font-black tracking-tighter text-white select-none pointer-events-none"
          >
            photovid
          </motion.h1>

        </div>
      </div>
    </footer>
  );
};
