import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, UploadCloud, Sparkles, Download, RefreshCw, Loader2, Trash2,
    Image as ImageIcon, Check, AlertCircle, Wand2, BookmarkPlus
} from 'lucide-react';
import { NavigationRail } from '../../dashboard/navigation/NavigationRail';
import { AssetProvider, useAssets } from '@/lib/store/contexts/AssetContext';
import { generateDeclutter, isFalConfigured } from '@/lib/api/toolGeneration';
import { downloadFile } from '@/lib/utils';
import type { DeclutterOptions } from '@/lib/types/generation';

const DeclutterToolInner: React.FC = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [mode, setMode] = useState<'auto' | 'manual'>('auto');

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

            setTimeout(async () => {
                clearInterval(progressInterval);
                setGenerationProgress(100);
                const mockUrl = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop';
                setResultImage(mockUrl);
                try { await addAsset(mockUrl, 'image', 'Declutter Result'); setSavedToLibrary(true); } catch {}
                setIsGenerating(false);
            }, 3000);
            return;
        }

        try {
            const options: DeclutterOptions = { mode };
            const resultUrl = await generateDeclutter(
                uploadedImage,
                options,
                undefined,
                (progress, status) => {
                    setGenerationProgress(progress);
                    console.log('Declutter status:', status);
                }
            );
            setResultImage(resultUrl);
            try { await addAsset(resultUrl, 'image', 'Declutter Result'); setSavedToLibrary(true); } catch {}
        } catch (err) {
            console.error('Declutter error:', err);
            setError(err instanceof Error ? err.message : 'Declutter failed. Please try again.');
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
                                <Wand2 size={18} className="text-emerald-400" />
                                One-Click Declutter
                            </h1>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Room Photo</label>
                            {!imagePreview ? (
                                <div
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    className={`relative border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                                >
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                                    <UploadCloud size={28} className="mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm text-zinc-400">Drop room photo here</p>
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
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Declutter Mode</label>
                            <div className="space-y-2">
                                {[
                                    { id: 'auto', name: 'Auto-Detect', desc: 'AI automatically finds and removes clutter' },
                                    { id: 'manual', name: 'Manual Selection', desc: 'Mark specific items to remove' },
                                ].map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setMode(option.id as 'auto' | 'manual')}
                                        className={`w-full p-3 rounded-xl text-left transition-all ${mode === option.id ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-white/[0.02] border border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-white">{option.name}</span>
                                            {mode === option.id && <Check size={16} className="text-emerald-400" />}
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-1">{option.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                            <p className="text-xs text-emerald-300/80 leading-relaxed">
                                <strong className="text-emerald-300">Smart AI:</strong> Removes personal items, papers, toys, and clutter while keeping furniture and fixtures.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <button
                            onClick={handleGenerate}
                            disabled={!uploadedImage || isGenerating}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${uploadedImage && !isGenerating ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-white/5 text-zinc-600 cursor-not-allowed'}`}
                        >
                            {isGenerating ? <><Loader2 size={18} className="animate-spin" />Decluttering {generationProgress}%</> : <><Sparkles size={18} />Declutter Room</>}
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-[#0a0a0b]">
                    <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                        <span className="text-sm text-zinc-500">{resultImage ? 'Decluttered Result' : 'Preview'}</span>
                        {resultImage && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setResultImage(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><RefreshCw size={14} />Regenerate</button>
                                {savedToLibrary ? (
                                    <span className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-lg flex items-center gap-1.5"><BookmarkPlus size={14} />Saved to Library</span>
                                ) : (
                                    <button onClick={async () => { if (resultImage) { try { await addAsset(resultImage, 'image', 'Declutter Result'); setSavedToLibrary(true); } catch {} } }} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><BookmarkPlus size={14} />Save to Library</button>
                                )}
                                <button onClick={() => resultImage && downloadFile(resultImage, `decluttered-${Date.now()}.jpg`)} className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5"><Download size={14} />Download</button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex items-center justify-center p-8">
                        {error ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} className="text-red-500" />
                                </div>
                                <p className="text-red-400 text-sm font-medium mb-2">Declutter Failed</p>
                                <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
                                <button onClick={() => setError(null)} className="mt-4 px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors">Try Again</button>
                            </div>
                        ) : !imagePreview ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><ImageIcon size={32} className="text-zinc-700" /></div>
                                <p className="text-zinc-500 text-sm">Upload a room photo to declutter</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" /><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={276.46} strokeDashoffset={276.46 - (276.46 * generationProgress) / 100} className="text-emerald-500 transition-all duration-300" strokeLinecap="round" /></svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">{generationProgress}%</span>
                                </div>
                                <p className="text-zinc-400 font-medium">Removing clutter...</p>
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={resultImage || imagePreview} alt="Preview" className="max-w-full max-h-[calc(100vh-180px)] object-contain" />
                                {resultImage && <div className="absolute top-4 right-4 px-3 py-1.5 bg-emerald-500/80 backdrop-blur rounded-lg text-xs text-white font-medium flex items-center gap-1.5"><Wand2 size={12} />Decluttered</div>}
                                {!resultImage && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><div className="text-center text-white"><Wand2 size={28} className="mx-auto mb-2 opacity-80" /><p className="text-sm font-medium">Ready to declutter</p></div></div>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const DeclutterTool: React.FC = () => (
    <AssetProvider>
        <DeclutterToolInner />
    </AssetProvider>
);
