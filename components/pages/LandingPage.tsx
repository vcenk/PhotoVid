import React from 'react';
import { Navbar } from '../layout/Navbar';
import { Hero } from '../landing/Hero';
import { LogoMarquee } from '../landing/LogoMarquee';
import { TransformShowcase } from '../landing/TransformShowcase';
import { WorkflowDemo } from '../landing/WorkflowDemo';
import { FeatureGrid } from '../landing/FeatureGrid';
import { MosaicSlideshow } from '../landing/MosaicSlideshow';
import { UseCasesSection } from '../landing/UseCasesSection';
import { TemplatePacks } from '../landing/TemplatePacks';
import { KineticShowcaseWall } from '../landing/KineticShowcaseWall';

import { PricingSection } from '../landing/PricingSection';
import { FaqAndFinalCtaSection } from '../landing/FaqAndFinalCtaSection';
import { Footer } from '../landing/Footer';

const SectionWrapper = ({ children, id, className = "" }: { children: React.ReactNode, id?: string, className?: string }) => (
  <section id={id} className={`relative ${className}`}>
    {children}
  </section>
);

export const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-white selection:bg-teal-500/30 overflow-x-hidden scroll-smooth">

      <Navbar />

      <main className="relative z-10">
        {/* Hero - Full viewport with particles and dynamic headlines */}
        <Hero />

        {/* Tool Marquee strip */}
        <LogoMarquee />

        {/* Transform Showcase - Magic before/after with AI animation */}
        <TransformShowcase />

        {/* Workflow Demo - How it works */}
        <SectionWrapper id="workflow" className="py-24 bg-zinc-950">
          <div className="text-center mb-16 px-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-bold uppercase tracking-widest mb-6">
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-6">
              From Photo to <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Listing-Ready</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Three steps. One platform. Transform any property photo into a polished, listing-ready image in seconds.
            </p>
          </div>
          <WorkflowDemo />
        </SectionWrapper>

        {/* Feature Grid - Bento-style capabilities */}
        <FeatureGrid />

        {/* Mosaic Slideshow - Visual showcase */}
        <SectionWrapper id="mosaic" className="p-0 bg-black">
          <MosaicSlideshow />
        </SectionWrapper>

        {/* Use Cases Section */}
        <SectionWrapper id="use-cases" className="py-24 bg-zinc-950">
          <UseCasesSection />
        </SectionWrapper>

        {/* Template Packs */}
        <SectionWrapper id="templates" className="py-24 bg-black">
          <TemplatePacks />
        </SectionWrapper>

        {/* Kinetic Showcase Wall - Dynamic gallery */}
        <KineticShowcaseWall />

        {/* Pricing Section */}
        <SectionWrapper id="pricing">
          <PricingSection />
        </SectionWrapper>

        {/* FAQ and Final CTA */}
        <FaqAndFinalCtaSection />
      </main>

      <Footer />

    </div>
  );
};
