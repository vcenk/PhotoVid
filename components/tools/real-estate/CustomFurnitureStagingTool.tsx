import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    UploadCloud,
    Sparkles,
    Download,
    RefreshCw,
    Check,
    Armchair,
    Loader2,
    Trash2,
    Image as ImageIcon,
    AlertCircle,
    Zap,
    BookmarkPlus,
    Link as LinkIcon
} from 'lucide-react';
import { BeforeAfterSlider } from '@/components/common/BeforeAfterSlider';
import { AssetProvider, useAssets } from '@/lib/store/contexts/AssetContext';
import { NavigationRail } from '../../dashboard/navigation/NavigationRail';
import { generateCustomFurnitureStaging, isFalConfigured, safeImageUrl } from '@/lib/api/toolGeneration';
import { useCredits } from '@/lib/store/contexts/CreditsContext';
import { CREDIT_COSTS } from '@/lib/types/credits';
import type { CustomFurnitureStagingOptions } from '@/lib/types/generation';

const TOOL_ID = 'custom-furniture-staging';
const CREDIT_COST = CREDIT_COSTS[TOOL_ID] || 3;

// Default showcase images
const DEFAULT_BEFORE_IMAGE = '/showcase/real-estate/before/virtual-staging.jpg';
const DEFAULT_AFTER_IMAGE = '/showcase/real-estate/after/virtual-staging.jpg';

// Furniture placement area presets
const FURNITURE_AREA_PRESETS = [
    { id: 'floor', label: 'Floor Area', description: 'Add furniture to the floor (recommended)' },
    { id: 'center', label: 'Center Only', description: 'Add furniture only in the center' },
    { id: 'full', label: 'Full Room', description: 'Add furniture throughout the room' },
];

// Pre-designed furniture style presets
const PROMPT_PRESETS = [
    {
        id: 'modern-minimal',
        label: 'Modern Minimal',
        prompt: 'Modern minimalist living room furniture: sleek low-profile sofa in neutral gray or white, glass and metal coffee table, simple geometric area rug, minimal decorative accents. Clean lines, uncluttered, contemporary design.',
    },
    {
        id: 'cozy-living',
        label: 'Cozy & Warm',
        prompt: 'Cozy inviting living room: plush comfortable sofa with soft throw pillows and blanket, warm wood coffee table, soft textured area rug, table lamps with warm lighting, plants and books as decor. Welcoming and homey atmosphere.',
    },
    {
        id: 'luxury-elegant',
        label: 'Luxury Elegant',
        prompt: 'Luxury elegant living room furniture: velvet tufted sofa in cream or navy, marble-top coffee table, ornate area rug, crystal table lamps, gold accent decor, elegant artwork. High-end sophisticated interior design.',
    },
    {
        id: 'scandinavian',
        label: 'Scandinavian',
        prompt: 'Scandinavian style furniture: light oak wood frame sofa with white cushions, simple wooden coffee table, sheepskin rug, minimalist floor lamp, green plants, neutral and white color palette. Nordic cozy minimal design.',
    },
    {
        id: 'mid-century',
        label: 'Mid-Century',
        prompt: 'Mid-century modern furniture: iconic curved sofa in mustard or teal, walnut wood coffee table with tapered legs, geometric patterned rug, Sputnik chandelier, vintage-inspired decor. Retro 1960s aesthetic.',
    },
    {
        id: 'coastal',
        label: 'Coastal Beach',
        prompt: 'Coastal beach house furniture: white slipcovered sofa, rattan coffee table, blue and white striped rug, driftwood accents, nautical decor, light airy atmosphere. Relaxed seaside living room.',
    },
    {
        id: 'industrial',
        label: 'Industrial Loft',
        prompt: 'Industrial loft furniture: leather chesterfield sofa in brown, reclaimed wood and metal coffee table, vintage area rug, Edison bulb floor lamp, metal shelving with books. Urban warehouse aesthetic.',
    },
    {
        id: 'custom',
        label: 'Custom',
        prompt: '',
    },
];

// Max file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

