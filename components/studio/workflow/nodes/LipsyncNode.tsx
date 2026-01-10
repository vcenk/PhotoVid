import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Mic2, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export const LipsyncNode = memo(({ id, data, selected }: NodeProps) => {
  const status = data.status || 'idle';

  const handleParameterChange = (key: string, value: any) => {
    data.parameters = { ...data.parameters, [key]: value };
    data.onChange?.(data.parameters);
  };

  return (
    <div
      className={cn(
        'rounded-xl border-2 bg-white dark:bg-zinc-900 transition-all duration-200 min-w-[300px]',
        status === 'running' && 'border-blue-500 ring-2 ring-blue-500/20',
        status === 'completed' && 'border-emerald-500 ring-2 ring-emerald-500/20',
        status === 'error' && 'border-red-500 ring-2 ring-red-500/20',
        status === 'idle' && 'border-rose-300 dark:border-rose-700',
        selected && 'ring-4 ring-indigo-500/30'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800 bg-rose-50 dark:bg-rose-950/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
            <Mic2 size={18} />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-900 dark:text-white">
              Lipsync
            </div>
            {status !== 'idle' && (
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {status === 'running' && 'Syncing...'}
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
        style={{ top: '35%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="video"
        className="w-3 h-3 bg-violet-500 border-2 border-white dark:border-zinc-900"
        style={{ top: '50%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="audio"
        className="w-3 h-3 bg-pink-500 border-2 border-white dark:border-zinc-900"
        style={{ top: '65%' }}
      />

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Input Labels */}
        <div className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Portrait (Image)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500" />
            <span>Video (Optional)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-pink-500" />
            <span>Audio (Required)</span>
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3">
          {/* Model Selection */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Model
            </label>
            <select
              value={data.parameters?.model || 'sync-labs'}
              onChange={(e) => handleParameterChange('model', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="sync-labs">Sync Labs 2.0</option>
              <option value="kling-lipsync">Kling LipSync</option>
            </select>
          </div>
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
        className="w-3 h-3 bg-violet-500 border-2 border-white dark:border-zinc-900"
        style={{ top: '50%' }}
      />
    </div>
  );
});

LipsyncNode.displayName = 'LipsyncNode';
