/**
 * ImageUploadStep - Step 3: Upload and arrange property images
 */

import React, { useState, useCallback } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Upload, Image as ImageIcon, X, GripVertical, Pencil, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useQuickVideo } from '../QuickVideoContext';
import type { VideoImage } from '@/lib/types/video-project';

// Simple ID generator
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Room label suggestions
const ROOM_LABELS = [
  'Living Room', 'Kitchen', 'Master Bedroom', 'Bedroom', 'Bathroom',
  'Dining Room', 'Office', 'Backyard', 'Front Exterior', 'Pool',
  'Garage', 'Patio', 'Balcony', 'Basement', 'Laundry',
];

export function ImageUploadStep() {
  const { images, addImages, removeImage, reorderImages, updateImageLabel } = useQuickVideo();
  const [isDragging, setIsDragging] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  // Process uploaded files
  const processFiles = useCallback((files: File[]) => {
    const newImages: VideoImage[] = files.map((file, index) => ({
      id: generateId(),
      order: images.length + index,
      url: URL.createObjectURL(file),
      duration: 3, // Default 3 seconds per image
    }));

    addImages(newImages);
  }, [images.length, addImages]);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const fileList = e.dataTransfer.files;
    const files: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.type.startsWith('image/')) {
        files.push(file);
      }
    }

    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    const files: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      files.push(fileList[i]);
    }

    if (files.length > 0) {
      processFiles(files);
    }
    // Reset input
    e.target.value = '';
  }, [processFiles]);

  // Handle label edit
  const startEditLabel = (id: string, currentLabel?: string) => {
    setEditingId(id);
    setEditLabel(currentLabel || '');
  };

  const saveLabel = () => {
    if (editingId) {
      updateImageLabel(editingId, editLabel);
      setEditingId(null);
      setEditLabel('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 mb-2">Add Property Photos</h2>
        <p className="text-zinc-400">
          Upload 5-15 photos. Drag to reorder - first image becomes the hero shot.
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          relative group overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300
          ${isDragging
            ? 'border-violet-500 bg-violet-600/10 scale-[1.01]'
            : 'border-white/10 bg-white/5 hover:border-violet-500/50 hover:bg-white/10'
          }
        `}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className="flex flex-col items-center justify-center p-12 text-center relative">
            <div className={`
                w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300
                ${isDragging ? 'bg-violet-600 text-white scale-110 shadow-lg shadow-violet-600/30' : 'bg-white/5 text-zinc-400 group-hover:bg-violet-600/20 group-hover:text-violet-300'}
            `}>
                <Upload size={32} />
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">
                {isDragging ? 'Drop images to upload' : 'Drag photos here'}
            </h3>
            <p className="text-zinc-400 max-w-sm mx-auto mb-6">
                Support for JPG, PNG, and WEBP. High resolution images work best (max 10MB each).
            </p>
            
            <button className="px-6 py-2.5 rounded-full bg-white text-black font-medium text-sm hover:bg-zinc-200 transition-colors pointer-events-none">
                Select Files
            </button>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Image Count Status */}
      <motion.div 
        initial={false}
        animate={{
            backgroundColor: images.length < 3 ? 'rgba(245, 158, 11, 0.1)' : images.length > 15 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            borderColor: images.length < 3 ? 'rgba(245, 158, 11, 0.2)' : images.length > 15 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'
        }}
        className="flex items-center gap-3 p-4 rounded-xl border backdrop-blur-sm"
      >
        <div className={`
            p-1.5 rounded-full
            ${images.length < 3 ? 'bg-amber-500/20 text-amber-400' : images.length > 15 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}
        `}>
             <AlertCircle size={18} />
        </div>
        <span className={`text-sm font-medium ${images.length < 3 ? 'text-amber-200' : images.length > 15 ? 'text-red-200' : 'text-green-200'}`}>
          {images.length === 0
            ? 'Add at least 3 photos to continue'
            : images.length < 3
              ? `${3 - images.length} more photo${3 - images.length > 1 ? 's' : ''} needed for a great video`
              : images.length > 15
                ? 'Consider removing some photos for better video flow'
                : `${images.length} photos added - perfect!`
          }
        </span>
      </motion.div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <p className="text-sm text-zinc-400 flex items-center gap-2">
                <GripVertical size={14} />
                Drag to reorder
             </p>
             <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                {images.length} Images
             </span>
          </div>

          <Reorder.Group
            axis="y"
            values={images}
            onReorder={(newOrder) => {
              // Update each image's order
              const oldImages = [...images];
              newOrder.forEach((img, newIndex) => {
                const oldIndex = oldImages.findIndex(i => i.id === img.id);
                if (oldIndex !== newIndex) {
                  reorderImages(oldIndex, newIndex);
                }
              });
            }}
            className="space-y-3"
          >
            {images.map((image, index) => (
              <Reorder.Item
                key={image.id}
                value={image}
                className="relative flex items-center gap-4 p-3 bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl cursor-move group backdrop-blur-sm transition-colors"
              >
                {/* Drag Handle */}
                <div className="pl-2 text-zinc-600 group-hover:text-zinc-400 transition-colors">
                    <GripVertical size={20} />
                </div>

                {/* Order Number */}
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0
                  ${index === 0 ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'bg-white/5 text-zinc-500'}
                `}>
                  {index + 1}
                </div>

                {/* Thumbnail */}
                <div className="w-24 h-16 rounded-lg overflow-hidden bg-black/50 flex-shrink-0 border border-white/5 relative">
                  <img
                    src={image.url}
                    alt={image.label || `Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === 0 && (
                     <div className="absolute inset-0 bg-violet-900/20 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-md">HERO</span>
                     </div>
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  {editingId === image.id ? (
                    <div className="flex items-center gap-2 max-w-sm">
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveLabel()}
                        placeholder="e.g., Living Room"
                        className="flex-1 px-3 py-1.5 bg-black/40 border border-violet-500/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                        autoFocus
                      />
                      <button
                        onClick={saveLabel}
                        className="p-1.5 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-lg transition-colors"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <div 
                        className="flex items-center gap-2 cursor-text group/label"
                        onClick={() => startEditLabel(image.id, image.label)}
                    >
                      <span className={`text-sm font-medium ${image.label ? 'text-white' : 'text-zinc-500 italic'}`}>
                        {image.label || 'Add room label...'}
                      </span>
                      <Pencil size={14} className="text-zinc-600 opacity-0 group-hover/label:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeImage(image.id)}
                  className="p-2 mr-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove image"
                >
                  <X size={18} />
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}

      {/* Quick Label Suggestions */}
      {images.length > 0 && images.some(img => !img.label) && (
        <div className="p-5 bg-violet-500/5 border border-violet-500/10 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
             <Sparkles size={16} className="text-violet-400" />
             <p className="text-sm font-medium text-violet-200">Quick Label Suggestions</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ROOM_LABELS.slice(0, 10).map((label) => (
              <button
                key={label}
                onClick={() => {
                  const unlabeled = images.find(img => !img.label);
                  if (unlabeled) {
                    updateImageLabel(unlabeled.id, label);
                  }
                }}
                className="px-3 py-1.5 bg-white/5 hover:bg-violet-600/20 border border-white/5 hover:border-violet-500/30 text-zinc-400 hover:text-violet-200 rounded-lg text-xs font-medium transition-all duration-200"
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-500 mt-2">Click to apply to the next unlabeled image</p>
        </div>
      )}
    </div>
  );
}

export default ImageUploadStep;
