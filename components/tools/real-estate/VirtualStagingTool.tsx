import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    UploadCloud,
    Sparkles,
    Download,
    RefreshCw,
    Check,
    Sofa,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Trash2,
    ZoomIn,
    Image as ImageIcon,
    AlertCircle,
    Zap
} from 'lucide-react';
import { NavigationRail, FlyoutType } from '../../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../../dashboard/navigation/FlyoutPanels';
import { generateVirtualStaging, isFalConfigured } from '@/lib/api/toolGeneration';
import { useCredits } from '@/lib/store/contexts/CreditsContext';
import { CREDIT_COSTS } from '@/lib/types/credits';
import type { VirtualStagingOptions } from '@/lib/types/generation';

// Room types
const ROOM_TYPES = [
    { id: 'living-room', label: 'Living Room' },
    { id: 'bedroom', label: 'Bedroom' },
    { id: 'kitchen', label: 'Kitchen' },
    { id: 'dining', label: 'Dining Room' },
    { id: 'bathroom', label: 'Bathroom' },
    { id: 'office', label: 'Home Office' },
];

// Staging styles with preview images
const STAGING_STYLES = [
    {
        id: 'modern',
        name: 'Modern',
        image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=300&h=200&fit=crop',
        prompt: 'modern minimalist interior design, clean lines, contemporary furniture, neutral colors'
    },
    {
        id: 'scandinavian',
        name: 'Scandinavian',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=300&h=200&fit=crop',
        prompt: 'scandinavian interior design, light wood furniture, white walls, cozy textiles'
    },
    {
        id: 'coastal',
        name: 'Coastal',
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300&h=200&fit=crop',
        prompt: 'coastal interior design, beach house style, light blue accents, natural materials'
    },
    {
        id: 'luxury',
        name: 'Luxury',
        image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=300&h=200&fit=crop',
        prompt: 'luxury interior design, high-end furniture, elegant finishes, rich textures'
    },
    {
        id: 'industrial',
        name: 'Industrial',
        image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=300&h=200&fit=crop',
        prompt: 'industrial interior design, exposed brick, metal accents, urban loft style'
    },
    {
        id: 'farmhouse',
        name: 'Farmhouse',
        image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=300&h=200&fit=crop',
        prompt: 'farmhouse interior design, rustic charm, warm wood tones, cozy country style'
    },
];

const TOOL_ID = 'virtual-staging';
const CREDIT_COST = CREDIT_COSTS[TOOL_ID] || 2;

