import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    UploadCloud,
    Sparkles,
    Download,
    RefreshCw,
    Sun,
    Loader2,
    Trash2,
    Image as ImageIcon,
    Sliders,
    Zap,
    Contrast,
    Palette,
    AlertCircle,
    BookmarkPlus
} from 'lucide-react';
import { NavigationRail } from '../../dashboard/navigation/NavigationRail';
import { AssetProvider, useAssets } from '@/lib/store/contexts/AssetContext';
import { BeforeAfterSlider } from '../../common/BeforeAfterSlider';
import { generatePhotoEnhancement, isFalConfigured } from '@/lib/api/toolGeneration';
import type { PhotoEnhancementOptions } from '@/lib/types/generation';

// Enhancement presets with MLS safety indicators
// Based on production-ready mapping for real estate photography
const ENHANCEMENT_PRESETS = [
    {
        id: 'auto',
        name: 'Auto (MLS Safe)',
        description: 'Safe enhancement, no lighting changes',
        icon: Zap,
        badge: 'Recommended',
        badgeColor: 'bg-green-500/20 text-green-400',
    },
    {
        id: 'bright',
        name: 'Bright & Airy',
        description: 'Interior boost with natural relighting',
        icon: Sun,
        badge: 'MLS Safe',
        badgeColor: 'bg-green-500/20 text-green-400',
    },
    {
        id: 'vivid',
        name: 'Vivid (Marketing)',
        description: 'Enhanced colors for brochures & social',
        icon: Palette,
        badge: 'Marketing Use',
        badgeColor: 'bg-yellow-500/20 text-yellow-400',
    },
    {
        id: 'hdr',
        name: 'HDR-Style',
        description: 'Balanced shadows & highlights',
        icon: Contrast,
        badge: 'Use Carefully',
        badgeColor: 'bg-yellow-500/20 text-yellow-400',
    },
];

