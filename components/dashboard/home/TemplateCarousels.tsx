import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { templateSections } from '../../../lib/data/dashboard';
import { useDashboardStore } from '../../../lib/store/dashboard';

export function TemplateCarousels() {
  const navigate = useNavigate();
  const { setPromptDraft } = useDashboardStore();

  const handleUseTemplate = (templateId: string, prompt: string, industry: string) => {
    setPromptDraft(prompt);
    const params = new URLSearchParams({
      template: templateId,
      industry: industry,
      prompt: prompt,
    });
    navigate(`/dashboard/studio?${params.toString()}`);
  };

  const getIndustryBadgeColor = (industry: string) => {
    switch (industry) {
      case 'real-estate':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400';
      case 'hospitality':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400';
      case 'retail':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400';
      default:
        return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
    }
  };

  const getIndustryLabel = (industry: string) => {
    switch (industry) {
      case 'real-estate':
        return 'Real Estate';
      case 'hospitality':
        return 'Hospitality';
      case 'retail':
        return 'Retail';
      default:
        return industry;
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {templateSections.map((section) => (
        <section key={section.id} className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{section.title}</h2>
            <button
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
              onClick={() => {
                // TODO: Navigate to filtered templates page
                navigate('/dashboard/templates');
              }}
            >
              <span>View all</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Horizontal Scroll */}
          <div className="relative">
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
              {section.templates.map((template) => (
                <div
                  key={template.id}
                  className={cn(
                    'flex-shrink-0 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800',
                    'rounded-2xl overflow-hidden hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-lg transition-all group snap-start'
                  )}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 relative overflow-hidden">
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={template.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-zinc-400 text-sm font-medium">Template Preview</div>
                      </div>
                    )}
                    {/* Industry badge overlay */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm',
                          getIndustryBadgeColor(template.industry)
                        )}
                      >
                        {getIndustryLabel(template.industry)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-base mb-2 line-clamp-1">{template.title}</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2 min-h-[2.5rem]">
                      {template.description}
                    </p>

                    {/* Use Template Button */}
                    <button
                      onClick={() => handleUseTemplate(template.id, template.prompt, template.industry)}
                      className={cn(
                        'w-full flex items-center justify-center gap-2 px-4 py-2.5',
                        'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900',
                        'rounded-xl text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100',
                        'transition-all group-hover:bg-violet-600 dark:group-hover:bg-violet-600',
                        'group-hover:text-white dark:group-hover:text-white'
                      )}
                    >
                      <span>Use Template</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Scroll Indicators (optional decorative gradient fade) */}
            <div className="absolute top-0 right-0 bottom-4 w-20 bg-gradient-to-l from-white dark:from-zinc-950 to-transparent pointer-events-none" />
          </div>
        </section>
      ))}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
