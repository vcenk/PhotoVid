import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    UploadCloud,
    Sparkles,
    Download,
    RefreshCw,
    Cloud,
    Loader2,
    Trash2,
    Image as ImageIcon,
    Sun,
    CloudSun,
    Sunset,
    CloudRain,
    Check,
    AlertCircle,
    BookmarkPlus
} from 'lucide-react';
import { NavigationRail } from '../../dashboard/navigation/NavigationRail';
import { AssetProvider, useAssets } from '@/lib/store/contexts/AssetContext';
import { BeforeAfterSlider } from '../../common/BeforeAfterSlider';
import { generateSkyReplacement, isFalConfigured } from '@/lib/api/toolGeneration';
import type { SkyReplacementOptions } from '@/lib/types/generation';

// Sky options with MLS safety indicators
// MLS-safe: blue-clear, blue-clouds, overcast
// Marketing-only: golden-hour, sunset, dramatic
const SKY_OPTIONS = [
    // MLS-Safe options (shown first)
    {
        id: 'blue-clear',
        name: 'Clear Blue',
        image: 'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=200&h=120&fit=crop',
        icon: Sun,
        badge: 'MLS Safe',
        badgeColor: 'bg-green-500/80',
        category: 'mls-safe',
    },
    {
        id: 'blue-clouds',
        name: 'Blue & Clouds',
        image: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=200&h=120&fit=crop',
        icon: CloudSun,
        badge: 'MLS Safe',
        badgeColor: 'bg-green-500/80',
        category: 'mls-safe',
    },
    {
        id: 'overcast',
        name: 'Soft Overcast',
        image: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=200&h=120&fit=crop',
        icon: CloudRain,
        badge: 'MLS Safe',
        badgeColor: 'bg-green-500/80',
        category: 'mls-safe',
    },
    // Marketing-only options
    {
        id: 'golden-hour',
        name: 'Golden Hour',
        image: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=200&h=120&fit=crop',
        icon: Sunset,
        badge: 'Marketing',
        badgeColor: 'bg-yellow-500/80',
        category: 'marketing',
    },
    {
        id: 'sunset',
        name: 'Sunset',
        image: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=200&h=120&fit=crop',
        icon: Sunset,
        badge: 'Marketing',
        badgeColor: 'bg-yellow-500/80',
        category: 'marketing',
    },
    {
        id: 'dramatic',
        name: 'Dramatic',
        image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=200&h=120&fit=crop',
        icon: Cloud,
        badge: 'Use Carefully',
        badgeColor: 'bg-orange-500/80',
        category: 'marketing',
    },
];

