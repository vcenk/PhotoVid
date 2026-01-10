import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Check, ChevronDown } from 'lucide-react';
import { useStudio } from '../../../lib/store/contexts/StudioContext';
import { PROMPT_SUGGESTIONS, getPromptsByIndustry, getPromptCategories } from '../../../lib/data/prompts';
import { PromptSuggestion } from '../../../lib/types/studio';

interface PromptSuggestionPanelProps {
    onSelectPrompt: (prompt: string) => void;
    currentPrompt?: string;
}

export const PromptSuggestionPanel: React.FC<PromptSuggestionPanelProps> = ({
    onSelectPrompt,
    currentPrompt = ''
}) => {
    const { selectedIndustry } = useStudio();
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const industryId = selectedIndustry?.id || 'real-estate';
    const prompts = getPromptsByIndustry(industryId);
    const categories = getPromptCategories(industryId);

    const handleCopy = (suggestion: PromptSuggestion) => {
        navigator.clipboard.writeText(suggestion.prompt);
        setCopiedId(suggestion.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleUse = (suggestion: PromptSuggestion) => {
        onSelectPrompt(suggestion.prompt);
    };

    // Group prompts by category
    const groupedPrompts = categories.reduce((acc, cat) => {
        acc[cat] = prompts.filter(p => p.category === cat);
        return acc;
    }, {} as Record<string, PromptSuggestion[]>);

    return (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-zinc-100 bg-gradient-to-r from-indigo-50 to-violet-50">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-100">
                        <Sparkles size={14} className="text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-zinc-900">Smart Prompts</h3>
                        <p className="text-xs text-zinc-500">AI-powered suggestions for {selectedIndustry?.name || 'your industry'}</p>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="divide-y divide-zinc-100">
                {categories.map(category => (
                    <div key={category}>
                        {/* Category Header */}
                        <button
                            onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                            className="w-full flex items-center justify-between p-3 hover:bg-zinc-50 transition-colors"
                        >
                            <span className="text-sm font-medium text-zinc-700">{category}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-400">{groupedPrompts[category].length}</span>
                                <ChevronDown
                                    size={14}
                                    className={`text-zinc-400 transition-transform ${expandedCategory === category ? 'rotate-180' : ''}`}
                                />
                            </div>
                        </button>

                        {/* Prompts */}
                        <AnimatePresence>
                            {expandedCategory === category && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-2 pt-0 space-y-2">
                                        {groupedPrompts[category].map(suggestion => (
                                            <div
                                                key={suggestion.id}
                                                className="p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors group"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span className="text-lg">{suggestion.icon}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-xs font-semibold text-zinc-900 mb-1">
                                                            {suggestion.title}
                                                        </h4>
                                                        <p className="text-[11px] text-zinc-500 mb-2">
                                                            {suggestion.description}
                                                        </p>
                                                        <p className="text-xs text-zinc-600 bg-white rounded-lg p-2 border border-zinc-200 font-mono">
                                                            {suggestion.prompt.substring(0, 80)}...
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleCopy(suggestion)}
                                                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-zinc-200 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors"
                                                    >
                                                        {copiedId === suggestion.id ? (
                                                            <><Check size={10} className="text-emerald-500" /> Copied</>
                                                        ) : (
                                                            <><Copy size={10} /> Copy</>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleUse(suggestion)}
                                                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors"
                                                    >
                                                        Use This
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {/* Quick Apply */}
            <div className="p-3 bg-zinc-50 border-t border-zinc-100">
                <p className="text-[10px] text-zinc-400 text-center">
                    Click "Use This" to apply a prompt to your generation
                </p>
            </div>
        </div>
    );
};
