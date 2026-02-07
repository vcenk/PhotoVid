import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export const ImageInputNode = memo(({ id, data, selected }: NodeProps) => {
  const [preview, setPreview] = useState<string | null>(data.parameters?.imageUrl || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPreview(url);
        data.parameters = { ...data.parameters, imageUrl: url, fileName: file.name };
        data.onChange?.(data.parameters);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    setPreview(null);
    data.parameters = { ...data.parameters, imageUrl: null, fileName: null };
    data.onChange?.(data.parameters);
  };

  return (
    <div
      className={cn(
        'rounded-xl border-2 bg-white dark:bg-zinc-900 transition-all duration-200 min-w-[280px]',
        'border-blue-300 dark:border-blue-700',
        selected && 'ring-4 ring-teal-500/30'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-zinc-200 dark:border-zinc-800 bg-blue-50 dark:bg-blue-950/30">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
          <ImageIcon size={18} />
        </div>
        <div className="text-sm font-bold text-zinc-900 dark:text-white">
          Image Input
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-40 object-cover rounded-lg"
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
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
              <Upload size={32} className="mx-auto mb-2 text-zinc-400" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Click to upload image
              </p>
              <p className="text-xs text-zinc-400 mt-1">PNG, JPG up to 10MB</p>
            </div>
          </label>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="image"
        className="w-3 h-3 bg-blue-500 border-2 border-white dark:border-zinc-900"
      />
    </div>
  );
});

ImageInputNode.displayName = 'ImageInputNode';
