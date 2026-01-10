import React from 'react';
import { Navbar } from '../layout/Navbar';
import { Hero } from '../landing/Hero';
import { WorkflowDemo } from '../landing/WorkflowDemo';
import { MosaicSlideshow } from '../landing/MosaicSlideshow';
import { UseCasesSection } from '../landing/UseCasesSection';
import { TemplatePacks } from '../landing/TemplatePacks';
import { CreatorPresets } from '../landing/CreatorPresets';
import { KineticShowcaseWall } from '../landing/KineticShowcaseWall';
import { PricingSection } from '../landing/PricingSection';
import { FaqAndFinalCtaSection } from '../landing/FaqAndFinalCtaSection';
import { LogoMarquee } from '../landing/LogoMarquee';
import { Footer } from '../landing/Footer'; 

const SectionWrapper = ({ children, id, className = "" }: { children: React.ReactNode, id?: string, className?: string }) => (
  <section id={id} className={`relative py-24 ${className}`}>
    {children}
  </section>
);

export const LandingPage: React.FC = () => {
  return (
    <div className="light relative min-h-screen bg-stone-50 text-zinc-800 selection:bg-indigo-500/30 overflow-x-hidden scroll-smooth transition-colors duration-500">

      <Navbar />
      
      <main className="relative z-10">
        <Hero />

        <div className="border-b border-zinc-200 bg-white/10 backdrop-blur-sm transition-colors duration-500">
            <LogoMarquee />
        </div>

        <SectionWrapper id="workflow" className="bg-white transition-colors duration-500">
            <div className="text-center mb-16 px-6">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-900 mb-6">
                From Prompt to <span className="text-indigo-500">Production</span>
              </h2>
              <p className="text-zinc-500 max-w-2xl mx-auto">
                Our industry-tuned models understand lighting, composition, and motion better than generic AI.
              </p>
            </div>
          <WorkflowDemo />
        </SectionWrapper>

        <SectionWrapper id="mosaic" className="p-0 bg-black">
            <MosaicSlideshow />
        </SectionWrapper>

        <SectionWrapper id="use-cases" className="bg-white/5 border-y border-zinc-200/20 backdrop-blur-sm transition-colors duration-500">
          <UseCasesSection />
        </SectionWrapper>

        <SectionWrapper id="templates" className="p-0">
          <TemplatePacks />
        </SectionWrapper>

        <SectionWrapper id="presets" className="p-0">
          <CreatorPresets />
        </SectionWrapper>

        <SectionWrapper id="showcase" className="p-0">
          <KineticShowcaseWall />
        </SectionWrapper>

        <SectionWrapper id="pricing" className="bg-zinc-100 border-t border-zinc-200 transition-colors duration-500">
          <PricingSection />
        </SectionWrapper>

        <FaqAndFinalCtaSection />
      </main>

      <Footer />
      
    </div>
  );
};
