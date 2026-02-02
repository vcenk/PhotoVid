import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, UploadCloud, Sparkles, Download, RefreshCw, Loader2, Trash2,
    Image as ImageIcon, Check, AlertCircle, Wand2, Car
} from 'lucide-react';
import { NavigationRail } from '../../dashboard/navigation/NavigationRail';
import { generateAutoEnhance, isFalConfigured } from '@/lib/api/toolGeneration';
import type { AutoEnhanceOptions } from '@/lib/types/generation';

const PRESETS = [
    { id: 'auto', name: 'Auto', desc: 'Intelligent auto-enhancement' },
    { id: 'showroom', name: 'Showroom', desc: 'Bright, polished dealership look' },
    { id: 'outdoor', name: 'Outdoor', desc: 'Natural outdoor lighting' },
    { id: 'dramatic', name: 'Dramatic', desc: 'Bold contrast and colors' },
];

const UPSCALE_OPTIONS = [
    { value: 2, label: '2x', desc: 'Standard quality' },
    { value: 4, label: '4x', desc: 'Maximum quality' },
];

export const AutoEnhanceTool: React.FC = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [preset, setPreset] = useState<'auto' | 'showroom' | 'outdoor' | 'dramatic'>('auto');
    const [upscaleFactor, setUpscaleFactor] = useState<2 | 4>(2);

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
            }, 500);

            setTimeout(() => {
                clearInterval(progressInterval);
                setGenerationProgress(100);
                setResultImage('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&h=800&fit=crop');
                setIsGenerating(false);
            }, 4000);
            return;
        }

        try {
            const options: AutoEnhanceOptions = { preset, upscaleFactor };
            const resultUrl = await generateAutoEnhance(
                uploadedImage,
                options,
                (progress, status) => {
                    setGenerationProgress(progress);
                    console.log('Auto enhance status:', status);
                }
            );
            setResultImage(resultUrl);
        } catch (err) {
            console.error('Auto enhance error:', err);
            setError(err instanceof Error ? err.message : 'Enhancement failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const selectedPreset = PRESETS.find(p => p.id === preset);

    return (
        <div className="h-screen flex bg-[#0a0a0b]">
            <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
<div className="flex-1 flex ml-0 lg:ml-16">
                <div className="w-[320px] flex-shrink-0 bg-[#111113] border-r border-white/5 flex flex-col">
                    <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/studio/apps/auto')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <ArrowLeft size={18} className="text-zinc-400" />
                            </button>
                            <h1 className="text-base font-semibold text-white flex items-center gap-2">
                                <Wand2 size={18} className="text-blue-400" />
                                Auto Enhance
                            </h1>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Vehicle Photo</label>
                            {!imagePreview ? (
                                <div
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    className={`relative border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                                >
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                                    <UploadCloud size={28} className="mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm text-zinc-400">Drop vehicle photo here</p>
                                    <p className="text-xs text-zinc-600 mt-1">PNG, JPG up to 10MB</p>
                                </div>
                            ) : (
                                <div className="relative rounded-xl overflow-hidden group">
                                    <img src={imagePreview} alt="Vehicle" className="w-full h-32 object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={removeImage} className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Enhancement Preset</label>
                            <div className="space-y-2">
                                {PRESETS.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => setPreset(p.id as typeof preset)}
                                        className={`w-full p-3 rounded-xl text-left transition-all ${preset === p.id ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-white/[0.02] border border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-white">{p.name}</span>
                                            {preset === p.id && <Check size={16} className="text-blue-400" />}
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-1">{p.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Upscale Factor</label>
                            <div className="grid grid-cols-2 gap-2">
                                {UPSCALE_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setUpscaleFactor(opt.value as 2 | 4)}
                                        className={`p-3 rounded-xl text-center transition-all ${upscaleFactor === opt.value ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/50' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                                    >
                                        <span className="text-lg font-bold">{opt.label}</span>
                                        <p className="text-xs mt-1">{opt.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <button
                            onClick={handleGenerate}
                            disabled={!uploadedImage || isGenerating}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${uploadedImage && !isGenerating ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-white/5 text-zinc-600 cursor-not-allowed'}`}
                        >
                            {isGenerating ? <><Loader2 size={18} className="animate-spin" />Enhancing {generationProgress}%</> : <><Sparkles size={18} />Enhance Photo</>}
                        </button>
                        <p className="text-xs text-zinc-600 text-center mt-2">1 credit per generation</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-[#0a0a0b]">
                    <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                        <span className="text-sm text-zinc-500">{resultImage ? `Enhanced: ${selectedPreset?.name} ${upscaleFactor}x` : 'Preview'}</span>
                        {resultImage && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setResultImage(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><RefreshCw size={14} />Try Again</button>
                                <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1.5"><Download size={14} />Download</button>
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
                                <button onClick={() => setError(null)} className="mt-4 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">Try Again</button>
                            </div>
                        ) : !imagePreview ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><Car size={32} className="text-zinc-700" /></div>
                                <p className="text-zinc-500 text-sm">Upload a vehicle photo to enhance</p>
                                <p className="text-xs text-zinc-600 mt-1">One-click color correction and polish</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" /><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={276.46} strokeDashoffset={276.46 - (276.46 * generationProgress) / 100} className="text-blue-500 transition-all duration-300" strokeLinecap="round" /></svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">{generationProgress}%</span>
                                </div>
                                <p className="text-zinc-400 font-medium">Enhancing photo...</p>
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={resultImage || imagePreview} alt="Preview" className="max-w-full max-h-[calc(100vh-180px)] object-contain" />
                                {resultImage && <div className="absolute top-4 right-4 px-3 py-1.5 bg-blue-500/80 backdrop-blur rounded-lg text-xs text-white font-medium flex items-center gap-1.5"><Wand2 size={12} />Enhanced</div>}
                                {!resultImage && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><div className="text-center text-white"><Wand2 size={28} className="mx-auto mb-2 opacity-80" /><p className="text-sm font-medium">Ready to enhance</p></div></div>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
