import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { WORKFLOW_TEMPLATES, WorkflowTemplate, cloneTemplate } from '../../../lib/data/workflow-templates';
import { Node, Edge } from '@xyflow/react';

interface TemplatePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTemplate: (nodes: Node[], edges: Edge[]) => void;
}

export const TemplatePanel: React.FC<TemplatePanelProps> = ({
  isOpen,
  onClose,
  onLoadTemplate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'content-creation', label: 'Content Creation' },
    { id: 'image-editing', label: 'Image Editing' },
    { id: 'video-creation', label: 'Video Creation' },
    { id: 'advanced', label: 'Advanced' }
  ];

  const filteredTemplates = selectedCategory === 'all'
    ? WORKFLOW_TEMPLATES
    : WORKFLOW_TEMPLATES.filter(t => t.category === selectedCategory);

  const handleLoadTemplate = (template: WorkflowTemplate) => {
    const { nodes, edges } = cloneTemplate(template);
    onLoadTemplate(nodes, edges);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-zinc-200 dark:border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/50 flex items-center justify-center">
              <Sparkles className="text-teal-600 dark:text-teal-400" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Workflow Templates
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Start with a pre-built workflow and customize it
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 p-4 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.id}
                  className="group relative bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:border-teal-400 dark:hover:border-teal-600 transition-all cursor-pointer hover:shadow-lg hover:shadow-teal-500/10"
                  onClick={() => handleLoadTemplate(template)}
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="text-teal-600 dark:text-teal-400" size={24} />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                    {template.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-500">
                    <span>{template.nodes.length} nodes</span>
                    <span>•</span>
                    <span>{template.edges.length} connections</span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-teal-600/5 dark:bg-teal-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-16">
              <p className="text-zinc-500 dark:text-zinc-400">
                No templates found in this category
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
            Click on a template to load it into the canvas. You can modify it as needed.
          </p>
        </div>
      </div>
    </div>
  );
};
