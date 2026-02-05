import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Sparkles,
    Download,
    RefreshCw,
    Loader2,
    Image as ImageIcon,
    AlertCircle,
    Zap,
    BookmarkPlus,
    Instagram,
    Facebook,
    Linkedin,
    Youtube,
    Type,
    Palette,
    Layout,
    MapPin,
    DollarSign,
    User,
    Building2,
    Check,
    UploadCloud,
    X,
    Home,
} from 'lucide-react';
import { uploadToR2 } from '@/lib/api/r2';
import { AssetProvider, useAssets } from '@/lib/store/contexts/AssetContext';
import { NavigationRail } from '../../dashboard/navigation/NavigationRail';
import { generateSocialMediaPoster, isFalConfigured } from '@/lib/api/toolGeneration';
import { useCredits } from '@/lib/store/contexts/CreditsContext';
import { CREDIT_COSTS } from '@/lib/types/credits';
import type {
    SocialMediaPosterOptions,
    SocialMediaPlatform,
    PosterType,
    DesignStyle,
    ColorTheme,
    PropertyType,
} from '@/lib/types/generation';

// Platform definitions with icons and labels
const PLATFORMS: { id: SocialMediaPlatform; label: string; icon: React.ReactNode; aspect: string }[] = [
    { id: 'instagram-square', label: 'Instagram Square', icon: <Instagram className="w-4 h-4" />, aspect: '1:1' },
    { id: 'instagram-portrait', label: 'Instagram Portrait', icon: <Instagram className="w-4 h-4" />, aspect: '4:5' },
    { id: 'instagram-story', label: 'Instagram/TikTok Story', icon: <Instagram className="w-4 h-4" />, aspect: '9:16' },
    { id: 'facebook-post', label: 'Facebook/Twitter Post', icon: <Facebook className="w-4 h-4" />, aspect: '16:9' },
    { id: 'facebook-story', label: 'Facebook Story', icon: <Facebook className="w-4 h-4" />, aspect: '9:16' },
    { id: 'linkedin-post', label: 'LinkedIn Post', icon: <Linkedin className="w-4 h-4" />, aspect: '16:9' },
    { id: 'pinterest-pin', label: 'Pinterest Pin', icon: <Layout className="w-4 h-4" />, aspect: '2:3' },
    { id: 'youtube-thumbnail', label: 'YouTube Thumbnail', icon: <Youtube className="w-4 h-4" />, aspect: '16:9' },
];

// Poster types
const POSTER_TYPES: { id: PosterType; label: string; template: string }[] = [
    { id: 'just-listed', label: 'Just Listed', template: 'JUST LISTED' },
    { id: 'open-house', label: 'Open House', template: 'OPEN HOUSE' },
    { id: 'price-reduced', label: 'Price Reduced', template: 'PRICE REDUCED' },
    { id: 'sold', label: 'Sold', template: 'SOLD' },
    { id: 'coming-soon', label: 'Coming Soon', template: 'COMING SOON' },
    { id: 'new-listing', label: 'New Listing', template: 'NEW LISTING' },
    { id: 'featured', label: 'Featured Property', template: 'FEATURED' },
    { id: 'luxury', label: 'Luxury Home', template: 'LUXURY LIVING' },
    { id: 'investment', label: 'Investment Property', template: 'INVESTMENT OPPORTUNITY' },
    { id: 'custom', label: 'Custom Text', template: '' },
];

// Design styles
const DESIGN_STYLES: { id: DesignStyle; label: string; description: string }[] = [
    { id: 'modern-minimal', label: 'Modern Minimal', description: 'Clean & contemporary' },
    { id: 'luxury-elegant', label: 'Luxury Elegant', description: 'High-end & sophisticated' },
    { id: 'bold-colorful', label: 'Bold & Colorful', description: 'Eye-catching & vibrant' },
    { id: 'clean-professional', label: 'Clean Professional', description: 'Trustworthy & polished' },
    { id: 'vector-flat', label: 'Vector/Flat', description: 'Modern & graphic' },
];

