import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, UploadCloud, Sparkles, Download, RefreshCw, Loader2, Trash2,
    Image as ImageIcon, Check, AlertCircle, Waves
} from 'lucide-react';
import { NavigationRail, FlyoutType } from '../../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../../dashboard/navigation/FlyoutPanels';
import { generatePoolEnhancement, isFalConfigured } from '@/lib/api/toolGeneration';
import type { PoolEnhancementOptions } from '@/lib/types/generation';

const MODE_OPTIONS = [
    { id: 'add-water', name: 'Add Water', desc: 'Fill an empty pool with water' },
    { id: 'clarify', name: 'Clarify Water', desc: 'Clear up murky or dirty pool water' },
    { id: 'enhance-color', name: 'Enhance Color', desc: 'Make existing water more vibrant' },
];

const COLOR_OPTIONS = [
    { id: 'crystal-blue', name: 'Crystal Blue', color: '#00B4D8' },
    { id: 'turquoise', name: 'Turquoise', color: '#00CED1' },
    { id: 'natural', name: 'Natural Aqua', color: '#48CAE4' },
];

export const PoolEnhancementTool: React.FC = () => {
    const navigate = useNavigate();
    const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [mode, setMode] = useState<'add-water' | 'clarify' | 'enhance-color'>('clarify');
    const [waterColor, setWaterColor] = useState<'crystal-blue' | 'turquoise' | 'natural'>('crystal-blue');

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
                setResultImage('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop');
                setIsGenerating(false);
            }, 3500);
            return;
        }

        try {
            const options: PoolEnhancementOptions = { mode, waterColor };
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
        } catch (err) {
            console.error('Pool enhancement error:', err);
            setError(err instanceof Error ? err.message : 'Pool enhancement failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const selectedMode = MODE_OPTIONS.find(m => m.id === mode);
    const selectedColor = COLOR_OPTIONS.find(c => c.id === waterColor);

    return (
        <div className="h-screen flex bg-[#0a0a0b]">
            <NavigationRail activeFlyout={activeFlyout} onFlyoutChange={setActiveFlyout} />
            <FlyoutPanels activeFlyout={activeFlyout} onClose={() => setActiveFlyout(null)} />

            <div className="flex-1 flex ml-[72px]">
                <div className="w-[320px] flex-shrink-0 bg-[#111113] border-r border-white/5 flex flex-col">
                    <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/studio/apps/real-estate')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <ArrowLeft size={18} className="text-zinc-400" />
                            </button>
                            <h1 className="text-base font-semibold text-white flex items-center gap-2">
                                <Waves size={18} className="text-cyan-400" />
                                Pool Enhancement
                            </h1>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Pool Photo</label>
                            {!imagePreview ? (
                                <div
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    className={`relative border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                                >
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                                    <UploadCloud size={28} className="mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm text-zinc-400">Drop pool photo</p>
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
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Enhancement Mode</label>
                            <div className="space-y-2">
                                {MODE_OPTIONS.map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setMode(m.id as typeof mode)}
                                        className={`w-full p-3 rounded-xl text-left transition-all ${mode === m.id ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-white/[0.02] border border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-white">{m.name}</span>
                                            {mode === m.id && <Check size={16} className="text-cyan-400" />}
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-1">{m.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Water Color</label>
                            <div className="flex gap-2">
                                {COLOR_OPTIONS.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => setWaterColor(c.id as typeof waterColor)}
                                        className={`flex-1 p-2.5 rounded-xl transition-all flex flex-col items-center gap-1.5 ${waterColor === c.id ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-white/[0.02] border border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: c.color }} />
                                        <span className="text-[11px] text-zinc-400">{c.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                            <p className="text-xs text-cyan-300/80 leading-relaxed">
                                <strong className="text-cyan-300">Tip:</strong> Works best on photos with visible pool edges. For empty pools, ensure the pool structure is clearly visible.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <button
                            onClick={handleGenerate}
                            disabled={!uploadedImage || isGenerating}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${uploadedImage && !isGenerating ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'bg-white/5 text-zinc-600 cursor-not-allowed'}`}
                        >
                            {isGenerating ? <><Loader2 size={18} className="animate-spin" />Enhancing {generationProgress}%</> : <><Sparkles size={18} />{selectedMode?.name}</>}
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-[#0a0a0b]">
                    <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-zinc-500">{resultImage ? 'Enhanced Pool:' : 'Preview'}</span>
                            {resultImage && <span className="text-sm text-white">{selectedColor?.name}</span>}
                        </div>
                        {resultImage && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setResultImage(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><RefreshCw size={14} />Try Different</button>
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
                                <p className="text-red-400 text-sm font-medium mb-2">Pool Enhancement Failed</p>
                                <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
                                <button onClick={() => setError(null)} className="mt-4 px-4 py-2 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors">Try Again</button>
                            </div>
                        ) : !imagePreview ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><ImageIcon size={32} className="text-zinc-700" /></div>
                                <p className="text-zinc-500 text-sm">Upload a pool photo to enhance</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" /><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={276.46} strokeDashoffset={276.46 - (276.46 * generationProgress) / 100} className="text-cyan-500 transition-all duration-300" strokeLinecap="round" /></svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">{generationProgress}%</span>
                                </div>
                                <p className="text-zinc-400 font-medium">Enhancing pool water...</p>
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={resultImage || imagePreview} alt="Preview" className="max-w-full max-h-[calc(100vh-180px)] object-contain" />
                                {resultImage && <div className="absolute top-4 right-4 px-3 py-1.5 bg-cyan-500/80 backdrop-blur rounded-lg text-xs text-white font-medium flex items-center gap-1.5"><Waves size={12} />Enhanced</div>}
                                {!resultImage && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><div className="text-center text-white"><Waves size={28} className="mx-auto mb-2 opacity-80" /><p className="text-sm font-medium">Ready to enhance pool</p></div></div>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
