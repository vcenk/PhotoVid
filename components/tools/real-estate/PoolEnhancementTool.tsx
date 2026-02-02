import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, UploadCloud, Sparkles, Download, RefreshCw, Loader2, Trash2,
    Image as ImageIcon, Check, AlertCircle, Waves, ChevronLeft, ChevronRight,
    Plus, Droplets, Flame, Lamp, Fence, UmbrellaIcon, Armchair, Bath, BookmarkPlus
} from 'lucide-react';
import { NavigationRail } from '../../dashboard/navigation/NavigationRail';
import { AssetProvider, useAssets } from '@/lib/store/contexts/AssetContext';
import { generatePoolEnhancement, isFalConfigured } from '@/lib/api/toolGeneration';
import { downloadFile } from '@/lib/utils';
import type { PoolEnhancementOptions, PoolMode, PoolElement } from '@/lib/types/generation';

// ============ DATA ============

const MODE_OPTIONS: { id: PoolMode; name: string; desc: string; emoji: string }[] = [
    { id: 'clean-water', name: 'Clean Water', desc: 'Crystal clear turquoise pool water', emoji: '💧' },
    { id: 'luxury-upgrade', name: 'Luxury Upgrade', desc: 'Resort-style pool area enhancement', emoji: '✨' },
    { id: 'add-pool', name: 'Add Pool', desc: 'Add a pool to a backyard without one', emoji: '🏊' },
];

const ELEMENT_OPTIONS: { id: PoolElement; label: string; icon: React.ElementType }[] = [
    { id: 'lounge-chairs', label: 'Lounge Chairs', icon: Armchair },
    { id: 'umbrella', label: 'Umbrella', icon: UmbrellaIcon },
    { id: 'hot-tub', label: 'Hot Tub', icon: Bath },
    { id: 'pool-lighting', label: 'Lighting', icon: Lamp },
    { id: 'outdoor-kitchen', label: 'Outdoor Kitchen', icon: Flame },
    { id: 'fire-pit', label: 'Fire Pit', icon: Flame },
    { id: 'water-features', label: 'Water Features', icon: Droplets },
    { id: 'pool-fence', label: 'Pool Fence', icon: Fence },
    { id: 'cabana', label: 'Cabana', icon: Fence },
    { id: 'landscaping', label: 'Landscaping', icon: Waves },
    { id: 'deck-upgrade', label: 'Deck Upgrade', icon: Fence },
    { id: 'diving-board', label: 'Diving Board', icon: Waves },
];

// ============ BEFORE/AFTER SLIDER ============

const BeforeAfterSlider: React.FC<{ before: string; after: string; modeName: string }> = ({ before, after, modeName }) => {
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
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-white font-medium">Before</div>
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-cyan-500/80 backdrop-blur-sm rounded-lg text-xs text-white font-medium flex items-center gap-1.5">
                <Waves size={12} />
                {modeName}
            </div>
        </div>
    );
};

// ============ MAIN COMPONENT ============

