import React from 'react';
import { Navbar } from '../layout/Navbar';
import { Hero } from '../sections/Hero';
import { WorkflowDemo } from '../sections/WorkflowDemo';
import { MosaicSlideshow } from '../sections/MosaicSlideshow';
import { UseCasesSection } from '../sections/UseCasesSection';
import { TemplatePacks } from '../sections/TemplatePacks';
import { CreatorPresets } from '../sections/CreatorPresets';
import { KineticShowcaseWall } from '../sections/KineticShowcaseWall';
import { PricingSection } from '../sections/PricingSection';
import { FaqAndFinalCtaSection } from '../sections/FaqAndFinalCtaSection';
import { LogoMarquee } from '../sections/LogoMarquee';
import { Footer } from '../sections/Footer'; 

const SectionWrapper = ({ children, id, className = "" }: { children: React.ReactNode, id?: string, className?: string }) => (
  <section id={id} className={`relative py-24 ${className}`}>
    {children}
  </section>
);

export const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-stone-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 selection:bg-indigo-500/30 overflow-x-hidden scroll-smooth transition-colors duration-500">
      
      <Navbar />
      
      <main className="relative z-10">
        <Hero />

        <div className="border-b border-zinc-200 dark:border-white/5 bg-white/10 backdrop-blur-sm transition-colors duration-500">
            <LogoMarquee />
        </div>

        <SectionWrapper id="workflow" className="bg-white dark:bg-zinc-950 transition-colors duration-500">
            <div className="text-center mb-16 px-6">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-900 dark:text-white mb-6">
                From Prompt to <span className="text-indigo-500">Production</span>
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
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

        <SectionWrapper id="pricing" className="bg-zinc-100 dark:bg-black border-t border-zinc-200 dark:border-white/5 transition-colors duration-500">
          <PricingSection />
        </SectionWrapper>

        <FaqAndFinalCtaSection />
      </main>

      <Footer />
      
    </div>
  );
};
