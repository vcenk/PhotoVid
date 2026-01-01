import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Play, Download, ExternalLink } from 'lucide-react';

export const OutputNode = memo(({ data }: { data: any }) => {
  const hasResult = !!data.result;

  return (
    <div className={`
      px-4 py-3 shadow-xl rounded-2xl transition-all duration-300 w-64
      ${hasResult ? 'bg-zinc-900 border-zinc-900 ring-4 ring-zinc-200' : 'bg-white border-2 border-zinc-200'}
    `}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-zinc-400" />
      
      <div className="flex items-center mb-3">
        <div className={`
          rounded-lg w-8 h-8 flex justify-center items-center mr-2
          ${hasResult ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-500'}
        `}>
           <Play size={14} fill={hasResult ? "currentColor" : "none"} />
        </div>
        <div className={`text-xs font-bold uppercase tracking-tight ${hasResult ? 'text-white' : 'text-zinc-900'}`}>
          {data.label}
        </div>
      </div>

      <div className={`
        aspect-video rounded-xl border flex flex-col items-center justify-center overflow-hidden
        ${hasResult ? 'border-zinc-800 bg-black' : 'border-zinc-200 bg-zinc-50'}
      `}>
        {hasResult ? (
          <video src={data.result} controls className="w-full h-full object-cover" />
        ) : (
          <div className="text-[10px] text-zinc-400">Awaiting result...</div>
        )}
      </div>

      {hasResult && (
        <div className="flex gap-2 mt-3">
          <a 
            href={data.result} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-zinc-800 text-[10px] font-bold text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            <Download size={10} /> Download
          </a>
        </div>
      )}
    </div>
  );
});