// Color themes
const COLOR_THEMES: { id: ColorTheme; label: string; colors: string[] }[] = [
    { id: 'classic-black', label: 'Classic Black & White', colors: ['#000000', '#FFFFFF', '#333333'] },
    { id: 'navy-gold', label: 'Navy & Gold', colors: ['#1a365d', '#d4af37', '#FFFFFF'] },
    { id: 'modern-blue', label: 'Modern Blue', colors: ['#2563eb', '#1e40af', '#FFFFFF'] },
    { id: 'elegant-green', label: 'Elegant Green', colors: ['#065f46', '#10b981', '#FFFFFF'] },
    { id: 'warm-red', label: 'Warm Red', colors: ['#dc2626', '#7f1d1d', '#FFFFFF'] },
    { id: 'purple-luxury', label: 'Purple Luxury', colors: ['#7c3aed', '#4c1d95', '#FFFFFF'] },
    { id: 'sunset-orange', label: 'Sunset Orange', colors: ['#ea580c', '#f59e0b', '#FFFFFF'] },
    { id: 'custom', label: 'Custom Colors', colors: [] },
];

// Property types
const PROPERTY_TYPES: { id: PropertyType; label: string }[] = [
    { id: 'house', label: 'House' },
    { id: 'condo', label: 'Condo' },
    { id: 'apartment', label: 'Apartment' },
    { id: 'townhouse', label: 'Townhouse' },
    { id: 'land', label: 'Land' },
    { id: 'commercial', label: 'Commercial' },
];

const TOOL_ID = 'social-media-poster';
const CREDIT_COST = CREDIT_COSTS[TOOL_ID] || 1;

