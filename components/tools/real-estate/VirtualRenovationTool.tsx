import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, UploadCloud, Sparkles, Download, RefreshCw, Loader2, Trash2,
    Image as ImageIcon, Check, AlertCircle, Hammer, ChevronLeft, ChevronRight, BookmarkPlus
} from 'lucide-react';
import { NavigationRail } from '../../dashboard/navigation/NavigationRail';
import { AssetProvider, useAssets } from '@/lib/store/contexts/AssetContext';
import { generateVirtualRenovation, isFalConfigured } from '@/lib/api/toolGeneration';
import { downloadFile } from '@/lib/utils';
import type { VirtualRenovationOptions } from '@/lib/types/generation';

const RENOVATION_TYPES = [
    { id: 'kitchen', name: 'Kitchen', desc: 'Full kitchen remodel' },
    { id: 'bathroom', name: 'Bathroom', desc: 'Bathroom renovation' },
    { id: 'full-room', name: 'Full Room', desc: 'Complete room makeover' },
];

const STYLES = [
    { id: 'modern', name: 'Modern', color: 'bg-blue-500' },
    { id: 'traditional', name: 'Traditional', color: 'bg-amber-600' },
    { id: 'contemporary', name: 'Contemporary', color: 'bg-violet-500' },
    { id: 'farmhouse', name: 'Farmhouse', color: 'bg-orange-600' },
    { id: 'luxury', name: 'Luxury', color: 'bg-yellow-500' },
];

const ELEMENTS = [
    { id: 'cabinets', name: 'Cabinets' },
    { id: 'countertops', name: 'Countertops' },
    { id: 'backsplash', name: 'Backsplash' },
    { id: 'fixtures', name: 'Fixtures' },
    { id: 'appliances', name: 'Appliances' },
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
            {/* After (full background) */}
            <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" />

            {/* Before (clipped) */}
            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
                <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
            </div>

            {/* Slider line */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center">
                    <ChevronLeft size={14} className="text-zinc-600 -mr-1" />
                    <ChevronRight size={14} className="text-zinc-600 -ml-1" />
                </div>
            </div>

            {/* Labels */}
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-white font-medium">Before</div>
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-orange-500/80 backdrop-blur-sm rounded-lg text-xs text-white font-medium flex items-center gap-1"><Hammer size={10} />Renovated</div>
        </div>
    );
};

