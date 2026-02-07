import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Download, Image as ImageIcon, Video, Music } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export const PreviewNode = memo(({ id, data, selected }: NodeProps) => {
  const hasImageInput = data.inputs?.image;
  const hasVideoInput = data.inputs?.video;
  const hasAudioInput = data.inputs?.audio;

  return (
    <div
      className={cn(
        'rounded-xl border-2 bg-white dark:bg-zinc-900 transition-all duration-200 min-w-[280px]',
        'border-zinc-300 dark:border-zinc-700',
        selected && 'ring-4 ring-teal-500/30'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-100 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400">
          <Download size={18} />
        </div>
        <div className="text-sm font-bold text-zinc-900 dark:text-white">
          Preview
        </div>
      </div>

      {/* Input Handles - Multiple types */}
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
        className="w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900"
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
      <div className="p-3">
        {/* Preview Area */}
        <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-6 min-h-[200px] flex items-center justify-center">
          {hasImageInput || hasVideoInput || hasAudioInput ? (
            <div className="text-center space-y-3">
              {hasImageInput && (
                <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                  <ImageIcon size={20} />
                  <span className="text-sm font-medium">Image connected</span>
                </div>
              )}
              {hasVideoInput && (
                <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Video size={20} />
                  <span className="text-sm font-medium">Video connected</span>
                </div>
              )}
              {hasAudioInput && (
                <div className="flex items-center justify-center gap-2 text-pink-600 dark:text-pink-400">
                  <Music size={20} />
                  <span className="text-sm font-medium">Audio connected</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <Download size={32} className="mx-auto mb-2 text-zinc-400" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Connect nodes to preview
              </p>
            </div>
          )}
        </div>

        {/* Download Button */}
        {(hasImageInput || hasVideoInput || hasAudioInput) && (
          <button className="w-full mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2">
            <Download size={16} />
            Download Result
          </button>
        )}
      </div>
    </div>
  );
});

PreviewNode.displayName = 'PreviewNode';
