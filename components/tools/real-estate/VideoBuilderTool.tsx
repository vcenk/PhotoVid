import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Player, PlayerRef } from '@remotion/player';
import {
    ArrowLeft,
    Film,
    Play,
    Pause,
    Upload,
    Home,
    User,
    Sparkles,
    Monitor,
    Square,
    Smartphone,
    GripVertical,
    Plus,
    Trash2,
    Clock,
    ChevronDown,
    ChevronRight,
    Image as ImageIcon,
    DollarSign,
    Bed,
    Bath,
    Maximize,
    Phone,
    Mail,
    Building2,
    RotateCcw,
    Volume2,
    VolumeX,
    Maximize2,
    SkipBack,
    SkipForward,
    Info,
} from 'lucide-react';
import { NavigationRail } from '../../dashboard/navigation/NavigationRail';
import { VideoProjectProvider, useVideoProject } from '@/lib/store/contexts/VideoProjectContext';
import { VIDEO_TEMPLATES } from '@/lib/data/video-templates';
import { PropertyVideo } from '@/remotion/compositions/PropertyVideo';
import { VIDEO_CONFIG, FORMAT_DIMENSIONS } from '@/lib/types/video-project';
import type { ExportFormat, VideoTemplate } from '@/lib/types/video-project';

// Format options for preview
const FORMAT_OPTIONS: { id: ExportFormat; label: string; icon: React.ReactNode; aspect: string; desc: string }[] = [
    { id: 'landscape', label: 'Landscape', icon: <Monitor size={18} />, aspect: '16:9', desc: 'YouTube, Website' },
    { id: 'square', label: 'Square', icon: <Square size={18} />, aspect: '1:1', desc: 'Instagram Feed' },
    { id: 'vertical', label: 'Vertical', icon: <Smartphone size={18} />, aspect: '9:16', desc: 'TikTok, Reels' },
];

// Collapsible Section Component
const CollapsibleSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    defaultOpen?: boolean;
    children: React.ReactNode;
    badge?: string;
}> = ({ title, icon, defaultOpen = true, children, badge }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-white/5 rounded-xl overflow-hidden bg-zinc-900/50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-zinc-400">{icon}</span>
                    <span className="text-sm font-medium text-white">{title}</span>
                    {badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                            {badge}
                        </span>
                    )}
                </div>
                {isOpen ? (
                    <ChevronDown size={16} className="text-zinc-500" />
                ) : (
                    <ChevronRight size={16} className="text-zinc-500" />
                )}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pt-1">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Input Field Component
