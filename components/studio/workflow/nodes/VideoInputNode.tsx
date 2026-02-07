import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Video, Upload, X } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export const VideoInputNode = memo(({ id, data, selected }: NodeProps) => {
  const [preview, setPreview] = useState<string | null>(data.parameters?.videoUrl || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      data.parameters = { ...data.parameters, videoUrl: url, fileName: file.name, file };
      data.onChange?.(data.parameters);
    }
  };

  const handleClear = () => {
    setPreview(null);
    data.parameters = { ...data.parameters, videoUrl: null, fileName: null, file: null };
    data.onChange?.(data.parameters);
  };

  return (
    <div
      className={cn(
        'rounded-xl border-2 bg-white dark:bg-zinc-900 transition-all duration-200 min-w-[280px]',
        'border-emerald-300 dark:border-emerald-700',
        selected && 'ring-4 ring-teal-500/30'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-zinc-200 dark:border-zinc-800 bg-emerald-50 dark:bg-emerald-950/30">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
          <Video size={18} />
        </div>
        <div className="text-sm font-bold text-zinc-900 dark:text-white">
          Video Input
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {preview ? (
          <div className="relative">
            <video
              src={preview}
              controls
              className="w-full h-40 object-cover rounded-lg bg-black"
            />
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X size={14} />
            </button>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {data.parameters?.fileName}
            </p>
          </div>
        ) : (
          <label className="block cursor-pointer">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-6 text-center hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors">
              <Upload size={32} className="mx-auto mb-2 text-zinc-400" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Click to upload video
              </p>
              <p className="text-xs text-zinc-400 mt-1">MP4, MOV up to 100MB</p>
            </div>
          </label>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="video"
        className="w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900"
      />
    </div>
  );
});

VideoInputNode.displayName = 'VideoInputNode';
