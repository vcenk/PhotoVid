import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Wand2, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export const TextToImageNode = memo(({ id, data, selected }: NodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const status = data.status || 'idle';

  const handleParameterChange = (key: string, value: any) => {
    data.parameters = { ...data.parameters, [key]: value };
    data.onChange?.(data.parameters);
  };

  return (
    <div
      className={cn(
        'rounded-xl border-2 bg-white dark:bg-zinc-900 transition-all duration-200 min-w-[320px]',
        status === 'running' && 'border-blue-500 ring-2 ring-blue-500/20',
        status === 'completed' && 'border-emerald-500 ring-2 ring-emerald-500/20',
        status === 'error' && 'border-red-500 ring-2 ring-red-500/20',
        status === 'idle' && 'border-indigo-300 dark:border-indigo-700',
        selected && 'ring-4 ring-indigo-500/30'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800 bg-indigo-50 dark:bg-indigo-950/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
            <Wand2 size={18} />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-900 dark:text-white">
              Text to Image
            </div>
            {status !== 'idle' && (
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {status === 'running' && 'Generating...'}
                {status === 'completed' && 'Complete'}
                {status === 'error' && 'Error'}
              </div>
            )}
          </div>
        </div>
        {status === 'running' && <Loader2 size={16} className="animate-spin text-blue-500" />}
        {status === 'completed' && <CheckCircle size={16} className="text-emerald-500" />}
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="prompt"
        className="w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900"
        style={{ top: '50%' }}
      />

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Model Selection */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Model
          </label>
          <select
            value={data.parameters?.model || 'flux-dev'}
            onChange={(e) => handleParameterChange('model', e.target.value)}
            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="flux-dev">Flux Dev</option>
            <option value="flux-pro">Flux Pro</option>
            <option value="flux-schnell">Flux Schnell</option>
          </select>
        </div>

        {/* Size Selection */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Width
            </label>
            <select
              value={data.parameters?.width || '1024'}
              onChange={(e) => handleParameterChange('width', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="512">512px</option>
              <option value="768">768px</option>
              <option value="1024">1024px</option>
              <option value="1536">1536px</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Height
            </label>
            <select
              value={data.parameters?.height || '1024'}
              onChange={(e) => handleParameterChange('height', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="512">512px</option>
              <option value="768">768px</option>
              <option value="1024">1024px</option>
              <option value="1536">1536px</option>
            </select>
          </div>
        </div>

        {/* Steps Slider */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Steps: {data.parameters?.steps || 28}
          </label>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={data.parameters?.steps || 28}
            onChange={(e) => handleParameterChange('steps', parseInt(e.target.value))}
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        {/* Negative Prompt */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Negative Prompt
          </label>
          <textarea
            value={data.parameters?.negative_prompt || ''}
            onChange={(e) => handleParameterChange('negative_prompt', e.target.value)}
            placeholder="What to avoid..."
            className="w-full h-16 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Preview */}
        {data.output?.imageUrl && (
          <div className="mt-3">
            <img
              src={data.output.imageUrl}
              alt="Generated"
              className="w-full h-40 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800"
            />
          </div>
        )}

        {/* Error */}
        {data.error && (
          <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <p className="text-xs text-red-600 dark:text-red-400">{data.error}</p>
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="image"
        className="w-3 h-3 bg-blue-500 border-2 border-white dark:border-zinc-900"
        style={{ top: '50%' }}
      />
    </div>
  );
});

TextToImageNode.displayName = 'TextToImageNode';
