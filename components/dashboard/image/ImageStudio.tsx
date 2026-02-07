import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    Image as ImageIcon,
    RectangleHorizontal,
    RectangleVertical,
    Square,
    Download,
    RefreshCw,
    Loader2,
    AlertCircle,
    Save,
} from 'lucide-react';
import { generateTextToImage, isFalConfigured } from '@/lib/api/fal';
import type { ImageSize } from '@/lib/api/fal';
import { useCredits } from '@/lib/store/contexts/CreditsContext';
import { useAssets } from '@/lib/store/contexts/AssetContext';

// Aspect ratio options mapped to FAL ImageSize
const ASPECT_RATIOS: { id: string; label: string; ratio: string; icon: typeof Square; falSize: ImageSize }[] = [
    { id: 'portrait', label: 'Portrait', ratio: '3:4', icon: RectangleVertical, falSize: 'portrait_4_3' },
    { id: 'square', label: 'Square', ratio: '1:1', icon: Square, falSize: 'square_hd' },
    { id: 'landscape', label: 'Landscape', ratio: '16:9', icon: RectangleHorizontal, falSize: 'landscape_16_9' },
];

// Community gallery samples
interface GalleryImage {
    id: string;
    src: string;
    prompt: string;
    style: string;
}

const COMMUNITY_IMAGES: GalleryImage[] = [
    { id: '1', src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&h=700&fit=crop', prompt: 'Modern luxury home exterior at golden hour, floor-to-ceiling windows, manicured landscaping, architectural photography', style: 'Exterior' },
    { id: '2', src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500&h=500&fit=crop', prompt: 'Spacious open-concept living room with marble floors, designer furniture, panoramic city skyline view at dusk', style: 'Interior' },
    { id: '3', src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=500&h=600&fit=crop', prompt: 'Mediterranean villa with terracotta roof, arched doorways, courtyard garden, warm sunset lighting', style: 'Exterior' },
    { id: '4', src: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&h=700&fit=crop', prompt: 'Scandinavian minimalist kitchen with white oak cabinets, natural light, house plants, clean lines', style: 'Interior' },
    { id: '5', src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&h=500&fit=crop', prompt: 'Contemporary estate with infinity pool overlooking hills, dramatic twilight sky, landscape lighting', style: 'Exterior' },
    { id: '6', src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=500&h=500&fit=crop', prompt: 'Bright modern bathroom with freestanding tub, floor-to-ceiling tile, double vanity, spa atmosphere', style: 'Interior' },
    { id: '7', src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&h=600&fit=crop', prompt: 'Waterfront property at blue hour, illuminated windows reflecting on calm water, luxury architecture', style: 'Exterior' },
    { id: '8', src: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=500&h=700&fit=crop', prompt: 'Grand foyer with double-height ceiling, chandelier, sweeping staircase, marble flooring, elegant entry', style: 'Interior' },
    { id: '9', src: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=500&h=500&fit=crop', prompt: 'Craftsman bungalow with covered porch, stone accents, lush garden, warm afternoon light', style: 'Exterior' },
    { id: '10', src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=500&h=600&fit=crop', prompt: 'Modern bedroom with floor-to-ceiling windows, city view, neutral tones, designer bed frame, ambient lighting', style: 'Interior' },
    { id: '11', src: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&h=700&fit=crop', prompt: 'Ultra-modern glass house nestled in tropical landscaping, rooftop deck, clean geometric lines', style: 'Exterior' },
    { id: '12', src: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=500&h=500&fit=crop', prompt: 'Cozy reading nook with built-in bookshelves, window seat, soft natural light, warm wood tones', style: 'Interior' },
];

// Mock fallback URLs for when FAL is not configured
const MOCK_IMAGES = [
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=800&fit=crop',
];

export const ImageStudio: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[1]); // Square default
    const [numImages, setNumImages] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'my-creations' | 'community'>('community');
    const [hoveredGallery, setHoveredGallery] = useState<string | null>(null);
    const promptRef = useRef<HTMLTextAreaElement>(null);

    const { hasEnoughCredits, deductCredits } = useCredits();
    const { assets, addAsset } = useAssets();

    const imageAssets = assets.filter(a => a.type === 'image');
    const canGenerate = prompt.trim().length > 0 && !isGenerating;
    const hasCredits = hasEnoughCredits('text-to-image');
    const showResults = isGenerating || !!error || generatedImages.length > 0;

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        if (!hasCredits) {
            setError('Insufficient credits. You need 2 credits per image.');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setGeneratedImages([]);

        // Mock fallback when FAL is not configured
        if (!isFalConfigured()) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const mockResults = MOCK_IMAGES.slice(0, numImages);
            setGeneratedImages(mockResults);
            setIsGenerating(false);
            return;
        }

        try {
            const result = await generateTextToImage({
                prompt: prompt.trim(),
                imageSize: selectedRatio.falSize,
                numImages,
            });

            const urls: string[] = (result?.images || []).map((img: { url: string }) => img.url);
            if (urls.length === 0) {
                throw new Error('No images returned from generation.');
            }

            await deductCredits('text-to-image');

            for (const url of urls) {
                await addAsset(url, 'image', prompt.slice(0, 50));
            }

            setGeneratedImages(urls);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Image generation failed. Please try again.';
            setError(message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRecreate = (image: GalleryImage) => {
        setPrompt(image.prompt);
        promptRef.current?.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDownload = async (url: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `photovid-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(a.href);
        } catch {
            window.open(url, '_blank');
        }
    };

    const handleSaveToLibrary = async (url: string) => {
        await addAsset(url, 'image', prompt.slice(0, 50) || 'Generated image');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="text-emerald-500" size={24} />
                        AI Image Studio
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Transform your imagination into stunning visuals
                    </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-medium w-fit">
                    2 credits per image
                </span>
            </div>

            {/* Generation Panel — 2 columns when results visible, centered otherwise */}
            <div className={`grid grid-cols-1 gap-6 ${showResults ? 'lg:grid-cols-2' : 'max-w-2xl mx-auto'}`}>
                {/* Left: Prompt + Config */}
                <div className="space-y-5">
                    {/* Prompt */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Describe your image
                        </label>
                        <textarea
                            ref={promptRef}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="A serene Japanese garden at dawn, soft mist rising over a koi pond..."
                            rows={3}
                            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-sm"
                        />
                    </div>

                    {/* Aspect Ratio */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Aspect Ratio
                        </label>
                        <div className="flex gap-2">
                            {ASPECT_RATIOS.map((ratio) => (
                                <button
                                    key={ratio.id}
                                    onClick={() => setSelectedRatio(ratio)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                        selectedRatio.id === ratio.id
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                    }`}
                                >
                                    <ratio.icon size={16} />
                                    {ratio.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Number of Images */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Number of Images
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4].map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setNumImages(n)}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                        numImages === n
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                    }`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={!canGenerate || !hasCredits}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                            canGenerate && hasCredits
                                ? 'bg-gradient-to-r from-emerald-600 to-fuchsia-600 text-white hover:from-emerald-700 hover:to-fuchsia-700 shadow-lg shadow-emerald-500/20 active:scale-[0.98]'
                                : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
                        }`}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} />
                                Generate {numImages > 1 ? `${numImages} Images` : 'Image'}
                            </>
                        )}
                    </button>

                    {!hasCredits && (
                        <p className="text-xs text-amber-500 text-center">
                            Not enough credits. You need 2 credits to generate.
                        </p>
                    )}
                </div>

                {/* Right: Results — only shown when generating, error, or results exist */}
                {showResults && (
                    <div className="min-h-[320px] flex flex-col">
                        {/* Error State */}
                        {error && (
                            <div className="flex flex-col items-center justify-center flex-1 gap-3 p-6 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20">
                                <AlertCircle size={32} className="text-red-500" />
                                <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
                                <button
                                    onClick={handleGenerate}
                                    className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* Loading State */}
                        {isGenerating && !error && (
                            <div className="flex flex-col items-center justify-center flex-1 gap-3 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
                                <Loader2 size={36} className="text-emerald-500 animate-spin" />
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Generating your image...</p>
                            </div>
                        )}

                        {/* Results */}
                        {!isGenerating && !error && generatedImages.length > 0 && (
                            <div className={`grid gap-3 ${generatedImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                {generatedImages.map((url, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="relative group rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800"
                                    >
                                        <img
                                            src={url}
                                            alt={`Generated ${idx + 1}`}
                                            className="w-full h-auto object-cover"
                                        />
                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-center p-3 opacity-0 group-hover:opacity-100">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleDownload(url)}
                                                    className="px-3 py-2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
                                                >
                                                    <Download size={14} />
                                                    Download
                                                </button>
                                                <button
                                                    onClick={() => handleSaveToLibrary(url)}
                                                    className="px-3 py-2 bg-emerald-500/90 backdrop-blur-sm rounded-lg text-xs font-medium text-white hover:bg-emerald-500 transition-colors flex items-center gap-1.5"
                                                >
                                                    <Save size={14} />
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Gallery Section */}
            <div className="space-y-4">
                {/* Tab Bar */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('my-creations')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            activeTab === 'my-creations'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                    >
                        My Creations
                    </button>
                    <button
                        onClick={() => setActiveTab('community')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            activeTab === 'community'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                    >
                        Community
                    </button>
                </div>

                {/* My Creations Tab */}
                {activeTab === 'my-creations' && (
                    <div>
                        {imageAssets.length === 0 ? (
                            <div className="text-center py-16">
                                <ImageIcon size={40} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
                                <p className="text-sm text-zinc-400 dark:text-zinc-500">
                                    No images yet. Generate your first image above!
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {imageAssets.map((asset) => (
                                    <div key={asset.id} className="relative group cursor-pointer">
                                        <div className="rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 aspect-square">
                                            <img
                                                src={asset.url}
                                                alt={asset.name || 'Generated image'}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-3 opacity-0 group-hover:opacity-100">
                                                <div className="flex gap-2 w-full">
                                                    <button
                                                        onClick={() => handleDownload(asset.url)}
                                                        className="flex-1 py-2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-200 flex items-center justify-center gap-1.5"
                                                    >
                                                        <Download size={14} />
                                                        Download
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Community Tab */}
                {activeTab === 'community' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {COMMUNITY_IMAGES.map((image, idx) => (
                            <motion.div
                                key={image.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className="relative group cursor-pointer"
                                onMouseEnter={() => setHoveredGallery(image.id)}
                                onMouseLeave={() => setHoveredGallery(null)}
                            >
                                <div className="rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 aspect-[4/5]">
                                    <img
                                        src={image.src}
                                        alt={image.prompt.slice(0, 50)}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />

                                    {/* Style Badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className="px-2 py-1 bg-black/40 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                                            {image.style}
                                        </span>
                                    </div>

                                    {/* Hover Overlay */}
                                    <AnimatePresence>
                                        {hoveredGallery === image.id && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4"
                                            >
                                                <p className="text-white/80 text-xs mb-3 line-clamp-2">
                                                    {image.prompt}
                                                </p>
                                                <button
                                                    onClick={() => handleRecreate(image)}
                                                    className="w-full py-2 px-4 bg-emerald-500/80 backdrop-blur-sm rounded-full text-white text-sm font-medium hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <RefreshCw size={14} />
                                                    Recreate
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
