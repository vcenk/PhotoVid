import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Zap, Loader2, CheckCircle2, Settings2 } from 'lucide-react';

export const ProcessingNode = memo(({ id, data }: { id: string, data: any }) => {
  const isProcessing = data.status === 'processing';
  const isCompleted = data.status === 'completed';

  return (
    <div className={`
      px-4 py-3 shadow-xl rounded-2xl bg-white border-2 transition-all duration-300 w-64
      ${isProcessing ? 'border-indigo-500 ring-4 ring-indigo-50' : 
        isCompleted ? 'border-emerald-500 bg-emerald-50/30' : 'border-zinc-200'}
    `}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-zinc-400" />
      
      <div className="flex items-center mb-3">
        <div className={`
          rounded-lg w-10 h-10 flex justify-center items-center transition-colors
          ${isProcessing ? 'bg-indigo-600 text-white animate-pulse' : 
            isCompleted ? 'bg-emerald-500 text-white' : 'bg-zinc-100 text-zinc-500'}
        `}>
           {isProcessing ? <Loader2 size={18} className="animate-spin" /> : 
            isCompleted ? <CheckCircle2 size={18} /> : <Zap size={18} />}
        </div>
        
        <div className="ml-3 flex-1">
          <div className="text-[11px] font-bold text-zinc-900 uppercase tracking-tight">{data.label}</div>
          <div className={`text-[10px] font-medium ${isProcessing ? 'text-indigo-500' : isCompleted ? 'text-emerald-600' : 'text-zinc-400'}`}>
            {isProcessing ? 'Generating...' : isCompleted ? 'Success' : 'Ready to Run'}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 px-2 py-1.5 bg-zinc-50 rounded-lg border border-zinc-100">
          <Settings2 size={12} className="text-zinc-400" />
          <input 
            type="text" 
            placeholder="Prompt suffix..."
            defaultValue={data.promptSuffix || ""}
            onChange={(e) => data.onDataChange?.(id, { promptSuffix: e.target.value })}
            className="bg-transparent text-[10px] text-zinc-600 outline-none w-full"
          />
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-zinc-400" />
    </div>
  );
});