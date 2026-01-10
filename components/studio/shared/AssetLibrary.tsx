import React from 'react';
import { useAssets } from '../../../lib/store/contexts/AssetContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Download, Image as ImageIcon, Play, ExternalLink } from 'lucide-react';

export const AssetLibrary: React.FC = () => {
  const { assets, loading, deleteAsset } = useAssets();

  if (loading && assets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-200">
        <div className="bg-zinc-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
          <ImageIcon size={32} />
        </div>
        <h3 className="text-xl font-medium text-zinc-900 mb-2">Your library is empty</h3>
        <p className="text-zinc-500">Uploaded photos and generated videos will appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <AnimatePresence>
        {assets.map((asset) => (
          <motion.div
            key={asset.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group relative bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <div className="aspect-square bg-zinc-100 relative overflow-hidden">
              {asset.type === 'image' ? (
                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <video src={asset.url} className="w-full h-full object-cover" muted onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }} />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                    <Play size={32} className="text-white fill-white" />
                  </div>
                </div>
              )}
              
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => deleteAsset(asset.id)}
                  className="p-2 bg-white/90 backdrop-blur rounded-lg text-zinc-500 hover:text-red-500 shadow-sm transition-colors"
                >
                  <Trash2 size={14} />
                </button>
                <a 
                  href={asset.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white/90 backdrop-blur rounded-lg text-zinc-500 hover:text-indigo-600 shadow-sm transition-colors"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
            
            <div className="p-3">
              <div className="text-xs font-bold text-zinc-900 truncate uppercase tracking-tight">
                {asset.name || (asset.type === 'image' ? 'Uploaded Image' : 'Generated Video')}
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                {new Date(asset.created_at).toLocaleDateString()}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
