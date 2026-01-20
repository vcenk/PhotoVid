import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, UploadCloud, Sparkles, Download, RefreshCw, Loader2, Trash2,
    Image as ImageIcon, Check, AlertCircle, Paintbrush
} from 'lucide-react';
import { NavigationRail, FlyoutType } from '../../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../../dashboard/navigation/FlyoutPanels';
import { generateWallColor, isFalConfigured } from '@/lib/api/toolGeneration';
import type { WallColorOptions } from '@/lib/types/generation';

const COLOR_PRESETS = [
    { name: 'Cloud White', hex: '#F5F5F5' },
    { name: 'Warm Beige', hex: '#D4C4B0' },
    { name: 'Soft Gray', hex: '#9CA3AF' },
    { name: 'Navy Blue', hex: '#1E3A5F' },
    { name: 'Sage Green', hex: '#9DC183' },
    { name: 'Dusty Rose', hex: '#D4A5A5' },
    { name: 'Charcoal', hex: '#374151' },
    { name: 'Terracotta', hex: '#CC6B49' },
    { name: 'Olive', hex: '#708238' },
    { name: 'Pale Blue', hex: '#B8D4E3' },
    { name: 'Lavender', hex: '#C4B7D5' },
    { name: 'Cream', hex: '#F5F5DC' },
];

const FINISHES = [
    { id: 'matte', name: 'Matte', desc: 'No shine, hides imperfections' },
    { id: 'eggshell', name: 'Eggshell', desc: 'Subtle sheen, easy to clean' },
    { id: 'satin', name: 'Satin', desc: 'Soft luster, durable' },
    { id: 'semi-gloss', name: 'Semi-Gloss', desc: 'Reflective, moisture-resistant' },
];