export const VirtualStagingTool: React.FC = () => {
    const navigate = useNavigate();
    const { balance, deductCredits, hasEnoughCredits } = useCredits();
    const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);
    const hasCredits = hasEnoughCredits(TOOL_ID as any);

    // Upload state
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Configuration state
    const [selectedRoom, setSelectedRoom] = useState(ROOM_TYPES[0].id);
    const [selectedStyle, setSelectedStyle] = useState(STAGING_STYLES[0].id);
    const [removeFurniture, setRemoveFurniture] = useState(false);

    // Generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [resultImage, setResultImage] = useState<string | null>(null);

    // Before/After slider
    const [sliderPosition, setSliderPosition] = useState(50);
    const sliderRef = useRef<HTMLDivElement>(null);

    // Error state
    const [error, setError] = useState<string | null>(null);

    // Handle drag events
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                setUploadedImage(file);
                setImagePreview(URL.createObjectURL(file));
                setResultImage(null);
            }
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadedImage(file);
            setImagePreview(URL.createObjectURL(file));
            setResultImage(null);
        }
    };

    const removeImage = () => {
        setUploadedImage(null);
        setImagePreview(null);
        setResultImage(null);
    };

    // Handle generation
    const handleGenerate = async () => {
        if (!uploadedImage) return;

        // Check credits first
        if (!hasCredits) {
            setError(`Insufficient credits. This tool requires ${CREDIT_COST} credits. You have ${balance} credits.`);
            return;
        }

        setIsGenerating(true);
        setGenerationProgress(0);
        setError(null);

        // Deduct credits before starting generation
        const deducted = await deductCredits(TOOL_ID as any);
        if (!deducted) {
            setError('Failed to deduct credits. Please try again.');
            setIsGenerating(false);
            return;
        }

        // Check if FAL API is configured
        if (!isFalConfigured()) {
            // Fallback to mock for demo/development
            const progressInterval = setInterval(() => {
                setGenerationProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 500);

            setTimeout(() => {
                clearInterval(progressInterval);
                setGenerationProgress(100);
                setResultImage('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=800&fit=crop');
                setIsGenerating(false);
            }, 3000);
            return;
        }

        try {
            const options: VirtualStagingOptions = {
                roomType: selectedRoom as VirtualStagingOptions['roomType'],
                style: selectedStyle as VirtualStagingOptions['style'],
                removeExisting: removeFurniture,
            };

            const resultUrl = await generateVirtualStaging(
                uploadedImage,
                options,
                (progress, status) => {
                    setGenerationProgress(progress);
                    console.log('Generation status:', status);
                }
            );

            setResultImage(resultUrl);
        } catch (err) {
            console.error('Virtual staging generation error:', err);
            setError(err instanceof Error ? err.message : 'Generation failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Before/After slider handler
    const handleSliderMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const position = ((clientX - rect.left) / rect.width) * 100;
        setSliderPosition(Math.max(0, Math.min(100, position)));
    }, []);

    const selectedStyleData = STAGING_STYLES.find(s => s.id === selectedStyle);

    return (
        <div className="h-screen flex bg-[#0a0a0b]">
            {/* Navigation Rail */}
            <NavigationRail activeFlyout={activeFlyout} onFlyoutChange={setActiveFlyout} />
            <FlyoutPanels activeFlyout={activeFlyout} onClose={() => setActiveFlyout(null)} />

            {/* Main Content */}
            <div className="flex-1 flex ml-[72px]">
                {/* Left Sidebar - Controls */}
                <div className="w-[340px] flex-shrink-0 bg-[#111113] border-r border-white/5 flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/studio/apps/real-estate')}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={18} className="text-zinc-400" />
                            </button>
                            <div>
                                <h1 className="text-base font-semibold text-white flex items-center gap-2">
                                    <Sofa size={18} className="text-indigo-400" />
                                    Virtual Staging
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        {/* Upload Area */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
                                Room Photo
                            </label>
                            {!imagePreview ? (
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`
                                        relative border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
                                        ${isDragging
                                            ? 'border-indigo-500 bg-indigo-500/10'
                                            : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                                        }
                                    `}
                                >
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                    />
                                    <UploadCloud size={28} className="mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm text-zinc-400">Drop image here</p>
                                    <p className="text-xs text-zinc-600 mt-1">or click to browse</p>
                                </div>
                            ) : (
                                <div className="relative rounded-xl overflow-hidden group">
                                    <img
                                        src={imagePreview}
                                        alt="Room"
                                        className="w-full h-40 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={removeImage}
                                            className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Room Type */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
                                Room Type
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {ROOM_TYPES.map((room) => (
                                    <button
                                        key={room.id}
                                        onClick={() => setSelectedRoom(room.id)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                            selectedRoom === room.id
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-300'
                                        }`}
                                    >
                                        {room.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Staging Style */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">
                                Style
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {STAGING_STYLES.map((style) => (
                                    <button
                                        key={style.id}
                                        onClick={() => setSelectedStyle(style.id)}
                                        className={`relative rounded-xl overflow-hidden transition-all ${
                                            selectedStyle === style.id
                                                ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#111113]'
                                                : 'hover:ring-1 hover:ring-white/20'
                                        }`}
                                    >
                                        <img
                                            src={style.image}
                                            alt={style.name}
                                            className="w-full h-24 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                                        <span className="absolute bottom-2 left-2 text-xs font-semibold text-white">
                                            {style.name}
                                        </span>
                                        {selectedStyle === style.id && (
                                            <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                                                <Check size={12} className="text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Options */}
                        <div>
                            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                <input
                                    type="checkbox"
                                    checked={removeFurniture}
                                    onChange={(e) => setRemoveFurniture(e.target.checked)}
                                    className="w-4 h-4 rounded border-zinc-600 bg-transparent text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                                />
                                <div>
                                    <p className="text-sm text-zinc-300">Remove existing furniture</p>
                                    <p className="text-xs text-zinc-600">Clear before staging</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <div className="p-4 border-t border-white/5 space-y-3">
                        {/* Credit Info */}
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500">Cost</span>
                            <span className={`flex items-center gap-1 ${hasCredits ? 'text-violet-400' : 'text-red-400'}`}>
                                <Zap size={12} className="fill-current" />
                                {CREDIT_COST} credits
                            </span>
                        </div>

                        {!hasCredits && (
                            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-xs text-red-400 text-center">
                                    Insufficient credits ({balance} available)
                                </p>
                                <button
                                    onClick={() => navigate('/studio/credits')}
                                    className="w-full mt-2 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                                >
                                    Get More Credits
                                </button>
                            </div>
                        )}

                        <button
                            onClick={handleGenerate}
                            disabled={!uploadedImage || isGenerating || !hasCredits}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                                uploadedImage && !isGenerating && hasCredits
                                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                    : 'bg-white/5 text-zinc-600 cursor-not-allowed'
                            }`}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Generating {generationProgress}%
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} />
                                    Generate
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right - Preview Area */}
                <div className="flex-1 flex flex-col bg-[#0a0a0b]">
                    {/* Preview Header */}
                    <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                        <span className="text-sm text-zinc-500">Preview</span>
                        {resultImage && (
                            <div className="flex items-center gap-2">
                                <button className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5">
                                    <RefreshCw size={14} />
                                    Regenerate
                                </button>
                                <button className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5">
                                    <Download size={14} />
                                    Download
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Preview Content */}
                    <div className="flex-1 flex items-center justify-center p-8">
                        {error ? (
                            /* Error State */
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} className="text-red-500" />
                                </div>
                                <p className="text-red-400 text-sm font-medium mb-2">Generation Failed</p>
                                <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
                                <button
                                    onClick={() => setError(null)}
                                    className="mt-4 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : !imagePreview && !resultImage ? (
                            /* Empty State */
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                                    <ImageIcon size={32} className="text-zinc-700" />
                                </div>
                                <p className="text-zinc-500 text-sm">Upload a room photo to get started</p>
                            </div>
                        ) : resultImage && imagePreview ? (
                            /* Before/After Comparison */
                            <div className="w-full max-w-5xl">
                                <div
                                    ref={sliderRef}
                                    className="relative rounded-2xl overflow-hidden cursor-ew-resize select-none shadow-2xl"
                                    onMouseMove={(e) => e.buttons === 1 && handleSliderMove(e)}
                                    onMouseDown={handleSliderMove}
                                    onTouchMove={handleSliderMove}
                                >
                                    {/* After Image */}
                                    <img
                                        src={resultImage}
                                        alt="After"
                                        className="w-full h-auto max-h-[calc(100vh-180px)] object-contain"
                                    />

                                    {/* Before Image (Clipped) */}
                                    <div
                                        className="absolute inset-0 overflow-hidden"
                                        style={{ width: `${sliderPosition}%` }}
                                    >
                                        <img
                                            src={imagePreview}
                                            alt="Before"
                                            className="w-full h-auto max-h-[calc(100vh-180px)] object-contain"
                                            style={{ width: sliderRef.current?.offsetWidth }}
                                        />
                                    </div>

                                    {/* Slider Handle */}
                                    <div
                                        className="absolute top-0 bottom-0 w-0.5 bg-white"
                                        style={{ left: `${sliderPosition}%` }}
                                    >
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                                            <ChevronLeft size={14} className="text-zinc-800 -mr-1" />
                                            <ChevronRight size={14} className="text-zinc-800 -ml-1" />
                                        </div>
                                    </div>

                                    {/* Labels */}
                                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur rounded-lg text-xs text-white font-medium">
                                        Before
                                    </div>
                                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur rounded-lg text-xs text-white font-medium">
                                        After • {selectedStyleData?.name}
                                    </div>
                                </div>
                            </div>
                        ) : isGenerating ? (
                            /* Generating State */
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="44"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                            className="text-white/10"
                                        />
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="44"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                            strokeDasharray={276.46}
                                            strokeDashoffset={276.46 - (276.46 * generationProgress) / 100}
                                            className="text-indigo-500 transition-all duration-300"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">
                                        {generationProgress}%
                                    </span>
                                </div>
                                <p className="text-zinc-400 font-medium">Staging your room...</p>
                                <p className="text-zinc-600 text-sm mt-1">This takes about 15-30 seconds</p>
                            </div>
                        ) : (
                            /* Image Uploaded, Ready to Generate */
                            <div className="w-full max-w-5xl">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                    <img
                                        src={imagePreview}
                                        alt="Room"
                                        className="w-full h-auto max-h-[calc(100vh-180px)] object-contain"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                        <div className="text-center">
                                            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-3">
                                                <Sparkles size={28} className="text-white" />
                                            </div>
                                            <p className="text-white font-medium">Ready to stage</p>
                                            <p className="text-white/60 text-sm">Click Generate to transform</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
