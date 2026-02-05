import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, UploadCloud, Sparkles, Download, RefreshCw, Loader2, Trash2,
    Image as ImageIcon, Check, AlertCircle, Paintbrush, ChevronLeft, ChevronRight, ChevronDown, BookmarkPlus
} from 'lucide-react';
import { NavigationRail } from '../../dashboard/navigation/NavigationRail';
import { AssetProvider, useAssets } from '@/lib/store/contexts/AssetContext';
import { generateExteriorPaint, isFalConfigured } from '@/lib/api/toolGeneration';
import { downloadFile } from '@/lib/utils';
import type { ExteriorPaintOptions, ExteriorPaintElement } from '@/lib/types/generation';

const COLOR_CATEGORIES = [
    {
        name: 'Neutrals',
        colors: [
            { name: 'Classic White', hex: '#F5F5F0' },
            { name: 'Warm Beige', hex: '#D4C4B0' },
            { name: 'Stone Gray', hex: '#9CA3AF' },
            { name: 'Charcoal', hex: '#374151' },
        ],
    },
    {
        name: 'Blues',
        colors: [
            { name: 'Navy Blue', hex: '#1E3A5F' },
            { name: 'Coastal Blue', hex: '#4A90B8' },
            { name: 'Pale Blue', hex: '#B8D4E3' },
            { name: 'Slate Blue', hex: '#6B7FA3' },
        ],
    },
    {
        name: 'Greens',
        colors: [
            { name: 'Sage Green', hex: '#9DC183' },
            { name: 'Forest Green', hex: '#2D5A3D' },
            { name: 'Olive', hex: '#708238' },
            { name: 'Mint', hex: '#B2D8C4' },
        ],
    },
    {
        name: 'Warm Tones',
        colors: [
            { name: 'Terracotta', hex: '#CC6B49' },
            { name: 'Dusty Rose', hex: '#D4A5A5' },
            { name: 'Butter Yellow', hex: '#F0D98C' },
            { name: 'Coral', hex: '#E88873' },
        ],
    },
    {
        name: 'Earth Tones',
        colors: [
            { name: 'Warm Taupe', hex: '#A08B70' },
            { name: 'Clay', hex: '#B47A56' },
            { name: 'Espresso', hex: '#4A3728' },
            { name: 'Sand', hex: '#D6C9A8' },
        ],
    },
];

const ALL_COLORS = COLOR_CATEGORIES.flatMap(c => c.colors);
const LIGHT_COLORS = ['#F5F5F0', '#B8D4E3', '#B2D8C4', '#F0D98C', '#D6C9A8', '#D4C4B0', '#D4A5A5'];

const FINISHES = [
    { id: 'matte', name: 'Matte', desc: 'No shine, hides imperfections' },
    { id: 'eggshell', name: 'Eggshell', desc: 'Subtle sheen, easy to clean' },
    { id: 'satin', name: 'Satin', desc: 'Soft luster, durable' },
    { id: 'semi-gloss', name: 'Semi-Gloss', desc: 'Reflective, moisture-resistant' },
];

type ElementKey = 'siding' | 'trim' | 'door' | 'shutters' | 'garageDoor';

const ELEMENT_DEFS: { key: ElementKey; label: string; defaultColor: string }[] = [
    { key: 'siding', label: 'Siding', defaultColor: '#D4C4B0' },
    { key: 'trim', label: 'Trim', defaultColor: '#F5F5F0' },
    { key: 'door', label: 'Door', defaultColor: '#1E3A5F' },
    { key: 'shutters', label: 'Shutters', defaultColor: '#374151' },
    { key: 'garageDoor', label: 'Garage Door', defaultColor: '#F5F5F0' },
];

const makeElement = (hex: string, enabled = false): ExteriorPaintElement => ({
    enabled,
    color: hex,
    colorName: ALL_COLORS.find(c => c.hex === hex)?.name || 'Custom',
});

const getColorName = (hex: string) => ALL_COLORS.find(c => c.hex === hex)?.name || 'Custom';

// ============ BEFORE/AFTER SLIDER ============