const PhotoEnhancementToolInner: React.FC = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState('auto');

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [savedToLibrary, setSavedToLibrary] = useState(false);
    const { addAsset } = useAssets();

    // Download handler
    const handleDownload = useCallback(async () => {
        if (!resultImage) return;
        try {
            const response = await fetch(resultImage);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `enhanced-photo-${Date.now()}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
            // Fallback: open in new tab
            window.open(resultImage, '_blank');
        }
    }, [resultImage]);

    // Check for pre-selected asset from library
    useEffect(() => {
        const selectedAssetUrl = sessionStorage.getItem('selectedAssetUrl');
        if (selectedAssetUrl) {
            sessionStorage.removeItem('selectedAssetUrl');
            setImagePreview(selectedAssetUrl);
            fetch(selectedAssetUrl)
                .then(res => res.blob())
                .then(blob => {
                    const fileName = selectedAssetUrl.split('/').pop() || 'image.jpg';
                    const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
                    setUploadedImage(file);
                })
                .catch(err => console.error('Failed to load pre-selected image:', err));
        }
    }, []);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
        else if (e.type === 'dragleave') setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]?.type.startsWith('image/')) {
            const file = e.dataTransfer.files[0];
            setUploadedImage(file);
            setImagePreview(URL.createObjectURL(file));
            setResultImage(null);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
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

    const handleGenerate = async () => {
        if (!uploadedImage) return;
        setIsGenerating(true);
        setGenerationProgress(0);
        setError(null);
        setSavedToLibrary(false);

        if (!isFalConfigured()) {
            const progressInterval = setInterval(() => {
                setGenerationProgress(prev => prev >= 90 ? (clearInterval(progressInterval), 90) : prev + 15);
            }, 400);

            setTimeout(async () => {
                clearInterval(progressInterval);
                setGenerationProgress(100);
                const mockUrl = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop';
                setResultImage(mockUrl);
                try { await addAsset(mockUrl, 'image', 'Photo Enhancement Result'); setSavedToLibrary(true); } catch {}
                setIsGenerating(false);
            }, 2500);
            return;
        }

        try {
            const options: PhotoEnhancementOptions = {
                preset: selectedPreset as PhotoEnhancementOptions['preset'],
                upscaleFactor: 2,
            };

            const resultUrl = await generatePhotoEnhancement(
                uploadedImage,
                options,
                (progress, status) => {
                    setGenerationProgress(progress);
                    console.log('Enhancement status:', status);
                }
            );

            setResultImage(resultUrl);
            try { await addAsset(resultUrl, 'image', 'Photo Enhancement Result'); setSavedToLibrary(true); } catch {}
        } catch (err) {
            console.error('Photo enhancement error:', err);
            setError(err instanceof Error ? err.message : 'Enhancement failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-screen flex bg-[#0a0a0b]">
            <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
<div className="flex-1 flex ml-0 lg:ml-16">
                {/* Sidebar */}
                <div className="w-[360px] flex-shrink-0 bg-[#111113] border-r border-white/5 flex flex-col">
                    <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/studio/real-estate')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <ArrowLeft size={18} className="text-zinc-400" />
                            </button>
                            <h1 className="text-base font-semibold text-white flex items-center gap-2">
                                <Sun size={18} className="text-amber-400" />
                                Photo Enhancement
                            </h1>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        {/* Upload */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Photo</label>
                            {!imagePreview ? (
                                <div
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    className={`relative border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                                >
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                                    <UploadCloud size={28} className="mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm text-zinc-400">Drop image here</p>
                                </div>
                            ) : (
                                <div className="relative rounded-xl overflow-hidden group">
                                    <img src={imagePreview} alt="Photo" className="w-full h-36 object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={removeImage} className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Presets */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Enhancement Style</label>
                            <div className="space-y-2">
                                {ENHANCEMENT_PRESETS.map((preset) => (
                                    <button
                                        key={preset.id}
                                        onClick={() => setSelectedPreset(preset.id)}
                                        className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3 ${selectedPreset === preset.id ? 'bg-amber-600/20 border border-amber-500/50' : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.05]'}`}
                                    >
                                        <preset.icon size={18} className={selectedPreset === preset.id ? 'text-amber-400' : 'text-zinc-500'} />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm font-medium ${selectedPreset === preset.id ? 'text-amber-300' : 'text-zinc-300'}`}>{preset.name}</p>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${preset.badgeColor}`}>
                                                    {preset.badge}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-500">{preset.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <button
                            onClick={handleGenerate}
                            disabled={!uploadedImage || isGenerating}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${uploadedImage && !isGenerating ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-white/5 text-zinc-600 cursor-not-allowed'}`}
                        >
                            {isGenerating ? <><Loader2 size={18} className="animate-spin" />Enhancing {generationProgress}%</> : <><Sparkles size={18} />Enhance Photo</>}
                        </button>
                    </div>
                </div>

                {/* Preview */}
                <div className="flex-1 flex flex-col bg-[#0a0a0b]">
                    <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                        <span className="text-sm text-zinc-500">{resultImage ? 'Enhanced Result' : 'Preview'}</span>
                        {resultImage && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setResultImage(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><RefreshCw size={14} />Try Again</button>
                                {savedToLibrary ? (
                                    <span className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-lg flex items-center gap-1.5"><BookmarkPlus size={14} />Saved to Library</span>
                                ) : (
                                    <button onClick={async () => { if (resultImage) { try { await addAsset(resultImage, 'image', 'Photo Enhancement Result'); setSavedToLibrary(true); } catch {} } }} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><BookmarkPlus size={14} />Save to Library</button>
                                )}
                                <button onClick={handleDownload} className="px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors flex items-center gap-1.5"><Download size={14} />Download</button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex items-center justify-center p-8">
                        {error ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} className="text-red-500" />
                                </div>
                                <p className="text-red-400 text-sm font-medium mb-2">Enhancement Failed</p>
                                <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
                                <button
                                    onClick={() => setError(null)}
                                    className="mt-4 px-4 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : !imagePreview ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><ImageIcon size={32} className="text-zinc-700" /></div>
                                <p className="text-zinc-500 text-sm">Upload a photo to enhance</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" /><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={276.46} strokeDashoffset={276.46 - (276.46 * generationProgress) / 100} className="text-amber-500 transition-all duration-300" strokeLinecap="round" /></svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">{generationProgress}%</span>
                                </div>
                                <p className="text-zinc-400 font-medium">Enhancing photo...</p>
                            </div>
                        ) : resultImage && imagePreview ? (
                            <div className="w-full max-w-4xl">
                                <BeforeAfterSlider
                                    beforeImage={imagePreview}
                                    afterImage={resultImage}
                                    beforeLabel="Original"
                                    afterLabel="Enhanced"
                                    className="shadow-2xl"
                                />
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={imagePreview} alt="Preview" className="max-w-full max-h-[calc(100vh-180px)] object-contain" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40"><div className="text-center text-white"><Sparkles size={28} className="mx-auto mb-2 opacity-80" /><p className="text-sm font-medium">Ready to enhance</p></div></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const PhotoEnhancementTool: React.FC = () => (
    <AssetProvider>
        <PhotoEnhancementToolInner />
    </AssetProvider>
);