const PoolEnhancementToolInner: React.FC = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [mode, setMode] = useState<PoolMode>('clean-water');
    const [selectedElements, setSelectedElements] = useState<PoolElement[]>([]);

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [savedToLibrary, setSavedToLibrary] = useState(false);
    const { addAsset } = useAssets();

    const toggleElement = (el: PoolElement) => {
        setSelectedElements(prev =>
            prev.includes(el) ? prev.filter(e => e !== el) : [...prev, el]
        );
    };

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
                try { await addAsset(mockUrl, 'image', 'Pool Enhancement Result'); setSavedToLibrary(true); } catch {}
                setIsGenerating(false);
            }, 3500);
            return;
        }

        try {
            const options: PoolEnhancementOptions = {
                mode,
                elements: selectedElements,
            };
            const resultUrl = await generatePoolEnhancement(
                uploadedImage,
                options,
                undefined,
                (progress, status) => {
                    setGenerationProgress(progress);
                    console.log('Pool enhancement status:', status);
                }
            );
            setResultImage(resultUrl);
            try { await addAsset(resultUrl, 'image', 'Pool Enhancement Result'); setSavedToLibrary(true); } catch {}
        } catch (err) {
            console.error('Pool enhancement error:', err);
            setError(err instanceof Error ? err.message : 'Pool enhancement failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const selectedModeName = MODE_OPTIONS.find(m => m.id === mode)?.name || '';
    const uploadLabel = mode === 'add-pool' ? 'Backyard Photo' : 'Pool Photo';
    const uploadHint = mode === 'add-pool' ? 'Drop backyard photo' : 'Drop pool photo';

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
                                <Waves size={18} className="text-cyan-400" />
                                Pool Enhancement
                            </h1>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        {/* Upload */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">{uploadLabel}</label>
                            {!imagePreview ? (
                                <div
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    className={`relative border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                                >
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                                    <UploadCloud size={28} className="mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm text-zinc-400">{uploadHint}</p>
                                </div>
                            ) : (
                                <div className="relative rounded-xl overflow-hidden group">
                                    <img src={imagePreview} alt="Photo" className="w-full h-32 object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={removeImage} className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pool Mode */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Pool Mode</label>
                            <div className="space-y-2">
                                {MODE_OPTIONS.map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setMode(m.id)}
                                        className={`w-full p-2.5 rounded-xl text-left transition-all ${mode === m.id ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-white/[0.02] border border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-lg">{m.emoji}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-white">{m.name}</span>
                                                    {mode === m.id && <Check size={14} className="text-cyan-400" />}
                                                </div>
                                                <p className="text-[11px] text-zinc-500 truncate">{m.desc}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Element Toggles */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Add Elements <span className="text-zinc-600">(optional)</span></label>
                            <div className="flex flex-wrap gap-1.5">
                                {ELEMENT_OPTIONS.map((el) => {
                                    const isActive = selectedElements.includes(el.id);
                                    const Icon = el.icon;
                                    return (
                                        <button
                                            key={el.id}
                                            onClick={() => toggleElement(el.id)}
                                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${isActive ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/[0.03] text-zinc-500 border border-white/5 hover:border-white/10 hover:text-zinc-300'}`}
                                        >
                                            <Icon size={12} />
                                            {el.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {selectedElements.length > 0 && (
                                <button
                                    onClick={() => setSelectedElements([])}
                                    className="mt-2 text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                            <p className="text-xs text-cyan-300/80 leading-relaxed">
                                <strong className="text-cyan-300">Tip:</strong> {mode === 'add-pool'
                                    ? 'Works best on photos showing a clear backyard area with visible ground space where a pool can be placed.'
                                    : 'Works best on photos with a clearly visible pool. Combine elements for a complete pool area makeover.'}
                            </p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <button
                            onClick={handleGenerate}
                            disabled={!uploadedImage || isGenerating}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${uploadedImage && !isGenerating ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'bg-white/5 text-zinc-600 cursor-not-allowed'}`}
                        >
                            {isGenerating ? (
                                <><Loader2 size={18} className="animate-spin" />Enhancing {generationProgress}%</>
                            ) : (
                                <><Sparkles size={18} />Enhance Pool</>
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-[#0a0a0b]">
                    <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-zinc-500">{resultImage ? 'Mode:' : 'Preview'}</span>
                            {resultImage && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-white font-medium">{selectedModeName}</span>
                                    {selectedElements.length > 0 && (
                                        <span className="text-xs text-zinc-500">+ {selectedElements.length} element{selectedElements.length > 1 ? 's' : ''}</span>
                                    )}
                                </div>
                            )}
                        </div>
                        {resultImage && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setResultImage(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><RefreshCw size={14} />Try Again</button>
                                {savedToLibrary ? (
                                    <span className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-lg flex items-center gap-1.5"><BookmarkPlus size={14} />Saved to Library</span>
                                ) : (
                                    <button onClick={async () => { if (resultImage) { try { await addAsset(resultImage, 'image', 'Pool Enhancement Result'); setSavedToLibrary(true); } catch {} } }} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><BookmarkPlus size={14} />Save to Library</button>
                                )}
                                <button onClick={() => resultImage && downloadFile(resultImage, `pool-enhanced-${Date.now()}.jpg`)} className="px-3 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors flex items-center gap-1.5"><Download size={14} />Download</button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex items-center justify-center p-8">
                        {error ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} className="text-red-500" />
                                </div>
                                <p className="text-red-400 text-sm font-medium mb-2">Pool Enhancement Failed</p>
                                <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
                                <button onClick={() => setError(null)} className="mt-4 px-4 py-2 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors">Try Again</button>
                            </div>
                        ) : !imagePreview ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><ImageIcon size={32} className="text-zinc-700" /></div>
                                <p className="text-zinc-500 text-sm">{mode === 'add-pool' ? 'Upload a backyard photo to add a pool' : 'Upload a pool photo to enhance'}</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" /><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={276.46} strokeDashoffset={276.46 - (276.46 * generationProgress) / 100} className="text-cyan-500 transition-all duration-300" strokeLinecap="round" /></svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">{generationProgress}%</span>
                                </div>
                                <p className="text-zinc-400 font-medium">Enhancing pool area...</p>
                            </div>
                        ) : resultImage && imagePreview ? (
                            <BeforeAfterSlider before={imagePreview} after={resultImage} modeName={selectedModeName} />
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={imagePreview} alt="Preview" className="max-w-full max-h-[calc(100vh-180px)] object-contain" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40"><div className="text-center text-white"><Waves size={28} className="mx-auto mb-2 opacity-80" /><p className="text-sm font-medium">{mode === 'add-pool' ? 'Ready to add pool' : 'Ready to enhance pool'}</p></div></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const PoolEnhancementTool: React.FC = () => (
    <AssetProvider>
        <PoolEnhancementToolInner />
    </AssetProvider>
);
