import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Paintbrush, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export const InpaintNode = memo(({ id, data, selected }: NodeProps) => {
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
        status === 'idle' && 'border-amber-300 dark:border-amber-700',
        selected && 'ring-4 ring-teal-500/30'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800 bg-amber-50 dark:bg-amber-950/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
            <Paintbrush size={18} />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-900 dark:text-white">
              Inpaint
            </div>
            {status !== 'idle' && (
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {status === 'running' && 'Inpainting...'}
                {status === 'completed' && 'Complete'}
                {status === 'error' && 'Error'}
              </div>
            )}
          </div>
        </div>
        {status === 'running' && <Loader2 size={16} className="animate-spin text-blue-500" />}
        {status === 'completed' && <CheckCircle size={16} className="text-emerald-500" />}
      </div>

      {/* Input Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="image"
        className="w-3 h-3 bg-blue-500 border-2 border-white dark:border-zinc-900"
        style={{ top: '40%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="prompt"
        className="w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900"
        style={{ top: '60%' }}
      />

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Inpaint Prompt */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Inpaint Prompt
          </label>
          <textarea
            value={data.parameters?.inpaint_prompt || ''}
            onChange={(e) => handleParameterChange('inpaint_prompt', e.target.value)}
            placeholder="Describe what to paint in the masked area..."
            className="w-full h-16 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        {/* Mask Mode */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Mask Mode
          </label>
          <select
            value={data.parameters?.mask_mode || 'auto'}
            onChange={(e) => handleParameterChange('mask_mode', e.target.value)}
            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="auto">Auto Detect</option>
            <option value="manual">Manual Mask</option>
          </select>
        </div>

        {/* Strength Slider */}
        <div>
          <label className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            <span>Strength</span>
            <span className="text-amber-600 dark:text-amber-400">
              {data.parameters?.strength || 0.8}
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={data.parameters?.strength || 0.8}
            onChange={(e) => handleParameterChange('strength', parseFloat(e.target.value))}
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
            <span>Subtle</span>
            <span>Strong</span>
          </div>
        </div>

        {/* Guidance Scale */}
        <div>
          <label className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            <span>Guidance Scale</span>
            <span className="text-amber-600 dark:text-amber-400">
              {data.parameters?.guidance_scale || 7.5}
            </span>
          </label>
          <input
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={data.parameters?.guidance_scale || 7.5}
            onChange={(e) => handleParameterChange('guidance_scale', parseFloat(e.target.value))}
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
            <span>Creative</span>
            <span>Precise</span>
          </div>
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
            className="w-full h-16 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        {/* Preview */}
        {data.output?.imageUrl && (
          <div className="mt-3">
            <img
              src={data.output.imageUrl}
              alt="Inpainted"
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

InpaintNode.displayName = 'InpaintNode';
