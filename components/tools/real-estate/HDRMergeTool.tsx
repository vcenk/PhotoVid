import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, UploadCloud, Sparkles, Download, RefreshCw, Loader2, Trash2,
    Image as ImageIcon, Check, AlertCircle, Layers, Plus, X
} from 'lucide-react';
import { NavigationRail, FlyoutType } from '../../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../../dashboard/navigation/FlyoutPanels';
import { generateHDRMerge, isFalConfigured } from '@/lib/api/toolGeneration';
import type { HDRMergeOptions } from '@/lib/types/generation';

const STYLES = [
    { id: 'natural', name: 'Natural', desc: 'Balanced, true-to-life HDR' },
    { id: 'enhanced', name: 'Enhanced', desc: 'Slightly boosted contrast and color' },
    { id: 'dramatic', name: 'Dramatic', desc: 'Bold, high-impact HDR effect' },
];

export const HDRMergeTool: React.FC = () => {
    const navigate = useNavigate();
    const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);

    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [style, setStyle] = useState<'natural' | 'enhanced' | 'dramatic'>('natural');

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
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) {
            addImages(files);
        }
    }, []);

    const addImages = (files: File[]) => {
        const newImages = [...uploadedImages, ...files].slice(0, 5); // Max 5 images
        setUploadedImages(newImages);
        setImagePreviews(newImages.map(f => URL.createObjectURL(f)));
        setResultImage(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addImages(Array.from(e.target.files));
        }
    };

    const removeImage = (index: number) => {
        const newImages = uploadedImages.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setUploadedImages(newImages);
        setImagePreviews(newPreviews);
        setResultImage(null);
    };

    const clearAll = () => {
        setUploadedImages([]);
        setImagePreviews([]);
        setResultImage(null);
    };

    const handleGenerate = async () => {
        if (uploadedImages.length < 2) return;
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
                setResultImage('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop');
                setIsGenerating(false);
            }, 4000);
            return;
        }

        try {
            const options: HDRMergeOptions = { images: [], style };
            const resultUrl = await generateHDRMerge(
                uploadedImages,
                options,
                (progress, status) => {
                    setGenerationProgress(progress);
                    console.log('HDR merge status:', status);
                }
            );
            setResultImage(resultUrl);
        } catch (err) {
            console.error('HDR merge error:', err);
            setError(err instanceof Error ? err.message : 'HDR merge failed. Please try again.');
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
                            <button onClick={() => navigate('/studio/apps/real-estate')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <ArrowLeft size={18} className="text-zinc-400" />
                            </button>
                            <h1 className="text-base font-semibold text-white flex items-center gap-2">
                                <Layers size={18} className="text-teal-400" />
                                HDR Auto-Merge
                            </h1>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Bracketed Photos ({uploadedImages.length}/5)</label>
                                {uploadedImages.length > 0 && (
                                    <button onClick={clearAll} className="text-xs text-zinc-500 hover:text-zinc-300">Clear all</button>
                                )}
                            </div>

                            {uploadedImages.length === 0 ? (
                                <div
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    className={`relative border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-teal-500 bg-teal-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                                >
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" multiple />
                                    <UploadCloud size={28} className="mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm text-zinc-400">Drop 2-5 bracketed exposures</p>
                                    <p className="text-xs text-zinc-600 mt-1">Under, normal, and over-exposed</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-3 gap-2">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative rounded-lg overflow-hidden group aspect-square">
                                                <img src={preview} alt={`Exposure ${index + 1}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button onClick={() => removeImage(index)} className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg text-white"><X size={14} /></button>
                                                </div>
                                                <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 px-1.5 py-0.5 rounded text-white">
                                                    {index === 0 ? 'Dark' : index === uploadedImages.length - 1 ? 'Bright' : 'Mid'}
                                                </span>
                                            </div>
                                        ))}
                                        {uploadedImages.length < 5 && (
                                            <div className="relative aspect-square">
                                                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" multiple />
                                                <div className="w-full h-full border border-dashed border-white/10 rounded-lg flex items-center justify-center hover:border-white/20 transition-colors">
                                                    <Plus size={20} className="text-zinc-600" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">HDR Style</label>
                            <div className="space-y-2">
                                {STYLES.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setStyle(s.id as typeof style)}
                                        className={`w-full p-3 rounded-xl text-left transition-all ${style === s.id ? 'bg-teal-500/10 border border-teal-500/30' : 'bg-white/[0.02] border border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-white">{s.name}</span>
                                            {style === s.id && <Check size={16} className="text-teal-400" />}
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-1">{s.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/10">
                            <p className="text-xs text-teal-300/80 leading-relaxed">
                                <strong className="text-teal-300">Best Results:</strong> Use 3-5 photos taken with bracketing enabled. Ensure all photos are from the same position.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <button
                            onClick={handleGenerate}
                            disabled={uploadedImages.length < 2 || isGenerating}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${uploadedImages.length >= 2 && !isGenerating ? 'bg-teal-600 hover:bg-teal-500 text-white' : 'bg-white/5 text-zinc-600 cursor-not-allowed'}`}
                        >
                            {isGenerating ? <><Loader2 size={18} className="animate-spin" />Merging {generationProgress}%</> : <><Sparkles size={18} />Merge HDR</>}
                        </button>
                        {uploadedImages.length === 1 && (
                            <p className="text-xs text-zinc-500 text-center mt-2">Add at least one more photo</p>
                        )}
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-[#0a0a0b]">
                    <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                        <span className="text-sm text-zinc-500">{resultImage ? `HDR Result (${style})` : 'Preview'}</span>
                        {resultImage && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setResultImage(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><RefreshCw size={14} />Try Different Style</button>
                                <button className="px-3 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors flex items-center gap-1.5"><Download size={14} />Download</button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex items-center justify-center p-8">
                        {error ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} className="text-red-500" />
                                </div>
                                <p className="text-red-400 text-sm font-medium mb-2">HDR Merge Failed</p>
                                <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
                                <button onClick={() => setError(null)} className="mt-4 px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors">Try Again</button>
                            </div>
                        ) : uploadedImages.length === 0 ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><ImageIcon size={32} className="text-zinc-700" /></div>
                                <p className="text-zinc-500 text-sm">Upload 2-5 bracketed exposure photos</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" /><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={276.46} strokeDashoffset={276.46 - (276.46 * generationProgress) / 100} className="text-teal-500 transition-all duration-300" strokeLinecap="round" /></svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">{generationProgress}%</span>
                                </div>
                                <p className="text-zinc-400 font-medium">Merging HDR exposures...</p>
                            </div>
                        ) : resultImage ? (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={resultImage} alt="HDR Result" className="max-w-full max-h-[calc(100vh-180px)] object-contain" />
                                <div className="absolute top-4 right-4 px-3 py-1.5 bg-teal-500/80 backdrop-blur rounded-lg text-xs text-white font-medium flex items-center gap-1.5"><Layers size={12} />HDR Merged</div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-4 max-w-xl">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="rounded-xl overflow-hidden shadow-lg">
                                        <img src={preview} alt={`Exposure ${index + 1}`} className="w-full aspect-[4/3] object-cover" />
                                        <div className="bg-white/5 p-2 text-center">
                                            <span className="text-xs text-zinc-400">
                                                {index === 0 ? 'Under-exposed' : index === uploadedImages.length - 1 ? 'Over-exposed' : 'Normal'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