export const WallColorTool: React.FC = () => {
    const navigate = useNavigate();
    const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedColor, setSelectedColor] = useState('#D4C4B0');
    const [customColor, setCustomColor] = useState('#D4C4B0');
    const [finish, setFinish] = useState<'matte' | 'eggshell' | 'satin' | 'semi-gloss'>('eggshell');

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

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

        if (!isFalConfigured()) {
            const progressInterval = setInterval(() => {
                setGenerationProgress(prev => prev >= 90 ? (clearInterval(progressInterval), 90) : prev + 10);
            }, 400);

            setTimeout(() => {
                clearInterval(progressInterval);
                setGenerationProgress(100);
                setResultImage('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop');
                setIsGenerating(false);
            }, 3500);
            return;
        }

        try {
            const options: WallColorOptions = {
                color: selectedColor,
                finish,
            };
            const resultUrl = await generateWallColor(
                uploadedImage,
                options,
                undefined,
                (progress, status) => {
                    setGenerationProgress(progress);
                    console.log('Wall color status:', status);
                }
            );
            setResultImage(resultUrl);
        } catch (err) {
            console.error('Wall color error:', err);
            setError(err instanceof Error ? err.message : 'Wall color change failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const selectedColorName = COLOR_PRESETS.find(c => c.hex === selectedColor)?.name || 'Custom';

    return (
        <div className="h-screen flex bg-[#0a0a0b]">
            <NavigationRail activeFlyout={activeFlyout} onFlyoutChange={setActiveFlyout} />
            <FlyoutPanels activeFlyout={activeFlyout} onClose={() => setActiveFlyout(null)} />

            <div className="flex-1 flex ml-56">
                <div className="w-[320px] flex-shrink-0 bg-[#111113] border-r border-white/5 flex flex-col">
                    <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/studio/apps/real-estate')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <ArrowLeft size={18} className="text-zinc-400" />
                            </button>
                            <h1 className="text-base font-semibold text-white flex items-center gap-2">
                                <Paintbrush size={18} className="text-pink-400" />
                                Wall Color Changer
                            </h1>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Room Photo</label>
                            {!imagePreview ? (
                                <div
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    className={`relative border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-pink-500 bg-pink-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                                >
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                                    <UploadCloud size={28} className="mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm text-zinc-400">Drop interior photo</p>
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
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Paint Color</label>
                            <div className="grid grid-cols-6 gap-2 mb-3">
                                {COLOR_PRESETS.map((color) => (
                                    <button
                                        key={color.hex}
                                        onClick={() => { setSelectedColor(color.hex); setCustomColor(color.hex); }}
                                        className={`w-full aspect-square rounded-lg transition-all relative ${selectedColor === color.hex ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-[#111113]' : 'hover:scale-110'}`}
                                        style={{ backgroundColor: color.hex }}
                                        title={color.name}
                                    >
                                        {selectedColor === color.hex && (
                                            <Check size={14} className={`absolute inset-0 m-auto ${color.hex === '#F5F5F5' || color.hex === '#F5F5DC' || color.hex === '#B8D4E3' ? 'text-gray-800' : 'text-white'}`} />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={customColor}
                                    onChange={(e) => { setCustomColor(e.target.value); setSelectedColor(e.target.value); }}
                                    className="w-10 h-10 rounded-lg cursor-pointer border-0"
                                />
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={selectedColor.toUpperCase()}
                                        onChange={(e) => { const val = e.target.value; if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) { setSelectedColor(val); setCustomColor(val); }}}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-mono"
                                        placeholder="#FFFFFF"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Paint Finish</label>
                            <div className="space-y-2">
                                {FINISHES.map((f) => (
                                    <button
                                        key={f.id}
                                        onClick={() => setFinish(f.id as typeof finish)}
                                        className={`w-full p-2.5 rounded-xl text-left transition-all ${finish === f.id ? 'bg-pink-500/10 border border-pink-500/30' : 'bg-white/[0.02] border border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-white">{f.name}</span>
                                            {finish === f.id && <Check size={14} className="text-pink-400" />}
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
                            disabled={!uploadedImage || isGenerating}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${uploadedImage && !isGenerating ? 'bg-pink-600 hover:bg-pink-500 text-white' : 'bg-white/5 text-zinc-600 cursor-not-allowed'}`}
                        >
                            {isGenerating ? <><Loader2 size={18} className="animate-spin" />Painting {generationProgress}%</> : <><Sparkles size={18} />Change Wall Color</>}
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-[#0a0a0b]">
                    <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-zinc-500">{resultImage ? 'Color Applied:' : 'Preview'}</span>
                            {resultImage && (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-md border border-white/20" style={{ backgroundColor: selectedColor }} />
                                    <span className="text-sm text-white font-medium">{selectedColorName}</span>
                                </div>
                            )}
                        </div>
                        {resultImage && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setResultImage(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><RefreshCw size={14} />Try Different Color</button>
                                <button className="px-3 py-1.5 text-xs font-medium text-white bg-pink-600 hover:bg-pink-500 rounded-lg transition-colors flex items-center gap-1.5"><Download size={14} />Download</button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex items-center justify-center p-8">
                        {error ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} className="text-red-500" />
                                </div>
                                <p className="text-red-400 text-sm font-medium mb-2">Wall Color Change Failed</p>
                                <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
                                <button onClick={() => setError(null)} className="mt-4 px-4 py-2 text-xs font-medium text-white bg-pink-600 hover:bg-pink-500 rounded-lg transition-colors">Try Again</button>
                            </div>
                        ) : !imagePreview ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><ImageIcon size={32} className="text-zinc-700" /></div>
                                <p className="text-zinc-500 text-sm">Upload an interior photo to change wall colors</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" /><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={276.46} strokeDashoffset={276.46 - (276.46 * generationProgress) / 100} className="text-pink-500 transition-all duration-300" strokeLinecap="round" /></svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">{generationProgress}%</span>
                                </div>
                                <p className="text-zinc-400 font-medium">Applying paint color...</p>
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={resultImage || imagePreview} alt="Preview" className="max-w-full max-h-[calc(100vh-180px)] object-contain" />
                                {resultImage && <div className="absolute top-4 right-4 px-3 py-1.5 bg-pink-500/80 backdrop-blur rounded-lg text-xs text-white font-medium flex items-center gap-1.5"><Paintbrush size={12} />{selectedColorName}</div>}
                                {!resultImage && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><div className="text-center text-white"><Paintbrush size={28} className="mx-auto mb-2 opacity-80" /><p className="text-sm font-medium">Ready to change color</p></div></div>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
