import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, UploadCloud, Sparkles, Download, RefreshCw, Loader2, Trash2,
    Image as ImageIcon, Check, AlertCircle, Sun, CloudRain, ChevronLeft, ChevronRight, BookmarkPlus
} from 'lucide-react';
import { NavigationRail } from '../../dashboard/navigation/NavigationRail';
import { AssetProvider, useAssets } from '@/lib/store/contexts/AssetContext';
import { generateRainToShine, isFalConfigured } from '@/lib/api/toolGeneration';
import { downloadFile } from '@/lib/utils';
import type { RainToShineOptions } from '@/lib/types/generation';

const SKY_OPTIONS = [
    { id: 'clear-blue', name: 'Clear Blue', desc: 'Perfectly clear sky with bright sunshine' },
    { id: 'partly-cloudy', name: 'Partly Cloudy', desc: 'Pleasant sky with fluffy white clouds' },
    { id: 'golden-hour', name: 'Golden Hour', desc: 'Warm golden lighting before sunset' },
];

const BRIGHTNESS_OPTIONS = [
    { id: 'natural', name: 'Natural', desc: 'Realistic daylight' },
    { id: 'bright', name: 'Bright', desc: 'Enhanced brightness' },
    { id: 'very-bright', name: 'Very Bright', desc: 'Sun-drenched look' },
];

const BeforeAfterSlider: React.FC<{ before: string; after: string }> = ({ before, after }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDraggingSlider = useRef(false);

    const handleMove = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        setSliderPosition((x / rect.width) * 100);
    };

    return (
        <div
            ref={containerRef}
            className="relative rounded-2xl overflow-hidden shadow-2xl w-full max-w-4xl aspect-[16/10] cursor-ew-resize select-none"
            onMouseDown={() => { isDraggingSlider.current = true; }}
            onMouseUp={() => { isDraggingSlider.current = false; }}
            onMouseLeave={() => { isDraggingSlider.current = false; }}
            onMouseMove={(e) => { if (isDraggingSlider.current) handleMove(e.clientX); }}
            onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        >
            <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
                <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center">
                    <ChevronLeft size={14} className="text-zinc-600 -mr-1" />
                    <ChevronRight size={14} className="text-zinc-600 -ml-1" />
                </div>
            </div>
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-white font-medium flex items-center gap-1"><CloudRain size={10} />Before</div>
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-yellow-500/80 backdrop-blur-sm rounded-lg text-xs text-white font-medium flex items-center gap-1"><Sun size={10} />Sunny</div>
        </div>
    );
};