const SkyReplacementToolInner: React.FC = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedSky, setSelectedSky] = useState('blue-clouds');

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [savedToLibrary, setSavedToLibrary] = useState(false);
    const { addAsset } = useAssets();

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
                setGenerationProgress(prev => prev >= 90 ? (clearInterval(progressInterval), 90) : prev + 10);
            }, 400);

            setTimeout(async () => {
                clearInterval(progressInterval);
                setGenerationProgress(100);
                const mockUrl = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop';
                setResultImage(mockUrl);
                try { await addAsset(mockUrl, 'image', 'Sky Replacement Result'); setSavedToLibrary(true); } catch {}
                setIsGenerating(false);
            }, 3000);
            return;
        }

        try {
            const options: SkyReplacementOptions = {
                skyType: selectedSky as SkyReplacementOptions['skyType'],
            };

            // Note: For better results, a sky mask should be provided
            // Currently using auto-detection (no mask)
            const resultUrl = await generateSkyReplacement(
                uploadedImage,
                options,
                undefined, // maskCanvas - TODO: add sky masking tool
                (progress, status) => {
                    setGenerationProgress(progress);
                    console.log('Sky replacement status:', status);
                }
            );

            setResultImage(resultUrl);
            try { await addAsset(resultUrl, 'image', 'Sky Replacement Result'); setSavedToLibrary(true); } catch {}
        } catch (err) {
            console.error('Sky replacement error:', err);
            setError(err instanceof Error ? err.message : 'Sky replacement failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const selectedSkyData = SKY_OPTIONS.find(s => s.id === selectedSky);

    return (
        <div className="h-screen flex bg-[#0a0a0b]">
            <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

            <div className="flex-1 flex ml-56">
                {/* Sidebar */}
                <div className="w-[360px] flex-shrink-0 bg-[#111113] border-r border-white/5 flex flex-col">
                    <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/studio/real-estate')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <ArrowLeft size={18} className="text-zinc-400" />
                            </button>
                            <h1 className="text-base font-semibold text-white flex items-center gap-2">
                                <Cloud size={18} className="text-cyan-400" />
                                Sky Replacement
                            </h1>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        {/* Upload */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Exterior Photo</label>
                            {!imagePreview ? (
                                <div
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    className={`relative border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                                >
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                                    <UploadCloud size={28} className="mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm text-zinc-400">Drop exterior photo</p>
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

                        {/* Sky Selection - MLS Safe */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">
                                MLS-Safe Skies
                            </label>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {SKY_OPTIONS.filter(s => s.category === 'mls-safe').map((sky) => (
                                    <button
                                        key={sky.id}
                                        onClick={() => setSelectedSky(sky.id)}
                                        className={`relative rounded-xl overflow-hidden transition-all ${selectedSky === sky.id ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-[#111113]' : 'hover:ring-1 hover:ring-white/20'}`}
                                    >
                                        <img src={sky.image} alt={sky.name} className="w-full h-20 object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                        <span className="absolute bottom-1.5 left-2 text-[11px] font-medium text-white">{sky.name}</span>
                                        <span className={`absolute top-1.5 left-1.5 text-[9px] px-1.5 py-0.5 rounded-full text-white ${sky.badgeColor}`}>
                                            {sky.badge}
                                        </span>
                                        {selectedSky === sky.id && (
                                            <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                                                <Check size={12} className="text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">
                                Marketing Use Only
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {SKY_OPTIONS.filter(s => s.category === 'marketing').map((sky) => (
                                    <button
                                        key={sky.id}
                                        onClick={() => setSelectedSky(sky.id)}
                                        className={`relative rounded-xl overflow-hidden transition-all ${selectedSky === sky.id ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-[#111113]' : 'hover:ring-1 hover:ring-white/20'}`}
                                    >
                                        <img src={sky.image} alt={sky.name} className="w-full h-20 object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                        <span className="absolute bottom-1.5 left-2 text-[11px] font-medium text-white">{sky.name}</span>
                                        <span className={`absolute top-1.5 left-1.5 text-[9px] px-1.5 py-0.5 rounded-full text-white ${sky.badgeColor}`}>
                                            {sky.badge}
                                        </span>
                                        {selectedSky === sky.id && (
                                            <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                                                <Check size={12} className="text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                            <p className="text-xs text-cyan-300/80 leading-relaxed">
                                <strong className="text-cyan-300">Tip:</strong> For best results, use exterior photos with clear sky visibility. MLS-safe options maintain natural, realistic appearance.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <button
                            onClick={handleGenerate}
                            disabled={!uploadedImage || isGenerating}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${uploadedImage && !isGenerating ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'bg-white/5 text-zinc-600 cursor-not-allowed'}`}
                        >
                            {isGenerating ? <><Loader2 size={18} className="animate-spin" />Replacing {generationProgress}%</> : <><Sparkles size={18} />Replace Sky</>}
                        </button>
                    </div>
                </div>

                {/* Preview */}
                <div className="flex-1 flex flex-col bg-[#0a0a0b]">
                    <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                        <span className="text-sm text-zinc-500">{resultImage ? `New Sky: ${selectedSkyData?.name}` : 'Preview'}</span>
                        {resultImage && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setResultImage(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><RefreshCw size={14} />Try Different Sky</button>
                                {savedToLibrary ? (
                                    <span className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-lg flex items-center gap-1.5"><BookmarkPlus size={14} />Saved to Library</span>
                                ) : (
                                    <button onClick={async () => { if (resultImage) { try { await addAsset(resultImage, 'image', 'Sky Replacement Result'); setSavedToLibrary(true); } catch {} } }} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><BookmarkPlus size={14} />Save to Library</button>
                                )}
                                <button className="px-3 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors flex items-center gap-1.5"><Download size={14} />Download</button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex items-center justify-center p-8">
                        {error ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} className="text-red-500" />
                                </div>
                                <p className="text-red-400 text-sm font-medium mb-2">Sky Replacement Failed</p>
                                <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
                                <button
                                    onClick={() => setError(null)}
                                    className="mt-4 px-4 py-2 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : !imagePreview ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><ImageIcon size={32} className="text-zinc-700" /></div>
                                <p className="text-zinc-500 text-sm">Upload an exterior photo</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" /><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={276.46} strokeDashoffset={276.46 - (276.46 * generationProgress) / 100} className="text-cyan-500 transition-all duration-300" strokeLinecap="round" /></svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">{generationProgress}%</span>
                                </div>
                                <p className="text-zinc-400 font-medium">Replacing sky...</p>
                            </div>
                        ) : resultImage && imagePreview ? (
                            <div className="w-full max-w-4xl">
                                <BeforeAfterSlider
                                    beforeImage={imagePreview}
                                    afterImage={resultImage}
                                    beforeLabel="Original"
                                    afterLabel={selectedSkyData?.name || 'New Sky'}
                                    className="shadow-2xl"
                                />
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={imagePreview} alt="Preview" className="max-w-full max-h-[calc(100vh-180px)] object-contain" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40"><div className="text-center text-white"><Cloud size={28} className="mx-auto mb-2 opacity-80" /><p className="text-sm font-medium">Ready to replace sky</p></div></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const SkyReplacementTool: React.FC = () => (
    <AssetProvider>
        <SkyReplacementToolInner />
    </AssetProvider>
);
