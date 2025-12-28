import React from 'react';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/sections/Hero';
import { WorkflowDemo } from './components/sections/WorkflowDemo';
import { UseCasesSection } from './components/sections/UseCasesSection';
import { TemplatePacks } from './components/sections/TemplatePacks';
import { KineticShowcaseWall } from './components/sections/KineticShowcaseWall';
import { PricingSection } from './components/sections/PricingSection';
import { FaqAndFinalCtaSection } from './components/sections/FaqAndFinalCtaSection';
import { LogoMarquee } from './components/sections/LogoMarquee';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { Footer } from './components/sections/Footer'; 

const SectionWrapper = ({ children, id, className = "" }: { children: React.ReactNode, id?: string, className?: string }) => (
  <section id={id} className={`relative py-24 ${className}`}>
    {children}
  </section>
);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="relative min-h-screen bg-stone-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 selection:bg-indigo-500/30 overflow-x-hidden scroll-smooth transition-colors duration-500">
        
        <Navbar />
        
        <main className="relative z-10">
          <Hero />

          <div className="border-b border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-black/40 backdrop-blur-sm transition-colors duration-500">
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

          <SectionWrapper id="use-cases" className="bg-stone-100 dark:bg-zinc-900/30 border-y border-zinc-200 dark:border-white/5 transition-colors duration-500">
            <UseCasesSection />
          </SectionWrapper>

          {/* UPDATED: Added p-0 to remove gap */}
          <SectionWrapper id="templates" className="p-0">
            <TemplatePacks />
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
    </ThemeProvider>
  );
};

export default App;