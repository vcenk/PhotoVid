import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { UploadCloud, Image as ImageIcon, Check } from 'lucide-react';
import { uploadToR2 } from '../../../lib/r2';

export const ImageInputNode = memo(({ id, data }: { id: string, data: any }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(data.url || null);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      const file = e.target.files[0];
      try {
        // Upload to R2 and update node data
        const url = await uploadToR2(file, 'canvas-uploads');
        setPreview(url);
        data.onDataChange?.(id, { url });
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="px-4 py-3 shadow-xl rounded-2xl bg-white border-2 border-zinc-200 w-52 overflow-hidden">
      <div className="flex items-center mb-3">
        <div className="rounded-lg w-8 h-8 flex justify-center items-center bg-zinc-100 text-zinc-500 mr-2">
           <ImageIcon size={16} />
        </div>
        <div className="text-xs font-bold text-zinc-900 uppercase tracking-tight">Input Image</div>
      </div>

      <div className={`
        relative aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all
        ${preview ? 'border-emerald-200 bg-emerald-50/20' : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100'}
      `}>
        {preview ? (
          <img src={preview} alt="Input" className="w-full h-full object-cover rounded-lg" />
        ) : (
          <>
            {uploading ? (
              <div className="text-[10px] text-zinc-400 animate-pulse">Uploading...</div>
            ) : (
              <div className="text-[10px] text-zinc-400 text-center px-4">Click to upload image</div>
            )}
          </>
        )}
        <input 
          type="file" 
          className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={onFileChange} 
          accept="image/*"
        />
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-zinc-400" />
    </div>
  );
});