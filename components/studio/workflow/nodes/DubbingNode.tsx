import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Languages, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '../../../../lib/utils';

// Language options for the dropdown
const LANGUAGES = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ko', name: 'Korean' },
  { code: 'it', name: 'Italian' },
  { code: 'ru', name: 'Russian' },
  { code: 'nl', name: 'Dutch' },
];

export const DubbingNode = memo(({ id, data, selected }: NodeProps) => {
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
        status === 'idle' && 'border-rose-300 dark:border-rose-700',
        selected && 'ring-4 ring-indigo-500/30'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800 bg-rose-50 dark:bg-rose-950/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
            <Languages size={18} />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-900 dark:text-white">
              AI Dubbing
            </div>
            {status !== 'idle' && (
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {status === 'running' && 'Translating...'}
                {status === 'completed' && 'Complete'}
                {status === 'error' && 'Error'}
              </div>
            )}
          </div>
        </div>
        {status === 'running' && <Loader2 size={16} className="animate-spin text-blue-500" />}
        {status === 'completed' && <CheckCircle size={16} className="text-emerald-500" />}
      </div>

      {/* Input Handle - Video */}
      <Handle
        type="target"
        position={Position.Left}
        id="video"
        className="w-3 h-3 bg-violet-500 border-2 border-white dark:border-zinc-900"
        style={{ top: '50%' }}
      />

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Target Language */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Target Language
          </label>
          <select
            value={data.parameters?.targetLanguage || 'es'}
            onChange={(e) => handleParameterChange('targetLanguage', e.target.value)}
            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Info */}
        <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50">
          <p className="text-xs text-rose-600 dark:text-rose-400">
            AI will transcribe, translate, and clone your voice in the target language.
          </p>
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

DubbingNode.displayName = 'DubbingNode';
