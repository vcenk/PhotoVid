import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, UploadCloud, Sparkles, Download, RefreshCw, Loader2, Trash2,
    Image as ImageIcon, AlertCircle, User
} from 'lucide-react';
import { NavigationRail, FlyoutType } from '../../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../../dashboard/navigation/FlyoutPanels';
import { generateHeadshotRetouching, isFalConfigured } from '@/lib/api/toolGeneration';
import type { HeadshotRetouchingOptions } from '@/lib/types/generation';

const BACKGROUND_OPTIONS = [
    { id: 'white', name: 'White Studio' },
    { id: 'gray', name: 'Gray Gradient' },
    { id: 'blur', name: 'Soft Blur' },
    { id: 'office', name: 'Office Setting' },
];

export const HeadshotRetouchingTool: React.FC = () => {
    const navigate = useNavigate();
    const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const [smoothSkin, setSmoothSkin] = useState(true);
    const [brightenEyes, setBrightenEyes] = useState(true);
    const [whitenTeeth, setWhitenTeeth] = useState(false);
    const [removeBackground, setRemoveBackground] = useState(false);
    const [backgroundType, setBackgroundType] = useState<'white' | 'gray' | 'blur' | 'office'>('white');

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
                setResultImage('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&crop=face');
                setIsGenerating(false);
            }, 3500);
            return;
        }

        try {
            const options: HeadshotRetouchingOptions = {
                smoothSkin,
                brightenEyes,
                whitenTeeth,
                removeBackground,
                backgroundType: removeBackground ? backgroundType : undefined,
            };
            const resultUrl = await generateHeadshotRetouching(
                uploadedImage,
                options,
                (progress, status) => {
                    setGenerationProgress(progress);
                    console.log('Headshot retouching status:', status);
                }
            );
            setResultImage(resultUrl);
        } catch (err) {
            console.error('Headshot retouching error:', err);
            setError(err instanceof Error ? err.message : 'Retouching failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

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
                                <User size={18} className="text-purple-400" />
                                Headshot Retouching
                            </h1>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Portrait Photo</label>
                            {!imagePreview ? (
                                <div
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    className={`relative border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                                >
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                                    <UploadCloud size={28} className="mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm text-zinc-400">Drop headshot photo</p>
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
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Enhancements</label>
                            <div className="space-y-2">
                                {[
                                    { id: 'smoothSkin', label: 'Smooth Skin', desc: 'Subtle skin smoothing', checked: smoothSkin, onChange: setSmoothSkin },
                                    { id: 'brightenEyes', label: 'Brighten Eyes', desc: 'Add natural catchlight', checked: brightenEyes, onChange: setBrightenEyes },
                                    { id: 'whitenTeeth', label: 'Whiten Teeth', desc: 'Natural teeth whitening', checked: whitenTeeth, onChange: setWhitenTeeth },
                                ].map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => option.onChange(!option.checked)}
                                        className={`w-full p-3 rounded-xl text-left transition-all ${option.checked ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-white/[0.02] border border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-sm font-medium text-white">{option.label}</span>
                                                <p className="text-xs text-zinc-500">{option.desc}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded flex items-center justify-center ${option.checked ? 'bg-purple-500' : 'bg-white/10'}`}>
                                                {option.checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <button
                                onClick={() => setRemoveBackground(!removeBackground)}
                                className={`w-full p-3 rounded-xl text-left transition-all ${removeBackground ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-white/[0.02] border border-white/5 hover:border-white/10'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm font-medium text-white">Replace Background</span>
                                        <p className="text-xs text-zinc-500">Change to professional background</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded flex items-center justify-center ${removeBackground ? 'bg-purple-500' : 'bg-white/10'}`}>
                                        {removeBackground && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                </div>
                            </button>

                            {removeBackground && (
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    {BACKGROUND_OPTIONS.map((bg) => (
                                        <button
                                            key={bg.id}
                                            onClick={() => setBackgroundType(bg.id as typeof backgroundType)}
                                            className={`p-2.5 rounded-lg text-xs font-medium transition-all ${backgroundType === bg.id ? 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/50' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                                        >
                                            {bg.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                            <p className="text-xs text-purple-300/80 leading-relaxed">
                                <strong className="text-purple-300">Perfect for:</strong> Agent headshots, team photos, and professional profiles. Maintains natural appearance.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <button
                            onClick={handleGenerate}
                            disabled={!uploadedImage || isGenerating}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${uploadedImage && !isGenerating ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-white/5 text-zinc-600 cursor-not-allowed'}`}
                        >
                            {isGenerating ? <><Loader2 size={18} className="animate-spin" />Retouching {generationProgress}%</> : <><Sparkles size={18} />Retouch Headshot</>}
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-[#0a0a0b]">
                    <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                        <span className="text-sm text-zinc-500">{resultImage ? 'Retouched Portrait' : 'Preview'}</span>
                        {resultImage && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setResultImage(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><RefreshCw size={14} />Adjust</button>
                                <button className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors flex items-center gap-1.5"><Download size={14} />Download</button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex items-center justify-center p-8">
                        {error ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} className="text-red-500" />
                                </div>
                                <p className="text-red-400 text-sm font-medium mb-2">Retouching Failed</p>
                                <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
                                <button onClick={() => setError(null)} className="mt-4 px-4 py-2 text-xs font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors">Try Again</button>
                            </div>
                        ) : !imagePreview ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><ImageIcon size={32} className="text-zinc-700" /></div>
                                <p className="text-zinc-500 text-sm">Upload a headshot to retouch</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" /><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={276.46} strokeDashoffset={276.46 - (276.46 * generationProgress) / 100} className="text-purple-500 transition-all duration-300" strokeLinecap="round" /></svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">{generationProgress}%</span>
                                </div>
                                <p className="text-zinc-400 font-medium">Enhancing portrait...</p>
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={resultImage || imagePreview} alt="Preview" className="max-w-full max-h-[calc(100vh-180px)] object-contain" />
                                {resultImage && <div className="absolute top-4 right-4 px-3 py-1.5 bg-purple-500/80 backdrop-blur rounded-lg text-xs text-white font-medium flex items-center gap-1.5"><User size={12} />Retouched</div>}
                                {!resultImage && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><div className="text-center text-white"><User size={28} className="mx-auto mb-2 opacity-80" /><p className="text-sm font-medium">Ready to retouch</p></div></div>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
