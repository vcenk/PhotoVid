import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, UploadCloud, Sparkles, Download, RefreshCw, Loader2, Trash2,
    AlertCircle, Search, Car, Check, Crown, FileText
} from 'lucide-react';
import { NavigationRail, FlyoutType } from '../../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../../dashboard/navigation/FlyoutPanels';
import { generateDamageDetection, isFalConfigured } from '@/lib/api/toolGeneration';
import type { DamageDetectionOptions } from '@/lib/types/generation';

const DAMAGE_TYPES = [
    { id: 'scratches', name: 'Scratches' },
    { id: 'dents', name: 'Dents' },
    { id: 'rust', name: 'Rust' },
    { id: 'paint-chips', name: 'Paint Chips' },
    { id: 'cracks', name: 'Cracks' },
];

const OVERLAY_STYLES = [
    { id: 'circles', name: 'Circles', desc: 'Circle markers around damage' },
    { id: 'arrows', name: 'Arrows', desc: 'Arrows pointing to damage' },
    { id: 'highlights', name: 'Highlights', desc: 'Colored area highlights' },
];

export const DamageDetectionTool: React.FC = () => {
    const navigate = useNavigate();
    const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [highlightDamage, setHighlightDamage] = useState(true);
    const [damageTypes, setDamageTypes] = useState<('scratches' | 'dents' | 'rust' | 'paint-chips' | 'cracks')[]>(['scratches', 'dents']);
    const [generateReport, setGenerateReport] = useState(true);
    const [overlayStyle, setOverlayStyle] = useState<'circles' | 'arrows' | 'highlights'>('circles');

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

    const toggleDamageType = (id: typeof damageTypes[number]) => {
        setDamageTypes(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
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
                setResultImage('https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200&h=800&fit=crop');
                setIsGenerating(false);
            }, 5000);
            return;
        }

        try {
            const options: DamageDetectionOptions = { highlightDamage, damageTypes, generateReport, overlayStyle };
            const resultUrl = await generateDamageDetection(
                uploadedImage,
                options,
                (progress, status) => {
                    setGenerationProgress(progress);
                    console.log('Damage detection status:', status);
                }
            );
            setResultImage(resultUrl);
        } catch (err) {
            console.error('Damage detection error:', err);
            setError(err instanceof Error ? err.message : 'Damage detection failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-screen flex bg-[#0a0a0b]">
            <NavigationRail activeFlyout={activeFlyout} onFlyoutChange={setActiveFlyout} />
            <FlyoutPanels activeFlyout={activeFlyout} onClose={() => setActiveFlyout(null)} />

            <div className="flex-1 flex ml-[72px]">
                <div className="w-[320px] flex-shrink-0 bg-[#111113] border-r border-white/5 flex flex-col">
                    <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/studio/apps/auto')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <ArrowLeft size={18} className="text-zinc-400" />
                            </button>
                            <h1 className="text-base font-semibold text-white flex items-center gap-2">
                                <Search size={18} className="text-red-400" />
                                Damage Detection
                            </h1>
                            <span className="ml-auto px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded text-[10px] font-bold text-white flex items-center gap-1">
                                <Crown size={10} />PRO
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Vehicle Photo</label>
                            {!imagePreview ? (
                                <div
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    className={`relative border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-red-500 bg-red-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                                >
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                                    <UploadCloud size={28} className="mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm text-zinc-400">Drop vehicle photo here</p>
                                    <p className="text-xs text-zinc-600 mt-1">Close-up for better detection</p>
                                </div>
                            ) : (
                                <div className="relative rounded-xl overflow-hidden group">
                                    <img src={imagePreview} alt="Vehicle" className="w-full h-24 object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={removeImage} className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Damage Types to Detect</label>
                            <div className="flex flex-wrap gap-2">
                                {DAMAGE_TYPES.map((d) => (
                                    <button
                                        key={d.id}
                                        onClick={() => toggleDamageType(d.id as typeof damageTypes[number])}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${damageTypes.includes(d.id as typeof damageTypes[number]) ? 'bg-red-500/20 text-red-300 ring-1 ring-red-500/50' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                                    >
                                        {d.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                            <div>
                                <p className="text-sm text-white font-medium">Highlight Damage</p>
                                <p className="text-xs text-zinc-500">Mark damage areas visually</p>
                            </div>
                            <button
                                onClick={() => setHighlightDamage(!highlightDamage)}
                                className={`w-11 h-6 rounded-full transition-colors ${highlightDamage ? 'bg-red-500' : 'bg-white/10'}`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${highlightDamage ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                        </div>

                        {highlightDamage && (
                            <div>
                                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Overlay Style</label>
                                <div className="space-y-2">
                                    {OVERLAY_STYLES.map((style) => (
                                        <button
                                            key={style.id}
                                            onClick={() => setOverlayStyle(style.id as typeof overlayStyle)}
                                            className={`w-full p-3 rounded-xl text-left transition-all ${overlayStyle === style.id ? 'bg-red-500/10 border border-red-500/30' : 'bg-white/[0.02] border border-white/5 hover:border-white/10'}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-white">{style.name}</span>
                                                {overlayStyle === style.id && <Check size={16} className="text-red-400" />}
                                            </div>
                                            <p className="text-xs text-zinc-500 mt-1">{style.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                            <div>
                                <p className="text-sm text-white font-medium">Generate Report</p>
                                <p className="text-xs text-zinc-500">Include damage summary</p>
                            </div>
                            <button
                                onClick={() => setGenerateReport(!generateReport)}
                                className={`w-11 h-6 rounded-full transition-colors ${generateReport ? 'bg-red-500' : 'bg-white/10'}`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${generateReport ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                        </div>

                        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                            <p className="text-xs text-red-300/80 leading-relaxed">
                                <strong className="text-red-300">Inspection Tool:</strong> AI-powered damage detection for vehicle inspections. Perfect for trade-in assessments and pre-purchase inspections.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <button
                            onClick={handleGenerate}
                            disabled={!uploadedImage || damageTypes.length === 0 || isGenerating}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${uploadedImage && damageTypes.length > 0 && !isGenerating ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-white/5 text-zinc-600 cursor-not-allowed'}`}
                        >
                            {isGenerating ? <><Loader2 size={18} className="animate-spin" />Analyzing {generationProgress}%</> : <><Sparkles size={18} />Detect Damage</>}
                        </button>
                        <p className="text-xs text-zinc-600 text-center mt-2">3 credits per analysis</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-[#0a0a0b]">
                    <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                        <span className="text-sm text-zinc-500">{resultImage ? `Damage Analysis: ${damageTypes.join(', ')}` : 'Preview'}</span>
                        {resultImage && (
                            <div className="flex items-center gap-2">
                                {generateReport && (
                                    <button className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><FileText size={14} />View Report</button>
                                )}
                                <button onClick={() => setResultImage(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><RefreshCw size={14} />New Analysis</button>
                                <button className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors flex items-center gap-1.5"><Download size={14} />Download</button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex items-center justify-center p-8">
                        {error ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} className="text-red-500" />
                                </div>
                                <p className="text-red-400 text-sm font-medium mb-2">Damage Detection Failed</p>
                                <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
                                <button onClick={() => setError(null)} className="mt-4 px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors">Try Again</button>
                            </div>
                        ) : !imagePreview ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><Car size={32} className="text-zinc-700" /></div>
                                <p className="text-zinc-500 text-sm">Upload a vehicle photo</p>
                                <p className="text-xs text-zinc-600 mt-1">AI will detect and highlight damage</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" /><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={276.46} strokeDashoffset={276.46 - (276.46 * generationProgress) / 100} className="text-red-500 transition-all duration-300" strokeLinecap="round" /></svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">{generationProgress}%</span>
                                </div>
                                <p className="text-zinc-400 font-medium">Analyzing for damage...</p>
                                <p className="text-xs text-zinc-600 mt-1">Detecting {damageTypes.join(', ')}</p>
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={resultImage || imagePreview} alt="Preview" className="max-w-full max-h-[calc(100vh-180px)] object-contain" />
                                {resultImage && <div className="absolute top-4 right-4 px-3 py-1.5 bg-red-500/80 backdrop-blur rounded-lg text-xs text-white font-medium flex items-center gap-1.5"><Search size={12} />Damage Detected</div>}
                                {!resultImage && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><div className="text-center text-white"><Search size={28} className="mx-auto mb-2 opacity-80" /><p className="text-sm font-medium">Ready to analyze</p></div></div>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