const SocialMediaPosterToolInner: React.FC = () => {
    const navigate = useNavigate();
    const { balance, deductCredits, hasEnoughCredits } = useCredits();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const hasCredits = hasEnoughCredits(TOOL_ID as any);

    // Image upload state
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Platform & Style state
    const [platform, setPlatform] = useState<SocialMediaPlatform>('instagram-square');
    const [posterType, setPosterType] = useState<PosterType>('just-listed');
    const [designStyle, setDesignStyle] = useState<DesignStyle>('modern-minimal');
    const [colorTheme, setColorTheme] = useState<ColorTheme>('classic-black');
    const [customColors, setCustomColors] = useState<string[]>(['#000000', '#FFFFFF', '#333333']);

    // Content state
    const [headline, setHeadline] = useState('');
    const [subtext, setSubtext] = useState('');
    const [price, setPrice] = useState('');
    const [address, setAddress] = useState('');
    const [propertyType, setPropertyType] = useState<PropertyType | undefined>(undefined);
    const [agentName, setAgentName] = useState('');
    const [brokerageName, setBrokerageName] = useState('');

    // Generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [savedToLibrary, setSavedToLibrary] = useState(false);
    const { addAsset } = useAssets();

    // Before/After slider state
    const [sliderPosition, setSliderPosition] = useState(50);

    // Get current headline text
    const currentHeadline = headline || POSTER_TYPES.find(p => p.id === posterType)?.template || '';

    // Get credit cost based on style
    const currentCreditCost = designStyle === 'vector-flat' ? 2 : 1;

    // Image upload handlers
    const handleImageUpload = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }
        setUploadedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(file);
        setError(null);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleImageUpload(file);
    }, [handleImageUpload]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleImageUpload(file);
    }, [handleImageUpload]);

    const handleRemoveImage = useCallback(() => {
        setUploadedImage(null);
        setImagePreview(null);
    }, []);

    const handleGenerate = async () => {
        if (!currentHeadline && posterType === 'custom') {
            setError('Please enter a headline for your custom poster');
            return;
        }

        setIsGenerating(true);
        setGenerationProgress(0);
        setError(null);
        setSavedToLibrary(false);

        if (!isFalConfigured()) {
            // Mock generation for demo
            const progressInterval = setInterval(() => {
                setGenerationProgress(prev => prev >= 90 ? (clearInterval(progressInterval), 90) : prev + 10);
            }, 400);

            setTimeout(async () => {
                clearInterval(progressInterval);
                setGenerationProgress(100);
                const mockUrl = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&h=1200&fit=crop';
                setResultImage(mockUrl);
                try { await addAsset(mockUrl, 'image', 'Social Media Poster'); setSavedToLibrary(true); } catch {}
                setIsGenerating(false);
            }, 3500);
            return;
        }

        try {
            let propertyImageUrl: string | undefined;

            // Only upload if user provided an image
            if (uploadedImage) {
                setGenerationProgress(5);
                setIsUploading(true);
                try {
                    propertyImageUrl = await uploadToR2(uploadedImage, `posters/${Date.now()}-${uploadedImage.name}`);
                    setGenerationProgress(15);
                } catch (uploadErr) {
                    console.error('R2 upload failed:', uploadErr);
                    // Continue without the image
                }
                setIsUploading(false);
            }

            const options: SocialMediaPosterOptions = {
                platform,
                posterType,
                designStyle,
                colorTheme,
                customColors: colorTheme === 'custom' ? customColors : undefined,
                headline: currentHeadline,
                subtext: subtext || undefined,
                price: price || undefined,
                address: address || undefined,
                propertyType: propertyType || undefined,
                agentName: agentName || undefined,
                brokerageName: brokerageName || undefined,
                propertyImageUrl,
            };

            const startProgress = uploadedImage ? 15 : 0;
            const resultUrl = await generateSocialMediaPoster(
                options,
                undefined,
                (progress, status) => {
                    setGenerationProgress(startProgress + progress * (100 - startProgress) / 100);
                    console.log('Poster generation status:', status);
                }
            );

            setResultImage(resultUrl);
            try { await addAsset(resultUrl, 'image', 'Social Media Poster'); setSavedToLibrary(true); } catch {}
            await deductCredits(TOOL_ID as any);
        } catch (err) {
            console.error('Poster generation error:', err);
            setError(err instanceof Error ? err.message : 'Poster generation failed. Please try again.');
        } finally {
            setIsGenerating(false);
            setIsUploading(false);
        }
    };

    const handleDownload = async () => {
        if (!resultImage) return;
        try {
            const response = await fetch(resultImage);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `social-poster-${platform}-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download error:', err);
        }
    };

    const handleReset = () => {
        setResultImage(null);
        setError(null);
        setSavedToLibrary(false);
        setSliderPosition(50);
    };

    // Aspect ratio preview dimensions
    const getPreviewDimensions = (platformId: SocialMediaPlatform) => {
        const aspectMap: Record<string, { w: number; h: number }> = {
            'instagram-square': { w: 300, h: 300 },
            'instagram-portrait': { w: 240, h: 300 },
            'instagram-story': { w: 169, h: 300 },
            'facebook-post': { w: 300, h: 169 },
            'facebook-story': { w: 169, h: 300 },
            'linkedin-post': { w: 300, h: 169 },
            'pinterest-pin': { w: 200, h: 300 },
            'youtube-thumbnail': { w: 300, h: 169 },
        };
        return aspectMap[platformId] || { w: 300, h: 300 };
    };

    const previewDimensions = getPreviewDimensions(platform);

    return (
        <div className="h-screen flex bg-[#0a0a0b]">
            {/* Navigation Rail */}
            <NavigationRail
                isMobileOpen={mobileMenuOpen}
                onMobileClose={() => setMobileMenuOpen(false)}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden ml-16">
                {/* Top Bar */}
                <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/studio/real-estate')}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-zinc-400" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                                <Layout className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h1 className="text-sm font-medium text-white">Social Media Poster</h1>
                                <p className="text-xs text-zinc-500">Generate marketing posters for all platforms</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-white/5">
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-xs font-medium text-zinc-300">{balance} credits</span>
                        </div>
                    </div>
                </div>

                {/* Main Area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel - Configuration */}
                    <div className="w-80 border-r border-white/10 bg-zinc-900/30 overflow-y-auto">
                        <div className="p-4 space-y-6">
                            {/* Platform Selection */}
                            <div>
                                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
                                    Platform
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {PLATFORMS.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setPlatform(p.id)}
                                            className={`p-2.5 rounded-xl border transition-all text-left ${
                                                platform === p.id
                                                    ? 'border-pink-500 bg-pink-500/10'
                                                    : 'border-white/10 bg-zinc-800/50 hover:bg-zinc-800'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={platform === p.id ? 'text-pink-400' : 'text-zinc-400'}>
                                                    {p.icon}
                                                </span>
                                                <span className="text-[10px] text-zinc-500">{p.aspect}</span>
                                            </div>
                                            <span className={`text-xs ${platform === p.id ? 'text-white' : 'text-zinc-300'}`}>
                                                {p.label.split(' ')[0]}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Poster Type */}
                            <div>
                                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
                                    Poster Type
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {POSTER_TYPES.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setPosterType(p.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                                                posterType === p.id
                                                    ? 'bg-pink-500 text-white'
                                                    : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
                                            }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Design Style */}
                            <div>
                                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
                                    Design Style
                                </label>
                                <div className="space-y-2">
                                    {DESIGN_STYLES.map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => setDesignStyle(s.id)}
                                            className={`w-full p-3 rounded-xl border transition-all text-left ${
                                                designStyle === s.id
                                                    ? 'border-pink-500 bg-pink-500/10'
                                                    : 'border-white/10 bg-zinc-800/50 hover:bg-zinc-800'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className={`text-sm ${designStyle === s.id ? 'text-white' : 'text-zinc-300'}`}>
                                                        {s.label}
                                                    </span>
                                                    <p className="text-xs text-zinc-500 mt-0.5">{s.description}</p>
                                                </div>
                                                {designStyle === s.id && (
                                                    <Check className="w-4 h-4 text-pink-400" />
                                                )}
                                            </div>
                                            {s.id === 'vector-flat' && (
                                                <span className="inline-block mt-2 px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px]">
                                                    2 credits
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Theme */}
                            <div>
                                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
                                    Color Theme
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {COLOR_THEMES.map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() => setColorTheme(c.id)}
                                            className={`p-2.5 rounded-xl border transition-all ${
                                                colorTheme === c.id
                                                    ? 'border-pink-500 bg-pink-500/10'
                                                    : 'border-white/10 bg-zinc-800/50 hover:bg-zinc-800'
                                            }`}
                                        >
                                            <div className="flex gap-1 mb-2">
                                                {c.colors.length > 0 ? (
                                                    c.colors.map((color, i) => (
                                                        <div
                                                            key={i}
                                                            className="w-4 h-4 rounded-full border border-white/20"
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))
                                                ) : (
                                                    <Palette className="w-4 h-4 text-zinc-500" />
                                                )}
                                            </div>
                                            <span className={`text-xs ${colorTheme === c.id ? 'text-white' : 'text-zinc-400'}`}>
                                                {c.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Property Type */}
                            <div>
                                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
                                    Property Type (Optional)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {PROPERTY_TYPES.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setPropertyType(propertyType === p.id ? undefined : p.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                                                propertyType === p.id
                                                    ? 'bg-pink-500 text-white'
                                                    : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
                                            }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center - Large Preview Area */}
                    <div className="flex-1 flex flex-col bg-zinc-950/50 overflow-hidden">
                        {/* Preview Header */}
                        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-zinc-500 uppercase tracking-wider">Preview</span>
                                <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400">
                                    {PLATFORMS.find(p => p.id === platform)?.aspect}
                                </span>
                            </div>
                            {imagePreview && !resultImage && (
                                <button
                                    onClick={handleRemoveImage}
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    Remove Photo
                                </button>
                            )}
                        </div>

                        {/* Main Preview Container - Takes remaining height */}
                        <div className="flex-1 flex items-center justify-center p-6 min-h-0 overflow-hidden">
                            {/* Result Display */}
                            {resultImage ? (
                                imagePreview ? (
                                    /* Before/After Slider - When we have both original and result */
                                    <div className="relative w-full h-full max-w-4xl flex items-center justify-center">
                                        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900">
                                            {/* Container with fixed dimensions based on result image */}
                                            <div className="relative" style={{ maxHeight: '70vh', maxWidth: '100%' }}>
                                                {/* After Image (Generated - Full width background) */}
                                                <img
                                                    src={resultImage}
                                                    alt="Generated poster"
                                                    className="block max-h-[70vh] max-w-full object-contain"
                                                />

                                                {/* Before Image (Original - Clipped overlay) */}
                                                <div
                                                    className="absolute inset-0 overflow-hidden"
                                                    style={{ width: `${sliderPosition}%` }}
                                                >
                                                    <img
                                                        src={imagePreview}
                                                        alt="Original photo"
                                                        className="block max-h-[70vh] max-w-full object-contain"
                                                        style={{
                                                            width: `${100 / (sliderPosition / 100)}%`,
                                                            maxWidth: 'none'
                                                        }}
                                                    />
                                                </div>

                                                {/* Slider Line */}
                                                <div
                                                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
                                                    style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                                                />

                                                {/* Slider Handle */}
                                                <div
                                                    className="absolute top-1/2 z-10 bg-white rounded-full p-2 shadow-lg cursor-ew-resize"
                                                    style={{ left: `${sliderPosition}%`, transform: 'translate(-50%, -50%)' }}
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M18 8L22 12L18 16" />
                                                        <path d="M6 8L2 12L6 16" />
                                                    </svg>
                                                </div>

                                                {/* Invisible Slider Input */}
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={sliderPosition}
                                                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                                                />

                                                {/* Labels */}
                                                <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm font-medium z-10">
                                                    Original
                                                </div>
                                                <div className="absolute top-4 right-4 px-3 py-1.5 bg-pink-500/90 backdrop-blur-sm rounded-full text-white text-sm font-medium z-10">
                                                    {POSTER_TYPES.find(p => p.id === posterType)?.label || 'Generated'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Just the result - No reference image was uploaded */
                                    <div className="w-full h-full max-w-4xl flex items-center justify-center">
                                        <div
                                            className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl"
                                            style={{ maxHeight: '100%', maxWidth: '100%' }}
                                        >
                                            <img
                                                src={resultImage}
                                                alt="Generated poster"
                                                className="max-w-full max-h-[70vh] object-contain"
                                            />
                                            <div className="absolute top-4 right-4 px-3 py-1.5 bg-pink-500/90 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                                                {POSTER_TYPES.find(p => p.id === posterType)?.label || 'Poster'}
                                            </div>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div
                                    onDragOver={!resultImage ? handleDragOver : undefined}
                                    onDragLeave={!resultImage ? handleDragLeave : undefined}
                                    onDrop={!resultImage ? handleDrop : undefined}
                                    className={`relative rounded-2xl overflow-hidden transition-all ${
                                        !imagePreview && !resultImage
                                            ? `border-2 border-dashed cursor-pointer ${
                                                isDragging
                                                    ? 'border-pink-500 bg-pink-500/10'
                                                    : 'border-white/20 bg-zinc-900/50 hover:border-pink-500/50 hover:bg-zinc-900'
                                              }`
                                            : 'border border-white/10 bg-zinc-900'
                                    }`}
                                    style={{
                                        aspectRatio: `${previewDimensions.w} / ${previewDimensions.h}`,
                                        maxHeight: '100%',
                                        maxWidth: '100%',
                                        width: previewDimensions.w > previewDimensions.h ? '100%' : 'auto',
                                        height: previewDimensions.h >= previewDimensions.w ? '100%' : 'auto',
                                    }}
                                >
                                    {/* Upload State - No image yet */}
                                    {!imagePreview && !resultImage && !isGenerating && (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                                                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500/20 to-rose-600/20 flex items-center justify-center mb-6">
                                                    <UploadCloud className="w-10 h-10 text-pink-400" />
                                                </div>
                                                <h3 className="text-lg font-medium text-white mb-2">Upload Reference Photo (Optional)</h3>
                                                <p className="text-sm text-zinc-400 mb-1">Or generate a poster without a photo</p>
                                                <p className="text-xs text-zinc-500 mt-2 max-w-xs text-center">
                                                    Your photo will be used as style inspiration for the AI-generated poster
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    {/* Generating State */}
                                    {isGenerating && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900">
                                            {imagePreview && (
                                                <img
                                                    src={imagePreview}
                                                    alt="Source"
                                                    className="absolute inset-0 w-full h-full object-cover opacity-20"
                                                />
                                            )}
                                            <div className="relative z-10 flex flex-col items-center gap-6">
                                                <div className="relative">
                                                    <div className="w-20 h-20 rounded-full border-4 border-pink-500/20 flex items-center justify-center">
                                                        <Loader2 className="w-10 h-10 text-pink-400 animate-spin" />
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-zinc-800 border border-white/10">
                                                        <span className="text-xs font-medium text-white">{Math.round(generationProgress)}%</span>
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-base font-medium text-white mb-1">
                                                        {isUploading ? 'Uploading image...' : 'Creating your poster...'}
                                                    </p>
                                                    <p className="text-sm text-zinc-500">This may take a moment</p>
                                                </div>
                                                <div className="w-48 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-gradient-to-r from-pink-500 to-rose-500"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${generationProgress}%` }}
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Image Uploaded - Ready to Generate */}
                                    {imagePreview && !resultImage && !isGenerating && (
                                        <div className="absolute inset-0">
                                            <img
                                                src={imagePreview}
                                                alt="Uploaded property"
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Overlay with settings summary */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
                                            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                                <span className="px-2.5 py-1 rounded-lg bg-pink-500/90 text-white text-xs font-medium">
                                                    {POSTER_TYPES.find(p => p.id === posterType)?.template || 'CUSTOM'}
                                                </span>
                                                <span className="px-2.5 py-1 rounded-lg bg-zinc-800/90 text-zinc-300 text-xs">
                                                    {DESIGN_STYLES.find(s => s.id === designStyle)?.label}
                                                </span>
                                            </div>
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <div className="flex items-center gap-2 text-white/90 text-sm mb-2">
                                                    <Home className="w-4 h-4" />
                                                    <span>Ready to Generate</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {/* Color Theme Preview */}
                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/40">
                                                        <div className="flex -space-x-1">
                                                            {(colorTheme === 'custom' ? customColors : COLOR_THEMES.find(c => c.id === colorTheme)?.colors || []).slice(0, 3).map((color, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="w-3 h-3 rounded-full border border-white/30"
                                                                    style={{ backgroundColor: color }}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-zinc-300">{COLOR_THEMES.find(c => c.id === colorTheme)?.label}</span>
                                                    </div>
                                                    {propertyType && (
                                                        <span className="px-2 py-1 rounded bg-black/40 text-xs text-zinc-300">
                                                            {PROPERTY_TYPES.find(p => p.id === propertyType)?.label}
                                                        </span>
                                                    )}
                                                </div>
                                                {(price || address) && (
                                                    <div className="text-white/60 text-xs">
                                                        {price && <span className="mr-3">{price}</span>}
                                                        {address && <span>{address}</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Action Bar */}
                        <div className="px-6 py-4 border-t border-white/5 bg-zinc-900/30">
                            <div className="flex items-center justify-between">
                                {/* Left side - Status/Info */}
                                <div className="flex items-center gap-3">
                                    {error && (
                                        <div className="flex items-center gap-2 text-red-400">
                                            <AlertCircle className="w-4 h-4" />
                                            <span className="text-sm">{error}</span>
                                        </div>
                                    )}
                                    {!hasCredits && !isGenerating && !error && (
                                        <div className="flex items-center gap-2 text-amber-400">
                                            <AlertCircle className="w-4 h-4" />
                                            <span className="text-sm">Not enough credits</span>
                                        </div>
                                    )}
                                    {savedToLibrary && resultImage && (
                                        <div className="flex items-center gap-1.5 text-green-400 text-sm">
                                            <BookmarkPlus className="w-4 h-4" />
                                            Saved to Library
                                        </div>
                                    )}
                                </div>

                                {/* Right side - Action Buttons */}
                                <div className="flex items-center gap-3">
                                    {resultImage ? (
                                        <>
                                            <button
                                                onClick={handleReset}
                                                className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors flex items-center gap-2 text-sm"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                New Poster
                                            </button>
                                            <button
                                                onClick={handleDownload}
                                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:opacity-90 transition-opacity flex items-center gap-2 text-sm font-medium"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={handleGenerate}
                                            disabled={isGenerating || !hasCredits}
                                            className={`px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 text-sm ${
                                                isGenerating || !hasCredits
                                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:opacity-90 shadow-lg shadow-pink-500/25'
                                            }`}
                                        >
                                            {isGenerating ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Sparkles className="w-4 h-4" />
                                            )}
                                            {isGenerating
                                                ? (isUploading ? 'Uploading...' : 'Generating...')
                                                : `Generate Poster (${currentCreditCost} credit${currentCreditCost > 1 ? 's' : ''})`
                                            }
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Content Input */}
                    <div className="w-80 border-l border-white/10 bg-zinc-900/30 overflow-y-auto">
                        <div className="p-4 space-y-4">
                            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                                Poster Content
                            </h3>

                            {/* Headline */}
                            <div>
                                <label className="text-xs text-zinc-500 mb-1.5 block flex items-center gap-1.5">
                                    <Type className="w-3.5 h-3.5" />
                                    Headline {posterType !== 'custom' && '(auto-filled)'}
                                </label>
                                <input
                                    type="text"
                                    value={headline}
                                    onChange={(e) => setHeadline(e.target.value)}
                                    placeholder={POSTER_TYPES.find(p => p.id === posterType)?.template || 'Enter headline...'}
                                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500/50"
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label className="text-xs text-zinc-500 mb-1.5 block flex items-center gap-1.5">
                                    <DollarSign className="w-3.5 h-3.5" />
                                    Price
                                </label>
                                <input
                                    type="text"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="$899,000"
                                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500/50"
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="text-xs text-zinc-500 mb-1.5 block flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                    Address / Location
                                </label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="123 Oak Street, Vancouver"
                                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500/50"
                                />
                            </div>

                            {/* Subtext */}
                            <div>
                                <label className="text-xs text-zinc-500 mb-1.5 block flex items-center gap-1.5">
                                    <Type className="w-3.5 h-3.5" />
                                    Subtext / Details
                                </label>
                                <input
                                    type="text"
                                    value={subtext}
                                    onChange={(e) => setSubtext(e.target.value)}
                                    placeholder="4 Bed | 3 Bath | 2,500 sqft"
                                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500/50"
                                />
                            </div>

                            <div className="border-t border-white/5 pt-4 mt-4">
                                <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-4">
                                    Branding (Optional)
                                </h3>

                                {/* Agent Name */}
                                <div className="mb-4">
                                    <label className="text-xs text-zinc-500 mb-1.5 block flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" />
                                        Agent Name
                                    </label>
                                    <input
                                        type="text"
                                        value={agentName}
                                        onChange={(e) => setAgentName(e.target.value)}
                                        placeholder="Jane Smith"
                                        className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500/50"
                                    />
                                </div>

                                {/* Brokerage Name */}
                                <div>
                                    <label className="text-xs text-zinc-500 mb-1.5 block flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5" />
                                        Brokerage
                                    </label>
                                    <input
                                        type="text"
                                        value={brokerageName}
                                        onChange={(e) => setBrokerageName(e.target.value)}
                                        placeholder="RE/MAX"
                                        className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500/50"
                                    />
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="mt-6 p-3 rounded-xl bg-zinc-800/30 border border-white/5">
                                <h4 className="text-xs font-medium text-zinc-400 mb-2">Tips for best results:</h4>
                                <ul className="text-xs text-zinc-500 space-y-1">
                                    <li>• Keep headlines short and impactful</li>
                                    <li>• Include price to attract serious buyers</li>
                                    <li>• Add key property features in subtext</li>
                                    <li>• Vector style costs 2 credits but looks great</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Export with AssetProvider wrapper
export const SocialMediaPosterTool: React.FC = () => {
    return (
        <AssetProvider>
            <SocialMediaPosterToolInner />
        </AssetProvider>
    );
};