const CustomFurnitureStagingToolInner: React.FC = () => {
    const navigate = useNavigate();
    const { balance, deductCredits, hasEnoughCredits } = useCredits();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const hasCredits = hasEnoughCredits(TOOL_ID as any);

    // Empty room input state
    const [roomFile, setRoomFile] = useState<File | null>(null);
    const [roomPreview, setRoomPreview] = useState<string | null>(null);
    const [roomUrl, setRoomUrl] = useState<string>('');
    const [roomInputMode, setRoomInputMode] = useState<'upload' | 'url'>('upload');
    const [isRoomDragging, setIsRoomDragging] = useState(false);

    // Furniture reference input state
    const [furnitureFile, setFurnitureFile] = useState<File | null>(null);
    const [furniturePreview, setFurniturePreview] = useState<string | null>(null);
    const [furnitureUrl, setFurnitureUrl] = useState<string>('');
    const [furnitureInputMode, setFurnitureInputMode] = useState<'upload' | 'url'>('upload');
    const [isFurnitureDragging, setIsFurnitureDragging] = useState(false);

    // Configuration state
    const [selectedPromptPreset, setSelectedPromptPreset] = useState<string>('exact-match');
    const [customPrompt, setCustomPrompt] = useState<string>('');
    const [furnitureAreaPreset, setFurnitureAreaPreset] = useState<string>('floor');

    // Generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [resultImage, setResultImage] = useState<string | null>(null);

    // Error state
    const [error, setError] = useState<string | null>(null);
    const [savedToLibrary, setSavedToLibrary] = useState(false);
    const { addAsset } = useAssets();

    // Validation helpers
    const validateFile = (file: File): string | null => {
        if (file.size > MAX_FILE_SIZE) {
            return `File too large. Maximum size is 10MB.`;
        }
        if (!ALLOWED_FORMATS.includes(file.type)) {
            return `Invalid format. Please use JPG, PNG, or WebP.`;
        }
        return null;
    };

    // Check for pre-selected asset from library
    useEffect(() => {
        const selectedAssetUrl = sessionStorage.getItem('selectedAssetUrl');
        if (selectedAssetUrl) {
            sessionStorage.removeItem('selectedAssetUrl');
            setRoomPreview(selectedAssetUrl);
            fetch(selectedAssetUrl)
                .then(res => res.blob())
                .then(blob => {
                    const fileName = selectedAssetUrl.split('/').pop() || 'image.jpg';
                    const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
                    setRoomFile(file);
                })
                .catch(err => console.error('Failed to load pre-selected image:', err));
        }
    }, []);

    // Room drag handlers
    const handleRoomDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsRoomDragging(true);
        } else if (e.type === 'dragleave') {
            setIsRoomDragging(false);
        }
    }, []);

    const handleRoomDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsRoomDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }
            setRoomFile(file);
            setRoomPreview(URL.createObjectURL(file));
            setRoomUrl('');
            setResultImage(null);
            setError(null);
        }
    }, []);

    const handleRoomFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }
            setRoomFile(file);
            setRoomPreview(URL.createObjectURL(file));
            setRoomUrl('');
            setResultImage(null);
            setError(null);
        }
    };

    const removeRoomImage = () => {
        setRoomFile(null);
        setRoomPreview(null);
        setRoomUrl('');
        setResultImage(null);
    };

    // Furniture drag handlers
    const handleFurnitureDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsFurnitureDragging(true);
        } else if (e.type === 'dragleave') {
            setIsFurnitureDragging(false);
        }
    }, []);

    const handleFurnitureDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFurnitureDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }
            setFurnitureFile(file);
            setFurniturePreview(URL.createObjectURL(file));
            setFurnitureUrl('');
            setResultImage(null);
            setError(null);
        }
    }, []);

    const handleFurnitureFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }
            setFurnitureFile(file);
            setFurniturePreview(URL.createObjectURL(file));
            setFurnitureUrl('');
            setResultImage(null);
            setError(null);
        }
    };

    const removeFurnitureImage = () => {
        setFurnitureFile(null);
        setFurniturePreview(null);
        setFurnitureUrl('');
        setResultImage(null);
    };

    // Check if inputs are valid
    // Furniture reference is now optional since we use text prompts for style
    const hasRoomInput = roomFile || (roomInputMode === 'url' && roomUrl.trim());
    const canGenerate = hasRoomInput && !isGenerating && hasCredits;

    // Handle generation
    const handleGenerate = async () => {
        if (!canGenerate) return;

        // Check credits first
        if (!hasCredits) {
            setError(`Insufficient credits. This tool requires ${CREDIT_COST} credits. You have ${balance} credits.`);
            return;
        }

        setIsGenerating(true);
        setGenerationProgress(0);
        setError(null);
        setSavedToLibrary(false);

        // Deduct credits before starting generation
        const deducted = await deductCredits(TOOL_ID as any);
        if (!deducted) {
            setError('Failed to deduct credits. Please try again.');
            setIsGenerating(false);
            return;
        }

        // Check if FAL generation is available (Supabase connected)
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

            setTimeout(async () => {
                clearInterval(progressInterval);
                setGenerationProgress(100);
                const mockUrl = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=800&fit=crop';
                setResultImage(mockUrl);
                try { await addAsset(mockUrl, 'image', 'Custom Furniture Staging Result'); setSavedToLibrary(true); } catch {}
                setIsGenerating(false);
            }, 3000);
            return;
        }

        try {
            // Get the prompt from preset or custom input
            const selectedPreset = PROMPT_PRESETS.find(p => p.id === selectedPromptPreset);
            const finalPrompt = selectedPromptPreset === 'custom'
                ? customPrompt
                : selectedPreset?.prompt;

            // Get the furniture area setting
            const furnitureArea = furnitureAreaPreset as 'floor' | 'center' | 'full';

            const options: CustomFurnitureStagingOptions = {
                prompt: finalPrompt || undefined,
                furnitureArea,
            };

            const resultUrl = await generateCustomFurnitureStaging(
                roomFile,
                roomInputMode === 'url' ? roomUrl : null,
                furnitureFile,
                furnitureInputMode === 'url' ? furnitureUrl : null,
                options,
                (progress, status) => {
                    setGenerationProgress(Math.min(progress, 90));
                    console.log('Generation status:', status);
                }
            );

            setGenerationProgress(95);
            const safeUrl = await safeImageUrl(resultUrl);
            setGenerationProgress(100);
            setResultImage(safeUrl);
            try { await addAsset(safeUrl, 'image', 'Custom Furniture Staging Result'); setSavedToLibrary(true); } catch {}
        } catch (err) {
            console.error('Custom furniture staging generation error:', err);
            setError(err instanceof Error ? err.message : 'Generation failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Download result image
    const handleDownload = async () => {
        if (!resultImage) return;

        try {
            const response = await fetch(resultImage);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const timestamp = new Date().toISOString().slice(0, 10);
            const extension = blob.type.includes('png') ? 'png' : 'jpg';
            link.download = `custom-staged-${timestamp}.${extension}`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
            window.open(resultImage, '_blank');
        }
    };

    // Get the room preview to show in BeforeAfterSlider
    const beforeImage = roomPreview || (roomInputMode === 'url' && roomUrl ? roomUrl : null);

    return (
        <div className="h-screen flex bg-[#0a0a0b]">
            {/* Navigation Rail */}
            <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex ml-0 lg:ml-16">
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
                                    <Armchair size={18} className="text-violet-400" />
                                    Custom Furniture Staging
                                </h1>
                                <p className="text-xs text-zinc-500 mt-0.5">Stage with your own furniture reference</p>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        {/* Empty Room Input */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
                                Empty Room Photo
                            </label>

                            {/* Tab Toggle */}
                            <div className="flex mb-2 bg-white/5 rounded-lg p-0.5">
                                <button
                                    onClick={() => setRoomInputMode('upload')}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                        roomInputMode === 'upload'
                                            ? 'bg-violet-600 text-white'
                                            : 'text-zinc-400 hover:text-zinc-300'
                                    }`}
                                >
                                    Upload
                                </button>
                                <button
                                    onClick={() => setRoomInputMode('url')}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                        roomInputMode === 'url'
                                            ? 'bg-violet-600 text-white'
                                            : 'text-zinc-400 hover:text-zinc-300'
                                    }`}
                                >
                                    URL
                                </button>
                            </div>

                            {roomInputMode === 'upload' ? (
                                !roomPreview ? (
                                    <div
                                        onDragEnter={handleRoomDrag}
                                        onDragLeave={handleRoomDrag}
                                        onDragOver={handleRoomDrag}
                                        onDrop={handleRoomDrop}
                                        className={`
                                            relative border border-dashed rounded-xl p-4 text-center transition-all cursor-pointer
                                            ${isRoomDragging
                                                ? 'border-violet-500 bg-violet-500/10'
                                                : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                                            }
                                        `}
                                    >
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={handleRoomFileChange}
                                            accept="image/jpeg,image/png,image/webp"
                                        />
                                        <UploadCloud size={24} className="mx-auto mb-2 text-zinc-500" />
                                        <p className="text-xs text-zinc-400">Drop empty room image</p>
                                        <p className="text-[10px] text-zinc-600 mt-1">JPG, PNG, WebP (max 10MB)</p>
                                    </div>
                                ) : (
                                    <div className="relative rounded-xl overflow-hidden group">
                                        <img
                                            src={roomPreview}
                                            alt="Empty Room"
                                            className="w-full h-28 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={removeRoomImage}
                                                className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="relative">
                                    <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        type="url"
                                        value={roomUrl}
                                        onChange={(e) => { setRoomUrl(e.target.value); setResultImage(null); }}
                                        placeholder="https://example.com/room.jpg"
                                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Furniture Reference Input (Optional - for visual guidance) */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
                                Furniture Reference <span className="text-zinc-600">(Optional)</span>
                            </label>

                            {/* Tab Toggle */}
                            <div className="flex mb-2 bg-white/5 rounded-lg p-0.5">
                                <button
                                    onClick={() => setFurnitureInputMode('upload')}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                        furnitureInputMode === 'upload'
                                            ? 'bg-violet-600 text-white'
                                            : 'text-zinc-400 hover:text-zinc-300'
                                    }`}
                                >
                                    Upload
                                </button>
                                <button
                                    onClick={() => setFurnitureInputMode('url')}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                        furnitureInputMode === 'url'
                                            ? 'bg-violet-600 text-white'
                                            : 'text-zinc-400 hover:text-zinc-300'
                                    }`}
                                >
                                    URL
                                </button>
                            </div>

                            {furnitureInputMode === 'upload' ? (
                                !furniturePreview ? (
                                    <div
                                        onDragEnter={handleFurnitureDrag}
                                        onDragLeave={handleFurnitureDrag}
                                        onDragOver={handleFurnitureDrag}
                                        onDrop={handleFurnitureDrop}
                                        className={`
                                            relative border border-dashed rounded-xl p-4 text-center transition-all cursor-pointer
                                            ${isFurnitureDragging
                                                ? 'border-violet-500 bg-violet-500/10'
                                                : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                                            }
                                        `}
                                    >
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={handleFurnitureFileChange}
                                            accept="image/jpeg,image/png,image/webp"
                                        />
                                        <Armchair size={24} className="mx-auto mb-2 text-zinc-500" />
                                        <p className="text-xs text-zinc-400">Drop furniture reference</p>
                                        <p className="text-[10px] text-zinc-600 mt-1">JPG, PNG, WebP (max 10MB)</p>
                                    </div>
                                ) : (
                                    <div className="relative rounded-xl overflow-hidden group">
                                        <img
                                            src={furniturePreview}
                                            alt="Furniture Reference"
                                            className="w-full h-28 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={removeFurnitureImage}
                                                className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="relative">
                                    <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        type="url"
                                        value={furnitureUrl}
                                        onChange={(e) => { setFurnitureUrl(e.target.value); setResultImage(null); }}
                                        placeholder="https://example.com/furniture.jpg"
                                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Furniture Placement Area */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
                                Furniture Placement
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {FURNITURE_AREA_PRESETS.map((preset) => (
                                    <button
                                        key={preset.id}
                                        onClick={() => setFurnitureAreaPreset(preset.id)}
                                        className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                                            furnitureAreaPreset === preset.id
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-300'
                                        }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-zinc-600 mt-1.5">
                                {FURNITURE_AREA_PRESETS.find(p => p.id === furnitureAreaPreset)?.description}
                            </p>
                        </div>

                        {/* Prompt Presets */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
                                Staging Style
                            </label>
                            <div className="grid grid-cols-2 gap-1.5">
                                {PROMPT_PRESETS.map((preset) => (
                                    <button
                                        key={preset.id}
                                        onClick={() => {
                                            setSelectedPromptPreset(preset.id);
                                            if (preset.id !== 'custom') {
                                                setCustomPrompt('');
                                            }
                                        }}
                                        className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all text-left ${
                                            selectedPromptPreset === preset.id
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-300'
                                        }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>

                            {/* Show description for selected preset */}
                            {selectedPromptPreset !== 'custom' && (
                                <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
                                    {PROMPT_PRESETS.find(p => p.id === selectedPromptPreset)?.prompt.slice(0, 100)}...
                                </p>
                            )}

                            {/* Custom prompt textarea - only show when Custom is selected */}
                            {selectedPromptPreset === 'custom' && (
                                <textarea
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    placeholder="Describe how you want the room staged..."
                                    className="w-full mt-2 px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 resize-none h-20"
                                />
                            )}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <div className="p-4 border-t border-white/5 space-y-3">
                        {/* Credit Info */}
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500">Cost</span>
                            <span className={`flex items-center gap-1 ${hasCredits ? 'text-emerald-400' : 'text-red-400'}`}>
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
                            disabled={!canGenerate}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                                canGenerate
                                    ? 'bg-violet-600 hover:bg-violet-500 text-white'
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
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                    <RefreshCw size={14} />
                                    Regenerate
                                </button>
                                {savedToLibrary ? (
                                    <span className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-lg flex items-center gap-1.5">
                                        <BookmarkPlus size={14} />
                                        Saved to Library
                                    </span>
                                ) : (
                                    <button
                                        onClick={async () => {
                                            if (resultImage) {
                                                try {
                                                    await addAsset(resultImage, 'image', 'Custom Furniture Staging Result');
                                                    setSavedToLibrary(true);
                                                } catch {}
                                            }
                                        }}
                                        className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"
                                    >
                                        <BookmarkPlus size={14} />
                                        Save to Library
                                    </button>
                                )}
                                <button
                                    onClick={handleDownload}
                                    className="px-3 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors flex items-center gap-1.5"
                                >
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
                                    className="mt-4 px-4 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : resultImage && beforeImage ? (
                            /* Before/After Comparison */
                            <div className="w-full max-w-5xl">
                                <BeforeAfterSlider
                                    beforeImage={beforeImage}
                                    afterImage={resultImage}
                                    beforeLabel="Before"
                                    afterLabel="After"
                                    className="shadow-2xl"
                                />
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
                                            className="text-violet-500 transition-all duration-300"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">
                                        {generationProgress}%
                                    </span>
                                </div>
                                <p className="text-zinc-400 font-medium">Staging with your furniture...</p>
                                <p className="text-zinc-600 text-sm mt-1">This takes about 20-40 seconds</p>
                            </div>
                        ) : beforeImage ? (
                            /* Image Uploaded, Ready to Generate */
                            <div className="w-full max-w-5xl">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                    <img
                                        src={beforeImage}
                                        alt="Empty Room"
                                        className="w-full h-auto max-h-[calc(100vh-180px)] object-contain"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                        <div className="text-center">
                                            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-3">
                                                <Sparkles size={28} className="text-white" />
                                            </div>
                                            <p className="text-white font-medium">Ready to stage</p>
                                            <p className="text-white/60 text-sm">
                                                Click Generate to add furniture
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Default Showcase */
                            <div className="w-full max-w-5xl">
                                <div className="mb-4 text-center">
                                    <p className="text-zinc-500 text-sm">Stage rooms with your own furniture reference images</p>
                                </div>
                                <BeforeAfterSlider
                                    beforeImage={DEFAULT_BEFORE_IMAGE}
                                    afterImage={DEFAULT_AFTER_IMAGE}
                                    beforeLabel="Empty Room"
                                    afterLabel="Custom Staged"
                                    className="shadow-2xl"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CustomFurnitureStagingTool: React.FC = () => (
    <AssetProvider>
        <CustomFurnitureStagingToolInner />
    </AssetProvider>
);