const InputField: React.FC<{
    icon?: React.ReactNode;
    label?: string;
    placeholder: string;
    value: string | number | undefined;
    onChange: (value: string) => void;
    type?: string;
    prefix?: string;
}> = ({ icon, label, placeholder, value, onChange, type = 'text', prefix }) => (
    <div className="space-y-1">
        {label && (
            <label className="text-xs text-zinc-500">{label}</label>
        )}
        <div className="relative">
            {icon && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                    {icon}
                </span>
            )}
            {prefix && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
                    {prefix}
                </span>
            )}
            <input
                type={type}
                placeholder={placeholder}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full py-2.5 bg-zinc-800/50 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all ${
                    icon ? 'pl-10 pr-3' : prefix ? 'pl-7 pr-3' : 'px-3'
                }`}
            />
        </div>
    </div>
);

// Inner component that uses the context
function VideoBuilderContent() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [previewFormat, setPreviewFormat] = useState<ExportFormat>('landscape');
    const [isMuted, setIsMuted] = useState(true);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const playerRef = useRef<PlayerRef>(null);

    const {
        project,
        createProject,
        images,
        addImages,
        removeImage,
        reorderImages,
        propertyData,
        updatePropertyData,
        agentBranding,
        updateAgentBranding,
        selectedTemplate,
        setTemplate,
        totalDuration,
        canPreview,
    } = useVideoProject();

    // Create project on mount if none exists
    useEffect(() => {
        if (!project) {
            createProject('Property Video');
        }
    }, [project, createProject]);

    // Handle file upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            await addImages(Array.from(files));
        }
        // Reset input
        e.target.value = '';
    };

    // Handle drag and drop
    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
            if (imageFiles.length > 0) {
                await addImages(imageFiles);
            }
        }
    }, [addImages]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(false);
    }, []);

    // Player controls
    const handlePlayPause = () => {
        if (playerRef.current) {
            if (playerRef.current.isPlaying()) {
                playerRef.current.pause();
            } else {
                playerRef.current.play();
            }
        }
    };

    const handleRestart = () => {
        if (playerRef.current) {
            playerRef.current.seekTo(0);
            playerRef.current.play();
        }
    };

    // Get dimensions for player
    const dimensions = FORMAT_DIMENSIONS[previewFormat];

    // Prepare input props for Remotion
    const inputProps = {
        images: images.map(img => ({
            ...img,
            url: img.url,
        })),
        propertyData,
        agentBranding,
        templateId: selectedTemplate,
        format: previewFormat,
    };

    return (
        <div className="h-screen flex bg-[#09090b]">
            {/* Navigation Rail */}
            <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
{/* Main Content Area */}
            <div className="flex-1 flex ml-0 lg:ml-16">
                {/* Left Sidebar - Controls */}
                <div className="w-[360px] flex-shrink-0 bg-[#0f0f11] border-r border-white/5 flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/studio/real-estate')}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={18} className="text-zinc-400" />
                            </button>
                            <div className="flex-1">
                                <h1 className="text-base font-semibold text-white flex items-center gap-2">
                                    <Film size={18} className="text-purple-400" />
                                    Video Builder
                                </h1>
                                <p className="text-xs text-zinc-500">Create stunning property videos</p>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Controls Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Images Section */}
                        <CollapsibleSection
                            title="Property Images"
                            icon={<ImageIcon size={16} />}
                            badge={images.length > 0 ? `${images.length}` : undefined}
                        >
                            {/* Upload Zone */}
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer mb-3 ${
                                    isDraggingOver
                                        ? 'border-purple-500 bg-purple-500/10'
                                        : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                                }`}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileUpload}
                                />
                                <Upload size={20} className={`mx-auto mb-2 ${isDraggingOver ? 'text-purple-400' : 'text-zinc-500'}`} />
                                <p className="text-sm text-zinc-400">
                                    {isDraggingOver ? 'Drop images here' : 'Drag & drop images'}
                                </p>
                                <p className="text-xs text-zinc-600 mt-1">or click to browse</p>
                            </div>

                            {/* Image Grid */}
                            {images.length > 0 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {images.map((img, index) => (
                                        <motion.div
                                            key={img.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="relative group aspect-square rounded-lg overflow-hidden bg-zinc-800 ring-1 ring-white/10"
                                        >
                                            <img
                                                src={img.url}
                                                alt={`Image ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <button
                                                onClick={() => removeImage(img.id)}
                                                className="absolute top-1 right-1 p-1 rounded-md bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                            >
                                                <Trash2 size={12} className="text-white" />
                                            </button>
                                            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white font-medium">
                                                {index + 1}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {images.length === 0 && (
                                <div className="text-center py-4">
                                    <p className="text-xs text-zinc-500">No images added yet</p>
                                    <p className="text-xs text-zinc-600">Upload at least 3 images for best results</p>
                                </div>
                            )}
                        </CollapsibleSection>

                        {/* Property Details Section */}
                        <CollapsibleSection
                            title="Property Details"
                            icon={<Home size={16} />}
                        >
                            <div className="space-y-3">
                                <InputField
                                    icon={<Home size={14} />}
                                    placeholder="123 Main Street, City, State"
                                    value={propertyData.address}
                                    onChange={(v) => updatePropertyData({ address: v })}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <InputField
                                        prefix="$"
                                        placeholder="Price"
                                        value={propertyData.price}
                                        onChange={(v) => updatePropertyData({ price: parseInt(v) || undefined })}
                                    />
                                    <InputField
                                        icon={<Maximize size={14} />}
                                        placeholder="Sq Ft"
                                        value={propertyData.squareFeet}
                                        onChange={(v) => updatePropertyData({ squareFeet: parseInt(v) || undefined })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <InputField
                                        icon={<Bed size={14} />}
                                        placeholder="Beds"
                                        value={propertyData.bedrooms}
                                        onChange={(v) => updatePropertyData({ bedrooms: parseInt(v) || undefined })}
                                        type="number"
                                    />
                                    <InputField
                                        icon={<Bath size={14} />}
                                        placeholder="Baths"
                                        value={propertyData.bathrooms}
                                        onChange={(v) => updatePropertyData({ bathrooms: parseFloat(v) || undefined })}
                                    />
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Agent Branding Section */}
                        <CollapsibleSection
                            title="Agent Branding"
                            icon={<User size={16} />}
                            defaultOpen={false}
                        >
                            <div className="space-y-3">
                                <InputField
                                    icon={<User size={14} />}
                                    placeholder="Your Name"
                                    value={agentBranding.name}
                                    onChange={(v) => updateAgentBranding({ name: v })}
                                />
                                <InputField
                                    icon={<Phone size={14} />}
                                    placeholder="(555) 123-4567"
                                    value={agentBranding.phone}
                                    onChange={(v) => updateAgentBranding({ phone: v })}
                                />
                                <InputField
                                    icon={<Mail size={14} />}
                                    placeholder="email@example.com"
                                    value={agentBranding.email}
                                    onChange={(v) => updateAgentBranding({ email: v })}
                                />
                                <InputField
                                    icon={<Building2 size={14} />}
                                    placeholder="Brokerage Name"
                                    value={agentBranding.brokerageName}
                                    onChange={(v) => updateAgentBranding({ brokerageName: v })}
                                />
                            </div>
                        </CollapsibleSection>

                        {/* Template Selection */}
                        <CollapsibleSection
                            title="Video Style"
                            icon={<Sparkles size={16} />}
                        >
                            <div className="grid grid-cols-2 gap-2">
                                {Object.values(VIDEO_TEMPLATES).map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => setTemplate(template.id as VideoTemplate)}
                                        className={`relative p-3 rounded-xl text-left transition-all ${
                                            selectedTemplate === template.id
                                                ? 'bg-purple-500/20 ring-2 ring-purple-500'
                                                : 'bg-zinc-800/50 hover:bg-zinc-800 ring-1 ring-white/5'
                                        }`}
                                    >
                                        <div
                                            className="w-full h-8 rounded-lg mb-2"
                                            style={{
                                                background: `linear-gradient(135deg, ${template.colors.primary}, ${template.colors.accent})`,
                                            }}
                                        />
                                        <div className="text-sm text-white font-medium">{template.name}</div>
                                        <div className="text-[10px] text-zinc-500 mt-0.5">
                                            {template.description.split(' ').slice(0, 3).join(' ')}
                                        </div>
                                        {selectedTemplate === template.id && (
                                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </CollapsibleSection>
                    </div>

                    {/* Export Section */}
                    <div className="p-4 border-t border-white/5 bg-zinc-900/50">
                        <div className="flex items-center justify-between text-sm mb-3">
                            <span className="text-zinc-400 flex items-center gap-2">
                                <Clock size={14} />
                                Duration
                            </span>
                            <span className="text-white font-medium">30 seconds</span>
                        </div>
                        <button
                            disabled={!canPreview}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium relative overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/20"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <Film size={18} />
                                Export Video
                            </span>
                            <span className="absolute top-1.5 right-2 text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                                Coming Soon
                            </span>
                        </button>
                        <p className="text-[10px] text-center text-zinc-600 mt-2">
                            5 credits per format • Export to MP4
                        </p>
                    </div>
                </div>

                {/* Right Side - Preview Area */}
                <div className="flex-1 flex flex-col bg-[#09090b]">
                    {/* Preview Header */}
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white">Live Preview</h2>
                            <p className="text-xs text-zinc-500">Real-time video preview with animations</p>
                        </div>
                        {/* Format Selector */}
                        <div className="flex items-center gap-2">
                            {FORMAT_OPTIONS.map((format) => (
                                <button
                                    key={format.id}
                                    onClick={() => setPreviewFormat(format.id)}
                                    className={`flex flex-col items-center px-4 py-2 rounded-xl transition-all ${
                                        previewFormat === format.id
                                            ? 'bg-purple-500/20 ring-1 ring-purple-500'
                                            : 'bg-zinc-900 hover:bg-zinc-800 ring-1 ring-white/5'
                                    }`}
                                >
                                    <span className={previewFormat === format.id ? 'text-purple-400' : 'text-zinc-400'}>
                                        {format.icon}
                                    </span>
                                    <span className={`text-xs mt-1 ${previewFormat === format.id ? 'text-white' : 'text-zinc-500'}`}>
                                        {format.aspect}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview Container */}
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="relative w-full h-full flex items-center justify-center">
                            {canPreview ? (
                                <div
                                    className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10"
                                    style={{
                                        aspectRatio: `${dimensions.width} / ${dimensions.height}`,
                                        maxHeight: '100%',
                                        maxWidth: '100%',
                                        width: previewFormat === 'vertical' ? 'auto' : '100%',
                                        height: previewFormat === 'vertical' ? '100%' : 'auto',
                                    }}
                                >
                                    {/* Remotion Player */}
                                    <Player
                                        ref={playerRef}
                                        component={PropertyVideo}
                                        inputProps={inputProps}
                                        durationInFrames={VIDEO_CONFIG.durationInFrames}
                                        fps={VIDEO_CONFIG.fps}
                                        compositionWidth={dimensions.width}
                                        compositionHeight={dimensions.height}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                        }}
                                        autoPlay
                                        loop
                                        showVolumeControls={false}
                                        clickToPlay={false}
                                    />

                                    {/* Custom Controls Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={handleRestart}
                                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                            >
                                                <RotateCcw size={16} className="text-white" />
                                            </button>
                                            <button
                                                onClick={handlePlayPause}
                                                className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                            >
                                                <Play size={20} className="text-white ml-0.5" />
                                            </button>
                                            <button
                                                onClick={() => setIsMuted(!isMuted)}
                                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                            >
                                                {isMuted ? (
                                                    <VolumeX size={16} className="text-white" />
                                                ) : (
                                                    <Volume2 size={16} className="text-white" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-zinc-900 flex items-center justify-center ring-1 ring-white/10">
                                        <Film size={40} className="text-zinc-700" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-1">No Preview Available</h3>
                                    <p className="text-sm text-zinc-500 mb-4">Upload property images to see your video</p>
                                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium cursor-pointer transition-colors">
                                        <Upload size={16} />
                                        Upload Images
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleFileUpload}
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Bar */}
                    {canPreview && (
                        <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between bg-zinc-900/30">
                            <div className="flex items-center gap-4 text-xs text-zinc-500">
                                <span className="flex items-center gap-1">
                                    <ImageIcon size={12} />
                                    {images.length} images
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    30 seconds
                                </span>
                                <span className="flex items-center gap-1">
                                    <Sparkles size={12} />
                                    {VIDEO_TEMPLATES[selectedTemplate]?.name || 'Modern'} style
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-600">
                                <Info size={12} />
                                {dimensions.width} × {dimensions.height}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Export with provider wrapper
export const VideoBuilderTool: React.FC = () => {
    return (
        <VideoProjectProvider>
            <VideoBuilderContent />
        </VideoProjectProvider>
    );
};
