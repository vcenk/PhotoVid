import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, UploadCloud, Sparkles, Download, RefreshCw, Loader2, Trash2,
    AlertCircle, Film, Car, Check, Play, Instagram, Youtube
} from 'lucide-react';
import { NavigationRail } from '../../dashboard/navigation/NavigationRail';
import { generateSocialClips, isFalConfigured } from '@/lib/api/toolGeneration';
import type { SocialClipsOptions } from '@/lib/types/generation';

const PLATFORMS = [
    { id: 'instagram', name: 'Instagram Reels', icon: Instagram },
    { id: 'tiktok', name: 'TikTok', icon: Film },
    { id: 'youtube-shorts', name: 'YouTube Shorts', icon: Youtube },
    { id: 'facebook', name: 'Facebook Stories', icon: Film },
];

const DURATIONS = [
    { value: 15, label: '15s', desc: 'Quick teaser' },
    { value: 30, label: '30s', desc: 'Standard' },
    { value: 60, label: '60s', desc: 'Full showcase' },
];

const STYLES = [
    { id: 'fast-cuts', name: 'Fast Cuts', desc: 'Dynamic, attention-grabbing' },
    { id: 'smooth', name: 'Smooth', desc: 'Elegant transitions' },
    { id: 'dramatic', name: 'Dramatic', desc: 'Cinematic reveals' },
];

