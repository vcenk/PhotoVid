import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { workflows } from '../../../lib/data/dashboard';
import { useDashboardStore, WorkflowFilter } from '../../../lib/store/dashboard';

const filters: { value: WorkflowFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'virtual-staging', label: 'Virtual Staging' },
  { value: 'menu-design', label: 'Menu Design' },
  { value: 'product-photography', label: 'Product Photography' },
];

export function WorkflowLibrary() {
  const navigate = useNavigate();
  const { selectedWorkflowFilter, setWorkflowFilter } = useDashboardStore();

  const filteredWorkflows =
    selectedWorkflowFilter === 'all'
      ? workflows
      : workflows.filter((w) => w.category === selectedWorkflowFilter || w.category === 'general');

  const handleWorkflowClick = (workflowId: string) => {
    const params = new URLSearchParams({
      workflow: workflowId,
    });
    navigate(`/dashboard/studio?${params.toString()}`);
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-6">Professional Workflows</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setWorkflowFilter(filter.value)}
            className={cn(
              'px-5 py-2.5 rounded-full text-sm font-medium transition-all',
              selectedWorkflowFilter === filter.value
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredWorkflows.map((workflow) => {
          const Icon = workflow.icon;

          return (
            <div
              key={workflow.id}
              className={cn(
                'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800',
                'rounded-2xl p-6 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-lg transition-all group'
              )}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl group-hover:bg-violet-100 dark:group-hover:bg-violet-950 transition-colors shrink-0">
                  <Icon size={24} className="text-zinc-700 dark:text-zinc-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg mb-1">{workflow.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{workflow.outcome}</p>
                </div>
              </div>

              {/* Best For Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {workflow.bestFor.map((industry) => (
                  <span
                    key={industry}
                    className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-medium"
                  >
                    {industry === 'real-estate'
                      ? 'Real Estate'
                      : industry === 'hospitality'
                      ? 'Hospitality'
                      : 'Retail'}
                  </span>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleWorkflowClick(workflow.id)}
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-4 py-2.5',
                  'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900',
                  'rounded-xl text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all'
                )}
              >
                <span>Open Workflow</span>
                <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
