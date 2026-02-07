import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ChevronDown, Play, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../../lib/utils';
import { getNodeDefinition } from '../../../../lib/workflow/node-definitions';
import { NodeDataType } from '../../../../lib/workflow/types';

// Color mapping for different data types
const DATA_TYPE_COLORS: Record<NodeDataType, string> = {
  prompt: 'bg-emerald-500',
  image: 'bg-blue-500',
  video: 'bg-emerald-500',
  audio: 'bg-pink-500',
  number: 'bg-amber-500',
  boolean: 'bg-cyan-500',
  any: 'bg-zinc-500'
};

export const BaseNode = memo(({ id, type, data, selected }: NodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const definition = getNodeDefinition(type);

  if (!definition) {
    return <div className="text-red-500">Unknown node type: {type}</div>;
  }

  const Icon = definition.icon;
  const status = data.status || 'idle';

  // Status colors
  const statusColors = {
    idle: 'border-zinc-300 dark:border-zinc-700',
    running: 'border-blue-500 ring-2 ring-blue-500/20',
    completed: 'border-emerald-500 ring-2 ring-emerald-500/20',
    error: 'border-red-500 ring-2 ring-red-500/20'
  };

  const statusIcons = {
    idle: null,
    running: <Loader2 size={12} className="animate-spin text-blue-500" />,
    completed: <CheckCircle size={12} className="text-emerald-500" />,
    error: <AlertCircle size={12} className="text-red-500" />
  };

  return (
    <div
      className={cn(
        'rounded-xl border-2 bg-white dark:bg-zinc-900 transition-all duration-200 min-w-[280px]',
        statusColors[status],
        selected && 'ring-4 ring-teal-500/30'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800 cursor-pointer',
          `bg-${definition.color}-50 dark:bg-${definition.color}-950/30`
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            `bg-${definition.color}-100 dark:bg-${definition.color}-900/50 text-${definition.color}-600 dark:text-${definition.color}-400`
          )}>
            <Icon size={18} />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-900 dark:text-white">
              {definition.label}
            </div>
            {status !== 'idle' && (
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {status === 'running' && 'Processing...'}
                {status === 'completed' && 'Complete'}
                {status === 'error' && 'Error'}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {statusIcons[status]}
          <ChevronDown
            size={16}
            className={cn(
              'text-zinc-400 transition-transform',
              !isExpanded && '-rotate-90'
            )}
          />
        </div>
      </div>

      {/* Input Handles */}
      {definition.inputs.map((input, index) => (
        <Handle
          key={input.id}
          type="target"
          position={Position.Left}
          id={input.id}
          style={{
            top: isExpanded ? 60 + index * 40 : 32 + index * 20,
            width: '12px',
            height: '12px',
            border: '2px solid',
            transition: 'all 0.2s'
          }}
          className={cn(
            DATA_TYPE_COLORS[input.type],
            'border-white dark:border-zinc-900'
          )}
        />
      ))}

      {/* Output Handles */}
      {definition.outputs.map((output, index) => (
        <Handle
          key={output.id}
          type="source"
          position={Position.Right}
          id={output.id}
          style={{
            top: isExpanded ? 60 + index * 40 : 32 + index * 20,
            width: '12px',
            height: '12px',
            border: '2px solid',
            transition: 'all 0.2s'
          }}
          className={cn(
            DATA_TYPE_COLORS[output.type],
            'border-white dark:border-zinc-900'
          )}
        />
      ))}

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-3">
              {/* Input Labels */}
              {definition.inputs.length > 0 && (
                <div className="space-y-2">
                  {definition.inputs.map((input) => (
                    <div key={input.id} className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', DATA_TYPE_COLORS[input.type])} />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        {input.label}
                        {input.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Parameters - will be rendered by specific node components */}
              {data.renderParameters && (
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  {data.renderParameters()}
                </div>
              )}

              {/* Output Labels */}
              {definition.outputs.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  {definition.outputs.map((output) => (
                    <div key={output.id} className="flex items-center gap-2 justify-end">
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        {output.label}
                      </span>
                      <div className={cn('w-2 h-2 rounded-full', DATA_TYPE_COLORS[output.type])} />
                    </div>
                  ))}
                </div>
              )}

              {/* Error Message */}
              {data.error && (
                <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <p className="text-xs text-red-600 dark:text-red-400">{data.error}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

BaseNode.displayName = 'BaseNode';