const BeforeAfterSlider: React.FC<{ before: string; after: string; elements: Record<ElementKey, ExteriorPaintElement> }> = ({ before, after, elements }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDraggingSlider = useRef(false);

    const handleMove = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        setSliderPosition((x / rect.width) * 100);
    };

    const enabledElements = ELEMENT_DEFS.filter(d => elements[d.key].enabled);

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
            <div className="absolute top-3 right-3 flex gap-1.5">
                {enabledElements.map(d => (
                    <div key={d.key} className="px-2 py-1 bg-emerald-500/80 backdrop-blur-sm rounded-lg text-[10px] text-white font-medium flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-sm border border-white/30" style={{ backgroundColor: elements[d.key].color }} />
                        {d.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============ ELEMENT COLOR PICKER ============

const ElementColorPicker: React.FC<{
    element: ExteriorPaintElement;
    label: string;
    onChange: (el: ExteriorPaintElement) => void;
}> = ({ element, label, onChange }) => {
    const [expanded, setExpanded] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Neutrals');
    const activeColors = COLOR_CATEGORIES.find(c => c.name === activeCategory)?.colors || [];

    return (
        <div className={`rounded-xl transition-all ${element.enabled ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-white/[0.02] border border-white/5'}`}>
            {/* Header row: toggle + label + color swatch */}
            <button
                className="w-full p-2.5 flex items-center gap-2.5"
                onClick={() => {
                    if (!element.enabled) {
                        onChange({ ...element, enabled: true });
                        setExpanded(true);
                    } else {
                        setExpanded(!expanded);
                    }
                }}
            >
                <div
                    onClick={(e) => { e.stopPropagation(); onChange({ ...element, enabled: !element.enabled }); }}
                    className={`w-8 h-5 rounded-full transition-colors flex items-center flex-shrink-0 cursor-pointer ${element.enabled ? 'bg-emerald-500 justify-end' : 'bg-white/10 justify-start'}`}
                >
                    <div className="w-3.5 h-3.5 rounded-full bg-white mx-0.5" />
                </div>
                <span className={`text-sm font-medium flex-1 text-left ${element.enabled ? 'text-white' : 'text-zinc-500'}`}>{label}</span>
                {element.enabled && (
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md border border-white/20" style={{ backgroundColor: element.color }} />
                        <span className="text-[11px] text-zinc-400">{element.colorName}</span>
                        <ChevronDown size={14} className={`text-zinc-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </div>
                )}
            </button>

            {/* Expanded color picker */}
            {element.enabled && expanded && (
                <div className="px-2.5 pb-2.5 space-y-2">
                    {/* Category tabs */}
                    <div className="flex gap-1 overflow-x-auto pb-0.5">
                        {COLOR_CATEGORIES.map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => setActiveCategory(cat.name)}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap transition-all ${activeCategory === cat.name ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                    {/* Color grid */}
                    <div className="grid grid-cols-4 gap-1.5">
                        {activeColors.map((color) => (
                            <button
                                key={color.hex}
                                onClick={() => onChange({ ...element, color: color.hex, colorName: color.name })}
                                className={`w-full aspect-square rounded-md transition-all relative ${element.color === color.hex ? 'ring-2 ring-emerald-500 ring-offset-1 ring-offset-[#111113]' : 'hover:scale-110'}`}
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                            >
                                {element.color === color.hex && (
                                    <Check size={12} className={`absolute inset-0 m-auto ${LIGHT_COLORS.includes(color.hex) ? 'text-gray-800' : 'text-white'}`} />
                                )}
                            </button>
                        ))}
                    </div>
                    {/* Custom color */}
                    <div className="flex items-center gap-1.5">
                        <input
                            type="color"
                            value={element.color}
                            onChange={(e) => onChange({ ...element, color: e.target.value, colorName: getColorName(e.target.value) || 'Custom' })}
                            className="w-7 h-7 rounded cursor-pointer border-0"
                        />
                        <input
                            type="text"
                            value={element.color.toUpperCase()}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                                    onChange({ ...element, color: val, colorName: getColorName(val) || 'Custom' });
                                }
                            }}
                            className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[11px] text-white font-mono"
                            placeholder="#FFFFFF"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// ============ MAIN COMPONENT ============

const ExteriorPaintToolInner: React.FC = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [finish, setFinish] = useState<'matte' | 'eggshell' | 'satin' | 'semi-gloss'>('satin');

    const [elements, setElements] = useState<Record<ElementKey, ExteriorPaintElement>>({
        siding: makeElement('#D4C4B0', true),
        trim: makeElement('#F5F5F0', false),
        door: makeElement('#1E3A5F', false),
        shutters: makeElement('#374151', false),
        garageDoor: makeElement('#F5F5F0', false),
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [savedToLibrary, setSavedToLibrary] = useState(false);
    const { addAsset } = useAssets();

    const updateElement = (key: ElementKey, el: ExteriorPaintElement) => {
        setElements(prev => ({ ...prev, [key]: el }));
    };

    const enabledCount = ELEMENT_DEFS.filter(d => elements[d.key].enabled).length;

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
        if (!uploadedImage || enabledCount === 0) return;
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
                const mockUrl = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&h=800&fit=crop';
                setResultImage(mockUrl);
                try { await addAsset(mockUrl, 'image', 'Exterior Paint Result'); setSavedToLibrary(true); } catch {}
                setIsGenerating(false);
            }, 3500);
            return;
        }

        try {
            const options: ExteriorPaintOptions = {
                finish,
                siding: elements.siding,
                trim: elements.trim,
                door: elements.door,
                shutters: elements.shutters,
                garageDoor: elements.garageDoor,
            };
            const resultUrl = await generateExteriorPaint(
                uploadedImage,
                options,
                undefined,
                (progress, status) => {
                    setGenerationProgress(progress);
                    console.log('Exterior paint status:', status);
                }
            );
            setResultImage(resultUrl);
            try { await addAsset(resultUrl, 'image', 'Exterior Paint Result'); setSavedToLibrary(true); } catch {}
        } catch (err) {
            console.error('Exterior paint error:', err);
            setError(err instanceof Error ? err.message : 'Exterior paint change failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Summary label for the top bar
    const enabledElements = ELEMENT_DEFS.filter(d => elements[d.key].enabled);
    const summaryText = enabledElements.map(d => `${d.label}: ${elements[d.key].colorName}`).join(' / ');

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
                                <Paintbrush size={18} className="text-emerald-400" />
                                Exterior Paint Visualizer
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
                                    className={`relative border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                                >
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                                    <UploadCloud size={28} className="mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm text-zinc-400">Drop exterior photo</p>
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

                        {/* Element selectors */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Select Elements & Colors</label>
                            <div className="space-y-2">
                                {ELEMENT_DEFS.map((def) => (
                                    <ElementColorPicker
                                        key={def.key}
                                        element={elements[def.key]}
                                        label={def.label}
                                        onChange={(el) => updateElement(def.key, el)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Finish */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Paint Finish</label>
                            <div className="space-y-2">
                                {FINISHES.map((f) => (
                                    <button
                                        key={f.id}
                                        onClick={() => setFinish(f.id as typeof finish)}
                                        className={`w-full p-2.5 rounded-xl text-left transition-all ${finish === f.id ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-white/[0.02] border border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-white">{f.name}</span>
                                            {finish === f.id && <Check size={14} className="text-emerald-400" />}
                                        </div>
                                        <p className="text-[11px] text-zinc-500">{f.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <button
                            onClick={handleGenerate}
                            disabled={!uploadedImage || isGenerating || enabledCount === 0}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${uploadedImage && !isGenerating && enabledCount > 0 ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-white/5 text-zinc-600 cursor-not-allowed'}`}
                        >
                            {isGenerating ? (
                                <><Loader2 size={18} className="animate-spin" />Painting {generationProgress}%</>
                            ) : enabledCount === 0 ? (
                                <>Enable at least one element</>
                            ) : (
                                <><Sparkles size={18} />Visualize Paint ({enabledCount})</>
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-[#0a0a0b]">
                    <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="text-sm text-zinc-500 flex-shrink-0">{resultImage ? 'Applied:' : 'Preview'}</span>
                            {resultImage && (
                                <div className="flex items-center gap-2 min-w-0">
                                    {enabledElements.map(d => (
                                        <div key={d.key} className="flex items-center gap-1 flex-shrink-0">
                                            <div className="w-4 h-4 rounded border border-white/20" style={{ backgroundColor: elements[d.key].color }} />
                                            <span className="text-[11px] text-zinc-400">{d.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {resultImage && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => setResultImage(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><RefreshCw size={14} />Try Again</button>
                                {savedToLibrary ? (
                                    <span className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-lg flex items-center gap-1.5"><BookmarkPlus size={14} />Saved to Library</span>
                                ) : (
                                    <button onClick={async () => { if (resultImage) { try { await addAsset(resultImage, 'image', 'Exterior Paint Result'); setSavedToLibrary(true); } catch {} } }} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><BookmarkPlus size={14} />Save to Library</button>
                                )}
                                <button onClick={() => resultImage && downloadFile(resultImage, `exterior-paint-${Date.now()}.jpg`)} className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5"><Download size={14} />Download</button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex items-center justify-center p-8">
                        {error ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} className="text-red-500" />
                                </div>
                                <p className="text-red-400 text-sm font-medium mb-2">Exterior Paint Change Failed</p>
                                <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
                                <button onClick={() => setError(null)} className="mt-4 px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors">Try Again</button>
                            </div>
                        ) : !imagePreview ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><ImageIcon size={32} className="text-zinc-700" /></div>
                                <p className="text-zinc-500 text-sm">Upload an exterior photo to visualize paint colors</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" /><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={276.46} strokeDashoffset={276.46 - (276.46 * generationProgress) / 100} className="text-emerald-500 transition-all duration-300" strokeLinecap="round" /></svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">{generationProgress}%</span>
                                </div>
                                <p className="text-zinc-400 font-medium">Applying exterior paint...</p>
                            </div>
                        ) : resultImage && imagePreview ? (
                            <BeforeAfterSlider before={imagePreview} after={resultImage} elements={elements} />
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={imagePreview} alt="Preview" className="max-w-full max-h-[calc(100vh-180px)] object-contain" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40"><div className="text-center text-white"><Paintbrush size={28} className="mx-auto mb-2 opacity-80" /><p className="text-sm font-medium">Ready to visualize paint</p></div></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ExteriorPaintTool: React.FC = () => (
    <AssetProvider>
        <ExteriorPaintToolInner />
    </AssetProvider>
);