const VirtualRenovationToolInner: React.FC = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [renovationType, setRenovationType] = useState<'kitchen' | 'bathroom' | 'full-room'>('kitchen');
    const [style, setStyle] = useState<'modern' | 'traditional' | 'contemporary' | 'farmhouse' | 'luxury'>('modern');
    const [selectedElements, setSelectedElements] = useState<string[]>(['cabinets', 'countertops']);

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

    const toggleElement = (id: string) => {
        setSelectedElements(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        );
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
                const mockUrl = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=800&fit=crop';
                setResultImage(mockUrl);
                try { await addAsset(mockUrl, 'image', 'Virtual Renovation Result'); setSavedToLibrary(true); } catch {}
                setIsGenerating(false);
            }, 4000);
            return;
        }

        try {
            const options: VirtualRenovationOptions = {
                renovationType,
                style,
                elements: selectedElements as VirtualRenovationOptions['elements'],
            };
            const resultUrl = await generateVirtualRenovation(
                uploadedImage,
                options,
                undefined,
                (progress, status) => {
                    setGenerationProgress(progress);
                    console.log('Renovation status:', status);
                }
            );
            setResultImage(resultUrl);
            try { await addAsset(resultUrl, 'image', 'Virtual Renovation Result'); setSavedToLibrary(true); } catch {}
        } catch (err) {
            console.error('Renovation error:', err);
            setError(err instanceof Error ? err.message : 'Renovation failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-screen flex bg-[#0a0a0b]">
            <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
<div className="flex-1 flex ml-0 lg:ml-16">
                <div className="w-[340px] flex-shrink-0 bg-[#111113] border-r border-white/5 flex flex-col">
                    <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/studio/real-estate')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <ArrowLeft size={18} className="text-zinc-400" />
                            </button>
                            <h1 className="text-base font-semibold text-white flex items-center gap-2">
                                <Hammer size={18} className="text-orange-400" />
                                Virtual Renovation
                            </h1>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Room Photo</label>
                            {!imagePreview ? (
                                <div
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    className={`relative border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                                >
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                                    <UploadCloud size={28} className="mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm text-zinc-400">Drop kitchen or bathroom photo</p>
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

                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Renovation Type</label>
                            <div className="space-y-2">
                                {RENOVATION_TYPES.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setRenovationType(type.id as typeof renovationType)}
                                        className={`w-full p-3 rounded-xl text-left transition-all ${renovationType === type.id ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-white/[0.02] border border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-white">{type.name}</span>
                                            {renovationType === type.id && <Check size={16} className="text-orange-400" />}
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-0.5">{type.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Design Style</label>
                            <div className="flex flex-wrap gap-2">
                                {STYLES.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setStyle(s.id as typeof style)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${style === s.id ? 'bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/50' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${s.color}`} />
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Elements to Renovate</label>
                            <div className="flex flex-wrap gap-2">
                                {ELEMENTS.map((el) => (
                                    <button
                                        key={el.id}
                                        onClick={() => toggleElement(el.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedElements.includes(el.id) ? 'bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/50' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                                    >
                                        {el.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                            <p className="text-xs text-orange-300/80 leading-relaxed">
                                <strong className="text-orange-300">Premium Feature:</strong> Visualize complete renovations before investing in actual remodeling work.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <button
                            onClick={handleGenerate}
                            disabled={!uploadedImage || isGenerating || selectedElements.length === 0}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${uploadedImage && !isGenerating && selectedElements.length > 0 ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-white/5 text-zinc-600 cursor-not-allowed'}`}
                        >
                            {isGenerating ? <><Loader2 size={18} className="animate-spin" />Renovating {generationProgress}%</> : <><Sparkles size={18} />Generate Renovation</>}
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-[#0a0a0b]">
                    <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                        <span className="text-sm text-zinc-500">{resultImage ? `${style.charAt(0).toUpperCase() + style.slice(1)} ${renovationType} Renovation` : 'Preview'}</span>
                        {resultImage && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setResultImage(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><RefreshCw size={14} />Try Different Style</button>
                                {savedToLibrary ? (
                                    <span className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-lg flex items-center gap-1.5"><BookmarkPlus size={14} />Saved to Library</span>
                                ) : (
                                    <button onClick={async () => { if (resultImage) { try { await addAsset(resultImage, 'image', 'Virtual Renovation Result'); setSavedToLibrary(true); } catch {} } }} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><BookmarkPlus size={14} />Save to Library</button>
                                )}
                                <button onClick={() => resultImage && downloadFile(resultImage, `renovation-${Date.now()}.jpg`)} className="px-3 py-1.5 text-xs font-medium text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors flex items-center gap-1.5"><Download size={14} />Download</button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex items-center justify-center p-8">
                        {error ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} className="text-red-500" />
                                </div>
                                <p className="text-red-400 text-sm font-medium mb-2">Renovation Failed</p>
                                <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
                                <button onClick={() => setError(null)} className="mt-4 px-4 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors">Try Again</button>
                            </div>
                        ) : !imagePreview ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><ImageIcon size={32} className="text-zinc-700" /></div>
                                <p className="text-zinc-500 text-sm">Upload a kitchen or bathroom photo</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" /><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={276.46} strokeDashoffset={276.46 - (276.46 * generationProgress) / 100} className="text-orange-500 transition-all duration-300" strokeLinecap="round" /></svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">{generationProgress}%</span>
                                </div>
                                <p className="text-zinc-400 font-medium">Generating renovation preview...</p>
                            </div>
                        ) : resultImage && imagePreview ? (
                            <BeforeAfterSlider before={imagePreview} after={resultImage} />
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={imagePreview} alt="Preview" className="max-w-full max-h-[calc(100vh-180px)] object-contain" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40"><div className="text-center text-white"><Hammer size={28} className="mx-auto mb-2 opacity-80" /><p className="text-sm font-medium">Ready to renovate</p></div></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const VirtualRenovationTool: React.FC = () => (
    <AssetProvider>
        <VirtualRenovationToolInner />
    </AssetProvider>
);