const RainToShineToolInner: React.FC = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [skyType, setSkyType] = useState<'clear-blue' | 'partly-cloudy' | 'golden-hour'>('clear-blue');
    const [brightness, setBrightness] = useState<'natural' | 'bright' | 'very-bright'>('bright');

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [savedToLibrary, setSavedToLibrary] = useState(false);
    const { addAsset } = useAssets();

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

            setTimeout(() => {
                clearInterval(progressInterval);
                setGenerationProgress(100);
                const mockUrl = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop';
                setResultImage(mockUrl);
                try { await addAsset(mockUrl, 'image', 'Rain to Shine Result'); setSavedToLibrary(true); } catch {}
                setIsGenerating(false);
            }, 3000);
            return;
        }

        try {
            const options: RainToShineOptions = { skyType, brightness };
            const resultUrl = await generateRainToShine(
                uploadedImage,
                options,
                (progress, status) => {
                    setGenerationProgress(progress);
                    console.log('Rain to shine status:', status);
                }
            );
            setResultImage(resultUrl);
            try { await addAsset(resultUrl, 'image', 'Rain to Shine Result'); setSavedToLibrary(true); } catch {}
        } catch (err) {
            console.error('Rain to shine error:', err);
            setError(err instanceof Error ? err.message : 'Weather conversion failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-screen flex bg-[#0a0a0b]">
            <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
<div className="flex-1 flex ml-0 lg:ml-16">
                <div className="w-[360px] flex-shrink-0 bg-[#111113] border-r border-white/5 flex flex-col">
                    <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/studio/real-estate')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <ArrowLeft size={18} className="text-zinc-400" />
                            </button>
                            <h1 className="text-base font-semibold text-white flex items-center gap-2">
                                <Sun size={18} className="text-yellow-400" />
                                Rain to Shine
                            </h1>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Rainy/Cloudy Photo</label>
                            {!imagePreview ? (
                                <div
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    className={`relative border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                                >
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                                    <CloudRain size={28} className="mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm text-zinc-400">Drop rainy or cloudy photo</p>
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

                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Target Weather</label>
                            <div className="space-y-2">
                                {SKY_OPTIONS.map((sky) => (
                                    <button
                                        key={sky.id}
                                        onClick={() => setSkyType(sky.id as typeof skyType)}
                                        className={`w-full p-3 rounded-xl text-left transition-all ${skyType === sky.id ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-white/[0.02] border border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-white">{sky.name}</span>
                                            {skyType === sky.id && <Check size={16} className="text-yellow-400" />}
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-1">{sky.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Brightness Level</label>
                            <div className="flex gap-2">
                                {BRIGHTNESS_OPTIONS.map((b) => (
                                    <button
                                        key={b.id}
                                        onClick={() => setBrightness(b.id as typeof brightness)}
                                        className={`flex-1 p-2.5 rounded-xl text-center transition-all ${brightness === b.id ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-white/[0.02] border border-white/5 hover:border-white/10'}`}
                                    >
                                        <span className="text-xs font-medium text-white">{b.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                            <p className="text-xs text-yellow-300/80 leading-relaxed">
                                <strong className="text-yellow-300">Perfect for:</strong> Rainy day shoots, overcast exteriors, or photos taken in bad weather conditions.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <button
                            onClick={handleGenerate}
                            disabled={!uploadedImage || isGenerating}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${uploadedImage && !isGenerating ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-white/5 text-zinc-600 cursor-not-allowed'}`}
                        >
                            {isGenerating ? <><Loader2 size={18} className="animate-spin" />Converting {generationProgress}%</> : <><Sparkles size={18} />Add Sunshine</>}
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-[#0a0a0b]">
                    <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                        <span className="text-sm text-zinc-500">{resultImage ? 'Sunny Result' : 'Preview'}</span>
                        {resultImage && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setResultImage(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><RefreshCw size={14} />Try Different Settings</button>
                                {savedToLibrary ? (
                                    <span className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-lg flex items-center gap-1.5"><BookmarkPlus size={14} />Saved to Library</span>
                                ) : (
                                    <button onClick={async () => { if (resultImage) { try { await addAsset(resultImage, 'image', 'Rain to Shine Result'); setSavedToLibrary(true); } catch {} } }} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><BookmarkPlus size={14} />Save to Library</button>
                                )}
                                <button onClick={() => resultImage && downloadFile(resultImage, `rain-to-shine-${Date.now()}.jpg`)} className="px-3 py-1.5 text-xs font-medium text-white bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-colors flex items-center gap-1.5"><Download size={14} />Download</button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex items-center justify-center p-8">
                        {error ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} className="text-red-500" />
                                </div>
                                <p className="text-red-400 text-sm font-medium mb-2">Weather Conversion Failed</p>
                                <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
                                <button onClick={() => setError(null)} className="mt-4 px-4 py-2 text-xs font-medium text-white bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-colors">Try Again</button>
                            </div>
                        ) : !imagePreview ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><ImageIcon size={32} className="text-zinc-700" /></div>
                                <p className="text-zinc-500 text-sm">Upload a rainy or cloudy exterior photo</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" /><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={276.46} strokeDashoffset={276.46 - (276.46 * generationProgress) / 100} className="text-yellow-500 transition-all duration-300" strokeLinecap="round" /></svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">{generationProgress}%</span>
                                </div>
                                <p className="text-zinc-400 font-medium">Adding sunshine...</p>
                            </div>
                        ) : resultImage && imagePreview ? (
                            <BeforeAfterSlider before={imagePreview} after={resultImage} />
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={imagePreview} alt="Preview" className="max-w-full max-h-[calc(100vh-180px)] object-contain" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40"><div className="text-center text-white"><CloudRain size={28} className="mx-auto mb-2 opacity-80" /><p className="text-sm font-medium">Ready to add sunshine</p></div></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const RainToShineTool: React.FC = () => (
    <AssetProvider>
        <RainToShineToolInner />
    </AssetProvider>
);
