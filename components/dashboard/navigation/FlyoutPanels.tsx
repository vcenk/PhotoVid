import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, Wand2, Image as ImageIcon, Video, ArrowRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { FlyoutType } from './NavigationRail';
import { getPresetsByIndustry } from '../../../lib/data/style-presets';
import { useDashboardStore } from '../../../lib/store/dashboard';

interface FlyoutPanelsProps {
  activeFlyout: FlyoutType;
  onClose: () => void;
}

export function FlyoutPanels({ activeFlyout, onClose }: FlyoutPanelsProps) {
  const navigate = useNavigate();
  const { activeIndustry } = useDashboardStore();

  if (!activeFlyout) return null;

  const handleQuickAction = (action: string, mode: 'image' | 'video' | 'edit') => {
    const params = new URLSearchParams({
      mode,
      action,
      industry: activeIndustry,
    });
    navigate(`/studio?${params.toString()}`);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Flyout Panel */}
      <div className="fixed left-56 top-0 bottom-0 w-[320px] bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 z-50 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeFlyout === 'image' && <ImageIcon size={20} className="text-teal-600" />}
            {activeFlyout === 'video' && <Video size={20} className="text-teal-600" />}
            {activeFlyout === 'edit' && <Wand2 size={20} className="text-teal-600" />}
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white capitalize">
              {activeFlyout} Tools
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={18} className="text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {activeFlyout === 'image' && <ImageFlyoutContent onAction={handleQuickAction} onClose={onClose} />}
          {activeFlyout === 'video' && <VideoFlyoutContent onAction={handleQuickAction} onClose={onClose} />}
          {activeFlyout === 'edit' && <EditFlyoutContent onAction={handleQuickAction} onClose={onClose} />}
        </div>
      </div>
    </>
  );
}

// Image Tools Flyout
function ImageFlyoutContent({ onAction, onClose }: { onAction: (action: string, mode: 'image') => void; onClose: () => void }) {
  const { activeIndustry } = useDashboardStore();
  const presets = getPresetsByIndustry(activeIndustry).filter(p =>
    p.category === 'lighting' || p.category === 'composition' || p.category === 'color-grading'
  ).slice(0, 6);

  const quickActions = [
    { id: 'text-to-image', label: 'Text to Image', description: 'Generate from prompt', icon: Sparkles },
    { id: 'image-variation', label: 'Image Variation', description: 'Create similar versions', icon: ImageIcon },
    { id: 'upscale', label: 'Upscale', description: 'Enhance resolution', icon: Wand2 },
    { id: 'background-remove', label: 'Remove Background', description: 'Transparent background', icon: Wand2 },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onAction(action.id, 'image')}
                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-teal-50 dark:hover:bg-teal-950/30 border border-zinc-200 dark:border-zinc-800 hover:border-teal-300 dark:hover:border-teal-700 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 transition-colors">
                  <Icon size={18} className="text-zinc-600 dark:text-zinc-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-zinc-900 dark:text-white">{action.label}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{action.description}</div>
                </div>
                <ArrowRight size={16} className="text-zinc-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Style Presets */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Style Presets</h3>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.id}
                onClick={() => onAction(preset.id, 'image')}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-teal-50 dark:hover:bg-teal-950/30 border border-zinc-200 dark:border-zinc-800 hover:border-teal-300 dark:hover:border-teal-700 transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 transition-colors">
                  <Icon size={20} className="text-zinc-600 dark:text-zinc-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                </div>
                <div className="text-xs font-medium text-zinc-900 dark:text-white text-center">{preset.name}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Video Tools Flyout
function VideoFlyoutContent({ onAction, onClose }: { onAction: (action: string, mode: 'video') => void; onClose: () => void }) {
  const quickActions = [
    { id: 'text-to-video', label: 'Text to Video', description: 'Generate from prompt', icon: Sparkles },
    { id: 'image-to-video', label: 'Image to Video', description: 'Animate static images', icon: Video },
    { id: 'extend-video', label: 'Extend Video', description: 'Add more frames', icon: Wand2 },
    { id: 'video-upscale', label: 'Upscale Video', description: 'Enhance quality', icon: Wand2 },
  ];

  const motionPresets = [
    { id: 'slow-pan', name: 'Slow Pan' },
    { id: 'dolly-zoom', name: 'Dolly Zoom' },
    { id: 'aerial-glide', name: 'Aerial Glide' },
    { id: 'room-flow', name: 'Room Flow' },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onAction(action.id, 'video')}
                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-teal-50 dark:hover:bg-teal-950/30 border border-zinc-200 dark:border-zinc-800 hover:border-teal-300 dark:hover:border-teal-700 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 transition-colors">
                  <Icon size={18} className="text-zinc-600 dark:text-zinc-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-zinc-900 dark:text-white">{action.label}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{action.description}</div>
                </div>
                <ArrowRight size={16} className="text-zinc-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Motion Presets */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Motion Styles</h3>
        <div className="grid grid-cols-2 gap-2">
          {motionPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onAction(preset.id, 'video')}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-teal-50 dark:hover:bg-teal-950/30 border border-zinc-200 dark:border-zinc-800 hover:border-teal-300 dark:hover:border-teal-700 transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 transition-colors">
                <Video size={20} className="text-zinc-600 dark:text-zinc-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
              </div>
              <div className="text-xs font-medium text-zinc-900 dark:text-white text-center">{preset.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Edit Tools Flyout
function EditFlyoutContent({ onAction, onClose }: { onAction: (action: string, mode: 'edit') => void; onClose: () => void }) {
  const editTools = [
    { id: 'inpaint', label: 'Inpaint', description: 'Paint to modify areas', icon: Wand2 },
    { id: 'outpaint', label: 'Outpaint', description: 'Extend image bounds', icon: Wand2 },
    { id: 'object-remove', label: 'Remove Object', description: 'Clean unwanted elements', icon: Wand2 },
    { id: 'color-correct', label: 'Color Correction', description: 'Adjust colors & tones', icon: Wand2 },
    { id: 'relighting', label: 'Relighting', description: 'Change lighting conditions', icon: Sparkles },
    { id: 'style-transfer', label: 'Style Transfer', description: 'Apply artistic styles', icon: ImageIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Edit Tools */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Editing Tools</h3>
        <div className="grid grid-cols-1 gap-2">
          {editTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onAction(tool.id, 'edit')}
                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-teal-50 dark:hover:bg-teal-950/30 border border-zinc-200 dark:border-zinc-800 hover:border-teal-300 dark:hover:border-teal-700 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 transition-colors">
                  <Icon size={18} className="text-zinc-600 dark:text-zinc-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-zinc-900 dark:text-white">{tool.label}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{tool.description}</div>
                </div>
                <ArrowRight size={16} className="text-zinc-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
