import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Music, Upload, X, Play, Pause } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export const AudioInputNode = memo(({ id, data, selected }: NodeProps) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(data.parameters?.audioUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      data.parameters = { ...data.parameters, audioUrl: url, fileName: file.name, file };
      data.onChange?.(data.parameters);
    }
  };

  const handleClear = () => {
    setAudioUrl(null);
    setIsPlaying(false);
    data.parameters = { ...data.parameters, audioUrl: null, fileName: null, file: null };
    data.onChange?.(data.parameters);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div
      className={cn(
        'rounded-xl border-2 bg-white dark:bg-zinc-900 transition-all duration-200 min-w-[280px]',
        'border-pink-300 dark:border-pink-700',
        selected && 'ring-4 ring-teal-500/30'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-zinc-200 dark:border-zinc-800 bg-pink-50 dark:bg-pink-950/30">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400">
          <Music size={18} />
        </div>
        <div className="text-sm font-bold text-zinc-900 dark:text-white">
          Audio Input
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {audioUrl ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-pink-50 dark:bg-pink-950/20 rounded-lg border border-pink-200 dark:border-pink-800">
              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center hover:bg-pink-700 transition-colors"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-900 dark:text-white truncate">
                  {data.parameters?.fileName}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Audio file
                </p>
              </div>
              <button
                onClick={handleClear}
                className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
          </div>
        ) : (
          <label className="block cursor-pointer">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-6 text-center hover:border-pink-400 dark:hover:border-pink-600 transition-colors">
              <Upload size={32} className="mx-auto mb-2 text-zinc-400" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Click to upload audio
              </p>
              <p className="text-xs text-zinc-400 mt-1">MP3, WAV up to 50MB</p>
            </div>
          </label>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="audio"
        className="w-3 h-3 bg-pink-500 border-2 border-white dark:border-zinc-900"
      />
    </div>
  );
});

AudioInputNode.displayName = 'AudioInputNode';
