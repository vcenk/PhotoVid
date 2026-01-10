import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Type } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export const PromptInputNode = memo(({ id, data, selected }: NodeProps) => {
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    data.parameters = { ...data.parameters, text: e.target.value };
    data.onChange?.(data.parameters);
  };

  return (
    <div
      className={cn(
        'rounded-xl border-2 bg-white dark:bg-zinc-900 transition-all duration-200 min-w-[320px]',
        'border-emerald-300 dark:border-emerald-700',
        selected && 'ring-4 ring-indigo-500/30'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-zinc-200 dark:border-zinc-800 bg-emerald-50 dark:bg-emerald-950/30">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
          <Type size={18} />
        </div>
        <div className="text-sm font-bold text-zinc-900 dark:text-white">
          Prompt Input
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <textarea
          value={data.parameters?.text || ''}
          onChange={handlePromptChange}
          placeholder="Enter your prompt here..."
          className="w-full h-24 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {(data.parameters?.text || '').length} characters
          </span>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="prompt"
        className="w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900"
      />
    </div>
  );
});

PromptInputNode.displayName = 'PromptInputNode';
