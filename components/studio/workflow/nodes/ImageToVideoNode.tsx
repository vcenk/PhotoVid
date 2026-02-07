import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Video, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export const ImageToVideoNode = memo(({ id, data, selected }: NodeProps) => {
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
        status === 'idle' && 'border-emerald-300 dark:border-emerald-700',
        selected && 'ring-4 ring-teal-500/30'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800 bg-emerald-50 dark:bg-emerald-950/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
            <Video size={18} />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-900 dark:text-white">
              Image to Video
            </div>
            {status !== 'idle' && (
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {status === 'running' && 'Animating...'}
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
        {/* Duration */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Duration
          </label>
          <select
            value={data.parameters?.duration || '5'}
            onChange={(e) => handleParameterChange('duration', e.target.value)}
            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="5">5 seconds</option>
            <option value="10">10 seconds</option>
          </select>
        </div>

        {/* Aspect Ratio */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Aspect Ratio
          </label>
          <select
            value={data.parameters?.aspect_ratio || '16:9'}
            onChange={(e) => handleParameterChange('aspect_ratio', e.target.value)}
            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="16:9">16:9 (Landscape)</option>
            <option value="9:16">9:16 (Vertical)</option>
            <option value="1:1">1:1 (Square)</option>
          </select>
        </div>

        {/* Motion Prompt (Optional) */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Motion Prompt (Optional)
          </label>
          <textarea
            value={data.parameters?.motion_prompt || ''}
            onChange={(e) => handleParameterChange('motion_prompt', e.target.value)}
            placeholder="Describe the motion..."
            className="w-full h-16 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
            className="w-full h-16 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Preview */}
        {data.output?.videoUrl && (
          <div className="mt-3">
            <video
              src={data.output.videoUrl}
              controls
              className="w-full h-40 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800 bg-black"
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
        id="video"
        className="w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900"
        style={{ top: '50%' }}
      />
    </div>
  );
});

ImageToVideoNode.displayName = 'ImageToVideoNode';
