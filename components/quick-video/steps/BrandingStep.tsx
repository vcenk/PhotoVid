/**
 * BrandingStep - Step 4: Configure agent branding
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { User, Building2, Phone, Mail, Globe, Upload, Camera, Sparkles, Info, X } from 'lucide-react';
import { useQuickVideo } from '../QuickVideoContext';

export function BrandingStep() {
  const { agentBranding, updateBranding } = useQuickVideo();
  const [photoPreview, setPhotoPreview] = useState<string | null>(agentBranding.photoUrl || null);
  const [logoPreview, setLogoPreview] = useState<string | null>(agentBranding.logoUrl || null);
  const [activeField, setActiveField] = useState<string | null>(null);

  // Handle photo upload
  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      updateBranding({ photoUrl: url });
    }
  }, [updateBranding]);

  // Handle logo upload
  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      updateBranding({ logoUrl: url });
    }
  }, [updateBranding]);

  const inputClasses = (name: string) => `
    w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-zinc-500 transition-all duration-300
    ${activeField === name 
      ? 'border-violet-500/50 ring-4 ring-violet-500/10 bg-white/10' 
      : 'border-white/5 hover:border-white/10 hover:bg-white/10'
    }
    focus:outline-none
  `;

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 mb-2">Agent Branding</h2>
        <p className="text-zinc-400">
          Add your contact information and branding to personalize the video
        </p>
      </div>

      {/* Photo & Logo Section */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Agent Photo */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Camera size={16} className="text-violet-400" />
            Agent Headshot
          </label>
          <div className="relative group">
            <div className={`
              aspect-square rounded-3xl border-2 border-dashed overflow-hidden
              flex items-center justify-center transition-all duration-300
              ${photoPreview 
                ? 'border-violet-500/50 bg-black/40' 
                : 'border-white/10 bg-white/5 group-hover:border-violet-500/30 group-hover:bg-white/10'
              }
            `}>
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Agent headshot"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6 transition-transform duration-300 group-hover:scale-105">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 group-hover:bg-violet-600/20 group-hover:text-violet-300 transition-colors">
                     <User size={32} className="text-zinc-500 group-hover:text-violet-300" />
                  </div>
                  <p className="text-sm font-medium text-white mb-1">Upload Photo</p>
                  <p className="text-xs text-zinc-500">JPG or PNG</p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {photoPreview && (
              <button
                onClick={(e) => { 
                    e.preventDefault();
                    setPhotoPreview(null); 
                    updateBranding({ photoUrl: undefined }); 
                }}
                className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-colors z-20 border border-white/10"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Brokerage Logo */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Building2 size={16} className="text-violet-400" />
            Brokerage Logo
          </label>
          <div className="relative group">
            <div className={`
              aspect-square rounded-3xl border-2 border-dashed overflow-hidden
              flex items-center justify-center transition-all duration-300
              ${logoPreview 
                ? 'border-violet-500/50 bg-black/40' 
                : 'border-white/10 bg-white/5 group-hover:border-violet-500/30 group-hover:bg-white/10'
              }
            `}>
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Brokerage logo"
                  className="w-full h-full object-contain p-8"
                />
              ) : (
                <div className="text-center p-6 transition-transform duration-300 group-hover:scale-105">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 group-hover:bg-violet-600/20 group-hover:text-violet-300 transition-colors">
                     <Upload size={32} className="text-zinc-500 group-hover:text-violet-300" />
                  </div>
                  <p className="text-sm font-medium text-white mb-1">Upload Logo</p>
                  <p className="text-xs text-zinc-500">PNG with transparent background</p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {logoPreview && (
              <button
                onClick={(e) => { 
                    e.preventDefault();
                    setLogoPreview(null); 
                    updateBranding({ logoUrl: undefined }); 
                }}
                className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-colors z-20 border border-white/10"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-white/5">
        <h3 className="text-lg font-semibold text-white">Agent Details</h3>
        
        {/* Agent Name - Required */}
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <User size={16} className="text-violet-400" />
            Agent Name <span className="text-red-400">*</span>
            </label>
            <input
            type="text"
            name="agentName"
            value={agentBranding.name}
            onFocus={() => setActiveField('agentName')}
            onBlur={() => setActiveField(null)}
            onChange={(e) => updateBranding({ name: e.target.value })}
            placeholder="Sarah Johnson"
            className={inputClasses('agentName')}
            />
        </div>

        {/* Title & Brokerage */}
        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Title</label>
            <input
                type="text"
                name="title"
                value={agentBranding.title || ''}
                onFocus={() => setActiveField('title')}
                onBlur={() => setActiveField(null)}
                onChange={(e) => updateBranding({ title: e.target.value })}
                placeholder="Senior Real Estate Agent"
                className={inputClasses('title')}
            />
            </div>
            <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Brokerage Name</label>
            <input
                type="text"
                name="brokerageName"
                value={agentBranding.brokerageName || ''}
                onFocus={() => setActiveField('brokerageName')}
                onBlur={() => setActiveField(null)}
                onChange={(e) => updateBranding({ brokerageName: e.target.value })}
                placeholder="RE/MAX Premier"
                className={inputClasses('brokerageName')}
            />
            </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-6 pt-6 border-t border-white/5">
        <h3 className="text-lg font-semibold text-white">Contact Information</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
              <Phone size={14} />
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={agentBranding.phone || ''}
              onFocus={() => setActiveField('phone')}
              onBlur={() => setActiveField(null)}
              onChange={(e) => updateBranding({ phone: e.target.value })}
              placeholder="(555) 123-4567"
              className={inputClasses('phone')}
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
              <Mail size={14} />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={agentBranding.email || ''}
              onFocus={() => setActiveField('email')}
              onBlur={() => setActiveField(null)}
              onChange={(e) => updateBranding({ email: e.target.value })}
              placeholder="sarah@example.com"
              className={inputClasses('email')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
            <Globe size={14} />
            Website
          </label>
          <input
            type="url"
            name="website"
            value={agentBranding.website || ''}
            onFocus={() => setActiveField('website')}
            onBlur={() => setActiveField(null)}
            onChange={(e) => updateBranding({ website: e.target.value })}
            placeholder="www.sarahjohnsonrealty.com"
            className={inputClasses('website')}
          />
        </div>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-4 p-5 bg-violet-600/10 border border-violet-500/20 rounded-2xl backdrop-blur-sm">
        <div className="p-2 bg-violet-600/20 rounded-lg text-violet-300">
            <Info size={20} />
        </div>
        <div>
          <p className="text-sm text-violet-200 font-semibold mb-1">Save Your Branding</p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            In a future update, your branding will be saved to your profile and auto-loaded for new videos.
            For now, you'll need to enter it each time.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BrandingStep;