export const SocialClipsTool: React.FC = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [platform, setPlatform] = useState<'instagram' | 'tiktok' | 'youtube-shorts' | 'facebook'>('instagram');
    const [duration, setDuration] = useState<15 | 30 | 60>(30);
    const [style, setStyle] = useState<'fast-cuts' | 'smooth' | 'dramatic'>('fast-cuts');
    const [addMusic, setAddMusic] = useState(true);
    const [addText, setAddText] = useState(true);
    const [textOverlay, setTextOverlay] = useState('');

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [resultVideo, setResultVideo] = useState<string | null>(null);
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
            setResultVideo(null);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setUploadedImage(file);
            setImagePreview(URL.createObjectURL(file));
            setResultVideo(null);
        }
    };

    const removeImage = () => {
        setUploadedImage(null);
        setImagePreview(null);
        setResultVideo(null);
    };

    const handleGenerate = async () => {
        if (!uploadedImage) return;
        setIsGenerating(true);
        setGenerationProgress(0);
        setError(null);

        if (!isFalConfigured()) {
            const progressInterval = setInterval(() => {
                setGenerationProgress(prev => prev >= 90 ? (clearInterval(progressInterval), 90) : prev + 5);
            }, 600);

            setTimeout(() => {
                clearInterval(progressInterval);
                setGenerationProgress(100);
                setResultVideo('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
                setIsGenerating(false);
            }, 8000);
            return;
        }

        try {
            const options: SocialClipsOptions = { platform, duration, style, addMusic, addText, textOverlay };
            const resultUrl = await generateSocialClips(
                uploadedImage,
                options,
                (progress, status) => {
                    setGenerationProgress(progress);
                    console.log('Social clips status:', status);
                }
            );
            setResultVideo(resultUrl);
        } catch (err) {
            console.error('Social clips error:', err);
            setError(err instanceof Error ? err.message : 'Video generation failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const selectedPlatform = PLATFORMS.find(p => p.id === platform);

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
                                <Film size={18} className="text-rose-400" />
                                Social Media Clips
                            </h1>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Vehicle Photo</label>
                            {!imagePreview ? (
                                <div
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    className={`relative border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-rose-500 bg-rose-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                                >
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                                    <UploadCloud size={28} className="mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm text-zinc-400">Drop vehicle photo here</p>
                                    <p className="text-xs text-zinc-600 mt-1">Best quality for social</p>
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
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Platform</label>
                            <div className="grid grid-cols-2 gap-2">
                                {PLATFORMS.map((p) => {
                                    const Icon = p.icon;
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => setPlatform(p.id as typeof platform)}
                                            className={`p-3 rounded-xl text-left transition-all ${platform === p.id ? 'bg-rose-500/10 border border-rose-500/30' : 'bg-white/[0.02] border border-white/5 hover:border-white/10'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Icon size={16} className={platform === p.id ? 'text-rose-400' : 'text-zinc-500'} />
                                                <span className="text-xs font-medium text-white">{p.name}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Duration</label>
                            <div className="grid grid-cols-3 gap-2">
                                {DURATIONS.map((d) => (
                                    <button
                                        key={d.value}
                                        onClick={() => setDuration(d.value as typeof duration)}
                                        className={`p-2.5 rounded-xl text-center transition-all ${duration === d.value ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/50' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                                    >
                                        <span className="text-sm font-bold block">{d.label}</span>
                                        <span className="text-[10px] opacity-70">{d.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Style</label>
                            <div className="space-y-2">
                                {STYLES.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setStyle(s.id as typeof style)}
                                        className={`w-full p-3 rounded-xl text-left transition-all ${style === s.id ? 'bg-rose-500/10 border border-rose-500/30' : 'bg-white/[0.02] border border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-white">{s.name}</span>
                                            {style === s.id && <Check size={16} className="text-rose-400" />}
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-1">{s.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <div>
                                    <p className="text-sm text-white font-medium">Add Music</p>
                                    <p className="text-xs text-zinc-500">Trending audio track</p>
                                </div>
                                <button
                                    onClick={() => setAddMusic(!addMusic)}
                                    className={`w-11 h-6 rounded-full transition-colors ${addMusic ? 'bg-rose-500' : 'bg-white/10'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${addMusic ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <div>
                                    <p className="text-sm text-white font-medium">Text Overlay</p>
                                    <p className="text-xs text-zinc-500">Add vehicle info</p>
                                </div>
                                <button
                                    onClick={() => setAddText(!addText)}
                                    className={`w-11 h-6 rounded-full transition-colors ${addText ? 'bg-rose-500' : 'bg-white/10'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${addText ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                            {addText && (
                                <input
                                    type="text"
                                    placeholder="e.g., 2024 BMW M4 | $65,000"
                                    value={textOverlay}
                                    onChange={(e) => setTextOverlay(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/50"
                                />
                            )}
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <button
                            onClick={handleGenerate}
                            disabled={!uploadedImage || isGenerating}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${uploadedImage && !isGenerating ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-white/5 text-zinc-600 cursor-not-allowed'}`}
                        >
                            {isGenerating ? <><Loader2 size={18} className="animate-spin" />Creating {generationProgress}%</> : <><Sparkles size={18} />Create Social Clip</>}
                        </button>
                        <p className="text-xs text-zinc-600 text-center mt-2">3 credits per clip</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-[#0a0a0b]">
                    <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                        <span className="text-sm text-zinc-500">{resultVideo ? `${selectedPlatform?.name} ${duration}s ${style}` : 'Preview'}</span>
                        {resultVideo && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setResultVideo(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><RefreshCw size={14} />New Clip</button>
                                <button className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors flex items-center gap-1.5"><Download size={14} />Download</button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex items-center justify-center p-8">
                        {error ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} className="text-red-500" />
                                </div>
                                <p className="text-red-400 text-sm font-medium mb-2">Clip Generation Failed</p>
                                <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
                                <button onClick={() => setError(null)} className="mt-4 px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors">Try Again</button>
                            </div>
                        ) : !imagePreview ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><Car size={32} className="text-zinc-700" /></div>
                                <p className="text-zinc-500 text-sm">Upload a vehicle photo</p>
                                <p className="text-xs text-zinc-600 mt-1">Create viral-worthy social content</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" /><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={276.46} strokeDashoffset={276.46 - (276.46 * generationProgress) / 100} className="text-rose-500 transition-all duration-300" strokeLinecap="round" /></svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">{generationProgress}%</span>
                                </div>
                                <p className="text-zinc-400 font-medium">Creating social clip...</p>
                                <p className="text-xs text-zinc-600 mt-1">Optimized for {selectedPlatform?.name}</p>
                            </div>
                        ) : resultVideo ? (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <video src={resultVideo} controls autoPlay loop className="max-w-full max-h-[calc(100vh-180px)]" />
                                <div className="absolute top-4 right-4 px-3 py-1.5 bg-rose-500/80 backdrop-blur rounded-lg text-xs text-white font-medium flex items-center gap-1.5"><Film size={12} />Social Ready</div>
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={imagePreview} alt="Preview" className="max-w-full max-h-[calc(100vh-180px)] object-contain" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <div className="text-center text-white">
                                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                                            <Play size={32} className="ml-1" />
                                        </div>
                                        <p className="text-sm font-medium">Ready to create clip</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
